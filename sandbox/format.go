package main

import (
	"context"
	"encoding/json"
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
// output is byte-stable across image rebuilds.
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
		return "", msg
	}
	return string(output), ""
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
