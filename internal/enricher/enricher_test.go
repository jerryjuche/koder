package enricher

import (
	"context"
	"errors"
	"strings"
	"testing"

	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
)

// fakeProvider is a scriptable enrichmentProvider for unit tests.
type fakeProvider struct {
	out string
	err error
}

func (f *fakeProvider) Name() string { return "fake" }
func (f *fakeProvider) GenerateContent(_ context.Context, systemPrompt, userPrompt string) (string, error) {
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
	})
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
