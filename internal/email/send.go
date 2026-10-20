package email

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// BuildResendPayload assembles the Resend /emails request body. Every
// transactional email carries the inline logo attachment that the templates
// reference as src="cid:koder-logo"; without it the header image would not
// render.
func BuildResendPayload(from string, to []string, subject, htmlBody, textBody string) map[string]interface{} {
	return map[string]interface{}{
		"from":        from,
		"to":          to,
		"subject":     subject,
		"text":        textBody,
		"html":        htmlBody,
		"attachments": EmailAttachments(),
	}
}

// SendEmailViaResend sends an email via the Resend API. It retries on
// transient network or 5xx errors with exponential backoff. Returns the
// provider email ID when successful, or an error.
func SendEmailViaResend(ctx context.Context, client *http.Client, apiKey, from string, to []string, subject, htmlBody, textBody string) (string, int, []byte, error) {
	if client == nil {
		client = &http.Client{Timeout: 15 * time.Second}
	}

	payload := BuildResendPayload(from, to, subject, htmlBody, textBody)
	body, err := json.Marshal(payload)
	if err != nil {
		return "", 0, nil, fmt.Errorf("marshal payload: %w", err)
	}

	var lastRespBody []byte
	var lastStatus int
	var lastErr error

	// Up to 3 attempts: immediate, +250ms, +500ms
	backoffs := []time.Duration{0, 250 * time.Millisecond, 500 * time.Millisecond}
	for i, wait := range backoffs {
		if i > 0 {
			select {
			case <-ctx.Done():
				return "", 0, nil, ctx.Err()
			case <-time.After(wait):
			}
		}

		req, _ := http.NewRequestWithContext(ctx, "POST", "https://api.resend.com/emails", bytes.NewReader(body))
		req.Header.Set("Authorization", "Bearer "+apiKey)
		req.Header.Set("Content-Type", "application/json")

		resp, err := client.Do(req)
		if err != nil {
			lastErr = err
			continue
		}
		respBody, _ := io.ReadAll(io.LimitReader(resp.Body, 128*1024))
		resp.Body.Close()
		lastRespBody = respBody
		lastStatus = resp.StatusCode

		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			// try to parse provider id
			var ok struct {
				ID string `json:"id"`
			}
			_ = json.Unmarshal(respBody, &ok)
			return ok.ID, resp.StatusCode, respBody, nil
		}

		// treat 4xx as terminal (don't retry)
		if resp.StatusCode >= 400 && resp.StatusCode < 500 {
			return "", resp.StatusCode, respBody, fmt.Errorf("resend api error status %d", resp.StatusCode)
		}

		// otherwise 5xx -> retry
		lastErr = fmt.Errorf("resend api status %d", resp.StatusCode)
	}

	if lastErr != nil {
		return "", lastStatus, lastRespBody, fmt.Errorf("send attempts failed: %w", lastErr)
	}
	return "", lastStatus, lastRespBody, fmt.Errorf("send failed")
}
