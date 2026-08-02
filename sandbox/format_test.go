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
	if !strings.Contains(resp.Error, "Cannot parse") && !strings.Contains(resp.Error, "error:") {
		t.Fatalf("expected black parse error, got %q", resp.Error)
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
