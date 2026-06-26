package executor

import (
	"bufio"
	"regexp"
	"strconv"
	"strings"
	"testing"
)

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

func TestOutputParsingLogic(t *testing.T) {
	output := `
=== RUN   TestSolution
=== RUN   TestSolution/case_1
--- PASS: TestSolution/case_1 (0.00s)
=== RUN   TestSolution/case_2
    main_test.go:12: got 5, want 4
--- FAIL: TestSolution/case_2 (0.00s)
=== RUN   TestSolution/case_3
--- PASS: TestSolution/case_3 (0.01s)
--- FAIL: TestSolution (0.01s)
FAIL
`

	var (
		runRegex    = regexp.MustCompile(`^=== RUN\s+TestSolution/case_(\d+)`)
		passRegex   = regexp.MustCompile(`^--- PASS:\s+TestSolution/case_(\d+)`)
		failRegex   = regexp.MustCompile(`^--- FAIL:\s+TestSolution/case_(\d+)`)
		detailRegex = regexp.MustCompile(`got\s+(.+),\s+want\s+(.+)`)

		passedMap = make(map[int]bool)
		gotMap    = make(map[int]string)
	)

	scanner := bufio.NewScanner(strings.NewReader(output))
	currentOrdinal := -1

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		if matches := runRegex.FindStringSubmatch(line); len(matches) > 1 {
			ord, _ := strconv.Atoi(matches[1])
			currentOrdinal = ord
		} else if matches := detailRegex.FindStringSubmatch(line); len(matches) > 2 && currentOrdinal != -1 {
			gotMap[currentOrdinal] = strings.TrimSpace(matches[1])
		} else if matches := passRegex.FindStringSubmatch(line); len(matches) > 1 {
			ord, _ := strconv.Atoi(matches[1])
			passedMap[ord] = true
		} else if matches := failRegex.FindStringSubmatch(line); len(matches) > 1 {
			ord, _ := strconv.Atoi(matches[1])
			passedMap[ord] = false
		}
	}

	if !passedMap[1] {
		t.Errorf("expected case 1 to pass")
	}
	if passedMap[2] {
		t.Errorf("expected case 2 to fail")
	}
	if gotMap[2] != "5" {
		t.Errorf("expected case 2 got detail to be '5', got %q", gotMap[2])
	}
	if !passedMap[3] {
		t.Errorf("expected case 3 to pass")
	}
}
