package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"strings"
	"time"
)

// ---------------------------------------------------------------------------
// Request / response types
// ---------------------------------------------------------------------------

// FormatRequest is the payload sent by the backend for language formatting.
type FormatRequest struct {
	Language string `json:"language"` // "python" (Go is formatted in-process by the backend)
	Code     string `json:"code"`     // Source to format
}

// FormatResponse is returned after formatting. The HTTP status is always 200;
// failures are surfaced through the Error field so the backend can map them to
// a client-facing 422 (mirrors how /execute returns compiler_error with 200).
type FormatResponse struct {
	Formatted string `json:"formatted"`
	Error     string `json:"error,omitempty"`
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

// formatPythonWithBlack pipes code through `black -q -` (stdin -> stdout).
// Black exit codes: 0 = success (formatted source on stdout); non-zero =
// parse error or internal failure (message on stderr, stdout empty). The
// version is pinned at build time via requirements in the Dockerfile so the
// output is byte-stable across image rebuilds. Parse failures are converted to
// detailed, human-friendly messages via formatSyntaxIssue.
func formatPythonWithBlack(code string) (string, string) {
	blackBin, err := exec.LookPath("black")
	if err != nil {
		return "", "black is not installed in the sandbox environment"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	output, err := runCommandWithLimitedOutput(ctx, blackBin, strings.NewReader(code), "-q", "-")
	if err != nil {
		msg := strings.TrimSpace(string(output))
		if msg == "" {
			msg = "black exited with an error"
		}
		return "", formatSyntaxIssue(code, msg)
	}
	return string(output), ""
}

// ---------------------------------------------------------------------------
// Detailed Python syntax error reporting
// ---------------------------------------------------------------------------

// pythonSyntaxProbeScript re-parses the raw source with Python's own parser so
// the reported line/column refers to the user's actual code rather than to the
// internally-normalized copy black parses (which can report meaningless
// positions, e.g. "7:0" for a one-line file). Emits one JSON line and exits 2
// on a parse failure; ast.parse must be wrapped for IndentationError (a
// SyntaxError subclass) before SyntaxError so the more specific class wins.
const pythonSyntaxProbeScript = `
import ast, sys, json

src = sys.stdin.read()
try:
    ast.parse(src)
    print(json.dumps({"ok": True}))
except IndentationError as e:
    print(json.dumps({"ok": False, "type": "IndentationError",
                      "line": e.lineno or 0, "column": e.offset or 0,
                      "msg": (e.msg or "")}))
    sys.exit(2)
except SyntaxError as e:
    print(json.dumps({"ok": False, "type": "SyntaxError",
                      "line": e.lineno or 0, "column": e.offset or 0,
                      "msg": (e.msg or "")}))
    sys.exit(2)
except Exception as e:
    print(json.dumps({"ok": False, "type": type(e).__name__,
                      "line": 0, "column": 0, "msg": (str(e) or "")}))
    sys.exit(2)
`

// pythonSyntaxProbe is the decoded result of pythonSyntaxProbeScript.
type pythonSyntaxProbe struct {
	Ok     bool   `json:"ok"`
	Type   string `json:"type"`
	Line   int    `json:"line"`
	Column int    `json:"column"`
	Msg    string `json:"msg"`
}

// formatSyntaxIssue converts a failed Python format attempt into a detailed,
// human-friendly message. It re-parses the raw source with ast.parse to surface
// the true location and error class, then attaches a targeted tip per error
// class. If no Python interpreter is available, or Python can parse the code
// while black still rejects it, it falls back to black's own message with its
// internal "error: cannot format -:" prefix stripped.
func formatSyntaxIssue(code, blackMsg string) string {
	if pythonBin := findPythonBin(); pythonBin != "" {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		output, _ := runCommandWithLimitedOutput(ctx, pythonBin, strings.NewReader(code), "-c", pythonSyntaxProbeScript)
		if len(output) > 0 {
			var probe pythonSyntaxProbe
			if json.Unmarshal(output, &probe) == nil && !probe.Ok {
				if msg := friendlyPythonSyntaxMessage(probe); msg != "" {
					return msg
				}
			}
		}
	}

	cleaned := strings.TrimSpace(blackMsg)
	cleaned = strings.TrimSpace(strings.TrimPrefix(cleaned, "error:"))
	cleaned = strings.TrimSpace(strings.TrimPrefix(cleaned, "cannot format -:"))
	if cleaned == "" {
		cleaned = "black could not parse the code"
	}
	return "Python syntax error: " + cleaned
}

// friendlyPythonSyntaxMessage builds a professional, actionable message from an
// ast.parse probe. The location defaults to "this line" when the interpreter
// could not pin one down.
func friendlyPythonSyntaxMessage(probe pythonSyntaxProbe) string {
	loc := "this line"
	if probe.Line > 0 {
		if probe.Column > 0 {
			loc = fmt.Sprintf("line %d, column %d", probe.Line, probe.Column)
		} else {
			loc = fmt.Sprintf("line %d", probe.Line)
		}
	}

	switch probe.Type {
	case "IndentationError", "TabError":
		detail := probe.Msg
		if detail == "" {
			detail = "inconsistent or unexpected indentation"
		}
		return fmt.Sprintf(
			"Python indentation error at %s: %s — Tip: Check your indentation. Python requires consistent spaces (usually 4) at every indented block.",
			loc, detail,
		)
	case "SyntaxError":
		detail := probe.Msg
		if detail == "" {
			detail = "invalid syntax"
		}
		return fmt.Sprintf(
			"Python syntax error at %s: %s — Tip: Check for missing colons, unclosed brackets, or statements merged onto one line.",
			loc, detail,
		)
	default:
		if probe.Type == "" {
			probe.Type = "parse error"
		}
		if probe.Msg == "" {
			probe.Msg = "unknown error"
		}
		return fmt.Sprintf("Python %s at %s: %s", probe.Type, loc, probe.Msg)
	}
}

// ---------------------------------------------------------------------------
// HTTP handler
// ---------------------------------------------------------------------------

func formatHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondError(w, http.StatusMethodNotAllowed, "method_not_allowed")
		return
	}

	if r.Header.Get("Content-Type") != "application/json" {
		respondError(w, http.StatusUnsupportedMediaType, "content_type_required")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1*1024*1024)

	var req FormatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid_request_body")
		return
	}

	if req.Language != "python" {
		respondError(w, http.StatusBadRequest, "unsupported_language")
		return
	}

	resp := FormatResponse{}
	if strings.TrimSpace(req.Code) == "" {
		resp.Formatted = ""
	} else {
		resp.Formatted, resp.Error = formatPythonWithBlack(req.Code)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
