package enricher

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"sync"
	"time"
	"unicode"

	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
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

func NewEnricher(_ context.Context, cfg *config.Config) (*Enricher, error) {
	provider := newNvidiaProvider(cfg.NVIDIAAPIKey)
	slog.Info("enricher: using NVIDIA NIM (DeepSeek V4 Flash)")
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

// AIAssistAction represents a targeted AI editing action.
type AIAssistAction string

const (
	ActionRephraseStatement   AIAssistAction = "rephrase_statement"
	ActionImproveHints        AIAssistAction = "improve_hints"
	ActionGenerateTestCases   AIAssistAction = "generate_test_cases"
	ActionRegenerateTestCases AIAssistAction = "regenerate_test_cases"
	ActionAdjustDifficulty    AIAssistAction = "adjust_difficulty"
	ActionFixSignatures       AIAssistAction = "fix_signatures"
	ActionAddEdgeCases        AIAssistAction = "add_edge_cases"
	ActionChat                AIAssistAction = "chat"
)

// AIAssistRequest is the payload for a targeted AI editing action.
type AIAssistRequest struct {
	Action     AIAssistAction  `json:"action"`
	Problem    *store.Problem  `json:"problem"`
	Message    string          `json:"message,omitempty"`
	TestCases  []store.TestCase `json:"test_cases,omitempty"`
	Difficulty *int            `json:"difficulty,omitempty"`
}

// AIAssistResponse contains only the fields the AI changed for a given action.
type AIAssistResponse struct {
	Statement         *string                       `json:"statement,omitempty"`
	Hints             []string                      `json:"hints,omitempty"`
	Constraints       *string                       `json:"constraints,omitempty"`
	LearningObjective *string                       `json:"learning_objective,omitempty"`
	FuncName          *string                       `json:"func_name,omitempty"`
	ReturnType        *string                       `json:"return_type,omitempty"`
	ParamTypes        []string                      `json:"param_types,omitempty"`
	LanguageVersions  *map[string]store.LanguageSpec `json:"language_versions,omitempty"`
	TestCases         []store.TestCase              `json:"test_cases,omitempty"`
	Difficulty        *int                          `json:"difficulty,omitempty"`
	XPReward          *int                          `json:"xp_reward,omitempty"`
	Explanation       string                        `json:"explanation"`
}

// AIAssistProblem performs a targeted AI editing action on a problem.
func (e *Enricher) AIAssistProblem(ctx context.Context, req *AIAssistRequest) (*AIAssistResponse, error) {
	if req == nil || req.Problem == nil {
		return nil, fmt.Errorf("request and problem are required")
	}

	if err := e.waitForRateLimit(ctx); err != nil {
		return nil, err
	}

	ctxJSON := buildProblemContext(req.Problem)

	systemPrompt, err := buildAISystemPrompt(req.Action)
	if err != nil {
		return nil, err
	}

	userPrompt := buildAIUserPrompt(req.Action, ctxJSON, req)

	payload, err := e.provider.GenerateContent(ctx, systemPrompt, userPrompt)
	if err != nil {
		return nil, fmt.Errorf("ai assist generate content failed: %w", err)
	}

	payload = cleanResponse(payload)
	slog.Debug("enricher: ai assist raw response",
		"action", req.Action,
		"payload_len", len(payload),
		"payload_preview", truncate(payload, 500),
	)

	var parsed struct {
		Statement         *string                       `json:"statement"`
		Hints             []string                      `json:"hints"`
		Constraints       *string                       `json:"constraints"`
		LearningObjective *string                       `json:"learning_objective"`
		FuncName          *string                       `json:"func_name"`
		ReturnType        *string                       `json:"return_type"`
		ParamTypes        []string                      `json:"param_types"`
		LanguageVersions  *map[string]store.LanguageSpec `json:"language_versions"`
		TestCases         []struct {
			Input    any    `json:"input_json"`
			Expected string `json:"expected"`
			IsHidden bool   `json:"is_hidden"`
			Ordinal  int    `json:"ordinal"`
		} `json:"test_cases"`
		Difficulty  *int   `json:"difficulty"`
		XPReward    *int   `json:"xp_reward"`
		Explanation string `json:"explanation"`
	}

	if err := json.Unmarshal([]byte(payload), &parsed); err != nil {
		slog.Error("enricher: ai assist failed to parse JSON",
			"action", req.Action,
			"error", err,
			"payload", truncate(payload, 2000),
		)
		return nil, fmt.Errorf("unable to parse AI assist response: %w", err)
	}

	resp := &AIAssistResponse{
		Statement:         parsed.Statement,
		Hints:             parsed.Hints,
		Constraints:       parsed.Constraints,
		LearningObjective: parsed.LearningObjective,
		FuncName:          parsed.FuncName,
		ReturnType:        parsed.ReturnType,
		ParamTypes:        parsed.ParamTypes,
		LanguageVersions:  parsed.LanguageVersions,
		Difficulty:        parsed.Difficulty,
		XPReward:          parsed.XPReward,
		Explanation:       parsed.Explanation,
	}

	// Convert test cases
	if len(parsed.TestCases) > 0 {
		resp.TestCases = make([]store.TestCase, 0, len(parsed.TestCases))
		for _, tc := range parsed.TestCases {
			normalized, err := normalizeTestCaseInput(tc.Input)
			if err != nil {
				return nil, fmt.Errorf("invalid test case input: %w", err)
			}
			resp.TestCases = append(resp.TestCases, store.TestCase{
				Input:    normalized,
				Expected: strings.TrimSpace(tc.Expected),
				IsHidden: tc.IsHidden,
				Ordinal:  tc.Ordinal,
			})
		}
	}

	// Validate action-specific requirements
	switch req.Action {
	case ActionImproveHints:
		if len(resp.Hints) != 3 {
			slog.Warn("enricher: ai assist hints count mismatch", "got", len(resp.Hints), "expected", 3)
		}
	case ActionGenerateTestCases, ActionRegenerateTestCases, ActionAddEdgeCases:
		if len(resp.TestCases) == 0 {
			return nil, fmt.Errorf("AI did not return any test cases")
		}
	}

	slog.Info("enricher: ai assist completed",
		"action", req.Action,
		"slug", req.Problem.Slug,
		"fields_changed", countChangedFields(resp),
	)

	return resp, nil
}

func buildProblemContext(p *store.Problem) string {
	b, _ := json.Marshal(map[string]any{
		"slug":                p.Slug,
		"title":               p.Title,
		"statement":           p.Statement,
		"constraints":         p.Constraints,
		"learning_objective":  p.LearningObjective,
		"func_name":           p.FuncName,
		"return_type":         p.ReturnType,
		"param_types":         p.ParamTypes,
		"hints":               p.Hints,
		"difficulty":          p.Difficulty,
		"xp_reward":           p.XPReward,
		"tags":                p.Tags,
		"language_versions":   p.LanguageVersions,
		"module":              p.Module,
		"language":            p.Language,
	})
	return string(b)
}

func buildAISystemPrompt(action AIAssistAction) (string, error) {
	switch action {
	case ActionRephraseStatement:
		return `You are a programming education expert specializing in clear, engaging problem statements.

Given a programming problem, rewrite its STATEMENT to be more pedagogically effective. Follow these rules:

1. Keep the same technical requirements — do NOT add or remove functionality
2. Use clear, concise language appropriate for the difficulty level
3. Add structure: break into sections with headings if appropriate
4. Include a brief "Objective" sentence at the top explaining what the student will practice
5. Preserve any code examples, function signatures, and usage examples exactly
6. Keep the same readability level — don't oversimplify for advanced problems

Return ONLY valid JSON with these fields:
- "statement": the rewritten full markdown statement
- "explanation": 1-2 sentence explanation of what you changed and why

Example:
{
  "statement": "## Updated Title\n\n### Objective\nPractice using conditionals...\n\n### Instructions\n...",
  "explanation": "Added an objective section, restructured instructions into bullet points, clarified edge case requirements."
}`, nil

	case ActionImproveHints:
		return `You are a programming education expert specializing in pedagogical hints.

Given a programming problem and its current hints, rewrite the 3 hints to be more helpful. Follow these rules:

1. Always return EXACTLY 3 hints
2. Hint 1: Subtle conceptual nudge — describes the approach without being specific
3. Hint 2: More direct — mentions relevant functions, operators, or patterns
4. Hint 3: Very specific — could almost reveal the solution
5. Each hint should be 1-3 complete sentences
6. Match the difficulty level of the problem

Return ONLY valid JSON with:
- "hints": array of exactly 3 strings
- "explanation": 1-2 sentence summary of how you improved them`, nil

	case ActionGenerateTestCases, ActionRegenerateTestCases, ActionAddEdgeCases:
		return `You are a programming education expert specializing in test case generation.

Given a programming problem, generate 8 comprehensive test cases. Follow these rules:

1. 5 visible test cases (is_hidden: false) — cover normal functionality
2. 3 hidden test cases (is_hidden: true) — edge cases, boundary conditions, error inputs
3. Test cases should progress from basic to more complex
4. Cover: typical inputs, edge cases (empty, zero, negative), boundary values, error conditions
5. ordinal must be 1-based sequential
6. input_json: JSON array of arguments as a string, e.g. "[4]" or "[4, \"hello\"]"
7. expected: string representation of the expected result. For strings, wrap in escaped quotes: "\"fish\"". For other types, raw value like "42" or "true"

Return ONLY valid JSON with:
- "test_cases": array of test case objects with input_json, expected, is_hidden, ordinal
- "explanation": 1-2 sentence summary of what the test cases cover`, nil

	case ActionAdjustDifficulty:
		return `You are a programming education expert specializing in difficulty calibration.

Given a programming problem, rewrite it for a TARGET DIFFICULTY level (1-5). Follow these rules:

1. Adjust the STATEMENT: simplify or add complexity appropriate for the target level
2. Adjust CONSTRAINTS: add or remove limitations to match difficulty
3. Rewrite all 3 HINTS to match the new difficulty level
4. Set appropriate XP_REWARD: 10/25/50/100/200 for difficulty 1/2/3/4/5
5. Keep the same function signature and core functionality

Difficulty definitions:
- 1 (Beginner): Basic syntax, single concept, minimal edge cases
- 2 (Easy): Two concepts combined, simple edge cases
- 3 (Medium): Multiple concepts, moderately complex logic
- 4 (Hard): Advanced concepts, optimization considerations, complex edge cases
- 5 (Expert): Advanced algorithms, performance constraints, multiple edge cases

Return ONLY valid JSON with:
- "statement": adjusted markdown statement
- "constraints": adjusted constraints
- "hints": exactly 3 hints at the new difficulty level
- "difficulty": the target difficulty number
- "xp_reward": appropriate XP value
- "explanation": what you changed and why`, nil

	case ActionFixSignatures:
		return `You are a programming education expert specializing in cross-language function signatures.

Given a programming problem, review and correct the function signatures for both Go and Python in language_versions.

Rules:
- Go: func_name must be PascalCase, return_type and param_types must be valid Go types
- Python: func_name must be snake_case, return_type and param_types must be valid Python types
- Python types map: string→str, int→int, bool→bool, float64→float, []T→list, map[K]V→dict
- param_types must match the function's actual parameter needs
- If language_versions is missing a Python entry, generate one

Return ONLY valid JSON with:
- "func_name": corrected Go function name (if changed)
- "return_type": corrected Go return type (if changed)
- "param_types": corrected Go param types (if changed)
- "language_versions": full corrected language_versions object
- "explanation": what was wrong and how you fixed it`, nil

	case ActionChat:
		return `You are an AI assistant helping an admin edit a programming problem on a coding education platform.

The admin will ask questions or request changes about the problem. Your response should:

1. Answer the question directly and professionally
2. When suggesting changes to problem fields, include the updated field values in structured JSON
3. For simple suggestions, return only an explanation
4. For actionable changes (statement rewrites, hint improvements, etc.), include the updated field

Always return valid JSON. For simple chat responses with no field changes:
{
  "explanation": "Your answer here..."
}

For responses that include changes to problem fields, include the relevant fields alongside the explanation.

Available fields you can modify: statement, hints, constraints, learning_objective, func_name, return_type, param_types, language_versions, difficulty, xp_reward`, nil

	default:
		return "", fmt.Errorf("unknown AI assist action: %s", action)
	}
}

func buildAIUserPrompt(action AIAssistAction, ctxJSON string, req *AIAssistRequest) string {
	var b strings.Builder

	switch action {
	case ActionRephraseStatement:
		fmt.Fprintf(&b, "Rephrase the statement for this problem:\n\n%s\n\nReturn only the rewritten statement and explanation.", ctxJSON)

	case ActionImproveHints:
		fmt.Fprintf(&b, "Improve the hints for this problem:\n\n%s\n\nReturn exactly 3 improved hints and an explanation.", ctxJSON)

	case ActionGenerateTestCases:
		fmt.Fprintf(&b, "Generate 8 test cases for this problem:\n\n%s\n\nReturn 5 visible + 3 hidden test cases covering normal and edge cases.", ctxJSON)

	case ActionRegenerateTestCases:
		fmt.Fprintf(&b, "Regenerate ALL test cases for this problem:\n\n%s\n\nThe current test cases are being replaced. Return 8 new test cases (5 visible, 3 hidden).", ctxJSON)

	case ActionAddEdgeCases:
		fmt.Fprintf(&b, "Add 3 additional edge case test cases to the following problem:\n\n%s\n\nReturn 3 test cases (all hidden) covering edge cases not already covered. Use ordinals 9, 10, 11.", ctxJSON)

	case ActionAdjustDifficulty:
		target := 3
		if req.Difficulty != nil {
			target = *req.Difficulty
		}
		fmt.Fprintf(&b, "Adjust the following problem to difficulty level %d/5:\n\n%s\n\nReturn updated statement, constraints, hints, difficulty, xp_reward, and explanation.", target, ctxJSON)

	case ActionFixSignatures:
		fmt.Fprintf(&b, "Review and fix the function signatures for this problem:\n\n%s\n\nReturn corrected func_name, return_type, param_types, language_versions, and explanation.", ctxJSON)

	case ActionChat:
		fmt.Fprintf(&b, "Current problem:\n\n%s\n\n\nAdmin request: %s\n\nRespond with any field changes as structured JSON alongside your explanation.", ctxJSON, req.Message)
	}

	return b.String()
}

func countChangedFields(resp *AIAssistResponse) int {
	count := 0
	if resp.Statement != nil {
		count++
	}
	if resp.Hints != nil {
		count++
	}
	if resp.Constraints != nil {
		count++
	}
	if resp.LearningObjective != nil {
		count++
	}
	if resp.FuncName != nil {
		count++
	}
	if resp.ReturnType != nil {
		count++
	}
	if resp.ParamTypes != nil {
		count++
	}
	if resp.LanguageVersions != nil {
		count++
	}
	if resp.TestCases != nil {
		count++
	}
	if resp.Difficulty != nil {
		count++
	}
	if resp.XPReward != nil {
		count++
	}
	return count
}

func (e *Enricher) waitForRateLimit(ctx context.Context) error {
	e.mu.Lock()
	defer e.mu.Unlock()

	const delay = 1 * time.Second

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

const (
	nvidiaBaseURL  = "https://integrate.api.nvidia.com/v1"
	nvidiaModel    = "deepseek-ai/deepseek-v4-flash"
	nvidiaTemp     = 0.7
	nvidiaMaxTokens = 8192
)

type nvidiaProvider struct {
	apiKey     string
	httpClient *http.Client
}

type nvidiaMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type nvidiaRequest struct {
	Model       string          `json:"model"`
	Messages    []nvidiaMessage `json:"messages"`
	Temperature float64         `json:"temperature"`
	MaxTokens   int             `json:"max_tokens"`
}

type nvidiaResponse struct {
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

func newNvidiaProvider(apiKey string) *nvidiaProvider {
	return &nvidiaProvider{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 120 * time.Second,
		},
	}
}

func (n *nvidiaProvider) Name() string { return "nvidia" }

func (n *nvidiaProvider) GenerateContent(ctx context.Context, systemPrompt, userPrompt string) (string, error) {
	body := nvidiaRequest{
		Model: nvidiaModel,
		Messages: []nvidiaMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userPrompt},
		},
		Temperature: nvidiaTemp,
		MaxTokens:   nvidiaMaxTokens,
	}

	payload, err := json.Marshal(body)
	if err != nil {
		return "", fmt.Errorf("nvidia marshal request: %w", err)
	}

	return n.doRequest(ctx, payload, 0)
}

func (n *nvidiaProvider) doRequest(ctx context.Context, payload []byte, attempt int) (string, error) {
	req, err := http.NewRequestWithContext(ctx, "POST", nvidiaBaseURL+"/chat/completions", bytes.NewReader(payload))
	if err != nil {
		return "", fmt.Errorf("nvidia create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+n.apiKey)

	resp, err := n.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("nvidia request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("nvidia read response: %w", err)
	}

	// Retry on rate limit (429) with exponential backoff, up to 3 retries
	if resp.StatusCode == 429 && attempt < 3 {
		wait := time.Duration(1<<(attempt+1)) * time.Second
		slog.Warn("nvidia rate limited, retrying",
			"retry_after_sec", wait.Seconds(),
			"attempt", attempt+1,
		)
		select {
		case <-time.After(wait):
		case <-ctx.Done():
			return "", ctx.Err()
		}
		return n.doRequest(ctx, payload, attempt+1)
	}

	if resp.StatusCode != 200 {
		bodySnippet := truncate(string(respBody), 1000)
		slog.Error("nvidia HTTP error",
			"status", resp.StatusCode,
			"body", bodySnippet,
		)
		return "", fmt.Errorf("nvidia returned HTTP %d: %s", resp.StatusCode, bodySnippet)
	}

	var result nvidiaResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		bodySnippet := truncate(string(respBody), 1000)
		slog.Error("nvidia parse response failed",
			"error", err,
			"body", bodySnippet,
		)
		return "", fmt.Errorf("nvidia parse response: %w (body: %s)", err, bodySnippet)
	}

	if result.Error != nil {
		return "", fmt.Errorf("nvidia API error: %s - %s", result.Error.Type, result.Error.Message)
	}

	if len(result.Choices) == 0 {
		bodySnippet := truncate(string(respBody), 1000)
		slog.Error("nvidia returned no choices", "body", bodySnippet)
		return "", fmt.Errorf("nvidia returned no choices (body: %s)", bodySnippet)
	}

	finishReason := result.Choices[0].FinishReason
	if finishReason == "length" {
		slog.Warn("nvidia response truncated due to max_tokens", "finish_reason", finishReason)
	} else if finishReason != "stop" {
		return "", fmt.Errorf("nvidia generation stopped early: %s", finishReason)
	}

	content := strings.TrimSpace(result.Choices[0].Message.Content)
	if content == "" {
		return "", fmt.Errorf("nvidia returned empty content (finish_reason=%s)", finishReason)
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
