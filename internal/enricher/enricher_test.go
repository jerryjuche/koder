package enricher

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
)

// fakeProvider is a scriptable enrichmentProvider for unit tests.
type fakeProvider struct {
	out    string
	err    error
	system string
	user   string
}

func (f *fakeProvider) Name() string { return "fake" }
func (f *fakeProvider) GenerateContent(_ context.Context, systemPrompt, userPrompt string) (string, error) {
	f.system = systemPrompt
	f.user = userPrompt
	return f.out, f.err
}

func TestToSnakeCase(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"", ""},
		{"A", "a"},
		{"FishAndChips", "fish_and_chips"},
		{"PrintDigits", "print_digits"},
		{"isPrime", "is_prime"},
		{"IsPrime", "is_prime"},
		{"ValidateAge", "validate_age"},
		{"NumberToString", "number_to_string"},
		{"ABCD", "a_b_c_d"},
		{"a", "a"},
	}

	for _, tc := range tests {
		got := toSnakeCase(tc.input)
		if got != tc.want {
			t.Errorf("toSnakeCase(%q) = %q, want %q", tc.input, got, tc.want)
		}
	}
}

func TestToPythonType(t *testing.T) {
	tests := []struct {
		goType string
		want   string
	}{
		{"string", "str"},
		{"int", "int"},
		{"int32", "int"},
		{"int64", "int"},
		{"uint", "int"},
		{"float64", "float"},
		{"float32", "float"},
		{"bool", "bool"},
		{"byte", "int"},
		{"rune", "int"},
		{"error", "None"},
		{"[]int", "list"},
		{"[]string", "list"},
		{"[]byte", "list"},
		{"[][]int", "list"},
		{"map[string]int", "dict"},
		{"map[int]string", "dict"},
		{"*int", "int"},
		{"*string", "str"},
		{"*TreeNode", "any"},
		{"", "any"},
	}

	for _, tc := range tests {
		got := toPythonType(tc.goType)
		if got != tc.want {
			t.Errorf("toPythonType(%q) = %q, want %q", tc.goType, got, tc.want)
		}
	}
}

func TestCleanResponse(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  string
	}{
		{
			name:  "already clean JSON",
			input: `{"title": "test"}`,
			want:  `{"title": "test"}`,
		},
		{
			name:  "markdown fences",
			input: "```json\n{\"title\": \"test\"}\n```",
			want:  `{"title": "test"}`,
		},
		{
			name:  "leading text",
			input: "Here is the result:\n{\"title\": \"test\"}\n--- end",
			want:  `{"title": "test"}`,
		},
		{
			name:  "nested braces",
			input: `{"nested": {"inner": "value"}, "arr": [1, 2]}`,
			want:  `{"nested": {"inner": "value"}, "arr": [1, 2]}`,
		},
		{
			name:  "no braces",
			input: "just text",
			want:  "just text",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := cleanResponse(tc.input)
			if got != tc.want {
				t.Errorf("cleanResponse() = %q, want %q", got, tc.want)
			}
		})
	}
}

func TestValidateEnrichedProblem(t *testing.T) {
	validProblem := &store.Problem{
		Title:      "TestProblem",
		Statement:  "## Test\n\nInstructions",
		FuncName:   "TestFunc",
		ReturnType: "string",
		ParamTypes: []string{"int"},
		Hints:      []string{"Hint 1", "Hint 2", "Hint 3"},
		Difficulty: 1,
		XPReward:   10,
		Tags:       []string{"math"},
		LanguageVersions: map[string]store.LanguageSpec{
			"go": {FuncName: "TestFunc", ReturnType: "string", ParamTypes: []string{"int"}},
		},
	}
	validTestCases := []store.TestCase{
		{Input: []byte("1"), Expected: "result", Ordinal: 1},
		{Input: []byte("2"), Expected: "result2", Ordinal: 2},
		{Input: []byte("3"), Expected: "result3", Ordinal: 3},
		{Input: []byte("4"), Expected: "result4", Ordinal: 4},
		{Input: []byte("5"), Expected: "result5", Ordinal: 5},
	}

	t.Run("valid problem", func(t *testing.T) {
		err := validateEnrichedProblem(validProblem, validTestCases)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})

	t.Run("nil problem", func(t *testing.T) {
		err := validateEnrichedProblem(nil, validTestCases)
		if err == nil {
			t.Error("expected error for nil problem")
		}
	})

	t.Run("missing title", func(t *testing.T) {
		p := *validProblem
		p.Title = ""
		err := validateEnrichedProblem(&p, validTestCases)
		if err == nil {
			t.Error("expected error for empty title")
		}
	})

	t.Run("missing func_name", func(t *testing.T) {
		p := *validProblem
		p.FuncName = ""
		err := validateEnrichedProblem(&p, validTestCases)
		if err == nil {
			t.Error("expected error for empty func_name")
		}
	})

	t.Run("wrong hint count", func(t *testing.T) {
		p := *validProblem
		p.Hints = []string{"only one"}
		err := validateEnrichedProblem(&p, validTestCases)
		if err == nil {
			t.Error("expected error for non-3 hints")
		}
	})

	t.Run("missing language_versions", func(t *testing.T) {
		p := *validProblem
		p.LanguageVersions = nil
		err := validateEnrichedProblem(&p, validTestCases)
		if err == nil {
			t.Error("expected error for nil language_versions")
		}
	})

	t.Run("missing go entry in language_versions", func(t *testing.T) {
		p := *validProblem
		p.LanguageVersions = map[string]store.LanguageSpec{
			"python": {FuncName: "test_func", ReturnType: "str", ParamTypes: []string{"int"}},
		}
		err := validateEnrichedProblem(&p, validTestCases)
		if err == nil {
			t.Error("expected error for missing go entry")
		}
	})

	t.Run("empty go func_name in language_versions", func(t *testing.T) {
		p := *validProblem
		p.LanguageVersions = map[string]store.LanguageSpec{
			"go": {FuncName: "", ReturnType: "string", ParamTypes: []string{"int"}},
		}
		err := validateEnrichedProblem(&p, validTestCases)
		if err == nil {
			t.Error("expected error for empty go func_name")
		}
	})

	t.Run("empty test cases", func(t *testing.T) {
		err := validateEnrichedProblem(validProblem, []store.TestCase{})
		if err == nil {
			t.Error("expected error for empty test cases")
		}
	})

	t.Run("single test case (valid)", func(t *testing.T) {
		err := validateEnrichedProblem(validProblem, validTestCases[:1])
		if err != nil {
			t.Errorf("expected no error for 1 test case, got %v", err)
		}
	})

	t.Run("negative ordinal", func(t *testing.T) {
		tcs := make([]store.TestCase, len(validTestCases))
		copy(tcs, validTestCases)
		tcs[0].Ordinal = -1
		err := validateEnrichedProblem(validProblem, tcs)
		if err == nil {
			t.Error("expected error for negative ordinal")
		}
	})
}

func TestExplainSolution(t *testing.T) {
	validJSON := `{
		"summary": "Adds two integers and returns the sum.",
		"approach": "Return a + b directly.",
		"time_complexity": "O(1) — a single addition, no loops.",
		"space_complexity": "O(1) — only the result is stored.",
		"key_techniques": ["arithmetic", "early return"],
		"strengths": ["simple", "correct"],
		"improvements": ["validate overflow"]
	}`

	t.Run("parses structured explanation", func(t *testing.T) {
		e := &Enricher{cfg: &config.Config{}, provider: &fakeProvider{out: validJSON}}
		exp, err := e.ExplainSolution(context.Background(), &ExplainSolutionRequest{
			Code:     "func Sum(a, b int) int { return a + b }",
			Language: "go",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if exp.Summary == "" || exp.Approach == "" {
			t.Error("expected summary and approach to be populated")
		}
		if exp.TimeComplexity != "O(1) — a single addition, no loops." {
			t.Errorf("unexpected time_complexity: %q", exp.TimeComplexity)
		}
		if len(exp.KeyTechniques) != 2 || len(exp.Improvements) != 1 {
			t.Errorf("unexpected techniques/improvements: %v / %v", exp.KeyTechniques, exp.Improvements)
		}
	})

	t.Run("strips markdown fences", func(t *testing.T) {
		e := &Enricher{cfg: &config.Config{}, provider: &fakeProvider{out: "```json\n" + validJSON + "\n```"}}
		exp, err := e.ExplainSolution(context.Background(), &ExplainSolutionRequest{
			Code:     "func Sum(a, b int) int { return a + b }",
			Language: "go",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if exp.TimeComplexity == "" {
			t.Error("expected parsed fields despite fences")
		}
	})

	t.Run("requires code", func(t *testing.T) {
		e := &Enricher{cfg: &config.Config{}, provider: &fakeProvider{out: validJSON}}
		_, err := e.ExplainSolution(context.Background(), &ExplainSolutionRequest{Code: "  "})
		if err == nil {
			t.Error("expected error for empty code")
		}
	})

	t.Run("provider error propagates", func(t *testing.T) {
		e := &Enricher{cfg: &config.Config{}, provider: &fakeProvider{err: errors.New("upstream down")}}
		_, err := e.ExplainSolution(context.Background(), &ExplainSolutionRequest{Code: "x"})
		if err == nil {
			t.Error("expected error from provider")
		}
	})

	t.Run("unparseable response errors", func(t *testing.T) {
		e := &Enricher{cfg: &config.Config{}, provider: &fakeProvider{out: "sorry, no JSON here"}}
		_, err := e.ExplainSolution(context.Background(), &ExplainSolutionRequest{Code: "x"})
		if err == nil {
			t.Error("expected parse error")
		}
		if !errors.Is(err, ErrAIInvalidResponse) {
			t.Errorf("expected ErrAIInvalidResponse sentinel, got %v", err)
		}
	})

	t.Run("provider error classified as upstream", func(t *testing.T) {
		e := &Enricher{cfg: &config.Config{}, provider: &fakeProvider{err: errors.New("upstream down")}}
		_, err := e.ExplainSolution(context.Background(), &ExplainSolutionRequest{Code: "x"})
		if err == nil {
			t.Fatal("expected error from provider")
		}
		if !errors.Is(err, ErrAIUpstream) {
			t.Errorf("expected ErrAIUpstream sentinel, got %v", err)
		}
	})

	t.Run("missing required sections classified as validation", func(t *testing.T) {
		e := &Enricher{cfg: &config.Config{}, provider: &fakeProvider{out: `{"summary": "only a summary"}`}}
		_, err := e.ExplainSolution(context.Background(), &ExplainSolutionRequest{Code: "x"})
		if err == nil {
			t.Fatal("expected validation error")
		}
		if !errors.Is(err, ErrAIValidation) {
			t.Errorf("expected ErrAIValidation sentinel, got %v", err)
		}
	})
}

func TestExplainSolutionScores(t *testing.T) {
	scoreJSON := `{
		"summary": "Sums the slice.",
		"approach": "Iterate and accumulate.",
		"time_complexity": "O(n)",
		"space_complexity": "O(1)",
		"quality_score": 92,
		"efficiency_score": 88,
		"readability_score": 76,
		"correctness_score": 104,
		"best_practices_score": -5
	}`

	t.Run("parses and clamps scores", func(t *testing.T) {
		e := &Enricher{cfg: &config.Config{}, provider: &fakeProvider{out: scoreJSON}}
		exp, err := e.ExplainSolution(context.Background(), &ExplainSolutionRequest{Code: "x"})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if exp.QualityScore != 92 || exp.EfficiencyScore != 88 || exp.ReadabilityScore != 76 {
			t.Errorf("unexpected scores: %+v", exp)
		}
		if exp.CorrectnessScore != 100 {
			t.Errorf("expected correctness clamped to 100, got %d", exp.CorrectnessScore)
		}
		if exp.BestPracticesScore != 0 {
			t.Errorf("expected best_practices clamped to 0, got %d", exp.BestPracticesScore)
		}
	})

	t.Run("missing optional arrays default to empty", func(t *testing.T) {
		minimal := `{
			"summary": "Sums the slice.",
			"approach": "Iterate and accumulate.",
			"time_complexity": "O(n)",
			"space_complexity": "O(1)"
		}`
		e := &Enricher{cfg: &config.Config{}, provider: &fakeProvider{out: minimal}}
		exp, err := e.ExplainSolution(context.Background(), &ExplainSolutionRequest{Code: "x"})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if exp.KeyTechniques == nil || exp.Strengths == nil || exp.Improvements == nil {
			t.Error("expected non-nil optional arrays")
		}
		if len(exp.KeyTechniques) != 0 || len(exp.Strengths) != 0 || len(exp.Improvements) != 0 {
			t.Errorf("expected empty optional arrays, got %+v", exp)
		}
	})

	t.Run("missing scores default to zero", func(t *testing.T) {
		noScores := `{
			"summary": "Sums the slice.",
			"approach": "Iterate and accumulate.",
			"time_complexity": "O(n)",
			"space_complexity": "O(1)"
		}`
		e := &Enricher{cfg: &config.Config{}, provider: &fakeProvider{out: noScores}}
		exp, err := e.ExplainSolution(context.Background(), &ExplainSolutionRequest{Code: "x"})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if exp.QualityScore != 0 || exp.EfficiencyScore != 0 ||
			exp.ReadabilityScore != 0 || exp.CorrectnessScore != 0 || exp.BestPracticesScore != 0 {
			t.Errorf("expected zero scores, got %+v", exp)
		}
	})
}

func TestExplainSolutionGrounding(t *testing.T) {
	fp := &fakeProvider{out: `{
		"summary": "s", "approach": "a",
		"time_complexity": "O(n)", "space_complexity": "O(1)"
	}`}
	e := &Enricher{cfg: &config.Config{}, provider: fp}
	_, err := e.ExplainSolution(context.Background(), &ExplainSolutionRequest{
		Code:               "func Sum(a []int) int { return 0 }",
		Language:           "go",
		ProblemTitle:       "Sum a slice",
		ProblemStatement:   "Return the sum of all integers in the slice.",
		ProblemConstraints: "1 <= len(a) <= 10^5",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	for _, want := range []string{
		"Sum a slice",
		"Return the sum of all integers in the slice.",
		"1 <= len(a) <= 10^5",
		"func Sum(a []int) int { return 0 }",
	} {
		if !strings.Contains(fp.user, want) {
			t.Errorf("user prompt missing %q\n---\n%s", want, fp.user)
		}
	}
	if !strings.Contains(fp.system, "quality_score") {
		t.Errorf("system prompt missing scoring rubric\n---\n%s", fp.system)
	}
}

func TestExplainChat(t *testing.T) {
	e := &Enricher{cfg: &config.Config{}, provider: &fakeProvider{out: "It is O(n) because of the loop."}}
	answer, err := e.ExplainChat(context.Background(), &ExplainChatRequest{
		Code:     "func Sum(a, b int) int { return a + b }",
		Language: "go",
		Question: "What is the complexity?",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !strings.Contains(answer, "O(n)") {
		t.Errorf("unexpected answer: %q", answer)
	}
}

func TestExplainChatValidatesInput(t *testing.T) {
	e := &Enricher{cfg: &config.Config{}, provider: &fakeProvider{out: "answer"}}
	if _, err := e.ExplainChat(context.Background(), &ExplainChatRequest{Code: "x"}); err == nil {
		t.Error("expected error for empty question")
	}
	if _, err := e.ExplainChat(context.Background(), &ExplainChatRequest{Question: "why?"}); err == nil {
		t.Error("expected error for empty code")
	}
}

func TestValidateExplainResponse(t *testing.T) {
	valid := &store.SolutionExplanation{
		Summary:         "s",
		Approach:        "a",
		TimeComplexity:  "O(n)",
		SpaceComplexity: "O(1)",
	}
	if err := validateExplainResponse(valid); err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	cases := []*store.SolutionExplanation{
		nil,
		{},
		{Summary: "s"},
		{Summary: "s", Approach: "a"},
		{Summary: "s", Approach: "a", TimeComplexity: "O(n)"},
	}
	for i, c := range cases {
		if err := validateExplainResponse(c); err == nil {
			t.Errorf("case %d: expected error", i)
		}
	}
}

func TestNvidiaProviderRequestBody(t *testing.T) {
	var got nvidiaRequest
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer test-key" {
			t.Errorf("unexpected authorization header: %q", r.Header.Get("Authorization"))
		}
		if err := json.NewDecoder(r.Body).Decode(&got); err != nil {
			t.Fatal(err)
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"choices":[{"index":0,"message":{"content":"ok"},"finish_reason":"stop"}]}`))
	}))
	defer srv.Close()

	p := newNvidiaProvider("test-key", "z-ai/glm-5.2", srv.URL, 16384, 0.2, true)
	out, err := p.GenerateContent(context.Background(), "sys", "user")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if out != "ok" {
		t.Errorf("unexpected output %q", out)
	}
	if got.Model != "z-ai/glm-5.2" {
		t.Errorf("unexpected model %q", got.Model)
	}
	if got.MaxTokens != 16384 {
		t.Errorf("expected max_tokens 16384, got %d", got.MaxTokens)
	}
	if got.Temperature != 0.2 {
		t.Errorf("expected temperature 0.2, got %v", got.Temperature)
	}
	if got.ResponseFormat == nil || got.ResponseFormat.Type != "json_object" {
		t.Errorf("expected response_format json_object, got %+v", got.ResponseFormat)
	}

	got = nvidiaRequest{}
	p2 := newNvidiaProvider("test-key", "m", srv.URL, 8192, 0.7, false)
	if _, err := p2.GenerateContent(context.Background(), "sys", "user"); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.ResponseFormat != nil {
		t.Errorf("expected no response_format when jsonMode off, got %+v", got.ResponseFormat)
	}
	if got.MaxTokens != 8192 || got.Temperature != 0.7 {
		t.Errorf("expected default knobs, got max_tokens=%d temperature=%v", got.MaxTokens, got.Temperature)
	}
}

func TestNvidiaProviderTruncationIsError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"choices":[{"index":0,"message":{"content":"partial"},"finish_reason":"length"}]}`))
	}))
	defer srv.Close()

	p := newNvidiaProvider("test-key", "m", srv.URL, 8192, 0.7, false)
	_, err := p.GenerateContent(context.Background(), "sys", "user")
	if err == nil {
		t.Fatal("expected truncation to be an error")
	}
	if !errors.Is(err, ErrAIInvalidResponse) {
		t.Errorf("expected ErrAIInvalidResponse, got %v", err)
	}
}
