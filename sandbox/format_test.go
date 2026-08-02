package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os/exec"
	"strings"
	"testing"
)

// requireBlack skips the test when black is unavailable (local dev, CI
// containers). The Dockerfile pins black, so the deployed sandbox always has it.
func requireBlack(t *testing.T) {
	t.Helper()
	if _, err := exec.LookPath("black"); err != nil {
		t.Skip("black not installed; skipping formatting test")
	}
}

func postFormat(t *testing.T, code string) *httptest.ResponseRecorder {
	t.Helper()
	body, err := json.Marshal(FormatRequest{Language: "python", Code: code})
	if err != nil {
		t.Fatalf("failed to marshal request: %v", err)
	}
	req := httptest.NewRequest(http.MethodPost, "/format", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	formatHandler(rec, req)
	return rec
}

func TestFormatPythonFormatsValidCode(t *testing.T) {
	requireBlack(t)

	rec := postFormat(t, "def add(a,b):\n    return a+b\n")
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp FormatResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if resp.Error != "" {
		t.Fatalf("expected no error, got %q", resp.Error)
	}

	expected := "def add(a, b):\n    return a + b\n"
	if resp.Formatted != expected {
		t.Fatalf("expected formatted output %q, got %q", expected, resp.Formatted)
	}
}

func TestFormatPythonRejectsSyntaxError(t *testing.T) {
	requireBlack(t)

	rec := postFormat(t, "def broken(:\n  pass\n")
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 with error field, got %d", rec.Code)
	}

	var resp FormatResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if resp.Error == "" {
		t.Fatal("expected a parse error message, got empty error")
	}
	if !strings.Contains(strings.ToLower(resp.Error), "syntax error") {
		t.Fatalf("expected a friendly syntax-error message, got %q", resp.Error)
	}
	if strings.Contains(resp.Error, "cannot format -:") {
		t.Fatalf("expected raw black prefix to be stripped, got %q", resp.Error)
	}
}

func TestFormatPythonExtraIndentationGetsFriendlyMessage(t *testing.T) {
	requireBlack(t)

	// The user's code was properly multi-line; a single extra indent on the
	// third line is an IndentationError. The message must point at the real
	// line 3, not black's normalized "7:0" position.
	code := "def median_of_two_sorted_arrays(arg1, arg2):\n" +
		"    tot = arg1 + arg2\n" +
		"        medLen = len(tot) / 2\n" +
		"    avg = tot[medLen]\n" +
		"    return int(avg)\n"
	rec := postFormat(t, code)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 with error field, got %d", rec.Code)
	}

	var resp FormatResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if resp.Error == "" {
		t.Fatal("expected an indentation error message, got empty error")
	}
	if !strings.Contains(strings.ToLower(resp.Error), "indentation") {
		t.Fatalf("expected indentation error message, got %q", resp.Error)
	}
	if !strings.Contains(resp.Error, "line 3") {
		t.Fatalf("expected the true source line, got %q", resp.Error)
	}
	if !strings.Contains(resp.Error, "Tip:") {
		t.Fatalf("expected an actionable tip, got %q", resp.Error)
	}
	if strings.Contains(resp.Error, "cannot format -:") {
		t.Fatalf("expected raw black prefix to be stripped, got %q", resp.Error)
	}
}

func TestFriendlyPythonSyntaxMessage(t *testing.T) {
	msg := friendlyPythonSyntaxMessage(pythonSyntaxProbe{
		Type: "IndentationError", Line: 3, Column: 9, Msg: "unexpected indent",
	})
	for _, want := range []string{"line 3", "column 9", "indentation", "tip:"} {
		if !strings.Contains(strings.ToLower(msg), want) {
			t.Fatalf("expected %q in message, got %q", want, msg)
		}
	}

	msg = friendlyPythonSyntaxMessage(pythonSyntaxProbe{
		Type: "SyntaxError", Line: 1, Column: 44, Msg: "invalid syntax",
	})
	for _, want := range []string{"line 1", "column 44", "syntax error", "tip:"} {
		if !strings.Contains(strings.ToLower(msg), want) {
			t.Fatalf("expected %q in message, got %q", want, msg)
		}
	}

	// Interpreter could not pin a location — fall back gracefully.
	msg = friendlyPythonSyntaxMessage(pythonSyntaxProbe{Type: "SyntaxError", Msg: "invalid syntax"})
	if !strings.Contains(msg, "this line") {
		t.Fatalf("expected fallback location, got %q", msg)
	}
}

func TestFormatSyntaxIssueStripsBlackPrefix(t *testing.T) {
	msg := formatSyntaxIssue(
		"def broken(:\n  pass\n",
		"error: cannot format -: Cannot parse: 7:0: avg = tot[medLen]",
	)
	if !strings.Contains(msg, "Python syntax error") {
		t.Fatalf("expected a Python syntax error message, got %q", msg)
	}
	if strings.Contains(msg, "cannot format -:") {
		t.Fatalf("expected raw black prefix to be stripped, got %q", msg)
	}
}

func TestFormatEmptyCodeReturnsEmpty(t *testing.T) {
	rec := postFormat(t, "   \n")
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	var resp FormatResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if resp.Formatted != "" || resp.Error != "" {
		t.Fatalf("expected empty result for empty input, got %+v", resp)
	}
}

func TestFormatUnsupportedLanguage(t *testing.T) {
	body, _ := json.Marshal(FormatRequest{Language: "go", Code: "package main"})
	req := httptest.NewRequest(http.MethodPost, "/format", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	formatHandler(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for unsupported language, got %d", rec.Code)
	}
}

func TestFormatPythonBlackNormalizesQuotes(t *testing.T) {
	requireBlack(t)

	// Black's default is double quotes; the byte-stable contract relies on this.
	rec := postFormat(t, "s = 'hello'\n")
	var resp FormatResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if resp.Error != "" {
		t.Fatalf("expected no error, got %q", resp.Error)
	}
	if resp.Formatted != "s = \"hello\"\n" {
		t.Fatalf("expected double-quote normalization, got %q", resp.Formatted)
	}
}
