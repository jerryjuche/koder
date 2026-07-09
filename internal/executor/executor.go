package executor

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"text/template"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
)

type Executor struct {
	cfg       *config.Config
	store     store.Store
	semaphore chan struct{}
}

// NewExecutor creates a new Executor instance with a concurrency semaphore.
func NewExecutor(cfg *config.Config, store store.Store) *Executor {
	return &Executor{
		cfg:       cfg,
		store:     store,
		semaphore: make(chan struct{}, cfg.ExecutorMaxConcurrency),
	}
}

// Warmup pulls the configured Docker image and initializes the build cache to prevent cold-start timeouts.
func (e *Executor) Warmup(ctx context.Context) error {
	slog.Info("executor: warming up docker image", "image", e.cfg.DockerImage)
	cmdPull := exec.CommandContext(ctx, "docker", "pull", e.cfg.DockerImage)
	cmdPull.Stdout = os.Stdout
	cmdPull.Stderr = os.Stderr
	if err := cmdPull.Run(); err != nil {
		slog.Warn("executor: failed to pull docker image, cold start might be slow", "error", err)
	}

	slog.Info("executor: populating go build cache")
	if err := os.MkdirAll(e.cfg.BuildCacheDir, 0755); err != nil {
		return fmt.Errorf("failed to create build cache dir: %w", err)
	}

	cmdRun := exec.CommandContext(ctx, "docker", "run", "--rm",
		"--user=65534:65534",
		"--cap-drop=ALL",
		"--security-opt=no-new-privileges",
		"--network=none",
		"--read-only",
		"--env", "CGO_ENABLED=0",
		"-v", fmt.Sprintf("%s:/root/.cache/go-build", e.cfg.BuildCacheDir),
		e.cfg.DockerImage, "go", "build", "std")

	if err := cmdRun.Run(); err != nil {
		slog.Warn("executor: failed to run dummy container, cache might not be populated", "error", err)
	}

	slog.Info("executor: warmup complete")
	return nil
}

// Execute acquires a concurrency slot, compiles, runs, and grades a submission.
func (e *Executor) Execute(ctx context.Context, req ExecutionRequest) (*ExecutionResult, error) {
	// 1. Acquire semaphore slot
	select {
	case e.semaphore <- struct{}{}:
	case <-ctx.Done():
		return nil, ctx.Err()
	}
	defer func() { <-e.semaphore }()

	slog.Info("executor: acquired semaphore slot", "user_id", req.UserID, "problem_id", req.ProblemID, "concurrent", len(e.semaphore))

	// 2. Fetch problem and test cases from the database
	problem, testCases, err := e.store.GetProblemWithTestCases(ctx, req.ProblemID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch problem and test cases: %w", err)
	}

	// 3. Resolve language-specific function metadata from LanguageVersions
	resolveProblemLanguageMeta(problem, req.Language)

		// 4. Route to language-specific executor
	if req.Language == "python" {
		return e.executePython(ctx, req, problem, testCases, true)
	}

	// 4. Format test cases as Go literals and prepare template data
	var needsReflect bool
	if !IsPrimitiveType(problem.ReturnType) && problem.ReturnType != "" {
		needsReflect = true
	}

	var renderedCases []TestCaseRenderData
	for _, tc := range testCases {
		// Parse JSON array input
		var rawArgs []json.RawMessage
		if err := json.Unmarshal(tc.Input, &rawArgs); err != nil {
			return nil, fmt.Errorf("failed to parse test case input: %w", err)
		}

		if len(rawArgs) != len(problem.ParamTypes) {
			return nil, fmt.Errorf("test case ordinal %d input count (%d) does not match problem param_types count (%d)",
				tc.Ordinal, len(rawArgs), len(problem.ParamTypes))
		}

		// Format arguments to Go literals
		var formattedArgs []string
		for i, rawArg := range rawArgs {
			formatted, err := formatGoLiteral(problem.ParamTypes[i], rawArg)
			if err != nil {
				return nil, fmt.Errorf("failed to format param %d for test case %d: %w", i, tc.Ordinal, err)
			}
			formattedArgs = append(formattedArgs, formatted)
		}

		// Convert expected JSON string to Go literal
		formattedExpected, err := formatGoLiteral(problem.ReturnType, []byte(tc.Expected))
		if err != nil {
			return nil, fmt.Errorf("failed to format expected value for test case %d: %w", tc.Ordinal, err)
		}

		renderedCases = append(renderedCases, TestCaseRenderData{
			Args:     strings.Join(formattedArgs, ", "),
			Expected: formattedExpected,
			Ordinal:  tc.Ordinal,
		})
	}

	renderData := &TemplateRenderData{
		FuncName:     problem.FuncName,
		ParamTypes:   problem.ParamTypes,
		ReturnType:   problem.ReturnType,
		IsPrimitive:  IsPrimitiveType(problem.ReturnType),
		NeedsReflect: needsReflect,
		TestCases:    renderedCases,
	}

	// 4. Create isolated sandbox directory
	uuidStr := uuid.NewString()
	sandboxPath, err := PrepareSandbox(e.cfg.SandboxBaseDir, uuidStr, req.Code, renderData, e.cfg.GoVersion)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare sandbox: %w", err)
	}

	// Per-execution build cache to prevent cache poisoning across users
	cachePath := filepath.Join(e.cfg.BuildCacheDir, uuidStr)
	if err := os.MkdirAll(cachePath, 0755); err != nil {
		return nil, fmt.Errorf("failed to create per-exec cache dir: %w", err)
	}

	defer func() {
		if err := os.RemoveAll(sandboxPath); err != nil {
			slog.Error("executor: failed to clean up sandbox directory", "path", sandboxPath, "error", err)
		}
		if err := os.RemoveAll(cachePath); err != nil {
			slog.Error("executor: failed to clean up cache directory", "path", cachePath, "error", err)
		}
	}()

	slog.Info("executor: sandbox created", "path", sandboxPath)

	// 5. Execute: remote sandbox or local Docker
	var (
		output        string
		runtimeMs     int
		cmdErr        error
		sandboxStatus string // non-empty = use sandbox result directly
		runCtx        context.Context
		runCancel     context.CancelFunc
	)

	if e.cfg.SandboxURL != "" {
		codeBytes, err := os.ReadFile(filepath.Join(sandboxPath, "solution.go"))
		if err != nil {
			return nil, fmt.Errorf("failed to read solution.go: %w", err)
		}
		testBytes, err := os.ReadFile(filepath.Join(sandboxPath, "main_test.go"))
		if err != nil {
			return nil, fmt.Errorf("failed to read main_test.go: %w", err)
		}
		client := newSandboxClient(e.cfg.SandboxURL, e.cfg.ExecutorTimeoutSeconds)
		resp, err := client.execute(ctx, req.Language, string(codeBytes), string(testBytes), e.cfg.GoVersion)
		if err != nil {
			return nil, fmt.Errorf("sandbox: %w", err)
		}
		output = resp.Stdout
		runtimeMs = resp.RuntimeMs
		sandboxStatus = resp.Status
	} else {
		runCtx, runCancel = context.WithTimeout(ctx, e.cfg.ExecutorTimeout())
		defer runCancel()

		cmd := exec.CommandContext(runCtx, "docker", "run",
			"--rm",
			"--user=65534:65534",
			"--cap-drop=ALL",
			"--security-opt=no-new-privileges",
			"--network=none",
			"--memory=256m",
			"--cpus=1.0",
			"--pids-limit=512",
			"--read-only",
			"--env", "CGO_ENABLED=0",
			"--env", "GOPROXY=off",
			"--env", "GOSUMDB=off",
			"--env", "GOTOOLCHAIN=local",
			"--env", "GOFLAGS=-buildvcs=false",
			"-v", fmt.Sprintf("%s:/app:ro", sandboxPath),
			"-v", fmt.Sprintf("%s:/root/.cache/go-build", cachePath),
			"--tmpfs", "/tmp:size=64m,noexec,nosuid",
			"-w", "/app",
			e.cfg.DockerImage,
			"go", "test", "-v", "-count=1", "-gcflags=-l", "./...",
		)

		startTime := time.Now()
		var outputBytes []byte
		outputBytes, cmdErr = cmd.CombinedOutput()
		runtimeMs = int(time.Since(startTime).Milliseconds())
		output = string(outputBytes)

		// Cap output to 100KB to prevent OOM
		if len(output) > 100*1024 {
			output = output[:100*1024]
		}
	}

	// 6. Parse go test output
	parsed := ParseTestOutput(output)
	passedMap := parsed.passedMap
	gotMap := parsed.gotMap
	wantMap := parsed.wantMap

	// 7. Classify submission status
	var status string
	var passedCount int
	totalCount := len(testCases)

	for _, tc := range testCases {
		if passed, found := passedMap[tc.Ordinal]; found && passed {
			passedCount++
		}
	}

	var friendlyMessage string

	if sandboxStatus != "" {
		status = sandboxStatus
		switch status {
		case "timeout":
			slog.Error("executor: execution timed out", "output", output, "runtime_ms", runtimeMs)
			friendlyMessage = "Execution timed out. Ensure there are no infinite loops and your algorithm is efficient."
		case "compiler_error":
			friendlyMessage = parseCompilerError(output)
		case "security_error":
			status = "compiler_error"
			friendlyMessage = "Your code was blocked for security reasons."
		}
	} else if runCtx != nil && runCtx.Err() == context.DeadlineExceeded {
		slog.Error("executor: execution timed out", "output", output, "runtime_ms", runtimeMs)
		status = "timeout"
		friendlyMessage = "Execution timed out. Ensure there are no infinite loops and your algorithm is efficient."
	} else if cmdErr != nil && strings.Contains(cmdErr.Error(), "exit status 137") {
		slog.Error("executor: execution OOM", "output", output, "runtime_ms", runtimeMs)
		status = "timeout"
		friendlyMessage = "Your code used too much memory. Try optimizing your solution."
	} else if cmdErr != nil && len(passedMap) == 0 {
		status = "compiler_error"
		friendlyMessage = parseCompilerError(output)
	} else if totalCount > 0 && passedCount == totalCount {
		status = "passed"
	} else {
		status = "failed"
	}

	slog.Info("executor: execution finished", "status", status, "passed", passedCount, "total", totalCount, "runtime_ms", runtimeMs)

	// 8. Record submission in DB
	sub := &store.Submission{
		UserID:      pgtype.UUID{Bytes: req.UserID, Valid: true},
		ProblemID:   pgtype.UUID{Bytes: req.ProblemID, Valid: true},
		Language:    req.Language,
		Code:        req.Code,
		Status:      status,
		PassedCount: passedCount,
		TotalCount:  totalCount,
		OutputLogs:  output,
		RuntimeMs:   runtimeMs,
	}

	if err := e.store.CreateSubmission(ctx, sub); err != nil {
		return nil, fmt.Errorf("failed to save submission: %w", err)
	}

	// 9. Update user progress in DB
	prog := &store.Progress{
		UserID:      pgtype.UUID{Bytes: req.UserID, Valid: true},
		ProblemID:   pgtype.UUID{Bytes: req.ProblemID, Valid: true},
		Solved:      status == "passed",
		BestRuntime: runtimeMs,
	}

	if err := e.store.UpsertProgress(ctx, prog); err != nil {
		return nil, fmt.Errorf("failed to update progress: %w", err)
	}

	// 10. Map results back to execution response
	var results []TestResult
	for _, tc := range testCases {
		passed := passedMap[tc.Ordinal]
		var got, want string

		// Prefer parsed output from go test; fall back to expected value
		if parsedGot, exists := gotMap[tc.Ordinal]; exists {
			got = parsedGot
		} else if !passed {
			got = "(no output captured)"
		} else {
			got = tc.Expected
		}

		// Use parsed WANT if available; otherwise use stored expected
		if parsedWant, exists := wantMap[tc.Ordinal]; exists {
			want = parsedWant
		} else {
			want = tc.Expected
		}

		// Hide test case details from students if hidden and didn't pass
		if tc.IsHidden && !passed {
			got = "(hidden test case)"
			want = "(hidden)"
		}

		results = append(results, TestResult{
			TestCaseID: uuid.UUID(tc.ID.Bytes),
			Ordinal:    tc.Ordinal,
			Passed:     passed,
			Got:        got,
			Expected:   want,
			IsHidden:   tc.IsHidden,
		})
	}

	return &ExecutionResult{
		Status:          status,
		FriendlyMessage: friendlyMessage,
		PassedCount:     passedCount,
		TotalCount:      totalCount,
		OutputLogs:      output,
		RuntimeMs:       runtimeMs,
		TestResults:     results,
	}, nil
}

func parseCompilerError(output string) string {
	lines := strings.Split(output, "\n")
	// Try Go error format first
	for _, line := range lines {
		if strings.Contains(line, "solution.go:") {
			parts := strings.SplitN(line, "solution.go:", 2)
			return "Line " + strings.TrimSpace(parts[1])
		}
	}
	// Try Python traceback format
	var pyLines []string
	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}
		// Capture meaningful error lines from Python tracebacks
		if strings.HasPrefix(trimmed, "SyntaxError:") ||
			strings.HasPrefix(trimmed, "IndentationError:") ||
			strings.HasPrefix(trimmed, "ImportError:") ||
			strings.HasPrefix(trimmed, "ModuleNotFoundError:") ||
			strings.HasPrefix(trimmed, "NameError:") ||
			strings.HasPrefix(trimmed, "TypeError:") ||
			strings.HasPrefix(trimmed, "AttributeError:") ||
			strings.HasPrefix(trimmed, "ValueError:") ||
			strings.HasPrefix(trimmed, "ZeroDivisionError:") ||
			strings.HasPrefix(trimmed, "EOFError:") {
			// Include line number context from above
			for j := max(0, i-3); j < i; j++ {
				ctx := strings.TrimSpace(lines[j])
				if ctx != "" && !strings.HasPrefix(ctx, "Traceback") && !strings.HasPrefix(ctx, "File ") {
					pyLines = append(pyLines, ctx)
				}
			}
			pyLines = append(pyLines, trimmed)
			break
		}
	}
	if len(pyLines) > 0 {
		return strings.Join(pyLines, "\n")
	}

	// Fallback to first meaningful line
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed != "" && !strings.HasPrefix(trimmed, "#") && !strings.HasPrefix(trimmed, "FAIL") && !strings.HasPrefix(trimmed, "exit status") && !strings.HasPrefix(trimmed, "Traceback") && !strings.HasPrefix(trimmed, "File ") {
			return trimmed
		}
	}

	return "Compilation failed due to a syntax error."
}

// ExecuteVisibleOnly executes code against visible test cases only (used for testing without submission).
func (e *Executor) ExecuteVisibleOnly(ctx context.Context, req ExecutionRequest) (*ExecutionResult, error) {
	// 1. Acquire semaphore slot
	select {
	case e.semaphore <- struct{}{}:
	case <-ctx.Done():
		return nil, ctx.Err()
	}
	defer func() { <-e.semaphore }()

	slog.Info("executor: testing code (visible tests only)", "user_id", req.UserID, "problem_id", req.ProblemID)

	// 2. Fetch problem and test cases from the database
	problem, allTestCases, err := e.store.GetProblemWithTestCases(ctx, req.ProblemID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch problem and test cases: %w", err)
	}

	// 3. Resolve language-specific function metadata from LanguageVersions
	resolveProblemLanguageMeta(problem, req.Language)

	// Filter to only visible test cases
	var testCases []store.TestCase
	for _, tc := range allTestCases {
		if !tc.IsHidden {
			testCases = append(testCases, tc)
		}
	}

	// Route to language-specific executor
	if req.Language == "python" {
		return e.executePython(ctx, req, problem, testCases, false)
	}
	var needsReflect bool
	if !IsPrimitiveType(problem.ReturnType) && problem.ReturnType != "" {
		needsReflect = true
	}

	var renderedCases []TestCaseRenderData
	for _, tc := range testCases {
		// Parse JSON array input
		var rawArgs []json.RawMessage
		if err := json.Unmarshal(tc.Input, &rawArgs); err != nil {
			return nil, fmt.Errorf("failed to parse test case input: %w", err)
		}

		if len(rawArgs) != len(problem.ParamTypes) {
			return nil, fmt.Errorf("test case ordinal %d input count (%d) does not match problem param_types count (%d)",
				tc.Ordinal, len(rawArgs), len(problem.ParamTypes))
		}

		// Format arguments to Go literals
		var formattedArgs []string
		for i, rawArg := range rawArgs {
			formatted, err := formatGoLiteral(problem.ParamTypes[i], rawArg)
			if err != nil {
				return nil, fmt.Errorf("failed to format param %d for test case %d: %w", i, tc.Ordinal, err)
			}
			formattedArgs = append(formattedArgs, formatted)
		}

		// Convert expected JSON string to Go literal
		formattedExpected, err := formatGoLiteral(problem.ReturnType, []byte(tc.Expected))
		if err != nil {
			return nil, fmt.Errorf("failed to format expected value for test case %d: %w", tc.Ordinal, err)
		}

		renderedCases = append(renderedCases, TestCaseRenderData{
			Args:     strings.Join(formattedArgs, ", "),
			Expected: formattedExpected,
			Ordinal:  tc.Ordinal,
		})
	}

	renderData := &TemplateRenderData{
		FuncName:     problem.FuncName,
		ParamTypes:   problem.ParamTypes,
		ReturnType:   problem.ReturnType,
		IsPrimitive:  IsPrimitiveType(problem.ReturnType),
		NeedsReflect: needsReflect,
		TestCases:    renderedCases,
	}

	// 5. Create isolated sandbox directory
	uuidStr := uuid.NewString()
	sandboxPath, err := PrepareSandbox(e.cfg.SandboxBaseDir, uuidStr, req.Code, renderData, e.cfg.GoVersion)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare sandbox: %w", err)
	}

	// Per-execution build cache to prevent cache poisoning across users
	cachePath := filepath.Join(e.cfg.BuildCacheDir, uuidStr)
	if err := os.MkdirAll(cachePath, 0755); err != nil {
		return nil, fmt.Errorf("failed to create per-exec cache dir: %w", err)
	}

	defer func() {
		if err := os.RemoveAll(sandboxPath); err != nil {
			slog.Error("executor: failed to clean up sandbox directory", "path", sandboxPath, "error", err)
		}
		if err := os.RemoveAll(cachePath); err != nil {
			slog.Error("executor: failed to clean up cache directory", "path", cachePath, "error", err)
		}
	}()

	slog.Info("executor: sandbox created", "path", sandboxPath)

	// 6. Execute: remote sandbox or local Docker
	var (
		output        string
		runtimeMs     int
		cmdErr        error
		sandboxStatus string
		runCtx        context.Context
		runCancel     context.CancelFunc
	)

	if e.cfg.SandboxURL != "" {
		codeBytes, err := os.ReadFile(filepath.Join(sandboxPath, "solution.go"))
		if err != nil {
			return nil, fmt.Errorf("failed to read solution.go: %w", err)
		}
		testBytes, err := os.ReadFile(filepath.Join(sandboxPath, "main_test.go"))
		if err != nil {
			return nil, fmt.Errorf("failed to read main_test.go: %w", err)
		}
		client := newSandboxClient(e.cfg.SandboxURL, e.cfg.ExecutorTimeoutSeconds)
		resp, err := client.execute(ctx, req.Language, string(codeBytes), string(testBytes), e.cfg.GoVersion)
		if err != nil {
			return nil, fmt.Errorf("sandbox: %w", err)
		}
		output = resp.Stdout
		runtimeMs = resp.RuntimeMs
		sandboxStatus = resp.Status
	} else {
		runCtx, runCancel = context.WithTimeout(ctx, e.cfg.ExecutorTimeout())
		defer runCancel()

		cmd := exec.CommandContext(runCtx, "docker", "run",
			"--rm",
			"--user=65534:65534",
			"--cap-drop=ALL",
			"--security-opt=no-new-privileges",
			"--network=none",
			"--memory=256m",
			"--cpus=1.0",
			"--pids-limit=512",
			"--read-only",
			"--env", "CGO_ENABLED=0",
			"--env", "GOPROXY=off",
			"--env", "GOSUMDB=off",
			"--env", "GOTOOLCHAIN=local",
			"--env", "GOFLAGS=-buildvcs=false",
			"-v", fmt.Sprintf("%s:/app:ro", sandboxPath),
			"-v", fmt.Sprintf("%s:/root/.cache/go-build", cachePath),
			"--tmpfs", "/tmp:size=64m,noexec,nosuid",
			"-w", "/app",
			e.cfg.DockerImage,
			"go", "test", "-v", "-count=1", "-gcflags=-l", "./...",
		)

		startTime := time.Now()
		var outputBytes []byte
		outputBytes, cmdErr = cmd.CombinedOutput()
		runtimeMs = int(time.Since(startTime).Milliseconds())
		output = string(outputBytes)

		// Cap output to 100KB to prevent OOM
		if len(output) > 100*1024 {
			output = output[:100*1024]
		}
	}

	// 7. Parse go test output
	parsed := ParseTestOutput(output)
	passedMap := parsed.passedMap
	gotMap := parsed.gotMap
	wantMap := parsed.wantMap

	// 8. Classify submission status
	var status string
	var passedCount int
	totalCount := len(testCases)

	for _, tc := range testCases {
		if passed, found := passedMap[tc.Ordinal]; found && passed {
			passedCount++
		}
	}

	var friendlyMessage string

	if sandboxStatus != "" {
		status = sandboxStatus
		switch status {
		case "timeout":
			slog.Error("executor: execution timed out", "output", output, "runtime_ms", runtimeMs)
			friendlyMessage = "Execution timed out. Ensure there are no infinite loops and your algorithm is efficient."
		case "compiler_error":
			friendlyMessage = parseCompilerError(output)
		case "security_error":
			status = "compiler_error"
			friendlyMessage = "Your code was blocked for security reasons."
		}
	} else if runCtx != nil && runCtx.Err() == context.DeadlineExceeded {
		slog.Error("executor: execution timed out", "output", output, "runtime_ms", runtimeMs)
		status = "timeout"
		friendlyMessage = "Execution timed out. Ensure there are no infinite loops and your algorithm is efficient."
	} else if cmdErr != nil && strings.Contains(cmdErr.Error(), "exit status 137") {
		slog.Error("executor: execution OOM", "output", output, "runtime_ms", runtimeMs)
		status = "timeout"
		friendlyMessage = "Your code used too much memory. Try optimizing your solution."
	} else if cmdErr != nil && len(passedMap) == 0 {
		status = "compiler_error"
		friendlyMessage = parseCompilerError(output)
	} else if totalCount > 0 && passedCount == totalCount {
		status = "passed"
	} else {
		status = "failed"
	}

	slog.Info("executor: test execution finished", "status", status, "passed", passedCount, "total", totalCount, "runtime_ms", runtimeMs)

	// 9. Map results back to execution response (no database writes for test-only)
	var results []TestResult
	for _, tc := range testCases {
		passed := passedMap[tc.Ordinal]
		var got, want string

		if parsedGot, exists := gotMap[tc.Ordinal]; exists {
			got = parsedGot
		} else if !passed {
			got = "(no output captured)"
		} else {
			got = tc.Expected
		}

		if parsedWant, exists := wantMap[tc.Ordinal]; exists {
			want = parsedWant
		} else {
			want = tc.Expected
		}

		results = append(results, TestResult{
			TestCaseID: uuid.UUID(tc.ID.Bytes),
			Ordinal:    tc.Ordinal,
			Passed:     passed,
			Got:        got,
			Expected:   want,
			IsHidden:   tc.IsHidden,
		})
	}

	return &ExecutionResult{
		Status:          status,
		FriendlyMessage: friendlyMessage,
		PassedCount:     passedCount,
		TotalCount:      totalCount,
		OutputLogs:      output,
		RuntimeMs:       runtimeMs,
		TestResults:     results,
	}, nil
}

// IsPrimitiveType checks if a Go type name is a basic primitive type.
func IsPrimitiveType(t string) bool {
	t = strings.TrimSpace(t)
	switch t {
	case "int", "int8", "int16", "int32", "int64",
		"uint", "uint8", "uint16", "uint32", "uint64",
		"float32", "float64",
		"string", "bool", "rune", "byte":
		return true
	}
	return false
}

func formatGoLiteral(paramType string, data []byte) (string, error) {
	paramType = strings.TrimSpace(paramType)
	switch paramType {
	case "int", "int8", "int16", "int32", "int64", "rune":
		var val int64
		if err := json.Unmarshal(data, &val); err != nil {
			return "", err
		}
		return strconv.FormatInt(val, 10), nil
	case "uint", "uint8", "uint16", "uint32", "uint64", "byte":
		var val uint64
		if err := json.Unmarshal(data, &val); err != nil {
			return "", err
		}
		return strconv.FormatUint(val, 10), nil
	case "float32", "float64":
		var val float64
		if err := json.Unmarshal(data, &val); err != nil {
			return "", err
		}
		return strconv.FormatFloat(val, 'f', -1, 64), nil
	case "string":
		var val string
		if err := json.Unmarshal(data, &val); err != nil {
			return "", err
		}
		return fmt.Sprintf("%q", val), nil
	case "bool":
		var val bool
		if err := json.Unmarshal(data, &val); err != nil {
			return "", err
		}
		if val {
			return "true", nil
		}
		return "false", nil
	}

	// Slices (starts with "[]")
	if strings.HasPrefix(paramType, "[]") {
		elemType := paramType[2:]
		var rawList []json.RawMessage
		if err := json.Unmarshal(data, &rawList); err != nil {
			return "", err
		}
		var elems []string
		for _, rawElem := range rawList {
			formatted, err := formatGoLiteral(elemType, rawElem)
			if err != nil {
				return "", err
			}
			elems = append(elems, formatted)
		}
		return fmt.Sprintf("%s{%s}", paramType, strings.Join(elems, ", ")), nil
	}

	// Maps (starts with "map[")
	if strings.HasPrefix(paramType, "map[") {
		closeBracketIdx := strings.Index(paramType, "]")
		if closeBracketIdx != -1 {
			keyType := paramType[4:closeBracketIdx]
			valType := paramType[closeBracketIdx+1:]
			var rawMap map[string]json.RawMessage
			if err := json.Unmarshal(data, &rawMap); err != nil {
				return "", err
			}
			var pairs []string
			for k, rawV := range rawMap {
				var formattedKey string
				var err error
				if keyType == "string" {
					formattedKey = fmt.Sprintf("%q", k)
				} else {
					formattedKey, err = formatGoLiteral(keyType, []byte(k))
					if err != nil {
						return "", err
					}
				}
				formattedVal, err := formatGoLiteral(valType, rawV)
				if err != nil {
					return "", err
				}
				pairs = append(pairs, fmt.Sprintf("%s: %s", formattedKey, formattedVal))
			}
			return fmt.Sprintf("%s{%s}", paramType, strings.Join(pairs, ", ")), nil
		}
	}

	return "", fmt.Errorf("unsupported Go type %q: cannot format %s as a Go literal", paramType, string(data))
}

// formatPythonLiteral converts a JSON value to a Python literal string.
// Maps Go type names to Python literal syntax.
func formatPythonLiteral(paramType string, data []byte) (string, error) {
	paramType = strings.TrimSpace(paramType)
	switch paramType {
	case "int", "int8", "int16", "int32", "int64", "uint", "uint8", "uint16", "uint32", "uint64", "rune", "byte":
		var val int64
		if err := json.Unmarshal(data, &val); err != nil {
			return "", err
		}
		return strconv.FormatInt(val, 10), nil
	case "float32", "float64":
		var val float64
		if err := json.Unmarshal(data, &val); err != nil {
			return "", err
		}
		return strconv.FormatFloat(val, 'f', -1, 64), nil
	case "string":
		var val string
		if err := json.Unmarshal(data, &val); err != nil {
			return "", err
		}
		return fmt.Sprintf("%q", val), nil
	case "bool":
		var val bool
		if err := json.Unmarshal(data, &val); err != nil {
			return "", err
		}
		if val {
			return "True", nil
		}
		return "False", nil
	}
	return "", fmt.Errorf("unsupported type %q for Python literal", paramType)
}

// executePython runs Python code execution: prepares sandbox files,
// executes, parses output, optionally records submission + progress, and returns the result.
func (e *Executor) executePython(ctx context.Context, req ExecutionRequest, problem *store.Problem, testCases []store.TestCase, recordSubmission bool) (*ExecutionResult, error) {
	// 1. Build JSON test case array for the Python template
	type pyTestCase struct {
		Ordinal   int               `json:"ordinal"`
		InputJSON []json.RawMessage `json:"input_json"`
		Expected  string            `json:"expected"`
	}
	pyCases := make([]pyTestCase, len(testCases))
	for i, tc := range testCases {
		var rawArgs []json.RawMessage
		if err := json.Unmarshal(tc.Input, &rawArgs); err != nil {
			return nil, fmt.Errorf("failed to parse test case input: %w", err)
		}
		pyCases[i] = pyTestCase{
			Ordinal:   tc.Ordinal,
			InputJSON: rawArgs,
			Expected:  tc.Expected,
		}
	}
	casesJSON, err := json.Marshal(pyCases)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal Python test cases: %w", err)
	}

	// Resolve the Python function name from language_versions (not problem.FuncName,
	// which was overwritten by resolveProblemLanguageMeta to the Go entry)
	pythonFuncName := problem.FuncName
	if problem.LanguageVersions != nil {
		if spec, ok := problem.LanguageVersions["python"]; ok && spec.FuncName != "" {
			pythonFuncName = spec.FuncName
		}
	}
	renderData := &TemplateRenderData{
		FuncName:      pythonFuncName,
		TestCasesJSON: string(casesJSON),
	}

	// 2. Create isolated sandbox directory
	uuidStr := uuid.NewString()
	sandboxPath := filepath.Join(e.cfg.SandboxBaseDir, uuidStr)
	if err := os.MkdirAll(sandboxPath, 0755); err != nil {
		return nil, fmt.Errorf("failed to create sandbox directory: %w", err)
	}

	defer func() {
		if err := os.RemoveAll(sandboxPath); err != nil {
			slog.Error("executor: failed to clean up sandbox directory", "path", sandboxPath, "error", err)
		}
	}()

	slog.Info("executor: python sandbox created", "path", sandboxPath)

	// 3. Write solution.py
	cleanCode := strings.TrimSpace(req.Code)
	if err := os.WriteFile(filepath.Join(sandboxPath, "solution.py"), []byte(cleanCode), 0644); err != nil {
		return nil, fmt.Errorf("failed to write solution.py: %w", err)
	}

	// 4. Render and write run_tests.py from Python template
	tmpl, err := template.New("run_tests").Parse(pythonTestTemplate)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Python test template: %w", err)
	}
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, renderData); err != nil {
		return nil, fmt.Errorf("failed to render run_tests.py: %w", err)
	}
	slog.Debug("executor: generated run_tests.py", "content", buf.String())
	if err := os.WriteFile(filepath.Join(sandboxPath, "run_tests.py"), buf.Bytes(), 0644); err != nil {
		return nil, fmt.Errorf("failed to write run_tests.py: %w", err)
	}

	// 5. Execute: remote sandbox or local Docker
	var (
		output        string
		runtimeMs     int
		cmdErr        error
		sandboxStatus string
		runCtx        context.Context
		runCancel     context.CancelFunc
	)

	sandboxURL := e.cfg.SandboxURL
	if e.cfg.PythonSandboxURL != "" {
		sandboxURL = e.cfg.PythonSandboxURL
	}
	if sandboxURL != "" {
		codeBytes, err := os.ReadFile(filepath.Join(sandboxPath, "solution.py"))
		if err != nil {
			return nil, fmt.Errorf("failed to read solution.py: %w", err)
		}
		testBytes, err := os.ReadFile(filepath.Join(sandboxPath, "run_tests.py"))
		if err != nil {
			return nil, fmt.Errorf("failed to read run_tests.py: %w", err)
		}
		client := newSandboxClient(sandboxURL, e.cfg.PythonExecutorTimeout)
		resp, err := client.execute(ctx, "python", string(codeBytes), string(testBytes), "")
		if err != nil {
			return nil, fmt.Errorf("sandbox: %w", err)
		}
		output = resp.Stdout
		runtimeMs = resp.RuntimeMs
		sandboxStatus = resp.Status
	} else {
		runCtx, runCancel = context.WithTimeout(ctx, e.cfg.PythonTimeout())
		defer runCancel()

		start := time.Now()
		cmd := exec.CommandContext(runCtx, "docker", "run",
			"--rm",
			"--user=65534:65534",
			"--cap-drop=ALL",
			"--security-opt=no-new-privileges",
			"--network=none",
			"--memory=512m",
			"--cpus=1.0",
			"--pids-limit=512",
			"--read-only",
			"--env", "PYTHONDONTWRITEBYTECODE=1",
			"-v", fmt.Sprintf("%s:/app:ro", sandboxPath),
			"-w", "/app",
			e.cfg.PythonDockerImage,
			"python3", "-u", "run_tests.py",
		)

		outputBytes, execErr := cmd.CombinedOutput()

		if len(outputBytes) > 100*1024 {
			outputBytes = outputBytes[:100*1024]
		}
		output = string(outputBytes)
		cmdErr = execErr

		if runCtx.Err() == context.DeadlineExceeded {
			output = "timeout"
		}

		runtimeMs = int(time.Since(start).Milliseconds())
	}

	// 6. Parse go test -v output (Python runner emits Go-compatible format)
	parsed := ParseTestOutput(output)
	passedMap := parsed.passedMap
	gotMap := parsed.gotMap
	wantMap := parsed.wantMap

	// 7. Classify submission status
	var status string
	var passedCount int
	totalCount := len(testCases)

	for _, tc := range testCases {
		if passed, found := passedMap[tc.Ordinal]; found && passed {
			passedCount++
		}
	}

	var friendlyMessage string

	if sandboxStatus != "" {
		status = sandboxStatus
		switch status {
		case "timeout":
			slog.Error("executor: python execution timed out", "output", output, "runtime_ms", runtimeMs)
			friendlyMessage = "Execution timed out. Ensure there are no infinite loops and your algorithm is efficient."
		case "compiler_error":
			friendlyMessage = parseCompilerError(output)
		case "security_error":
			status = "compiler_error"
			friendlyMessage = "Your code was blocked for security reasons."
		}
	} else if runCtx != nil && runCtx.Err() == context.DeadlineExceeded {
		slog.Error("executor: python execution timed out", "output", output, "runtime_ms", runtimeMs)
		status = "timeout"
		friendlyMessage = "Execution timed out. Ensure there are no infinite loops and your algorithm is efficient."
	} else if cmdErr != nil && strings.Contains(cmdErr.Error(), "exit status 137") {
		slog.Error("executor: python execution OOM", "output", output, "runtime_ms", runtimeMs)
		status = "timeout"
		friendlyMessage = "Your code used too much memory. Try optimizing your solution."
	} else if cmdErr != nil && len(passedMap) == 0 {
		status = "compiler_error"
		friendlyMessage = parseCompilerError(output)
	} else if totalCount > 0 && passedCount == totalCount {
		status = "passed"
	} else {
		status = "failed"
	}

	slog.Info("executor: python execution finished", "status", status, "passed", passedCount, "total", totalCount, "runtime_ms", runtimeMs)

	if recordSubmission {
		// 8. Record submission in DB
		sub := &store.Submission{
			UserID:      pgtype.UUID{Bytes: req.UserID, Valid: true},
			ProblemID:   pgtype.UUID{Bytes: req.ProblemID, Valid: true},
			Language:    req.Language,
			Code:        req.Code,
			Status:      status,
			PassedCount: passedCount,
			TotalCount:  totalCount,
			OutputLogs:  output,
			RuntimeMs:   runtimeMs,
		}

		if err := e.store.CreateSubmission(ctx, sub); err != nil {
			return nil, fmt.Errorf("failed to save python submission: %w", err)
		}

		// 9. Update user progress in DB
		prog := &store.Progress{
			UserID:      pgtype.UUID{Bytes: req.UserID, Valid: true},
			ProblemID:   pgtype.UUID{Bytes: req.ProblemID, Valid: true},
			Solved:      status == "passed",
			BestRuntime: runtimeMs,
		}

		if err := e.store.UpsertProgress(ctx, prog); err != nil {
			return nil, fmt.Errorf("failed to update progress: %w", err)
		}
	}

	// 10. Map results back to execution response
	var results []TestResult
	for _, tc := range testCases {
		passed := passedMap[tc.Ordinal]
		var got, want string

		if parsedGot, exists := gotMap[tc.Ordinal]; exists {
			got = parsedGot
		} else if !passed {
			got = "(no output captured)"
		} else {
			got = tc.Expected
		}

		if parsedWant, exists := wantMap[tc.Ordinal]; exists {
			want = parsedWant
		} else {
			want = tc.Expected
		}

		if tc.IsHidden && !passed {
			got = "(hidden test case)"
			want = "(hidden)"
		}

		results = append(results, TestResult{
			TestCaseID: uuid.UUID(tc.ID.Bytes),
			Ordinal:    tc.Ordinal,
			Passed:     passed,
			Got:        got,
			Expected:   want,
			IsHidden:   tc.IsHidden,
		})
	}

	return &ExecutionResult{
		Status:          status,
		FriendlyMessage: friendlyMessage,
		PassedCount:     passedCount,
		TotalCount:      totalCount,
		OutputLogs:      output,
		RuntimeMs:       runtimeMs,
		TestResults:     results,
	}, nil
}

// resolveProblemLanguageMeta sets language-specific FuncName/ReturnType/ParamTypes
// from LanguageVersions when available, falling back to top-level fields.
func resolveProblemLanguageMeta(problem *store.Problem, language string) {
	if language == "" {
		return
	}
	if problem.LanguageVersions == nil {
		return
	}
	spec, ok := problem.LanguageVersions[language]
	if !ok {
		return
	}
	if spec.FuncName != "" {
		problem.FuncName = spec.FuncName
	}
	if spec.ReturnType != "" {
		problem.ReturnType = spec.ReturnType
	}
	if len(spec.ParamTypes) > 0 {
		problem.ParamTypes = spec.ParamTypes
	}
}
