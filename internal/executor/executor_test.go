package executor

import (
	"bytes"
	"strings"
	"testing"
	"text/template"

	"github.com/jerryjuche/koder/internal/store"
)

func TestTemplateReflectImport(t *testing.T) {
	tests := []struct {
		name        string
		returnType  string
		wantReflect bool
	}{
		{"primitive int", "int", false},
		{"primitive bool", "bool", false},
		{"primitive string", "string", false},
		{"slice []int", "[]int", true},
		{"map map[string]int", "map[string]int", true},
		{"pointer *TreeNode", "*TreeNode", true},
		{"empty return type", "", false},
	}

	tmpl, err := template.New("main_test").Funcs(template.FuncMap{
		"IsPrimitiveType": IsPrimitiveType,
	}).Parse(mainTestTemplate)
	if err != nil {
		t.Fatalf("failed to parse template: %v", err)
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var buf bytes.Buffer
			err := tmpl.Execute(&buf, &TemplateRenderData{
				FuncName:    "TestFunc",
				ReturnType:  tt.returnType,
				IsPrimitive: IsPrimitiveType(tt.returnType),
				TestCases:   []TestCaseRenderData{{Args: "1", Expected: "2", Ordinal: 1}},
			})
			if err != nil {
				t.Fatalf("template execute error: %v", err)
			}

			output := buf.String()
			hasReflect := strings.Contains(output, `"reflect"`)

			if hasReflect && !tt.wantReflect {
				t.Errorf("template has reflect import but shouldn't\n%s", output)
			}
			if !hasReflect && tt.wantReflect {
				t.Errorf("template missing reflect import but should have it\n%s", output)
			}
		})
	}
}

func TestIsPrimitiveType(t *testing.T) {
	tests := []struct {
		typ  string
		want bool
	}{
		{"int", true},
		{"string", true},
		{"bool", true},
		{"float64", true},
		{"[]int", false},
		{"map[string]int", false},
	}

	for _, tc := range tests {
		if got := IsPrimitiveType(tc.typ); got != tc.want {
			t.Errorf("IsPrimitiveType(%q) = %v, want %v", tc.typ, got, tc.want)
		}
	}
}

func TestFormatPythonLiteral(t *testing.T) {
	tests := []struct {
		typ  string
		json string
		want string
	}{
		{"int", "42", "42"},
		{"string", `"hello"`, `"hello"`},
		{"bool", "true", "True"},
		{"bool", "false", "False"},
		{"float64", "3.14", "3.14"},
		{"any", "null", "None"},
		{"int", "null", "None"},
		{"string", "null", "None"},
		{"", "null", "None"},
	}

	for _, tc := range tests {
		got, err := formatPythonLiteral(tc.typ, []byte(tc.json))
		if err != nil {
			t.Errorf("formatPythonLiteral(%s, %s) error: %v", tc.typ, tc.json, err)
			continue
		}
		if got != tc.want {
			t.Errorf("formatPythonLiteral(%s, %s) = %q, want %q", tc.typ, tc.json, got, tc.want)
		}
	}
}

func TestFormatGoLiteral(t *testing.T) {
	tests := []struct {
		typ  string
		json string
		want string
	}{
		{"int", "42", "42"},
		{"string", `"hello"`, `"hello"`},
		{"bool", "true", "true"},
		{"float64", "3.14", "3.14"},
		{"[]int", "[1, 2, 3]", "[]int{1, 2, 3}"},
		{"[]string", `["a", "b"]`, `[]string{"a", "b"}`},
		{"[][]int", "[[1, 2], [3]]", "[][]int{[]int{1, 2}, []int{3}}"},
	}

	for _, tc := range tests {
		got, err := formatGoLiteral(tc.typ, []byte(tc.json))
		if err != nil {
			t.Errorf("formatGoLiteral(%s, %s) error: %v", tc.typ, tc.json, err)
			continue
		}
		if got != tc.want {
			t.Errorf("formatGoLiteral(%s, %s) = %q, want %q", tc.typ, tc.json, got, tc.want)
		}
	}
}

func TestParseTestOutput_AllPass(t *testing.T) {
	output := `=== RUN   TestSolution
=== RUN   TestSolution/case_1
--- PASS: TestSolution/case_1 (0.00s)
=== RUN   TestSolution/case_2
--- PASS: TestSolution/case_2 (0.00s)
=== RUN   TestSolution/case_3
--- PASS: TestSolution/case_3 (0.01s)
--- PASS: TestSolution (0.01s)
`
	res := ParseTestOutput(output)

	if !res.passedMap[1] {
		t.Errorf("expected case 1 to pass")
	}
	if !res.passedMap[2] {
		t.Errorf("expected case 2 to pass")
	}
	if !res.passedMap[3] {
		t.Errorf("expected case 3 to pass")
	}
}

func TestParseTestOutput_MixedPassFail(t *testing.T) {
	output := `=== RUN   TestSolution
=== RUN   TestSolution/case_1
--- PASS: TestSolution/case_1 (0.00s)
=== RUN   TestSolution/case_2
    main_test.go:12: === FAIL: Case 2
    main_test.go:12: GOT: 5
    main_test.go:12: WANT: 4
--- FAIL: TestSolution/case_2 (0.00s)
=== RUN   TestSolution/case_3
--- PASS: TestSolution/case_3 (0.01s)
--- FAIL: TestSolution (0.01s)
FAIL
`
	res := ParseTestOutput(output)

	if !res.passedMap[1] {
		t.Errorf("expected case 1 to pass")
	}
	if res.passedMap[2] {
		t.Errorf("expected case 2 to fail, got pass")
	}
	if !res.passedMap[3] {
		t.Errorf("expected case 3 to pass")
	}
	if res.gotMap[2] != "5" {
		t.Errorf("expected case 2 got to be '5', got %q", res.gotMap[2])
	}
}

func TestParseTestOutput_MultiLineGotWant(t *testing.T) {
	// The parser's state machine tracks GOT/WANT via state transitions.
	// Multi-line values are accumulated line-by-line. Continuation lines
	// within the GOT/WANT section are included with tabs stripped.
	// The WANT value is finalized only when the next state transition
	// occurs (e.g. pass/fail line or EOF), and is associated with the
	// last-seen ordinal at that point.
	output := "=== RUN   TestSolution\n" +
		"=== RUN   TestSolution/case_1\n" +
		"\tmain_test.go:12: === FAIL: Case 1\n" +
		"\tmain_test.go:12: GOT: start\n" +
		"\tmain_test.go:12: continuation\n" +
		"\tmain_test.go:12: WANT: expected value\n" +
		"--- FAIL: TestSolution/case_1 (0.00s)\n"
	res := ParseTestOutput(output)

	if res.passedMap[1] {
		t.Errorf("expected case 1 to fail")
	}
	if !strings.Contains(res.gotMap[1], "start") {
		t.Errorf("expected got to contain 'start', got %q", res.gotMap[1])
	}
	if !strings.Contains(res.gotMap[1], "continuation") {
		t.Errorf("expected got to contain 'continuation', got %q", res.gotMap[1])
	}
	if !strings.Contains(res.wantMap[1], "expected value") {
		t.Errorf("expected want to contain 'expected value', got %q", res.wantMap[1])
	}
}

func TestParseTestOutput_CompilerError(t *testing.T) {
	output := `# koder
./solution.go:5:10: syntax error: unexpected newline, expecting comma or }
FAIL
koder [build failed]
`
	res := ParseTestOutput(output)

	if len(res.passedMap) != 0 {
		t.Errorf("expected no passed/failed cases for compiler error, got %d", len(res.passedMap))
	}
}

func TestParseTestOutput_Timeout(t *testing.T) {
	output := `panic: test timed out after 5s
`
	res := ParseTestOutput(output)

	if len(res.passedMap) != 0 {
		t.Errorf("expected no passed/failed cases for timeout")
	}
}

func TestParseTestOutput_Empty(t *testing.T) {
	res := ParseTestOutput("")

	if len(res.passedMap) != 0 {
		t.Errorf("expected empty result for empty output")
	}
	if len(res.gotMap) != 0 {
		t.Errorf("expected empty gotMap for empty output")
	}
	if len(res.wantMap) != 0 {
		t.Errorf("expected empty wantMap for empty output")
	}
}

func TestParseTestOutput_SingleCase(t *testing.T) {
	output := `=== RUN   TestSolution
=== RUN   TestSolution/case_1
    main_test.go:12: === FAIL: Case 1
    main_test.go:12: GOT: false
    main_test.go:12: WANT: true
--- FAIL: TestSolution/case_1 (0.00s)
--- FAIL: TestSolution (0.01s)
FAIL
`
	res := ParseTestOutput(output)

	if res.passedMap[1] {
		t.Errorf("expected case 1 to fail")
	}
	if res.gotMap[1] != "false" {
		t.Errorf("expected got 'false', got %q", res.gotMap[1])
	}
	if res.wantMap[1] != "true" {
		t.Errorf("expected want 'true', got %q", res.wantMap[1])
	}
}

func TestParseTestOutput_NoWANTLine(t *testing.T) {
	// Edge case: go test error format without explicit WANT line
	output := `=== RUN   TestSolution
=== RUN   TestSolution/case_1
    main_test.go:12: GOT: 10
--- FAIL: TestSolution/case_1 (0.00s)
--- FAIL: TestSolution (0.01s)
FAIL
`
	res := ParseTestOutput(output)

	if res.passedMap[1] {
		t.Errorf("expected case 1 to fail")
	}
	// GOT was found, but no corresponding WANT was set on case 1
	if res.gotMap[1] != "10" {
		t.Errorf("expected got '10', got %q", res.gotMap[1])
	}
	if _, exists := res.wantMap[1]; exists {
		t.Errorf("expected no want for case 1, got %q", res.wantMap[1])
	}
}

func TestPythonTemplate_Renders(t *testing.T) {
	tmpl, err := template.New("python_test").Parse(pythonTestTemplate)
	if err != nil {
		t.Fatalf("failed to parse python template: %v", err)
	}

	tests := []struct {
		name      string
		funcName  string
		pyCases   []PyTestCaseRenderData
	}{
		{
			name:     "basic function",
			funcName: "fish_and_chips",
			pyCases: []PyTestCaseRenderData{
				{Ordinal: 1, PyInputs: "(4,)", Expected: "\"fish\""},
			},
		},
		{
			name:     "multiple cases",
			funcName: "is_prime",
			pyCases: []PyTestCaseRenderData{
				{Ordinal: 1, PyInputs: "(2,)", Expected: "true"},
				{Ordinal: 2, PyInputs: "(4,)", Expected: "false"},
			},
		},
		{
			name:     "no test cases",
			funcName: "do_nothing",
			pyCases: []PyTestCaseRenderData{},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			var buf bytes.Buffer
			err := tmpl.Execute(&buf, &TemplateRenderData{
				FuncName:   tc.funcName,
				PyTestCases: tc.pyCases,
			})
			if err != nil {
				t.Fatalf("template execute error: %v", err)
			}

			output := buf.String()
			if !strings.Contains(output, "from solution import "+tc.funcName) {
				t.Errorf("template missing import line")
			}
			if !strings.Contains(output, "=== RUN TestSolution") {
				t.Errorf("template missing RUN line")
			}
			if strings.Count(output, "print(\"---") == 0 {
				t.Errorf("template missing PASS/FAIL print statements")
			}
		})
	}
}

func TestPythonTemplate_ComparisonLogic(t *testing.T) {
	// Verify the template uses json.loads + == (not str() comparison)
	content := pythonTestTemplate
	if strings.Contains(content, "str(result) == str(expected)") {
		t.Error("template still uses str() comparison instead of json.loads")
	}
	if !strings.Contains(content, "json.loads(expected)") {
		t.Error("template missing json.loads(expected)")
	}
	if !strings.Contains(content, "result == expected_val") {
		t.Error("template missing result == expected_val")
	}
}

func TestResolveProblemLanguageMeta(t *testing.T) {
	t.Run("empty language returns early", func(t *testing.T) {
		p := &store.Problem{FuncName: "Original", ReturnType: "string", ParamTypes: []string{"int"}}
		resolveProblemLanguageMeta(p, "")
		if p.FuncName != "Original" {
			t.Error("should not modify FuncName when language is empty")
		}
	})

	t.Run("nil LanguageVersions returns early", func(t *testing.T) {
		p := &store.Problem{FuncName: "Original", ReturnType: "string", ParamTypes: []string{"int"}}
		resolveProblemLanguageMeta(p, "go")
		if p.FuncName != "Original" {
			t.Error("should not modify FuncName when LanguageVersions is nil")
		}
	})

	t.Run("resolves go metadata", func(t *testing.T) {
		p := &store.Problem{
			FuncName:   "OldName",
			ReturnType: "old",
			ParamTypes: []string{"old"},
			LanguageVersions: map[string]store.LanguageSpec{
				"go": {FuncName: "GoFunc", ReturnType: "string", ParamTypes: []string{"int"}},
			},
		}
		resolveProblemLanguageMeta(p, "go")
		if p.FuncName != "GoFunc" {
			t.Errorf("expected FuncName 'GoFunc', got %q", p.FuncName)
		}
		if p.ReturnType != "string" {
			t.Errorf("expected ReturnType 'string', got %q", p.ReturnType)
		}
		if len(p.ParamTypes) != 1 || p.ParamTypes[0] != "int" {
			t.Errorf("expected ParamTypes ['int'], got %v", p.ParamTypes)
		}
	})

	t.Run("resolves python metadata", func(t *testing.T) {
		p := &store.Problem{
			FuncName:   "OldName",
			ReturnType: "old",
			ParamTypes: []string{"old"},
			LanguageVersions: map[string]store.LanguageSpec{
				"go":     {FuncName: "GoFunc", ReturnType: "string", ParamTypes: []string{"int"}},
				"python": {FuncName: "go_func", ReturnType: "str", ParamTypes: []string{"int"}},
			},
		}
		resolveProblemLanguageMeta(p, "python")
		if p.FuncName != "go_func" {
			t.Errorf("expected FuncName 'go_func', got %q", p.FuncName)
		}
		if p.ReturnType != "str" {
			t.Errorf("expected ReturnType 'str', got %q", p.ReturnType)
		}
	})

	t.Run("unknown language returns early", func(t *testing.T) {
		p := &store.Problem{
			FuncName: "Original",
			LanguageVersions: map[string]store.LanguageSpec{
				"go": {FuncName: "GoFunc", ReturnType: "string", ParamTypes: []string{"int"}},
			},
		}
		resolveProblemLanguageMeta(p, "rust")
		if p.FuncName != "Original" {
			t.Error("should not modify FuncName for unknown language")
		}
	})

	t.Run("empty fields in spec do not override", func(t *testing.T) {
		p := &store.Problem{
			FuncName:   "KeepMe",
			ReturnType: "string",
			ParamTypes: []string{"int"},
			LanguageVersions: map[string]store.LanguageSpec{
				"python": {FuncName: "", ReturnType: "str", ParamTypes: nil},
			},
		}
		resolveProblemLanguageMeta(p, "python")
		if p.FuncName != "KeepMe" {
			t.Error("should keep original FuncName when python entry has empty FuncName")
		}
		if p.ReturnType != "str" {
			t.Errorf("should override ReturnType, got %q", p.ReturnType)
		}
		if len(p.ParamTypes) != 1 || p.ParamTypes[0] != "int" {
			t.Error("should keep original ParamTypes when python entry has nil ParamTypes")
		}
	})
}

func TestParseTestOutput_PythonFormat(t *testing.T) {
	tests := []struct {
		name     string
		output   string
		wantPass map[int]bool
		wantGot  map[int]string
		wantWant map[int]string
	}{
		{
			name: "all pass",
			output: `=== RUN TestSolution
--- PASS: TestSolution/case_1
--- PASS: TestSolution/case_2
--- PASS: TestSolution
`,
			wantPass: map[int]bool{1: true, 2: true},
		},
		{
			name: "mixed pass fail",
			output: `=== RUN TestSolution
--- PASS: TestSolution/case_1
=== FAIL: Case 2
GOT: 5
WANT: 4
--- FAIL: TestSolution/case_2
--- FAIL: TestSolution
`,
			wantPass: map[int]bool{1: true, 2: false},
			wantGot:  map[int]string{2: "5"},
			wantWant: map[int]string{2: "4"},
		},
		{
			name: "string comparison with embedded quotes",
			output: `=== RUN TestSolution
=== FAIL: Case 1
GOT: fish
WANT: "fish"
--- FAIL: TestSolution/case_1
--- FAIL: TestSolution
`,
			wantPass: map[int]bool{1: false},
			wantGot:  map[int]string{1: "fish"},
			wantWant: map[int]string{1: `"fish"`},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			res := ParseTestOutput(tc.output)
			for ord, passed := range tc.wantPass {
				if res.passedMap[ord] != passed {
					t.Errorf("case %d: expected pass=%v, got pass=%v", ord, passed, res.passedMap[ord])
				}
			}
			for ord, got := range tc.wantGot {
				if res.gotMap[ord] != got {
					t.Errorf("case %d: expected got=%q, got got=%q", ord, got, res.gotMap[ord])
				}
			}
			for ord, want := range tc.wantWant {
				if res.wantMap[ord] != want {
					t.Errorf("case %d: expected want=%q, got want=%q", ord, want, res.wantMap[ord])
				}
			}
		})
	}
}

