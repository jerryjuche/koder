package executor

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"math"
	"net/http"
	"time"
)

// SandboxRequest is the payload sent to the remote sandbox service.
type SandboxRequest struct {
	Language   string `json:"language"`
	Code       string `json:"code"`
	TestCode   string `json:"test_code"`
	TimeoutSec int    `json:"timeout_sec"`
	GoVersion  string `json:"go_version,omitempty"`
}

// SandboxResponse is returned by the remote sandbox service.
type SandboxResponse struct {
	Status      string `json:"status"`
	Stdout      string `json:"stdout"`
	Stderr      string `json:"stderr"`
	PassedCount int    `json:"passed_count"`
	TotalCount  int    `json:"total_count"`
	RuntimeMs   int    `json:"runtime_ms"`
	Error       string `json:"error,omitempty"`
}

// sandboxClient handles HTTP communication with the remote sandbox.
type sandboxClient struct {
	httpClient *http.Client
	baseURL    string
	timeoutSec int
}

// newSandboxClient creates a client with a per-request timeout.
func newSandboxClient(baseURL string, timeoutSec int) *sandboxClient {
	return &sandboxClient{
		httpClient: &http.Client{
			Timeout: time.Duration(timeoutSec+10) * time.Second,
		},
		baseURL:    baseURL,
		timeoutSec: timeoutSec,
	}
}

// execute sends code and test_code to the remote sandbox and returns the result.
// It performs up to maxRetries attempts with exponential backoff on transient failures.
func (c *sandboxClient) execute(ctx context.Context, language, code, testCode, goVersion string) (*SandboxResponse, error) {
	reqBody := SandboxRequest{
		Language:   language,
		Code:       code,
		TestCode:   testCode,
		TimeoutSec: c.timeoutSec,
		GoVersion:  goVersion,
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("sandbox: failed to marshal request: %w", err)
	}

	url := c.baseURL + "/execute"
	maxRetries := 2

	var lastErr error
	for attempt := 0; attempt <= maxRetries; attempt++ {
		if attempt > 0 {
			backoff := time.Duration(math.Pow(2, float64(attempt))) * 500 * time.Millisecond
			slog.Info("sandbox: retrying", "attempt", attempt, "backoff_ms", backoff.Milliseconds())
			select {
			case <-time.After(backoff):
			case <-ctx.Done():
				return nil, ctx.Err()
			}
		}

		resp, err := c.doRequest(ctx, url, body)
		if err == nil {
			return resp, nil
		}

		lastErr = err
		slog.Warn("sandbox: request failed", "attempt", attempt, "error", err)
	}

	return nil, fmt.Errorf("sandbox: all %d attempts failed: %w", maxRetries+1, lastErr)
}

func (c *sandboxClient) doRequest(ctx context.Context, url string, body []byte) (*SandboxResponse, error) {
	start := time.Now()

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("sandbox: failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	httpResp, err := c.httpClient.Do(req)
	duration := time.Since(start)
	if err != nil {
		slog.Warn("sandbox: HTTP call failed",
			"duration_ms", duration.Milliseconds(),
			"error", err,
		)
		return nil, fmt.Errorf("sandbox: HTTP request failed: %w", err)
	}
	defer httpResp.Body.Close()

	respBody, err := io.ReadAll(httpResp.Body)
	if err != nil {
		return nil, fmt.Errorf("sandbox: failed to read response body: %w", err)
	}

	slog.Info("sandbox: call completed",
		"status_code", httpResp.StatusCode,
		"duration_ms", duration.Milliseconds(),
		"body_size", len(respBody),
	)

	if httpResp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("sandbox: unexpected status %d: %s", httpResp.StatusCode, string(respBody))
	}

	var sandboxResp SandboxResponse
	if err := json.Unmarshal(respBody, &sandboxResp); err != nil {
		return nil, fmt.Errorf("sandbox: failed to parse response: %w", err)
	}

	return &sandboxResp, nil
}
