import {
  CodeSnippet,
  CodeSnippetHeader,
  CodeSnippetBody,
  CodeSnippetContent,
  CodeSnippetCopyButton,
} from ".";

const fibonacciGo = `package koder

// Fibonacci returns the nth Fibonacci number.
// The sequence starts with F(0) = 0, F(1) = 1.
func Fibonacci(n int) int {
    if n <= 1 {
        return n
    }

    a, b := 0, 1
    for i := 2; i <= n; i++ {
        a, b = b, a+b
    }

    return b
}`;

const fibonacciPy = `def fibonacci(n: int) -> int:
    \"\"\"Return the nth Fibonacci number.\"\"\"
    if n <= 1:
        return n

    a, b = 0, 1
    for i in range(2, n + 1):
        a, b = b, a + b

    return b`;

const sortGo = `package koder

import "sort"

// SortAndDeduplicate sorts a slice of integers
// and removes duplicate values in-place.
func SortAndDeduplicate(nums []int) []int {
    if len(nums) == 0 {
        return nums
    }

    sort.Ints(nums)

    j := 0
    for i := 1; i < len(nums); i++ {
        if nums[j] != nums[i] {
            j++
            nums[j] = nums[i]
        }
    }

    return nums[:j+1]
}`;

const querySQL = `-- Get top users by XP with their submission stats
SELECT
    u.id,
    u.username,
    u.xp,
    COUNT(DISTINCT s.id) AS total_submissions,
    COUNT(DISTINCT CASE WHEN s.status = 'passed' THEN s.id END) AS passed_submissions,
    ROUND(
        COUNT(DISTINCT CASE WHEN s.status = 'passed' THEN s.id END)::numeric /
        NULLIF(COUNT(DISTINCT s.id), 0) * 100, 1
    ) AS pass_rate
FROM users u
LEFT JOIN submissions s ON s.user_id = u.id
WHERE u.xp > 0
GROUP BY u.id, u.username, u.xp
ORDER BY u.xp DESC
LIMIT 10;`;

const longCode = `package koder

import (
    "fmt"
    "math"
    "sort"
    "strings"
)

// AnalyzeText performs comprehensive text analysis on the input string
// and returns a detailed report of various metrics.
func AnalyzeText(input string) (*TextReport, error) {
    if len(input) == 0 {
        return nil, fmt.Errorf("input cannot be empty")
    }

    report := &TextReport{
        Original: input,
    }

    words := strings.Fields(input)
    report.WordCount = len(words)
    report.CharCount = len(input)
    report.LineCount = strings.Count(input, "\\n") + 1

    freq := make(map[string]int)
    for _, w := range words {
        cleaned := strings.Trim(strings.ToLower(w), ".,!?;:'\\"")
        if cleaned != "" {
            freq[cleaned]++
        }
    }

    type wordFreq struct {
        word  string
        count int
    }
    sorted := make([]wordFreq, 0, len(freq))
    for w, c := range freq {
        sorted = append(sorted, wordFreq{w, c})
    }
    sort.Slice(sorted, func(i, j int) bool {
        return sorted[i].count > sorted[j].count
    })

    limit := 10
    if len(sorted) < limit {
        limit = len(sorted)
    }
    report.TopWords = sorted[:limit]

    vowelCount := 0
    for _, c := range input {
        switch strings.ToLower(string(c)) {
        case "a", "e", "i", "o", "u":
            vowelCount++
        }
    }
    report.VowelCount = vowelCount

    report.AverageWordLength = 0.0
    if report.WordCount > 0 {
        totalLetters := 0
        for _, w := range words {
            totalLetters += len(w)
        }
        report.AverageWordLength = math.Round(
            float64(totalLetters)/float64(report.WordCount)*100,
        ) / 100
    }

    return report, nil
}

type TextReport struct {
    Original          string
    WordCount         int
    CharCount         int
    LineCount         int
    VowelCount        int
    AverageWordLength float64
    TopWords          []struct {
        Word  string
        Count int
    }
}`;

export const CodeSnippetHorizontalDemo = () => (
  <CodeSnippet
    files={[{ language: "go", filename: "solution.go", code: fibonacciGo }]}
    showLineNumbers
    variant="default"
  />
);

export const CodeSnippetVerticalDemo = () => (
  <CodeSnippet
    files={[{ language: "go", filename: "solution.go", code: fibonacciGo }]}
    showLineNumbers={false}
    variant="minimal"
  />
);

export const CodeSnippetShowMore = () => (
  <CodeSnippet
    files={[{ language: "go", filename: "analyzer.go", code: longCode }]}
    showMore
    maxCollapsedHeight={200}
    showLineNumbers
    variant="default"
  />
);

const multiFileData = [
  { language: "go", filename: "fibonacci.go", code: fibonacciGo },
  { language: "python", filename: "fibonacci.py", code: fibonacciPy },
  { language: "go", filename: "sort.go", code: sortGo },
  { language: "sql", filename: "query.sql", code: querySQL },
];

export const CodeSnippetWithTabs = () => (
  <CodeSnippet
    files={multiFileData}
    defaultValue="go"
    showLineNumbers
    variant="default"
  />
);
