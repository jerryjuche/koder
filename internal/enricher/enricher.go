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
	"unicode"

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
	Title           string                        `json:"title"`
	Statement       string                        `json:"statement"`
	FuncName        string                        `json:"func_name"`
	ReturnType      string                        `json:"return_type"`
	ParamTypes      []string                      `json:"param_types"`
	Hints           []string                      `json:"hints"`
	Difficulty      int                           `json:"difficulty"`
	XPReward        int                           `json:"xp_reward"`
	Tags            []string                      `json:"tags"`
	TestCases       []enrichedTestCase            `json:"test_cases"`
	LanguageVersions *map[string]store.LanguageSpec `json:"language_versions,omitempty"`
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

	code := "```"

	systemPrompt := `You are an expert programming curriculum author. You output only valid JSON. No markdown fences, no comments, no extra text.

You generate professional, educational programming exercises from existing README files. Respond with exactly this JSON structure:

{
  "title": "fishandchips",
  "statement": "## FishAndChips\n\n### Instructions\n\nWrite a function **FishAndChips()** that takes an **int** and returns a **string**.\n\nThe function should return:\n- \"fish and chips\" if the number is divisible by both **2 and 3**\n- \"fish\" if the number is divisible by **2**\n- \"chips\" if the number is divisible by **3**\n- \"number is negative\" if the number is **negative**\n- \"non divisible\" if the number is **not divisible** by 2 or 3\n\n### Expected function\n\n` + code + `go\nfunc FishAndChips(n int) string {\n\n}\n` + code + `\n\n### Usage\n\n` + code + `go\npackage main\n\nimport (\n\t\"fmt\"\n\t\"koder\"\n)\n\nfunc main() {\n\tfmt.Println(koder.FishAndChips(4))\n\tfmt.Println(koder.FishAndChips(9))\n\tfmt.Println(koder.FishAndChips(6))\n}\n` + code + `\n\nAnd its output:\n\n` + code + `\n$ go run . | cat -e\nfish$\nchips$\nfish and chips$\n` + code + `\n",
  "func_name": "FishAndChips",
  "return_type": "string",
  "param_types": ["int"],
  "hints": ["Check the modulo operator (%) to test divisibility — n%2==0 means divisible by 2", "Handle the negative case first with an early return before checking divisibility", "Remember that a number divisible by both 2 and 3 (i.e. divisible by 6) should return \"fish and chips\" before the individual fish/chips checks"],
  "difficulty": 1,
  "xp_reward": 10,
  "tags": ["conditions", "modulo", "branching"],
  "test_cases": [
    {"input_json": "[4]", "expected": "\"fish\"", "is_hidden": false, "ordinal": 1},
    {"input_json": "[9]", "expected": "\"chips\"", "is_hidden": false, "ordinal": 2},
    {"input_json": "[6]", "expected": "\"fish and chips\"", "is_hidden": false, "ordinal": 3},
    {"input_json": "[-1]", "expected": "\"number is negative\"", "is_hidden": true, "ordinal": 4},
    {"input_json": "[7]", "expected": "\"non divisible\"", "is_hidden": true, "ordinal": 5}
  ],
  "language_versions": {
    "go": {
      "func_name": "FishAndChips",
      "return_type": "string",
      "param_types": ["int"]
    },
    "python": {
      "func_name": "fish_and_chips",
      "return_type": "str",
      "param_types": ["int"]
    }
  }
}

PRODUCTION RULES — follow these exactly for every exercise:

1. **title**: lowercase-kebab exercise name from the README (e.g. "fishandchips", "printdigits")
2. **statement**: A COMPREHENSIVE, PROFESSIONAL markdown document. Must include:
   - A clear heading with the exercise name
   - Full instructions restated in a clear, structured format with bullet points
   - The expected function signature in a Go code block
   - A usage example with a complete main() function in a Go code block
   - The expected output in a code block
   - Do NOT truncate or summarize — write the FULL statement that a student can read and implement from
3. **func_name**: Exact PascalCase function name from the README (e.g. "FishAndChips")
4. **return_type**: Exact Go return type as a string (e.g. "string", "int", "bool", "error", "int, error")
5. **param_types**: Array of Go parameter type strings in order, e.g. ["int"], ["int", "string"]
6. **hints**: Exactly 3 hints, ordered general to specific. Each should be a complete sentence. First hint describes the concept/approach, second hint gives a concrete suggestion, third hint is very implementation-specific.
7. **difficulty**: 1 (easy, basic syntax) to 5 (expert, advanced algorithms)
8. **xp_reward**: 10/25/50/100/200 for difficulty 1/2/3/4/5
9. **tags**: Array of 2-5 relevant tags from: arrays, strings, conditions, loops, recursion, pointers, structs, interfaces, maps, slices, sorting, math, modulo, ascii, bitwise, concurrency, errors, generics, files, parsing, branching, searching, runes
10. **test_cases**: At least 5 test cases:
    - 2-3 basic visible cases (is_hidden: false) covering main functionality
    - 2-3 edge case/hidden cases (is_hidden: true) covering error conditions, boundaries, special inputs
    - input_json: JSON string of arguments as array, e.g. "[4]" or "[4, \"hello\"]"
    - expected: Go string literal. Wrap strings in escaped quotes: "\"fish\"". For non-string types: raw value like "42" or "true"
    - ordinal: sequential starting at 1
11. **language_versions** (REQUIRED): Per-language function metadata. Must include at least a "go" entry. Also include a "python" entry with:
    - **func_name**: snake_case equivalent of the Go function name (e.g. "fish_and_chips")
    - **return_type**: Python return type as a string (e.g. "str", "int", "bool", "list", "dict")
    - **param_types**: Array of Python parameter type strings (e.g. ["int"], ["str", "int"])
    Translate Go types to Python: string→str, int→int, bool→bool, float64→float, []T→list, map[K]V→dict, error→no return/raise exception

IMPORTANT: All 11 fields are REQUIRED. Do not omit any field. Do not add extra fields.
Use only Go standard library. If the exercise refers to z01.PrintRune, rewrite it as fmt.Printf("%c", r).`

	userPrompt := fmt.Sprintf(`Generate a complete, professional exercise from this README. Follow the schema and production rules exactly.

Every field is required: title, statement, func_name, return_type, param_types, hints, difficulty, xp_reward, tags, at least 5 test_cases, and language_versions.
The language_versions field must include both a "go" entry (matching func_name/return_type/param_types) and a "python" entry (snake_case name, Python types).

The statement must be a full markdown document with instructions, function signature, usage example, and expected output. Do not abbreviate.

README:
%s`, strings.TrimSpace(rawReadme))

	payload, err := e.provider.GenerateContent(ctx, systemPrompt, userPrompt)
	if err != nil {
		return nil, nil, fmt.Errorf("%s generate content failed: %w", e.provider.Name(), err)
	}

	payload = cleanResponse(payload)
	slog.Debug("enricher: provider raw response", "provider", e.provider.Name(), "payload_len", len(payload), "payload_preview", truncate(payload, 500))

	var parsed enrichedResponse
	if err := json.Unmarshal([]byte(payload), &parsed); err != nil {
		slog.Error("enricher: failed to parse JSON",
			"provider", e.provider.Name(),
			"error", err,
			"payload", truncate(payload, 2000),
		)
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

	// Populate language_versions: prefer AI-provided, fall back to Go + inferred Python
	if parsed.LanguageVersions != nil && len(*parsed.LanguageVersions) > 0 {
		problem.LanguageVersions = *parsed.LanguageVersions
	} else {
		pythonFuncName := toSnakeCase(parsed.FuncName)
		pythonReturnType := toPythonType(parsed.ReturnType)
		pythonParamTypes := make([]string, len(parsed.ParamTypes))
		for i, pt := range parsed.ParamTypes {
			pythonParamTypes[i] = toPythonType(pt)
		}
		problem.LanguageVersions = map[string]store.LanguageSpec{
			"go": {
				FuncName:   parsed.FuncName,
				ReturnType: parsed.ReturnType,
				ParamTypes: parsed.ParamTypes,
			},
			"python": {
				FuncName:   pythonFuncName,
				ReturnType: pythonReturnType,
				ParamTypes: pythonParamTypes,
			},
		}
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
		slog.Error("enricher: validation failed",
			"provider", e.provider.Name(),
			"error", err,
			"title", problem.Title,
			"func_name", problem.FuncName,
			"payload_preview", truncate(payload, 500),
		)
		return nil, nil, fmt.Errorf("%s enrichment validation failed: %w", e.provider.Name(), err)
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

	var delay time.Duration
	switch e.provider.Name() {
	case "gemini":
		delay = 30 * time.Second
	case "groq":
		delay = 2 * time.Second
	default:
		delay = 1 * time.Second
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
	var lastErr error
	for attempt := 0; attempt < 3; attempt++ {
		if attempt > 0 {
			delay := time.Duration(1<<attempt) * time.Second
			slog.Warn("enricher: retrying Gemini request", "attempt", attempt+1, "delay", delay)
			select {
			case <-time.After(delay):
			case <-ctx.Done():
				return "", ctx.Err()
			}
		}

		result, err := g.generateOnce(ctx, systemPrompt, userPrompt)
		if err == nil {
			return result, nil
		}

		lastErr = err
		// Don't retry on content-blocked or schema errors (permanent failures)
		errStr := err.Error()
		if strings.Contains(errStr, "prompt may have been blocked") ||
			strings.Contains(errStr, "finish_reason") ||
			strings.Contains(errStr, "SAFETY") {
			return "", err
		}
	}
	return "", fmt.Errorf("gemini generate content failed after 3 attempts: %w", lastErr)
}

func (g *geminiProvider) generateOnce(ctx context.Context, systemPrompt, userPrompt string) (string, error) {
	cfg := &genai.GenerateContentConfig{
		SystemInstruction: genai.NewContentFromText(systemPrompt, genai.RoleUser),
		ResponseMIMEType:  "application/json",
		ResponseSchema:    enrichmentSchema(),
		Temperature:       float32Ptr(0.0),
		MaxOutputTokens:   8192,
	}

	response, err := g.client.Models.GenerateContent(ctx, g.model, []*genai.Content{
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
		bodySnippet := truncate(string(respBody), 1000)
		slog.Error("groq HTTP error",
			"status", resp.StatusCode,
			"body", bodySnippet,
		)
		return "", fmt.Errorf("groq returned HTTP %d: %s", resp.StatusCode, bodySnippet)
	}

	var result groqResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		bodySnippet := truncate(string(respBody), 1000)
		slog.Error("groq parse response failed",
			"error", err,
			"body", bodySnippet,
		)
		return "", fmt.Errorf("groq parse response: %w (body: %s)", err, bodySnippet)
	}

	if result.Error != nil {
		return "", fmt.Errorf("groq API error: %s - %s", result.Error.Type, result.Error.Message)
	}

	if len(result.Choices) == 0 {
		bodySnippet := truncate(string(respBody), 1000)
		slog.Error("groq returned no choices", "body", bodySnippet)
		return "", fmt.Errorf("groq returned no choices (body: %s)", bodySnippet)
	}

	finishReason := result.Choices[0].FinishReason
	if finishReason == "length" {
		slog.Warn("groq response truncated due to max_tokens", "finish_reason", finishReason)
	} else if finishReason != "stop" {
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

func cleanResponse(s string) string {
	s = strings.TrimSpace(s)

	start := strings.Index(s, "{")
	if start == -1 {
		return s
	}

	end := strings.LastIndex(s, "}")
	if end == -1 || end < start {
		return s
	}

	return s[start : end+1]
}

func languageSpecSchema() *genai.Schema {
	return &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"func_name":   {Type: genai.TypeString},
			"return_type": {Type: genai.TypeString},
			"param_types": {
				Type:  genai.TypeArray,
				Items: &genai.Schema{Type: genai.TypeString},
			},
		},
		Required: []string{"func_name", "return_type", "param_types"},
	}
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
			"language_versions": {
				Type: genai.TypeObject,
				Properties: map[string]*genai.Schema{
					"go":     languageSpecSchema(),
					"python": languageSpecSchema(),
				},
				Required: []string{"go"},
			},
		},
		Required: []string{"title", "statement", "func_name", "return_type", "param_types", "hints", "difficulty", "xp_reward", "tags", "test_cases", "language_versions"},
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
	if problem.LanguageVersions == nil || len(problem.LanguageVersions) == 0 {
		return fmt.Errorf("enriched problem missing language_versions")
	}
	goSpec, hasGo := problem.LanguageVersions["go"]
	if !hasGo {
		return fmt.Errorf("enriched problem language_versions missing 'go' entry")
	}
	if strings.TrimSpace(goSpec.FuncName) == "" {
		return fmt.Errorf("enriched problem language_versions 'go' entry missing func_name")
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

// toSnakeCase converts PascalCase or camelCase to snake_case for Python function names.
func toSnakeCase(s string) string {
	if s == "" {
		return ""
	}
	var result strings.Builder
	for i, r := range s {
		if unicode.IsUpper(r) {
			if i > 0 {
				result.WriteRune('_')
			}
			result.WriteRune(unicode.ToLower(r))
		} else {
			result.WriteRune(r)
		}
	}
	return result.String()
}

// toPythonType converts Go type strings to their Python equivalents.
func toPythonType(goType string) string {
	switch goType {
	case "string":
		return "str"
	case "int", "int8", "int16", "int32", "int64", "uint", "uint8", "uint16", "uint32", "uint64":
		return "int"
	case "float32", "float64":
		return "float"
	case "bool":
		return "bool"
	case "byte", "rune":
		return "int"
	case "error":
		return "None"
	default:
		if strings.HasPrefix(goType, "[]") {
			return "list"
		}
		if strings.HasPrefix(goType, "map[") {
			return "dict"
		}
		if strings.HasPrefix(goType, "*") {
			return toPythonType(goType[1:])
		}
		if strings.HasPrefix(goType, "[]*") {
			return "list"
		}
		return "any"
	}
}
