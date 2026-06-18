package executor

// TestCaseRenderData represents the formatted test case variables for rendering in the template.
type TestCaseRenderData struct {
	Args     string
	Expected string
	Ordinal  int
}

// TemplateRenderData represents the global data passed to the template.
type TemplateRenderData struct {
	FuncName     string
	ParamTypes   []string
	ReturnType   string
	IsPrimitive  bool
	NeedsReflect bool
	TestCases    []TestCaseRenderData
}

const mainTestTemplate = `package piscine

import (
	"testing"
	{{if .NeedsReflect}}"reflect"{{end}}
)

func TestSolution(t *testing.T) {
	{{range $i, $tc := .TestCases}}
	t.Run("case_{{$tc.Ordinal}}", func(t *testing.T) {
		{{if $.ReturnType}}
		got := {{$.FuncName}}({{$tc.Args}})
		want := {{$tc.Expected}}
		{{if $.IsPrimitive}}
		if got != want {
			t.Errorf("=== FAIL: Case %d\nGOT: %#v\nWANT: %#v\n", {{$tc.Ordinal}}, got, want)
		}
		{{else}}
		if !reflect.DeepEqual(got, want) {
			t.Errorf("=== FAIL: Case %d\nGOT: %#v\nWANT: %#v\n", {{$tc.Ordinal}}, got, want)
		}
		{{end}}
		{{else}}
		{{$.FuncName}}({{$tc.Args}})
		{{end}}
	})
	{{end}}
}
`
