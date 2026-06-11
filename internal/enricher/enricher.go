package enricher

import (
	"context"
	"encoding/json"
	"fmt"
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
	Title      string            `json:"title"`
	Statement  string            `json:"statement"`
	FuncName   string            `json:"func_name"`
	ReturnType string            `json:"return_type"`
	ParamTypes []string          `json:"param_types"`
	Hints      []string          `json:"hints"`
	Difficulty int               `json:"difficulty"`
	XPReward   int               `json:"xp_reward"`
	Tags       []string          `json:"tags"`
	TestCases  []enrichedTestCase `json:"test_cases"`
}

type enrichedTestCase struct {
	Input    json.RawMessage `json:"input_json"`
	Expected string          `json:"expected"`
	IsHidden bool            `json:"is_hidden"`
	Ordinal  int             `json:"ordinal"`
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

	prompt := fmt.Sprintf(`You are an expert Go curriculum author. Analyze the exercise README below and return exactly one JSON object that conforms to the requested schema. Do not include any markdown fences, comments, or explanation outside the JSON object. Build a testable Go exercise from the content and include a list of test cases.

README:
%s`, strings.TrimSpace(rawReadme))

	config := &genai.GenerateContentConfig{
		ResponseMIMEType: "application/json",
		ResponseSchema:   enrichmentSchema(),
		Temperature:      float32Ptr(0.0),
		MaxOutputTokens:  2000,
	}

	response, err := e.client.Models.GenerateContent(ctx, e.cfg.GeminiModel, []*genai.Content{genai.NewContentFromText(prompt, genai.RoleUser)}, config)
	if err != nil {
		return nil, nil, fmt.Errorf("gemini generate content failed: %w", err)
	}

	payload := strings.TrimSpace(response.Text())
	if payload == "" {
		return nil, nil, fmt.Errorf("empty response from Gemini")
	}

	var parsed enrichedResponse
	if err := json.Unmarshal([]byte(payload), &parsed); err != nil {
		return nil, nil, fmt.Errorf("unable to parse Gemini JSON response: %w", err)
	}

	if err := validateEnrichedResponse(&parsed); err != nil {
		return nil, nil, err
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
		normalized, err := normalizeJSONInput(tc.Input)
		if err != nil {
			return nil, nil, fmt.Errorf("invalid test case input payload: %w", err)
		}

		testCases = append(testCases, store.TestCase{
			Input:    []byte(normalized),
			Expected: strings.TrimSpace(tc.Expected),
			IsHidden: tc.IsHidden,
			Ordinal:  tc.Ordinal,
		})
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

func enrichmentSchema() *genai.Schema {
	return &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"title": {
				Type: genai.TypeString,
			},
			"statement": {
				Type: genai.TypeString,
			},
			"func_name": {
				Type: genai.TypeString,
			},
			"return_type": {
				Type: genai.TypeString,
			},
			"param_types": {
				Type: genai.TypeArray,
				Items: &genai.Schema{Type: genai.TypeString},
			},
			"hints": {
				Type: genai.TypeArray,
				Items: &genai.Schema{Type: genai.TypeString},
				MinItems: int64Ptr(3),
				MaxItems: int64Ptr(3),
			},
			"difficulty": {
				Type: genai.TypeInteger,
			},
			"xp_reward": {
				Type: genai.TypeInteger,
			},
			"tags": {
				Type: genai.TypeArray,
				Items: &genai.Schema{Type: genai.TypeString},
			},
			"test_cases": {
				Type: genai.TypeArray,
				Items: &genai.Schema{
					Type: genai.TypeObject,
					Properties: map[string]*genai.Schema{
						"input_json": {Type: genai.TypeString},
						"expected":   {Type: genai.TypeString},
						"is_hidden":  {Type: genai.TypeBoolean},
						"ordinal":    {Type: genai.TypeInteger},
					},
					Required: []string{"input_json", "expected", "ordinal"},
				},
			},
		},
		Required: []string{"title", "statement", "func_name", "return_type", "param_types", "hints", "difficulty", "xp_reward", "tags", "test_cases"},
	}
}

func validateEnrichedResponse(response *enrichedResponse) error {
	if response.Title == "" {
		return fmt.Errorf("enrichment response missing title")
	}
	if response.Statement == "" {
		return fmt.Errorf("enrichment response missing statement")
	}
	if response.FuncName == "" {
		return fmt.Errorf("enrichment response missing func_name")
	}
	if response.ReturnType == "" {
		return fmt.Errorf("enrichment response missing return_type")
	}
	if len(response.ParamTypes) == 0 {
		return fmt.Errorf("enrichment response missing param_types")
	}
	if len(response.Hints) != 3 {
		return fmt.Errorf("enrichment response must include exactly 3 hints")
	}
	if response.Difficulty < 1 || response.Difficulty > 5 {
		return fmt.Errorf("enrichment response difficulty must be between 1 and 5")
	}
	if response.XPReward <= 0 {
		return fmt.Errorf("enrichment response xp_reward must be positive")
	}
	if len(response.Tags) == 0 {
		return fmt.Errorf("enrichment response must include at least one tag")
	}
	if len(response.TestCases) == 0 {
		return fmt.Errorf("enrichment response must include at least one test case")
	}
	for _, tc := range response.TestCases {
		if len(tc.Input) == 0 {
			return fmt.Errorf("enrichment response test case input_json cannot be empty")
		}
		if tc.Expected == "" {
			return fmt.Errorf("enrichment response test case expected cannot be empty")
		}
		if tc.Ordinal < 1 {
			return fmt.Errorf("enrichment response test case ordinal must be a positive integer")
		}
	}
	return nil
}

func normalizeJSONInput(raw json.RawMessage) (json.RawMessage, error) {
	trimmed := bytesTrimSpace(raw)
	if len(trimmed) == 0 {
		return nil, fmt.Errorf("input_json is empty")
	}

	if trimmed[0] == '"' {
		var decoded string
		if err := json.Unmarshal(trimmed, &decoded); err != nil {
			return nil, fmt.Errorf("unable to unquote input_json: %w", err)
		}
		var normalized json.RawMessage
		if err := json.Unmarshal([]byte(decoded), &normalized); err != nil {
			return nil, fmt.Errorf("unable to parse input_json content as JSON: %w", err)
		}
		return normalized, nil
	}

	var probe any
	if err := json.Unmarshal(trimmed, &probe); err != nil {
		return nil, fmt.Errorf("input_json must be valid JSON: %w", err)
	}

	return json.RawMessage(trimmed), nil
}

func bytesTrimSpace(data json.RawMessage) json.RawMessage {
	return json.RawMessage(strings.TrimSpace(string(data)))
}

func float32Ptr(value float32) *float32 {
	return &value
}

func int64Ptr(value int64) *int64 {
	return &value
}
