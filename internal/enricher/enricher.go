package enricher

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
	"google.golang.org/genai"
)

type Enricher struct {
	cfg         *config.Config
	client      *genai.Client
	mu          sync.Mutex
	lastRequest time.Time
}

func NewEnricher(ctx context.Context, cfg *config.Config) (*Enricher, error) {
	client, err := genai.NewClient(ctx, &genai.ClientConfig{APIKey: cfg.GeminiAPIKey})
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Gemini client: %w", err)
	}

	return &Enricher{cfg: cfg, client: client}, nil
}

func (e *Enricher) EnrichProblem(ctx context.Context, rawReadme string) (*store.Problem, []store.TestCase, error) {
	if rawReadme == "" {
		return nil, nil, fmt.Errorf("raw README content is required")
	}

	if err := e.waitForRateLimit(ctx); err != nil {
		return nil, nil, err
	}

	prompt := fmt.Sprintf(`You are an expert Go curriculum author. Analyze the exercise README below and return exactly one function call to register_problem. Do not output any explanatory text or markdown. Return only a single Tool call with structured arguments.

README:
%s`, strings.TrimSpace(rawReadme))

	config := &genai.GenerateContentConfig{
		Temperature:     float32Ptr(0.0),
		MaxOutputTokens: 2000,
		Tools: []*genai.Tool{{
			FunctionDeclarations: []*genai.FunctionDeclaration{registerProblemDeclaration()},
		}},
		ToolConfig: &genai.ToolConfig{
			FunctionCallingConfig: &genai.FunctionCallingConfig{
				Mode:                 genai.FunctionCallingConfigModeAny,
				AllowedFunctionNames: []string{"register_problem"},
			},
		},
	}

	response, err := e.client.Models.GenerateContent(ctx, e.cfg.GeminiModel, []*genai.Content{genai.NewContentFromText(prompt, genai.RoleUser)}, config)
	if err != nil {
		return nil, nil, fmt.Errorf("gemini generate content failed: %w", err)
	}

	calls := response.FunctionCalls()
	if len(calls) == 0 {
		return nil, nil, fmt.Errorf("gemini did not return a function call")
	}

	call := calls[0]
	if call.Name != "register_problem" {
		return nil, nil, fmt.Errorf("unexpected function call %q from Gemini", call.Name)
	}

	problem, testCases, err := parseRegisteredProblemArgs(call.Args)
	if err != nil {
		return nil, nil, err
	}

	if err := validateEnrichedProblem(problem, testCases); err != nil {
		return nil, nil, err
	}

	return problem, testCases, nil
}

func (e *Enricher) waitForRateLimit(ctx context.Context) error {
	e.mu.Lock()
	defer e.mu.Unlock()

	if !e.lastRequest.IsZero() {
		next := e.lastRequest.Add(30 * time.Second)
		if delay := time.Until(next); delay > 0 {
			select {
			case <-time.After(delay):
			case <-ctx.Done():
				return ctx.Err()
			}
		}
	}

	e.lastRequest = time.Now()
	return nil
}

func registerProblemDeclaration() *genai.FunctionDeclaration {
	return &genai.FunctionDeclaration{
		Name:        "register_problem",
		Description: "Return a structured exercise definition using only a function call with typed arguments.",
		ParametersJsonSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"title":       map[string]any{"type": "string"},
				"statement":   map[string]any{"type": "string"},
				"func_name":   map[string]any{"type": "string"},
				"return_type": map[string]any{"type": "string"},
				"param_types": map[string]any{
					"type":  "array",
					"items": map[string]any{"type": "string"},
				},
				"hints": map[string]any{
					"type":     "array",
					"items":    map[string]any{"type": "string"},
					"minItems": 3,
					"maxItems": 3,
				},
				"difficulty": map[string]any{"type": "integer"},
				"xp_reward":  map[string]any{"type": "integer"},
				"tags": map[string]any{
					"type":  "array",
					"items": map[string]any{"type": "string"},
				},
				"test_cases": map[string]any{
					"type": "array",
					"items": map[string]any{
						"type": "object",
						"properties": map[string]any{
							"input":     map[string]any{},
							"expected":  map[string]any{"type": "string"},
							"is_hidden": map[string]any{"type": "boolean"},
							"ordinal":   map[string]any{"type": "integer"},
						},
						"required":             []string{"input", "expected", "ordinal"},
						"additionalProperties": false,
					},
				},
			},
			"required":             []string{"title", "statement", "func_name", "return_type", "param_types", "hints", "difficulty", "xp_reward", "tags", "test_cases"},
			"additionalProperties": false,
		},
	}
}

func parseRegisteredProblemArgs(args map[string]any) (*store.Problem, []store.TestCase, error) {
	title, err := getStringArg(args, "title", true)
	if err != nil {
		return nil, nil, err
	}

	statement, err := getStringArg(args, "statement", true)
	if err != nil {
		return nil, nil, err
	}

	funcName, err := getStringArg(args, "func_name", true)
	if err != nil {
		return nil, nil, err
	}

	returnType, err := getStringArg(args, "return_type", true)
	if err != nil {
		return nil, nil, err
	}

	paramTypes, err := getStringArrayArg(args, "param_types", true)
	if err != nil {
		return nil, nil, err
	}

	hints, err := getStringArrayArg(args, "hints", true)
	if err != nil {
		return nil, nil, err
	}

	difficulty, err := getIntArg(args, "difficulty", true)
	if err != nil {
		return nil, nil, err
	}

	xpReward, err := getIntArg(args, "xp_reward", true)
	if err != nil {
		return nil, nil, err
	}

	tags, err := getStringArrayArg(args, "tags", true)
	if err != nil {
		return nil, nil, err
	}

	testCasesRaw, ok := args["test_cases"]
	if !ok {
		return nil, nil, fmt.Errorf("missing test_cases")
	}

	testCasesSlice, ok := testCasesRaw.([]any)
	if !ok {
		return nil, nil, fmt.Errorf("test_cases must be an array")
	}

	testCases := make([]store.TestCase, 0, len(testCasesSlice))
	for i, raw := range testCasesSlice {
		tcMap, ok := raw.(map[string]any)
		if !ok {
			return nil, nil, fmt.Errorf("test_cases[%d] must be an object", i)
		}

		inputJSON, err := normalizeTestCaseInput(tcMap["input"])
		if err != nil {
			return nil, nil, fmt.Errorf("test_cases[%d] input error: %w", i, err)
		}

		expected, err := getStringArg(tcMap, "expected", true)
		if err != nil {
			return nil, nil, fmt.Errorf("test_cases[%d] expected error: %w", i, err)
		}

		isHidden, err := getBoolArg(tcMap, "is_hidden", false)
		if err != nil {
			return nil, nil, fmt.Errorf("test_cases[%d] is_hidden error: %w", i, err)
		}

		ordinal, err := getIntArg(tcMap, "ordinal", true)
		if err != nil {
			return nil, nil, fmt.Errorf("test_cases[%d] ordinal error: %w", i, err)
		}

		testCases = append(testCases, store.TestCase{
			Input:    inputJSON,
			Expected: strings.TrimSpace(expected),
			IsHidden: isHidden,
			Ordinal:  ordinal,
		})
	}

	return &store.Problem{
		Title:      strings.TrimSpace(title),
		Statement:  strings.TrimSpace(statement),
		FuncName:   strings.TrimSpace(funcName),
		ReturnType: strings.TrimSpace(returnType),
		ParamTypes: paramTypes,
		Hints:      hints,
		Difficulty: difficulty,
		XPReward:   xpReward,
		Tags:       tags,
	}, testCases, nil
}

func getStringArg(args map[string]any, key string, required bool) (string, error) {
	raw, ok := args[key]
	if !ok || raw == nil {
		if !required {
			return "", nil
		}
		return "", fmt.Errorf("%s is required", key)
	}

	value, ok := raw.(string)
	if !ok {
		return "", fmt.Errorf("%s must be a string", key)
	}

	if required && strings.TrimSpace(value) == "" {
		return "", fmt.Errorf("%s cannot be empty", key)
	}

	return value, nil
}

func getStringArrayArg(args map[string]any, key string, required bool) ([]string, error) {
	raw, ok := args[key]
	if !ok || raw == nil {
		if !required {
			return nil, nil
		}
		return nil, fmt.Errorf("%s is required", key)
	}

	items, ok := raw.([]any)
	if !ok {
		return nil, fmt.Errorf("%s must be an array", key)
	}

	result := make([]string, 0, len(items))
	for i, item := range items {
		value, ok := item.(string)
		if !ok {
			return nil, fmt.Errorf("%s[%d] must be a string", key, i)
		}
		result = append(result, strings.TrimSpace(value))
	}

	if required && len(result) == 0 {
		return nil, fmt.Errorf("%s cannot be empty", key)
	}

	return result, nil
}

func getIntArg(args map[string]any, key string, required bool) (int, error) {
	raw, ok := args[key]
	if !ok || raw == nil {
		if !required {
			return 0, nil
		}
		return 0, fmt.Errorf("%s is required", key)
	}

	switch value := raw.(type) {
	case float64:
		return int(value), nil
	case int:
		return value, nil
	case int64:
		return int(value), nil
	case json.Number:
		parsed, err := value.Int64()
		if err != nil {
			return 0, fmt.Errorf("%s must be an integer", key)
		}
		return int(parsed), nil
	case string:
		if strings.TrimSpace(value) == "" {
			if !required {
				return 0, nil
			}
			return 0, fmt.Errorf("%s cannot be empty", key)
		}
		parsed, err := strconv.Atoi(value)
		if err != nil {
			return 0, fmt.Errorf("%s must be an integer", key)
		}
		return parsed, nil
	default:
		return 0, fmt.Errorf("%s must be an integer", key)
	}
}

func getBoolArg(args map[string]any, key string, defaultValue bool) (bool, error) {
	raw, ok := args[key]
	if !ok || raw == nil {
		return defaultValue, nil
	}

	switch value := raw.(type) {
	case bool:
		return value, nil
	case string:
		if strings.EqualFold(value, "true") {
			return true, nil
		}
		if strings.EqualFold(value, "false") {
			return false, nil
		}
		return false, fmt.Errorf("%s must be a boolean", key)
	default:
		return false, fmt.Errorf("%s must be a boolean", key)
	}
}

func normalizeTestCaseInput(raw any) ([]byte, error) {
	if raw == nil {
		return nil, fmt.Errorf("input cannot be null")
	}

	switch value := raw.(type) {
	case string:
		trimmed := strings.TrimSpace(value)
		if trimmed == "" {
			return nil, fmt.Errorf("input cannot be empty")
		}

		var parsed any
		if err := json.Unmarshal([]byte(trimmed), &parsed); err == nil {
			return json.Marshal(parsed)
		}

		return json.Marshal(value)
	default:
		return json.Marshal(value)
	}
}

func validateEnrichedProblem(problem *store.Problem, testCases []store.TestCase) error {
	if problem == nil {
		return fmt.Errorf("enriched problem cannot be nil")
	}
	if strings.TrimSpace(problem.Title) == "" {
		return fmt.Errorf("enriched problem missing title")
	}
	if strings.TrimSpace(problem.Statement) == "" {
		return fmt.Errorf("enriched problem missing statement")
	}
	if strings.TrimSpace(problem.FuncName) == "" {
		return fmt.Errorf("enriched problem missing func_name")
	}
	if strings.TrimSpace(problem.ReturnType) == "" {
		return fmt.Errorf("enriched problem missing return_type")
	}
	if len(problem.ParamTypes) == 0 {
		return fmt.Errorf("enriched problem missing param_types")
	}
	if len(problem.Hints) != 3 {
		return fmt.Errorf("enriched problem must include exactly 3 hints")
	}
	if problem.Difficulty < 1 || problem.Difficulty > 5 {
		return fmt.Errorf("enriched problem difficulty must be between 1 and 5")
	}
	if problem.XPReward <= 0 {
		return fmt.Errorf("enriched problem xp_reward must be positive")
	}
	if len(problem.Tags) == 0 {
		return fmt.Errorf("enriched problem must include at least one tag")
	}
	if len(testCases) == 0 {
		return fmt.Errorf("enriched problem must include at least one test case")
	}

	for _, tc := range testCases {
		if len(tc.Input) == 0 {
			return fmt.Errorf("enriched problem test case input cannot be empty")
		}
		if strings.TrimSpace(tc.Expected) == "" {
			return fmt.Errorf("enriched problem test case expected cannot be empty")
		}
		if tc.Ordinal < 1 {
			return fmt.Errorf("enriched problem test case ordinal must be a positive integer")
		}
	}

	return nil
}

func float32Ptr(value float32) *float32 {
	return &value
}
