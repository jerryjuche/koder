package executor

import (
	"github.com/google/uuid"
)

// ExecutionRequest represents a submission to be compiled and run.
type ExecutionRequest struct {
	UserID    uuid.UUID
	ProblemID uuid.UUID
	Code      string
	Language  string
}

// TestResult represents the result of a single test case.
type TestResult struct {
	TestCaseID uuid.UUID `json:"test_case_id"`
	Ordinal    int       `json:"ordinal"`
	Passed     bool      `json:"passed"`
	Got        string    `json:"got"`
	Expected   string    `json:"expected"`
	IsHidden   bool      `json:"is_hidden"`
}

// ExecutionResult represents the output of the grading process.
type ExecutionResult struct {
	Status          string       `json:"status"` // "passed" | "failed" | "compiler_error" | "timeout"
	FriendlyMessage string       `json:"friendly_message,omitempty"`
	PassedCount     int          `json:"passed_count"`
	TotalCount      int          `json:"total_count"`
	OutputLogs      string       `json:"output_logs"`
	RuntimeMs       int          `json:"runtime_ms"`
	TestResults     []TestResult `json:"test_results"`
}
