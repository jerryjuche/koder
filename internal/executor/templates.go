package executor

// TestCaseRenderData represents the formatted test case variables for rendering in the Go template.
type TestCaseRenderData struct {
	Args     string
	Expected string
	Ordinal  int
}

// PyTestCaseRenderData represents a Python test case with pre-formatted literal inputs.
type PyTestCaseRenderData struct {
	Ordinal  int
	PyInputs string // Python tuple literal, e.g. `(3,)` or `("hello", True)`
	Expected string // JSON-encoded expected value as a string (parsed via json.loads)
}

// TemplateRenderData represents the global data passed to the template.
type TemplateRenderData struct {
	FuncName       string
	ParamTypes     []string
	ReturnType     string
	IsPrimitive    bool
	NeedsReflect   bool
	TestCases      []TestCaseRenderData
	TestCasesJSON  string // JSON-encoded test cases for Python template (legacy)
	PyTestCases    []PyTestCaseRenderData
}

// mainTestTemplate generates a clean, compilable Go test file.
// Uses trimmed template actions ({{- -}}) to eliminate blank lines from
// range/if blocks, producing output that passes gofmt and is easy to debug.
// pythonTestTemplate generates a Python test runner that emits Go-compatible
// output (=== RUN, --- PASS/FAIL, GOT:/WANT:), requiring zero changes to parser.go.
const pythonTestTemplate = `import sys, json

sys.path.insert(0, '.')
from solution import {{.FuncName}}

test_cases = [
{{- range $i, $tc := .PyTestCases}}
    {"ordinal": {{$tc.Ordinal}}, "inputs": {{$tc.PyInputs}}, "expected": {{printf "%q" $tc.Expected}}},
{{- end}}
]

print("=== RUN TestSolution")

passed = 0
total = len(test_cases)

for tc in test_cases:
    ordinal = tc["ordinal"]
    inputs = tc["inputs"]
    expected = tc["expected"]
    try:
        result = {{.FuncName}}(*inputs)
        expected_val = json.loads(expected)
        if result == expected_val:
            passed += 1
            print(f"--- PASS: TestSolution/case_{ordinal}")
        else:
            print(f"--- FAIL: TestSolution/case_{ordinal}")
            print(f"=== FAIL: Case {ordinal}")
            print(f"GOT: {result}")
            print(f"WANT: {expected}")
    except Exception as e:
        print(f"--- FAIL: TestSolution/case_{ordinal}")
        print(f"=== FAIL: Case {ordinal}")
        print(f"GOT: (exception) {e}")
        print(f"WANT: {expected}")

print("--- PASS: TestSolution" if passed == total else "--- FAIL: TestSolution")
`

const mainTestTemplate = `package koder

import (
	"testing"
{{- if and (ne .ReturnType "") (not (IsPrimitiveType .ReturnType))}}
	"reflect"
{{- end}}
)

func TestSolution(t *testing.T) {
{{- range $i, $tc := .TestCases}}
	t.Run("case_{{$tc.Ordinal}}", func(t *testing.T) {
{{- if $.ReturnType}}
		got := {{$.FuncName}}({{$tc.Args}})
		want := {{$tc.Expected}}
{{- if $.IsPrimitive}}
		if got != want {
			t.Errorf("=== FAIL: Case %d\nGOT: %#v\nWANT: %#v\n", {{$tc.Ordinal}}, got, want)
		}
{{- else}}
		if !reflect.DeepEqual(got, want) {
			t.Errorf("=== FAIL: Case %d\nGOT: %#v\nWANT: %#v\n", {{$tc.Ordinal}}, got, want)
		}
{{- end}}
{{- else}}
		{{$.FuncName}}({{$tc.Args}})
{{- end}}
	})
{{- end}}
}
`
