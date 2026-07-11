package enricher

import (
	"testing"

	"github.com/jerryjuche/koder/internal/store"
)

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
