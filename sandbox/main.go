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
	"os/exec"
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
	Code       string `json:"code"`        // Student solution (package piscine expected)
	TestCode   string `json:"test_code"`   // Generated main_test.go content
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
// Execution logic
// ---------------------------------------------------------------------------

func runTests(ctx context.Context, req ExecuteRequest) ExecuteResponse {
	// Normalise parameters
	timeoutSec := req.TimeoutSec
	if timeoutSec <= 0 || timeoutSec > maxTimeoutSec {
		timeoutSec = defaultTimeoutSec
	}

	// Validate code for dangerous patterns before any I/O
	if err := validateCode(req.Code); err != nil {
		log.Printf("security: blocked submission: %v", err)
		return ExecuteResponse{
			Status: "security_error",
			Error:  err.Error(),
		}
	}
	goModule := req.GoModule
	if goModule == "" {
		goModule = defaultGoModule
	}
	goVersion := req.GoVersion
	if goVersion == "" {
		goVersion = defaultGoVersion
	}

	// Create an isolated temp directory.
	// First try the system temp dir; fall back to CWD if /tmp is missing
	// (some Railway containers start without /tmp).
	tmpDir, err := os.MkdirTemp("", fmt.Sprintf("sandbox-%s-", randString(8)))
	if err != nil {
		log.Printf("WARN: system temp dir unavailable (%v), falling back to CWD", err)
		tmpDir, err = os.MkdirTemp(".", fmt.Sprintf("sandbox-%s-", randString(8)))
	}
	if err != nil {
		return errorResponse("internal_error", fmt.Sprintf("failed to create temp directory: %v", err))
	}
	defer func() {
		if rmErr := os.RemoveAll(tmpDir); rmErr != nil {
			log.Printf("WARN: failed to clean up sandbox %s: %v", tmpDir, rmErr)
		}
	}()

	// Write go.mod
	goModContent := fmt.Sprintf("module %s\n\ngo %s\n", goModule, goVersion)
	if err := os.WriteFile(filepath.Join(tmpDir, "go.mod"), []byte(goModContent), 0644); err != nil {
		return errorResponse("internal_error", fmt.Sprintf("failed to write go.mod: %v", err))
	}

	// Write solution.go — force package piscine
	solution := strings.TrimSpace(req.Code)
	solution = forcePackagePiscine(solution)
	if err := os.WriteFile(filepath.Join(tmpDir, "solution.go"), []byte(solution), 0644); err != nil {
		return errorResponse("internal_error", fmt.Sprintf("failed to write solution.go: %v", err))
	}

	// Write main_test.go
	if err := os.WriteFile(filepath.Join(tmpDir, "main_test.go"), []byte(req.TestCode), 0644); err != nil {
		return errorResponse("internal_error", fmt.Sprintf("failed to write main_test.go: %v", err))
	}

	// Run go test with execution timeout
	runCtx, runCancel := context.WithTimeout(ctx, time.Duration(timeoutSec)*time.Second)
	defer runCancel()

	start := time.Now()
	cmd := exec.CommandContext(runCtx, "go", "test",
		"-v",
		"-count=1",
		"-gcflags=-l",
		"./...",
	)
	cmd.Dir = tmpDir

	// Apply OS-level resource limits (memory, processes, fds, cpu)
	// These are enforced by the kernel and cannot be bypassed by the child.
	setProcessAttributes(cmd, timeoutSec)

	output, err := cmd.CombinedOutput()

	// If timed out, forcefully kill the entire process group to ensure no
	// zombie children survive (fork bombs, runaway goroutines, etc.)
	if runCtx.Err() == context.DeadlineExceeded {
		killProcessGroup(cmd)
		reapProcess(cmd)
	}

	runtimeMs := int(time.Since(start).Milliseconds())
	stdout := string(output)

	// Classify result
	timedOut := runCtx.Err() == context.DeadlineExceeded
	result := classifyOutput(stdout, timedOut, err)

	// Resource monitoring log
	log.Printf("execution: status=%s passed=%d total=%d runtime=%dms timeout=%ds",
		result.status, result.passedCount, result.totalCount, runtimeMs, timeoutSec)

	return ExecuteResponse{
		Status:      result.status,
		Stdout:      stdout,
		Stderr:      "",
		PassedCount: result.passedCount,
		TotalCount:  result.totalCount,
		RuntimeMs:   runtimeMs,
		Error:       compileErrorMessage(result.status, stdout),
	}
}

// forcePackagePiscine replaces any package declaration with "package piscine".
// If none exists, it prepends the declaration.
var packageRegexp = regexp.MustCompile(`(?m)^\s*package\s+\w+`)

func forcePackagePiscine(code string) string {
	if packageRegexp.MatchString(code) {
		return packageRegexp.ReplaceAllString(code, "package piscine")
	}
	return "package piscine\n\n" + code
}

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

	var req ExecuteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid_request_body")
		return
	}

	if r.Header.Get("Content-Type") != "application/json" {
		respondError(w, http.StatusUnsupportedMediaType, "content_type_required")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 100*1024)

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
