package enricher

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
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

type enrichedResponse struct {
	Title      string             `json:"title"`
	Statement  string             `json:"statement"`
	FuncName   string             `json:"func_name"`
	ReturnType string             `json:"return_type"`
	ParamTypes []string           `json:"param_types"`
	Hints      []string           `json:"hints"`
	Difficulty int                `json:"difficulty"`
	XPReward   int                `json:"xp_reward"`
	Tags       []string           `json:"tags"`
	TestCases  []enrichedTestCase `json:"test_cases"`
}

type enrichedTestCase struct {
	Input    any    `json:"input_json"`
	Expected string `json:"expected"`
	IsHidden bool   `json:"is_hidden"`
	Ordinal  int    `json:"ordinal"`
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

	slog.Debug("enricher: calling Gemini", "readme_len", len(rawReadme))

	systemInstruction := genai.NewContentFromText(
		`You are an expert Go curriculum author. Use only the Go standard library in examples. If the exercise refers to z01.PrintRune, rewrite it as fmt.Printf("%c", r) while preserving semantics. Output only valid JSON that matches the requested schema, with no markdown fences, comments, or extra fields.`,
		genai.RoleUser,
	)

	userPrompt := genai.NewContentFromText(fmt.Sprintf(`Analyze the exercise README below and return exactly one JSON object that conforms to the requested schema. Use stringified Go literals for expected values. For input_json, output a JSON string containing a JSON array of function arguments (e.g. "[1, \"hello\"]").

README:
%s`, strings.TrimSpace(rawReadme)), genai.RoleUser)

	cfg := &genai.GenerateContentConfig{
		ResponseMIMEType: "application/json",
		ResponseSchema:   enrichmentSchema(),
		Temperature:      float32Ptr(0.0),
		MaxOutputTokens:  8192,
	}

	response, err := e.client.Models.GenerateContent(ctx, e.cfg.GeminiModel, []*genai.Content{systemInstruction, userPrompt}, cfg)
	if err != nil {
		return nil, nil, fmt.Errorf("gemini generate content failed: %w", err)
	}

	if len(response.Candidates) == 0 {
		return nil, nil, fmt.Errorf("gemini returned no candidates (prompt may have been blocked)")
	}

	candidate := response.Candidates[0]
	if candidate.FinishReason != genai.FinishReasonStop {
		slog.Warn("enricher: Gemini finish reason not Stop",
			"finish_reason", candidate.FinishReason,
			"index", candidate.Index,
		)
		return nil, nil, fmt.Errorf("gemini generation stopped early: finish_reason=%s", candidate.FinishReason)
	}

	payload := strings.TrimSpace(response.Text())
	if payload == "" {
		return nil, nil, fmt.Errorf("empty response from Gemini (finish_reason=%s)", candidate.FinishReason)
	}

	slog.Debug("enricher: Gemini raw response", "payload_len", len(payload), "payload_preview", truncate(payload, 500))

	var parsed enrichedResponse
	if err := json.Unmarshal([]byte(payload), &parsed); err != nil {
		slog.Error("enricher: failed to parse Gemini JSON", "error", err, "payload", truncate(payload, 1000))
		return nil, nil, fmt.Errorf("unable to parse Gemini JSON response: %w", err)
	}

	problem := &store.Problem{
		Title:      strings.TrimSpace(parsed.Title),
		Statement:  strings.TrimSpace(parsed.Statement),
		FuncName:   strings.TrimSpace(parsed.FuncName),
		ReturnType: strings.TrimSpace(parsed.ReturnType),
		ParamTypes: parsed.ParamTypes,
		Hints:      parsed.Hints,
		Difficulty: parsed.Difficulty,
		XPReward:   parsed.XPReward,
		Tags:       parsed.Tags,
	}

	testCases := make([]store.TestCase, 0, len(parsed.TestCases))
	for _, tc := range parsed.TestCases {
		normalized, err := normalizeTestCaseInput(tc.Input)
		if err != nil {
			return nil, nil, fmt.Errorf("invalid test case input payload: %w", err)
		}

		testCases = append(testCases, store.TestCase{
			Input:    normalized,
			Expected: strings.TrimSpace(tc.Expected),
			IsHidden: tc.IsHidden,
			Ordinal:  tc.Ordinal,
		})
	}

	if err := validateEnrichedProblem(problem, testCases); err != nil {
		return nil, nil, err
	}

	slog.Info("enricher: problem enriched successfully",
		"title", problem.Title,
		"func", problem.FuncName,
		"test_cases", len(testCases),
		"difficulty", problem.Difficulty,
	)

	return problem, testCases, nil
}

func truncate(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
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

func enrichmentSchema() *genai.Schema {
	return &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"title":       {Type: genai.TypeString},
			"statement":   {Type: genai.TypeString},
			"func_name":   {Type: genai.TypeString},
			"return_type": {Type: genai.TypeString},
			"param_types": {
				Type:  genai.TypeArray,
				Items: &genai.Schema{Type: genai.TypeString},
			},
			"hints": {
				Type:     genai.TypeArray,
				Items:    &genai.Schema{Type: genai.TypeString},
				MinItems: int64Ptr(3),
				MaxItems: int64Ptr(3),
			},
			"difficulty": {Type: genai.TypeInteger},
			"xp_reward":  {Type: genai.TypeInteger},
			"tags": {
				Type:  genai.TypeArray,
				Items: &genai.Schema{Type: genai.TypeString},
			},
			"test_cases": {
				Type: genai.TypeArray,
				Items: &genai.Schema{
					Type: genai.TypeObject,
					Properties: map[string]*genai.Schema{
"input_json": {
	Type:        genai.TypeString,
	Description: "JSON array of function arguments as a string. Example: \"[1, \\\"hello\\\", true]\"",
},
						"expected":  {Type: genai.TypeString},
						"is_hidden": {Type: genai.TypeBoolean},
						"ordinal":   {Type: genai.TypeInteger},
					},
					Required: []string{"input_json", "expected", "ordinal"},
				},
			},
		},
		Required: []string{"title", "statement", "func_name", "return_type", "param_types", "hints", "difficulty", "xp_reward", "tags", "test_cases"},
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

func int64Ptr(value int64) *int64 {
	return &value
}
