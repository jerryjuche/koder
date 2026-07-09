package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

// stripShebang removes any shebang line from Python code.
func stripShebang(code string) string {
	lines := strings.Split(code, "\n")
	if len(lines) > 0 && strings.HasPrefix(strings.TrimSpace(lines[0]), "#!") {
		lines = lines[1:]
	}
	return strings.TrimSpace(strings.Join(lines, "\n"))
}

// findPythonBin returns the path to a Python 3 interpreter, or empty string if none found.
func findPythonBin() string {
	if _, err := exec.LookPath("python3"); err == nil {
		return "python3"
	}
	if _, err := exec.LookPath("python"); err == nil {
		return "python"
	}
	return ""
}

type cappedBuffer struct {
	bytes.Buffer
	max int
}

func (b *cappedBuffer) Write(p []byte) (int, error) {
	if b.Len() >= b.max {
		return len(p), nil
	}
	if len(p) > b.max-b.Len() {
		p = p[:b.max-b.Len()]
	}
	return b.Buffer.Write(p)
}

func runCommandWithLimitedOutput(ctx context.Context, name string, stdin *strings.Reader, args ...string) ([]byte, error) {
	cmd := exec.CommandContext(ctx, name, args...)
	if stdin != nil {
		cmd.Stdin = stdin
	}
	var out cappedBuffer
	out.max = 64 * 1024
	cmd.Stdout = &out
	cmd.Stderr = &out
	if err := cmd.Run(); err != nil {
		return out.Bytes(), err
	}
	return out.Bytes(), nil
}

func formatSecurityFriendlyMessage(errText string) string {
	reason := strings.TrimSpace(strings.TrimPrefix(errText, "security:"))
	if reason == "" {
		reason = "restricted or unsafe behavior"
	}
	return fmt.Sprintf("Your code was blocked by the sandbox security checks: %s — Tip: Keep your solution within the allowed built-ins and avoid file, network, process, and dynamic execution features.", reason)
}

// validatePythonAST is Layer 2 defense: runs ast.parse() on the submitted code
// via a Python subprocess to catch obfuscated imports and dangerous calls.
func validatePythonAST(code string) error {
	script := `
import ast, sys, json

dangerous_modules = {"os", "subprocess", "ctypes", "socket", "shutil", "pickle", "code", "importlib", "builtins"}
dangerous_calls = {"eval", "exec", "compile", "__import__", "open", "getattr", "setattr", "globals", "locals", "input"}

try:
    tree = ast.parse(sys.stdin.read())
except SyntaxError as e:
    print(json.dumps({"ok": False, "error": f"syntax error: {e}"}))
    sys.exit(0)

for node in ast.walk(tree):
    if isinstance(node, ast.Import):
        for alias in node.names:
            base = alias.name.split(".")[0]
            if base in dangerous_modules:
                print(json.dumps({"ok": False, "error": f"dangerous import: {alias.name}"}))
                sys.exit(0)
    if isinstance(node, ast.ImportFrom):
        base = node.module.split(".")[0] if node.module else ""
        if base in dangerous_modules:
            print(json.dumps({"ok": False, "error": f"dangerous from-import: {node.module}"}))
            sys.exit(0)
    if isinstance(node, ast.Call):
        if isinstance(node.func, ast.Name) and node.func.id in dangerous_calls:
            print(json.dumps({"ok": False, "error": f"dangerous call: {node.func.id}"}))
            sys.exit(0)
        if isinstance(node.func, ast.Attribute) and isinstance(node.func.value, ast.Name):
            if node.func.value.id in dangerous_modules:
                print(json.dumps({"ok": False, "error": f"dangerous attribute: {node.func.value.id}.{node.func.attr}"}))
                sys.exit(0)

print(json.dumps({"ok": True}))
`
	var astPythonBin = findPythonBin()
	if astPythonBin == "" {
		// No Python available, skip AST validation
		return nil
	}
	// Use a short timeout (10s) to prevent malicious AST from hanging the sandbox
	astCtx, astCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer astCancel()
	output, err := runCommandWithLimitedOutput(astCtx, astPythonBin, strings.NewReader(code), "-c", script)
	if err != nil {
		log.Printf("validatePythonAST: python subprocess error: %v output=%s", err, string(output))
		return nil
	}

	var result struct {
		Ok    bool   `json:"ok"`
		Error string `json:"error"`
	}
	if err := json.Unmarshal(output, &result); err != nil {
		log.Printf("validatePythonAST: failed to parse python AST output: %v output=%s", err, string(output))
		return nil
	}
	if !result.Ok {
		return fmt.Errorf("security: %s", result.Error)
	}
	return nil
}

// runPythonTests executes a Python solution against generated test code.
func runPythonTests(ctx context.Context, req ExecuteRequest) ExecuteResponse {
	// Normalise timeout
	timeoutSec := req.TimeoutSec
	if timeoutSec <= 0 || timeoutSec > maxTimeoutSec {
		timeoutSec = defaultTimeoutSec
	}

	// Layer 1: Regex blocklist
	if err := validatePythonCode(req.Code); err != nil {
		log.Printf("security: blocked Python submission (regex): %v", err)
		return ExecuteResponse{
			Status: "security_error",
			Error:  formatSecurityFriendlyMessage(err.Error()),
		}
	}

	// Layer 2: AST validation via Python subprocess
	if err := validatePythonAST(req.Code); err != nil {
		log.Printf("security: blocked Python submission (AST): %v", err)
		return ExecuteResponse{
			Status: "security_error",
			Error:  formatSecurityFriendlyMessage(err.Error()),
		}
	}

	var pythonBin = findPythonBin()
	if pythonBin == "" {
		log.Printf("neither python3 nor python found in PATH")
		return ExecuteResponse{
			Status: "compiler_error",
			Stdout: "",
			Error:  "Python interpreter not found in sandbox environment",
		}
	}
	log.Printf("using python binary: %s", pythonBin)

	// Create an isolated temp directory
	tmpDir, err := os.MkdirTemp("", "pysandbox-"+randString(8)+"-")
	if err != nil {
		log.Printf("WARN: system temp dir unavailable (%v), falling back to CWD", err)
		tmpDir, err = os.MkdirTemp(".", "pysandbox-"+randString(8)+"-")
	}
	if err != nil {
		return errorResponse("internal_error", fmt.Sprintf("failed to create temp directory: %v", err))
	}
	defer func() {
		if rmErr := os.RemoveAll(tmpDir); rmErr != nil {
			log.Printf("WARN: failed to clean up sandbox %s: %v", tmpDir, rmErr)
		}
	}()

	// Write solution.py
	solution := stripShebang(req.Code)
	solution = strings.TrimSpace(solution)
	if err := os.WriteFile(filepath.Join(tmpDir, "solution.py"), []byte(solution), 0644); err != nil {
		return errorResponse("internal_error", fmt.Sprintf("failed to write solution.py: %v", err))
	}

	// Write run_tests.py (the test code generated by the backend)
	if err := os.WriteFile(filepath.Join(tmpDir, "run_tests.py"), []byte(req.TestCode), 0644); err != nil {
		return errorResponse("internal_error", fmt.Sprintf("failed to write run_tests.py: %v", err))
	}

	// Execute python -u run_tests.py with execution timeout
	runCtx, runCancel := context.WithTimeout(ctx, time.Duration(timeoutSec)*time.Second)
	defer runCancel()

	start := time.Now()
	cmd := exec.CommandContext(runCtx, pythonBin, "-u", "run_tests.py")
	cmd.Dir = tmpDir
	cmd.Env = []string{
		"PATH=" + os.Getenv("PATH"),
		"HOME=" + os.Getenv("HOME"),
		"PYTHONDONTWRITEBYTECODE=1",
		"PYTHONUNBUFFERED=1",
	}

	setPythonRlimits(timeoutSec)

	var out cappedBuffer
	out.max = 64 * 1024
	cmd.Stdout = &out
	cmd.Stderr = &out
	err = cmd.Run()
	outputBytes := out.Bytes()
	if err != nil {
		log.Printf("runPythonTests: python command returned error: %v output=%s", err, string(outputBytes))
		if strings.Contains(string(outputBytes), "cannot allocate memory") || strings.Contains(string(outputBytes), "out of memory") || strings.Contains(string(outputBytes), "Killed") {
			return ExecuteResponse{
				Status: "compiler_error",
				Stdout: string(outputBytes),
				Error:  "The sandbox ran out of memory while executing your code. Try simplifying your solution or reducing the amount of data processed.",
			}
		}
	}

	if len(outputBytes) > 100*1024 {
		outputBytes = outputBytes[:100*1024]
	}
	output := string(outputBytes)

	if runCtx.Err() == context.DeadlineExceeded {
		killProcessGroup(cmd)
		reapProcess(cmd)
	}

	runtimeMs := int(time.Since(start).Milliseconds())

	timedOut := runCtx.Err() == context.DeadlineExceeded
	result := classifyOutput(output, timedOut, err)

	log.Printf("execution: status=%s passed=%d total=%d runtime=%dms language=python timeout=%ds",
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
