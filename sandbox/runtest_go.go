package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

var packageRegexp = regexp.MustCompile(`(?m)^\s*package\s+\w+`)

func runGoTests(ctx context.Context, req ExecuteRequest) ExecuteResponse {
	// Normalise parameters
	timeoutSec := req.TimeoutSec
	if timeoutSec <= 0 || timeoutSec > maxTimeoutSec {
		timeoutSec = defaultTimeoutSec
	}

	// Validate code for dangerous patterns before any I/O
	if err := validateCode(req.Code); err != nil {
		log.Printf("security: blocked Go submission: %v", err)
		return ExecuteResponse{
			Status: "security_error",
			Error:  err.Error(),
		}
	}
	goModule := req.GoModule
	if goModule == "" {
		goModule = defaultGoModule
	} else {
		if strings.ContainsAny(goModule, "\n\r") || !regexp.MustCompile(`^[a-zA-Z0-9_./-]+$`).MatchString(goModule) {
			return errorResponse("security_error", "invalid go_module")
		}
	}
	goVersion := req.GoVersion
	if goVersion == "" {
		goVersion = defaultGoVersion
	} else {
		if !regexp.MustCompile(`^1\.\d+$`).MatchString(goVersion) {
			return errorResponse("security_error", "invalid go_version")
		}
	}

	// Create an isolated temp directory
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

	// Write solution.go
	solution := strings.TrimSpace(req.Code)
	solution = forcePackageKoder(solution)
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
	cmd.Env = []string{
		"PATH=" + os.Getenv("PATH"),
		"HOME=" + os.Getenv("HOME"),
		"CGO_ENABLED=0",
		"GOPROXY=off",
		"GOSUMDB=off",
		"GOTOOLCHAIN=local",
		"GOFLAGS=-buildvcs=false",
	}

	setProcessAttributes(cmd, timeoutSec)

	var out cappedBuffer
	out.max = 64 * 1024
	cmd.Stdout = &out
	cmd.Stderr = &out
	if err := cmd.Run(); err != nil {
		log.Printf("runGoTests: go command returned error: %v output=%s", err, out.String())
	}

	output := out.String()
	if len(output) > 100*1024 {
		output = output[:100*1024]
	}

	if runCtx.Err() == context.DeadlineExceeded {
		killProcessGroup(cmd)
		reapProcess(cmd)
	}

	runtimeMs := int(time.Since(start).Milliseconds())

	timedOut := runCtx.Err() == context.DeadlineExceeded
	result := classifyOutput(output, timedOut, err)

	log.Printf("execution: status=%s passed=%d total=%d runtime=%dms timeout=%ds",
		result.status, result.passedCount, result.totalCount, runtimeMs, timeoutSec)

	return ExecuteResponse{
		Status:      result.status,
		Stdout:      output,
		Stderr:      "",
		PassedCount: result.passedCount,
		TotalCount:  result.totalCount,
		RuntimeMs:   runtimeMs,
		Error:       compileErrorMessage(result.status, output),
	}
}

func forcePackageKoder(code string) string {
	if packageRegexp.MatchString(code) {
		return packageRegexp.ReplaceAllString(code, "package koder")
	}
	return "package koder\n\n" + code
}
