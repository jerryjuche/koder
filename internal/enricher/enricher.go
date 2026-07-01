package enricher

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
	"google.golang.org/genai"
)

type enrichmentProvider interface {
	Name() string
	GenerateContent(ctx context.Context, systemPrompt, userPrompt string) (string, error)
}

type Enricher struct {
	cfg      *config.Config
	provider enrichmentProvider
	mu       sync.Mutex
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
	var provider enrichmentProvider

	switch cfg.EnrichmentProvider {
	case "gemini":
		client, err := genai.NewClient(ctx, &genai.ClientConfig{APIKey: cfg.GeminiAPIKey})
		if err != nil {
			return nil, fmt.Errorf("failed to initialize Gemini client: %w", err)
		}
		provider = &geminiProvider{client: client, model: cfg.GeminiModel}
		slog.Info("enricher: using Gemini provider", "model", cfg.GeminiModel)
	case "groq":
		provider = newGroqProvider(cfg.GroqAPIKey, cfg.GroqModel)
		slog.Info("enricher: using Groq provider", "model", cfg.GroqModel)
	default:
		return nil, fmt.Errorf("unknown enrichment provider: %s", cfg.EnrichmentProvider)
	}

	return &Enricher{cfg: cfg, provider: provider}, nil
}

func (e *Enricher) EnrichProblem(ctx context.Context, rawReadme string) (*store.Problem, []store.TestCase, error) {
	if rawReadme == "" {
		return nil, nil, fmt.Errorf("raw README content is required")
	}

	if err := e.waitForRateLimit(ctx); err != nil {
		return nil, nil, err
	}

	slog.Debug("enricher: calling provider", "provider", e.provider.Name(), "readme_len", len(rawReadme))

	systemPrompt := `You are an expert Go curriculum author. Use only the Go standard library in examples. If the exercise refers to z01.PrintRune, rewrite it as fmt.Printf("%c", r) while preserving semantics. Output only valid JSON that matches the requested schema, with no markdown fences, comments, or extra fields.`

	userPrompt := fmt.Sprintf(`Analyze the exercise README below and return exactly one JSON object that conforms to the requested schema. Use stringified Go literals for expected values. For input_json, output a JSON string containing a JSON array of function arguments (e.g. "[1, \"hello\"]").

README:
%s`, strings.TrimSpace(rawReadme))

	payload, err := e.provider.GenerateContent(ctx, systemPrompt, userPrompt)
	if err != nil {
		return nil, nil, fmt.Errorf("%s generate content failed: %w", e.provider.Name(), err)
	}

	slog.Debug("enricher: provider raw response", "provider", e.provider.Name(), "payload_len", len(payload), "payload_preview", truncate(payload, 500))

	var parsed enrichedResponse
	if err := json.Unmarshal([]byte(payload), &parsed); err != nil {
		slog.Error("enricher: failed to parse provider JSON", "provider", e.provider.Name(), "error", err, "payload", truncate(payload, 1000))
		return nil, nil, fmt.Errorf("unable to parse %s JSON response: %w", e.provider.Name(), err)
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
		"provider", e.provider.Name(),
		"title", problem.Title,
		"func", problem.FuncName,
		"test_cases", len(testCases),
		"difficulty", problem.Difficulty,
	)

	return problem, testCases, nil
}

func (e *Enricher) waitForRateLimit(ctx context.Context) error {
	e.mu.Lock()
	defer e.mu.Unlock()

	delay := 1 * time.Second
	if e.provider.Name() == "gemini" {
		delay = 30 * time.Second
	}

	if !e.lastRequest.IsZero() {
		next := e.lastRequest.Add(delay)
		if wait := time.Until(next); wait > 0 {
			select {
			case <-time.After(wait):
			case <-ctx.Done():
				return ctx.Err()
			}
		}
	}

	e.lastRequest = time.Now()
	return nil
}

type geminiProvider struct {
	client *genai.Client
	model  string
}

func (g *geminiProvider) Name() string { return "gemini" }

func (g *geminiProvider) GenerateContent(ctx context.Context, systemPrompt, userPrompt string) (string, error) {
	cfg := &genai.GenerateContentConfig{
		ResponseMIMEType: "application/json",
		ResponseSchema:   enrichmentSchema(),
		Temperature:      float32Ptr(0.0),
		MaxOutputTokens:  8192,
	}

	response, err := g.client.Models.GenerateContent(ctx, g.model, []*genai.Content{
		genai.NewContentFromText(systemPrompt, genai.RoleUser),
		genai.NewContentFromText(userPrompt, genai.RoleUser),
	}, cfg)
	if err != nil {
		return "", fmt.Errorf("gemini generate content failed: %w", err)
	}

	if len(response.Candidates) == 0 {
		return "", fmt.Errorf("gemini returned no candidates (prompt may have been blocked)")
	}

	candidate := response.Candidates[0]
	if candidate.FinishReason != genai.FinishReasonStop {
		slog.Warn("enricher: Gemini finish reason not Stop",
			"finish_reason", candidate.FinishReason,
			"index", candidate.Index,
		)
		return "", fmt.Errorf("gemini generation stopped early: finish_reason=%s", candidate.FinishReason)
	}

	payload := strings.TrimSpace(response.Text())
	if payload == "" {
		return "", fmt.Errorf("empty response from Gemini (finish_reason=%s)", candidate.FinishReason)
	}

	return payload, nil
}

type groqProvider struct {
	apiKey     string
	model      string
	httpClient *http.Client
}

type groqMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type groqRequest struct {
	Model          string              `json:"model"`
	Messages       []groqMessage       `json:"messages"`
	ResponseFormat *groqResponseFormat `json:"response_format,omitempty"`
	Temperature    float64             `json:"temperature"`
	MaxTokens      int                 `json:"max_tokens"`
}

type groqResponseFormat struct {
	Type string `json:"type"`
}

type groqResponse struct {
	Choices []struct {
		Index         int    `json:"index"`
		Message       struct {
			Content string `json:"content"`
		} `json:"message"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
		Type    string `json:"type"`
	} `json:"error,omitempty"`
}

func newGroqProvider(apiKey, model string) *groqProvider {
	if model == "" {
		model = "llama-3.3-70b-versatile"
	}
	return &groqProvider{
		apiKey: apiKey,
		model:  model,
		httpClient: &http.Client{
			Timeout: 120 * time.Second,
		},
	}
}

func (g *groqProvider) Name() string { return "groq" }

func (g *groqProvider) GenerateContent(ctx context.Context, systemPrompt, userPrompt string) (string, error) {
	body := groqRequest{
		Model: g.model,
		Messages: []groqMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userPrompt},
		},
		ResponseFormat: &groqResponseFormat{Type: "json_object"},
		Temperature:    0.0,
		MaxTokens:      8192,
	}

	payload, err := json.Marshal(body)
	if err != nil {
		return "", fmt.Errorf("groq marshal request: %w", err)
	}

	return g.doRequest(ctx, payload, 0)
}

func (g *groqProvider) doRequest(ctx context.Context, payload []byte, attempt int) (string, error) {
	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewReader(payload))
	if err != nil {
		return "", fmt.Errorf("groq create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+g.apiKey)

	resp, err := g.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("groq request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("groq read response: %w", err)
	}

	if resp.StatusCode == 429 && attempt < 2 {
		retryAfter := resp.Header.Get("Retry-After")
		var wait time.Duration
		if seconds, err := strconv.Atoi(retryAfter); err == nil {
			wait = time.Duration(seconds) * time.Second
		} else {
			wait = 5 * time.Second
		}

		slog.Warn("groq rate limited, retrying",
			"retry_after_sec", wait.Seconds(),
			"attempt", attempt+1,
		)
		select {
		case <-time.After(wait):
		case <-ctx.Done():
			return "", ctx.Err()
		}
		return g.doRequest(ctx, payload, attempt+1)
	}

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("groq returned HTTP %d: %s", resp.StatusCode, truncate(string(respBody), 500))
	}

	var result groqResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return "", fmt.Errorf("groq parse response: %w", err)
	}

	if result.Error != nil {
		return "", fmt.Errorf("groq API error: %s - %s", result.Error.Type, result.Error.Message)
	}

	if len(result.Choices) == 0 {
		return "", fmt.Errorf("groq returned no choices")
	}

	finishReason := result.Choices[0].FinishReason
	if finishReason != "stop" && finishReason != "length" {
		return "", fmt.Errorf("groq generation stopped early: %s", finishReason)
	}

	content := strings.TrimSpace(result.Choices[0].Message.Content)
	if content == "" {
		return "", fmt.Errorf("groq returned empty content (finish_reason=%s)", finishReason)
	}

	return content, nil
}

func truncate(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
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
