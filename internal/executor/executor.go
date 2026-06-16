package executor

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
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

// Execute acquires a concurrency slot, compiles, runs, and grades a submission.
func (e *Executor) Execute(ctx context.Context, req ExecutionRequest) (*ExecutionResult, error) {
	// 1. Acquire semaphore slot
	select {
	case e.semaphore <- struct{}{}:
	case <-ctx.Done():
		return nil, ctx.Err()
	}
	defer func() { <-e.semaphore }()

	slog.Info("executor: acquired semaphore slot", "user_id", req.UserID, "problem_id", req.ProblemID)

	// 2. Fetch problem and test cases from the database
	problem, testCases, err := e.store.GetProblemWithTestCases(ctx, req.ProblemID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch problem and test cases: %w", err)
	}

	// 3. Format test cases as Go literals and prepare template data
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

		renderedCases = append(renderedCases, TestCaseRenderData{
			Args:     strings.Join(formattedArgs, ", "),
			Expected: tc.Expected,
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
	sandboxPath, err := PrepareSandbox(e.cfg.SandboxBaseDir, uuidStr, req.Code, renderData)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare sandbox: %w", err)
	}
	defer func() {
		if err := os.RemoveAll(sandboxPath); err != nil {
			slog.Error("executor: failed to clean up sandbox directory", "path", sandboxPath, "error", err)
		}
	}()

	slog.Info("executor: sandbox created", "path", sandboxPath)

	// 5. Run Docker container with a command execution timeout
	runCtx, runCancel := context.WithTimeout(ctx, e.cfg.ExecutorTimeout())
	defer runCancel()

	cmd := exec.CommandContext(runCtx, "docker", "run",
		"--rm",
		"--network=none",
		"--memory=64m",
		"--cpus=0.5",
		"-v", fmt.Sprintf("%s:/app", sandboxPath),
		"-v", fmt.Sprintf("%s:/root/.cache/go-build", e.cfg.BuildCacheDir),
		"-w", "/app",
		e.cfg.DockerImage,
		"go", "test", "./...", "-v",
	)

	startTime := time.Now()
	outputBytes, cmdErr := cmd.CombinedOutput()
	runtimeMs := int(time.Since(startTime).Milliseconds())
	output := string(outputBytes)

	// 6. Parse go test output
	var (
		runRegex    = regexp.MustCompile(`^=== RUN\s+TestSolution/case_(\d+)`)
		passRegex   = regexp.MustCompile(`^--- PASS:\s+TestSolution/case_(\d+)`)
		failRegex   = regexp.MustCompile(`^--- FAIL:\s+TestSolution/case_(\d+)`)
		detailRegex = regexp.MustCompile(`got\s+(.+),\s+want\s+(.+)`)

		passedMap = make(map[int]bool)
		gotMap    = make(map[int]string)
	)

	scanner := bufio.NewScanner(strings.NewReader(output))
	currentOrdinal := -1

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		if matches := runRegex.FindStringSubmatch(line); len(matches) > 1 {
			ord, _ := strconv.Atoi(matches[1])
			currentOrdinal = ord
		} else if matches := detailRegex.FindStringSubmatch(line); len(matches) > 2 && currentOrdinal != -1 {
			gotMap[currentOrdinal] = strings.TrimSpace(matches[1])
		} else if matches := passRegex.FindStringSubmatch(line); len(matches) > 1 {
			ord, _ := strconv.Atoi(matches[1])
			passedMap[ord] = true
		} else if matches := failRegex.FindStringSubmatch(line); len(matches) > 1 {
			ord, _ := strconv.Atoi(matches[1])
			passedMap[ord] = false
		}
	}

	// 7. Classify submission status
	var status string
	var passedCount int
	totalCount := len(testCases)

	for _, tc := range testCases {
		if passed, found := passedMap[tc.Ordinal]; found && passed {
			passedCount++
		}
	}

	if runCtx.Err() == context.DeadlineExceeded {
		status = "timeout"
	} else if cmdErr != nil && len(passedMap) == 0 {
		status = "compiler_error"
	} else if passedCount == totalCount {
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
		got := tc.Expected
		if !passed {
			if parsedGot, exists := gotMap[tc.Ordinal]; exists {
				got = parsedGot
			} else {
				got = "failed (no output captured)"
			}
		}

		// Handle hidden test cases: hide got/expected from the student if it's hidden and didn't pass
		// Wait, the client only needs test_case details if visible.
		results = append(results, TestResult{
			TestCaseID: uuid.UUID(tc.ID.Bytes),
			Ordinal:    tc.Ordinal,
			Passed:     passed,
			Got:        got,
			Expected:   tc.Expected,
			IsHidden:   tc.IsHidden,
		})
	}

	return &ExecutionResult{
		Status:      status,
		PassedCount: passedCount,
		TotalCount:  totalCount,
		OutputLogs:  output,
		RuntimeMs:   runtimeMs,
		TestResults: results,
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

	return string(data), nil
}
