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
	// Extract the first meaningful line mentioning solution.go
	for _, line := range strings.Split(output, "\n") {
		if strings.Contains(line, "solution.go:") {
			parts := strings.SplitN(line, "solution.go:", 2)
			return strings.TrimSpace(parts[1])
		}
	}
	// Fallback: first non-empty, non-Go-toolchain line
	for _, line := range strings.Split(output, "\n") {
		trimmed := strings.TrimSpace(line)
		if trimmed != "" &&
			!strings.HasPrefix(trimmed, "#") &&
			!strings.HasPrefix(trimmed, "FAIL") &&
			!strings.HasPrefix(trimmed, "exit status") &&
			!strings.HasPrefix(trimmed, "ok ") {
			return trimmed
		}
	}
	return "compilation failed"
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
