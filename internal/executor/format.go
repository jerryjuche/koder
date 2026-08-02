package executor

import (
	"context"
	"fmt"
	"go/format"
)

// FormatSyntaxError indicates the source could not be parsed — a client error,
// not an infrastructure failure. The API handler maps it to HTTP 422.
type FormatSyntaxError struct {
	Err error
}

func (e *FormatSyntaxError) Error() string { return e.Err.Error() }
func (e *FormatSyntaxError) Unwrap() error { return e.Err }

// FormatCode formats source code with the authoritative formatter for the
// language. Go is formatted in-process via go/format.Source() (the same
// canonicalizer gofmt uses); Python is formatted by pinned black inside the
// remote sandbox so output is byte-identical to the formatter version the
// grading pipeline ships with. Empty input formats to empty output.
func (e *Executor) FormatCode(ctx context.Context, language, code string) (string, error) {
	switch language {
	case "go":
		formatted, err := format.Source([]byte(code))
		if err != nil {
			return "", &FormatSyntaxError{Err: err}
		}
		return string(formatted), nil

	case "python":
		sandboxURL := e.cfg.SandboxURL
		if e.cfg.PythonSandboxURL != "" {
			sandboxURL = e.cfg.PythonSandboxURL
		}
		if sandboxURL == "" {
			return "", fmt.Errorf("no sandbox configured for python formatting")
		}
		client := newSandboxClient(sandboxURL, e.cfg.PythonExecutorTimeout, e.cfg.SandboxRequestTimeoutExtra)
		resp, err := client.format(ctx, code)
		if err != nil {
			return "", err
		}
		if resp.Error != "" {
			return "", &FormatSyntaxError{Err: fmt.Errorf("%s", resp.Error)}
		}
		return resp.Formatted, nil

	default:
		return "", fmt.Errorf("unsupported language %q", language)
	}
}
