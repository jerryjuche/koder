package executor

import (
	"bytes"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"text/template"
)

var packageRegexp = regexp.MustCompile(`(?m)^\s*package\s+[a-zA-Z0-9_]+`)

// PrepareSandbox creates the temporary sandbox directory, writes the required files,
// and returns the path to the sandbox. It is the caller's responsibility to clean up.
func PrepareSandbox(baseDir string, uuidStr string, code string, renderData *TemplateRenderData, goVersion string) (string, error) {
	sandboxPath := filepath.Join(baseDir, uuidStr)
	if err := os.MkdirAll(sandboxPath, 0755); err != nil {
		return "", fmt.Errorf("failed to create sandbox directory: %w", err)
	}

	// Prepare solution.go — force package koder to match test template.
	// Students may submit "package main" but the test runner lives in package koder.
	solutionCode := strings.TrimSpace(code)
	if packageRegexp.MatchString(solutionCode) {
		solutionCode = packageRegexp.ReplaceAllString(solutionCode, "package koder")
	} else {
		solutionCode = "package koder\n\n" + solutionCode
	}

	err := os.WriteFile(filepath.Join(sandboxPath, "solution.go"), []byte(solutionCode), 0644)
	if err != nil {
		_ = os.RemoveAll(sandboxPath)
		return "", fmt.Errorf("failed to write solution.go: %w", err)
	}

	// Prepare go.mod
	goModContent := "module sandbox\n\ngo " + goVersion + "\n"
	err = os.WriteFile(filepath.Join(sandboxPath, "go.mod"), []byte(goModContent), 0644)
	if err != nil {
		_ = os.RemoveAll(sandboxPath)
		return "", fmt.Errorf("failed to write go.mod: %w", err)
	}

	// Prepare main_test.go from template
	tmpl, err := template.New("main_test").Funcs(template.FuncMap{
		"IsPrimitiveType": IsPrimitiveType,
	}).Parse(mainTestTemplate)
	if err != nil {
		_ = os.RemoveAll(sandboxPath)
		return "", fmt.Errorf("failed to parse test template: %w", err)
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, renderData); err != nil {
		_ = os.RemoveAll(sandboxPath)
		return "", fmt.Errorf("failed to render main_test.go: %w", err)
	}

	// Log the generated test file for debugging compile errors
	slog.Debug("sandbox: generated main_test.go", "content", buf.String())

	err = os.WriteFile(filepath.Join(sandboxPath, "main_test.go"), buf.Bytes(), 0644)
	if err != nil {
		_ = os.RemoveAll(sandboxPath)
		return "", fmt.Errorf("failed to write main_test.go: %w", err)
	}

	return sandboxPath, nil
}
