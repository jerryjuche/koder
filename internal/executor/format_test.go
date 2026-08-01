package executor

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/jerryjuche/koder/internal/config"
)

func TestFormatCodeGoFormatsValidSource(t *testing.T) {
	e := NewExecutor(&config.Config{}, nil)
	out, err := e.FormatCode(context.Background(), "go", "package koder\n\nfunc add(a,b int) int{\nreturn a+b\n}\n")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := "package koder\n\nfunc add(a, b int) int {\n\treturn a + b\n}\n"
	if out != expected {
		t.Fatalf("expected:\n%s\ngot:\n%s", expected, out)
	}
}

func TestFormatCodeGoRejectsSyntaxError(t *testing.T) {
	e := NewExecutor(&config.Config{}, nil)
	_, err := e.FormatCode(context.Background(), "go", "package koder\nfunc broken( {\n")
	if err == nil {
		t.Fatal("expected syntax error")
	}
	var se *FormatSyntaxError
	if !errors.As(err, &se) {
		t.Fatalf("expected *FormatSyntaxError, got %T", err)
	}
}

func TestFormatCodeGoEmptyInput(t *testing.T) {
	e := NewExecutor(&config.Config{}, nil)
	out, err := e.FormatCode(context.Background(), "go", "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if out != "" {
		t.Fatalf("expected empty output, got %q", out)
	}
}

// TestFormatCodeGoPreservesStubSignature is a regression guard for the scaffold
// generated frontend-side (ProblemWorkspaceClient generateScaffold): formatting
// must never alter the function signature line, or grading tests that bind to
// the generated signature would silently break.
func TestFormatCodeGoPreservesStubSignature(t *testing.T) {
	e := NewExecutor(&config.Config{}, nil)
	stub := "package koder\n\nfunc isPalindrome(s string) bool {\n\t// Write your solution here\n}\n"
	out, err := e.FormatCode(context.Background(), "go", stub)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !strings.Contains(out, "func isPalindrome(s string) bool {") {
		t.Fatalf("formatting altered the stub signature:\n%s", out)
	}
}

func TestFormatCodeUnsupportedLanguage(t *testing.T) {
	e := NewExecutor(&config.Config{}, nil)
	if _, err := e.FormatCode(context.Background(), "rust", "fn main() {}"); err == nil {
		t.Fatal("expected unsupported language error")
	}
}

func TestFormatCodePythonViaSandbox(t *testing.T) {
	var gotLanguage, gotCode string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/format" {
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
		var req struct {
			Language string `json:"language"`
			Code     string `json:"code"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			t.Fatalf("failed to decode request: %v", err)
		}
		gotLanguage, gotCode = req.Language, req.Code

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"formatted":"def add(a, b):\n    return a + b\n"}`)
	}))
	defer server.Close()

	cfg := &config.Config{
		SandboxURL:                server.URL,
		PythonExecutorTimeout:     10,
		SandboxRequestTimeoutExtra: 5,
	}
	e := NewExecutor(cfg, nil)

	out, err := e.FormatCode(context.Background(), "python", "def add(a,b):\n return a+b\n")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if gotLanguage != "python" {
		t.Fatalf("expected language python, got %q", gotLanguage)
	}
	if !strings.Contains(gotCode, "def add") {
		t.Fatalf("expected source to reach sandbox, got %q", gotCode)
	}
	if out != "def add(a, b):\n    return a + b\n" {
		t.Fatalf("unexpected formatted output: %q", out)
	}
}

func TestFormatCodePythonMapsSandboxErrorToSyntaxError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"formatted":"","error":"error: cannot format stdin: Cannot parse: 1:0: unexpected indent"}`)
	}))
	defer server.Close()

	cfg := &config.Config{
		SandboxURL:                server.URL,
		PythonExecutorTimeout:     10,
		SandboxRequestTimeoutExtra: 5,
	}
	e := NewExecutor(cfg, nil)

	_, err := e.FormatCode(context.Background(), "python", "def broken(:\n pass\n")
	if err == nil {
		t.Fatal("expected syntax error")
	}
	var se *FormatSyntaxError
	if !errors.As(err, &se) {
		t.Fatalf("expected *FormatSyntaxError, got %T", err)
	}
	if !strings.Contains(err.Error(), "Cannot parse") {
		t.Fatalf("expected black parse error in message, got %q", err.Error())
	}
}
