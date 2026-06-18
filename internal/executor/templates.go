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
	{{if .NeedsReflect}}"reflect"
	"sort"{{end}}
)

{{if .NeedsReflect}}
// sortIntSlice is a helper for order-independent slice comparison
func sortIntSlice(s []int) []int {
	sorted := make([]int, len(s))
	copy(sorted, s)
	sort.Ints(sorted)
	return sorted
}
{{end}}

func TestSolution(t *testing.T) {
	{{range $i, $tc := .TestCases}}
	t.Run("case_{{$tc.Ordinal}}", func(t *testing.T) {
		{{if $.ReturnType}}
		got := {{$.FuncName}}({{$tc.Args}})
		want := {{$tc.Expected}}
		{{if $.IsPrimitive}}
		if got != want {
			t.Errorf("=== FAIL: Case {{$tc.Ordinal}}\nGOT: %#v\nWANT: %#v", got, want)
		}
		{{else}}
		// For integer slices, sort before comparison to handle order-independent results
		var gotCmp, wantCmp interface{} = got, want
		if gotSlice, ok := got.([]int); ok {
			gotCmp = sortIntSlice(gotSlice)
		}
		if wantSlice, ok := want.([]int); ok {
			wantCmp = sortIntSlice(wantSlice)
		}
		if !reflect.DeepEqual(gotCmp, wantCmp) {
			t.Errorf("=== FAIL: Case {{$tc.Ordinal}}\nGOT: %#v\nWANT: %#v", gotCmp, wantCmp)
		}
		{{end}}
		{{else}}
		{{$.FuncName}}({{$tc.Args}})
		{{end}}
	})
	{{end}}
}
`
