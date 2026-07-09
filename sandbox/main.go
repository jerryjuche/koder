package main

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// ---------------------------------------------------------------------------
// Request / response types
// ---------------------------------------------------------------------------

// ExecuteRequest is the payload sent by the backend.
type ExecuteRequest struct {
	Language   string `json:"language"`    // "go" or "python"
	Code       string `json:"code"`        // Student solution
	TestCode   string `json:"test_code"`   // Generated test runner content
	TimeoutSec int    `json:"timeout_sec"` // Per-execution timeout (default 30)
	GoModule   string `json:"go_module"`   // Module name for go.mod (default "sandbox")
	GoVersion  string `json:"go_version"`  // Go version directive (default "1.23")
}

// ExecuteResponse is returned to the backend after execution.
type ExecuteResponse struct {
	Status      string `json:"status"`       // "passed" | "failed" | "compiler_error" | "timeout"
	Stdout      string `json:"stdout"`       // Full go test -v output (backend parses details)
	Stderr      string `json:"stderr"`       // Any stderr captured
	PassedCount int    `json:"passed_count"` // Count of passed test cases
	TotalCount  int    `json:"total_count"`  // Total test cases detected
	RuntimeMs   int    `json:"runtime_ms"`   // Wall-clock execution time
	Error       string `json:"error,omitempty"`
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const (
	defaultTimeoutSec = 30
	maxTimeoutSec     = 60
	defaultGoModule   = "sandbox"
	defaultGoVersion  = "1.23"
)

var letters = []rune("abcdefghijklmnopqrstuvwxyz0123456789")

func randString(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

// ---------------------------------------------------------------------------
// Output parsing (mirrors the regex in internal/executor/executor.go)
// ---------------------------------------------------------------------------

var (
	runRegex      = regexp.MustCompile(`^=== RUN\s+TestSolution/case_(\d+)`)
	passRegex     = regexp.MustCompile(`^--- PASS:\s+TestSolution/case_(\d+)`)
	failStdRegex  = regexp.MustCompile(`^--- FAIL:\s+TestSolution/case_(\d+)`)
	caseFailRegex = regexp.MustCompile(`=== FAIL: Case (\d+)`)
)

type parseResult struct {
	passedCount int
	totalCount  int
	status      string
}

func classifyOutput(output string, timedOut bool, cmdErr error) parseResult {
	var (
		passedSet = make(map[int]bool)
		failedSet = make(map[int]bool)
		allSet    = make(map[int]bool)
	)

	scanner := bufio.NewScanner(strings.NewReader(output))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		if m := runRegex.FindStringSubmatch(line); len(m) > 1 {
			ord, _ := strconv.Atoi(m[1])
			allSet[ord] = true
			continue
		}
		if m := passRegex.FindStringSubmatch(line); len(m) > 1 {
			ord, _ := strconv.Atoi(m[1])
			passedSet[ord] = true
			allSet[ord] = true
			continue
		}
		if m := failStdRegex.FindStringSubmatch(line); len(m) > 1 {
			ord, _ := strconv.Atoi(m[1])
			failedSet[ord] = true
			allSet[ord] = true
			continue
		}
		if m := caseFailRegex.FindStringSubmatch(line); len(m) > 1 {
			ord, _ := strconv.Atoi(m[1])
			failedSet[ord] = true
			allSet[ord] = true
			continue
		}
	}

	if timedOut {
		return parseResult{status: "timeout"}
	}

	if cmdErr != nil && len(passedSet) == 0 && len(failedSet) == 0 {
		return parseResult{status: "compiler_error"}
	}

	total := len(allSet)
	passed := len(passedSet)

	var status string
	switch {
	case total == 0:
		status = "compiler_error"
	case passed == total:
		status = "passed"
	default:
		status = "failed"
	}

	return parseResult{
		passedCount: passed,
		totalCount:  total,
		status:      status,
	}
}

// ---------------------------------------------------------------------------
// Execution dispatcher
// ---------------------------------------------------------------------------

func runTests(ctx context.Context, req ExecuteRequest) ExecuteResponse {
	switch req.Language {
	case "python":
		return runPythonTests(ctx, req)
	default:
		return runGoTests(ctx, req)
	}
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

func compileErrorMessage(status, output string) string {
	if status != "compiler_error" {
		return ""
	}
	lines := strings.Split(output, "\n")

	// Try Go error format first
	for _, line := range lines {
		if strings.Contains(line, "solution.go:") {
			parts := strings.SplitN(line, "solution.go:", 2)
			return strings.TrimSpace(parts[1])
		}
	}

	// Try Python traceback format: find the last error line and its file context
	for i := len(lines) - 1; i >= 0; i-- {
		trimmed := strings.TrimSpace(lines[i])
		if trimmed == "" {
			continue
		}
		if isPythonErrorLine(trimmed) {
			// Look backwards for File "...", line N context
			for j := i - 1; j >= max(0, i-4); j-- {
				ctx := strings.TrimSpace(lines[j])
				if pyFile, lineNum := extractPyFileLine(ctx); pyFile != "" {
					return fmt.Sprintf("%s:%s: %s", pyFile, lineNum, trimmed)
				}
			}
			return trimmed
		}
	}

	// Fallback: first non-empty, non-Go-toolchain line
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed != "" &&
			!strings.HasPrefix(trimmed, "#") &&
			!strings.HasPrefix(trimmed, "FAIL") &&
			!strings.HasPrefix(trimmed, "exit status") &&
			!strings.HasPrefix(trimmed, "ok ") &&
			!strings.HasPrefix(trimmed, "Traceback") {
			return trimmed
		}
	}
	return "compilation failed"
}

// isPythonErrorLine detects Python error lines like "NameError: ..." or
// "TypeError: ...". It uses a colon-based heuristic: the word before the
// first colon must end with "Error" or "Exception" and be a single token
// (no spaces/quotes), which matches all Python builtin and custom exceptions
// while rejecting Go file paths, indented code, and traceback headers.
func isPythonErrorLine(line string) bool {
	line = strings.TrimSpace(line)
	if line == "" {
		return false
	}
	colonIdx := strings.IndexByte(line, ':')
	if colonIdx <= 0 {
		return false
	}
	errorType := line[:colonIdx]
	// Must be a single word token — reject paths, indented code, headers
	if strings.ContainsAny(errorType, " \t\"'") {
		return false
	}
	return strings.HasSuffix(errorType, "Error") || strings.HasSuffix(errorType, "Exception")
}

// extractPyFileLine extracts file and line number from Python "File" line.
// Input:  File "/tmp/sandbox/solution.py", line 3, in <module>
// Output: "solution.py", "3"
func extractPyFileLine(line string) (string, string) {
	line = strings.TrimSpace(line)
	if !strings.HasPrefix(line, "File \"") {
		return "", ""
	}
	rest := strings.TrimPrefix(line, "File ")
	rest = strings.TrimSpace(rest)
	if !strings.HasPrefix(rest, "\"") {
		return "", ""
	}
	rest = rest[1:] // skip opening quote
	endQuote := strings.IndexByte(rest, '"')
	if endQuote < 0 {
		return "", ""
	}
	filePath := rest[:endQuote]
	basename := filepath.Base(filePath)

	after := strings.TrimSpace(rest[endQuote+1:])
	if !strings.HasPrefix(after, ", line ") {
		return basename, ""
	}
	after = strings.TrimPrefix(after, ", line ")
	lineNum := strings.Split(after, ",")[0]
	lineNum = strings.Split(lineNum, " ")[0]
	return basename, strings.TrimSpace(lineNum)
}

func errorResponse(status, message string) ExecuteResponse {
	return ExecuteResponse{
		Status: status,
		Error:  message,
	}
}

// ---------------------------------------------------------------------------
// HTTP handlers
// ---------------------------------------------------------------------------

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
}

func versionHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	commit := gitCommit
	if commit == "" {
		commit = "dev"
	}
	fmt.Fprintf(w, `{"commit":%q}`, commit)
}

func executeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondError(w, http.StatusMethodNotAllowed, "method_not_allowed")
		return
	}

	if r.Header.Get("Content-Type") != "application/json" {
		respondError(w, http.StatusUnsupportedMediaType, "content_type_required")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 100*1024)

	var req ExecuteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid_request_body")
		return
	}

	if req.Code == "" {
		respondError(w, http.StatusBadRequest, "code_required")
		return
	}
	if req.TestCode == "" {
		respondError(w, http.StatusBadRequest, "test_code_required")
		return
	}

	result := runTests(r.Context(), req)

	w.Header().Set("Content-Type", "application/json")
	if result.Status == "internal_error" {
		w.WriteHeader(http.StatusInternalServerError)
	} else {
		w.WriteHeader(http.StatusOK)
	}
	json.NewEncoder(w).Encode(result)
}

func respondError(w http.ResponseWriter, code int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

var gitCommit string // set at build time with -ldflags

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Per-IP rate limiter: 10 requests per minute, purge stale entries every 5 minutes
	rl := NewRateLimiter(10, 1*time.Minute, 5*time.Minute)
	defer rl.Stop()

	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/version", versionHandler)
	mux.HandleFunc("/execute", executeHandler)
	// Rate limiter middleware
	rateLimited := rl.Middleware(mux)

	// Route: internal endpoints bypass rate limiter
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		if path == "/health" || path == "/version" {
			mux.ServeHTTP(w, r)
			return
		}
		rateLimited.ServeHTTP(w, r)
	})

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: time.Duration(maxTimeoutSec+10) * time.Second,
		IdleTimeout:  30 * time.Second,
	}

	log.Printf("sandbox: listening on :%s", port)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("sandbox: server error: %v", err)
	}
}
