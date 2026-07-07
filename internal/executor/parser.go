package executor

import (
	"bufio"
	"regexp"
	"strconv"
	"strings"
)

// parsedOutput holds the results of parsing go test -v output.
type parsedOutput struct {
	passedMap map[int]bool
	gotMap    map[int]string
	wantMap   map[int]string
}

// runRegex matches "=== RUN   TestSolution/case_N"
var runRegex = regexp.MustCompile(`^=== RUN\s+TestSolution/case_(\d+)`)

// passRegex matches "--- PASS: TestSolution/case_N"
var passRegex = regexp.MustCompile(`^--- PASS:\s+TestSolution/case_(\d+)`)

// failRegex matches "--- FAIL: TestSolution/case_N"
var failRegex = regexp.MustCompile(`^--- FAIL:\s+TestSolution/case_(\d+)`)

// caseFailRegex matches lines containing "=== FAIL: Case N" (from t.Errorf format)
var caseFailRegex = regexp.MustCompile(`(?:\s|^)=== FAIL: Case (\d+)`)

// gotRegex matches lines containing "GOT:" (possibly prefixed by tabs/file:line)
var gotRegex = regexp.MustCompile(`(?:\s|^)GOT:\s+(.*)$`)

// wantRegex matches lines containing "WANT:" (possibly prefixed by tabs/file:line)
var wantRegex = regexp.MustCompile(`(?:\s|^)WANT:\s+(.*)$`)

// ParseTestOutput parses the output of `go test -v` for a single solution
// and returns the pass/fail status per test case ordinal, along with
// parsed GOT/WANT values.
func ParseTestOutput(output string) parsedOutput {
	res := parsedOutput{
		passedMap: make(map[int]bool),
		gotMap:    make(map[int]string),
		wantMap:   make(map[int]string),
	}

	scanner := bufio.NewScanner(strings.NewReader(output))

	var currentOrdinal int = -1
	var currentState string
	var gotBuffer []string
	var wantBuffer []string

	for scanner.Scan() {
		line := scanner.Text()
		trimmed := strings.TrimSpace(line)

		switch {
		case runRegex.MatchString(trimmed):
			matches := runRegex.FindStringSubmatch(trimmed)
			ord, _ := strconv.Atoi(matches[1])
			currentOrdinal = ord
			currentState = ""
		case passRegex.MatchString(trimmed):
			matches := passRegex.FindStringSubmatch(trimmed)
			ord, _ := strconv.Atoi(matches[1])
			res.passedMap[ord] = true
			currentState = ""
		case failRegex.MatchString(trimmed):
			matches := failRegex.FindStringSubmatch(trimmed)
			ord, _ := strconv.Atoi(matches[1])
			res.passedMap[ord] = false
			currentState = ""
		case caseFailRegex.MatchString(trimmed):
			matches := caseFailRegex.FindStringSubmatch(trimmed)
			ord, _ := strconv.Atoi(matches[1])
			currentOrdinal = ord
			res.passedMap[ord] = false
			currentState = ""
		case gotRegex.MatchString(trimmed):
			matches := gotRegex.FindStringSubmatch(trimmed)
			currentState = "got"
			gotBuffer = []string{matches[1]}
		case wantRegex.MatchString(trimmed):
			matches := wantRegex.FindStringSubmatch(trimmed)
			if currentOrdinal != -1 && len(gotBuffer) > 0 {
				res.gotMap[currentOrdinal] = strings.Join(gotBuffer, "\n")
			}
			currentState = "want"
			wantBuffer = []string{matches[1]}
		case currentState == "got" && trimmed != "":
			gotBuffer = append(gotBuffer, strings.TrimLeft(line, "\t"))
		case currentState == "want" && trimmed != "":
			wantBuffer = append(wantBuffer, strings.TrimLeft(line, "\t"))
		case currentState == "got":
			gotBuffer = append(gotBuffer, "")
		case currentState == "want":
			wantBuffer = append(wantBuffer, "")
		}
	}

	// Finalize any remaining buffers
	if currentOrdinal != -1 {
		if len(gotBuffer) > 0 {
			res.gotMap[currentOrdinal] = strings.Join(gotBuffer, "\n")
		}
		if len(wantBuffer) > 0 {
			res.wantMap[currentOrdinal] = strings.Join(wantBuffer, "\n")
		}
	}

	return res
}
