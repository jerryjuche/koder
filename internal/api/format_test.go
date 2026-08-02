package api

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/jerryjuche/koder/internal/auth"
	"github.com/jerryjuche/koder/internal/executor"
)

// fakeFormatter is a scriptable Formatter for handler tests.
type fakeFormatter struct {
	out   string
	err   error
	calls int
	lang  string
	code  string
}

func (f *fakeFormatter) FormatCode(_ context.Context, language, code string) (string, error) {
	f.calls++
	f.lang = language
	f.code = code
	return f.out, f.err
}

// requestWithClaims wraps httptest in a request carrying authenticated claims.
func formatRequest(body string) *http.Request {
	req := httptest.NewRequest(http.MethodPost, "/api/format", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	return req
}

func withClaims(req *http.Request, userID string) *http.Request {
	ctx := context.WithValue(req.Context(), claimsContextKey, &auth.Claims{UserID: userID, Role: "student"})
	return req.WithContext(ctx)
}

func TestFormatRejectsUnauthenticated(t *testing.T) {
	h := NewFormatHandler(&fakeFormatter{})
	rec := httptest.NewRecorder()
	h.Format(rec, formatRequest(`{"language":"go","code":"package koder"}`))
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rec.Code)
	}
}

func TestFormatGoSuccess(t *testing.T) {
	f := &fakeFormatter{out: "package koder\n"}
	h := NewFormatHandler(f)
	rec := httptest.NewRecorder()
	h.Format(rec, withClaims(formatRequest(`{"language":"go","code":"package koder"}`), "user-1"))

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	if f.calls != 1 {
		t.Fatalf("expected 1 formatter call, got %d", f.calls)
	}
	if f.lang != "go" {
		t.Fatalf("expected language go, got %q", f.lang)
	}
	var body map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	data, ok := body["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected data payload, got %v", body)
	}
	if data["formatted"] != "package koder\n" {
		t.Fatalf("expected formatted payload, got %v", data)
	}
}

func TestFormatRejectsUnsupportedLanguage(t *testing.T) {
	f := &fakeFormatter{}
	h := NewFormatHandler(f)
	rec := httptest.NewRecorder()
	h.Format(rec, withClaims(formatRequest(`{"language":"rust","code":"fn main() {}"}`), "user-1"))

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
	if f.calls != 0 {
		t.Fatal("expected formatter not to be called for unsupported language")
	}
}

func TestFormatRejectsOversizedCode(t *testing.T) {
	f := &fakeFormatter{}
	h := NewFormatHandler(f)
	big := fmt.Sprintf(`{"language":"python","code":%q}`, string(bytes.Repeat([]byte("x"), 50*1024+1)))
	rec := httptest.NewRecorder()
	h.Format(rec, withClaims(formatRequest(big), "user-1"))

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
	if f.calls != 0 {
		t.Fatal("expected formatter not to be called for oversized code")
	}
}

func TestFormatSyntaxErrorReturns422(t *testing.T) {
	f := &fakeFormatter{err: &executor.FormatSyntaxError{Err: errors.New("1:2: expected ';'")}}
	h := NewFormatHandler(f)
	rec := httptest.NewRecorder()
	h.Format(rec, withClaims(formatRequest(`{"language":"go","code":"package koder\nfunc broken( {"}`), "user-1"))

	if rec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("expected 422, got %d", rec.Code)
	}
	var body map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if body["error"] == nil || body["error"] == "" {
		t.Fatalf("expected a syntax error message, got %v", body)
	}
}

func TestFormatInfrastructureFailureReturns502(t *testing.T) {
	f := &fakeFormatter{err: errors.New("sandbox: HTTP request failed: connection refused")}
	h := NewFormatHandler(f)
	rec := httptest.NewRecorder()
	h.Format(rec, withClaims(formatRequest(`{"language":"python","code":"x=1"}`), "user-1"))

	if rec.Code != http.StatusBadGateway {
		t.Fatalf("expected 502, got %d", rec.Code)
	}
}
