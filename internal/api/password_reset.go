package api

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/auth"
	"github.com/jerryjuche/koder/internal/config"
	emailtmpl "github.com/jerryjuche/koder/internal/email"
	"github.com/jerryjuche/koder/internal/store"
)

type PasswordResetHandler struct {
	store store.Store
	cfg   *config.Config
}

func NewPasswordResetHandler(store store.Store, cfg *config.Config) *PasswordResetHandler {
	return &PasswordResetHandler{store: store, cfg: cfg}
}

type forgotPasswordRequest struct {
	Email string `json:"email"`
}

type resetPasswordRequest struct {
	Token    string `json:"token"`
	Password string `json:"password"`
}

// ForgotPassword generates a reset token and emails the user.
// POST /auth/forgot-password
func (h *PasswordResetHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req forgotPasswordRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if req.Email == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Email is required", nil)
		return
	}

	// Always return success to prevent email enumeration
	respondSuccess := func() {
		RespondSuccess(w, map[string]string{"message": "If an account with that email exists, a reset link has been sent"})
	}

	// Check if user exists
	user, err := h.store.GetUserByEmail(r.Context(), req.Email)
	if err != nil {
		slog.Info("password_reset: email not found", "email", maskEmail(req.Email))
		respondSuccess()
		return
	}

	// Generate random token (32 bytes → 64 hex chars)
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		slog.Error("password_reset: failed to generate token", "error", err)
		RespondError(w, http.StatusInternalServerError, "GENERATION_FAILED", "Failed to generate reset token", nil)
		return
	}
	rawToken := hex.EncodeToString(tokenBytes)

	// Store SHA-256 hash
	tokenHashBytes := sha256.Sum256([]byte(rawToken))
	tokenHash := hex.EncodeToString(tokenHashBytes[:])

	expiresAt := time.Now().Add(1 * time.Hour)
	if err := h.store.CreatePasswordResetToken(r.Context(), req.Email, tokenHash, expiresAt); err != nil {
		slog.Error("password_reset: failed to store token", "error", err)
		RespondError(w, http.StatusInternalServerError, "STORE_FAILED", "Failed to create reset token", nil)
		return
	}

	// Record the email lifecycle so delivery can be traced end-to-end
	resetID := uuid.New()
	emailLog, err := h.store.CreateEmailLog(r.Context(), &resetID, req.Email, "forgot_password")
	if err != nil {
		slog.Error("password_reset: failed to create email log", "error", err, "email", maskEmail(req.Email))
	}

	// Send email with reset link (async)
	logID := uuid.Nil
	if emailLog != nil {
		logID = emailLog.ID.Bytes
	}
	go h.sendResetEmail(req.Email, rawToken, user.Name, logID)

	slog.Info("password_reset: token created", "email", maskEmail(req.Email))
	respondSuccess()
}

// ResetPassword validates a reset token and updates the user's password.
// POST /auth/reset-password
func (h *PasswordResetHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req resetPasswordRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if req.Token == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Token is required", nil)
		return
	}
	if req.Password == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Password is required", nil)
		return
	}
	if len(req.Password) < 8 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Password must be at least 8 characters", nil)
		return
	}
	if len(req.Password) > 128 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Password must be at most 128 characters", nil)
		return
	}

	// Hash the token to look up
	tokenHashBytes := sha256.Sum256([]byte(req.Token))
	tokenHash := hex.EncodeToString(tokenHashBytes[:])

	email, expiresAt, used, err := h.store.GetPasswordResetToken(r.Context(), tokenHash)
	if err != nil {
		slog.Info("password_reset: invalid token attempt")
		RespondError(w, http.StatusBadRequest, "INVALID_TOKEN", "Invalid or expired reset token", nil)
		return
	}

	if used {
		RespondError(w, http.StatusBadRequest, "TOKEN_USED", "This reset token has already been used", nil)
		return
	}

	if time.Now().After(expiresAt) {
		RespondError(w, http.StatusBadRequest, "TOKEN_EXPIRED", "This reset token has expired", nil)
		return
	}

	// Find user by email
	user, err := h.store.GetUserByEmail(r.Context(), email)
	if err != nil {
		slog.Error("password_reset: user not found for email", "email", maskEmail(email))
		RespondError(w, http.StatusInternalServerError, "USER_NOT_FOUND", "Unable to reset password", nil)
		return
	}

	// Hash new password
	passwordHash, err := auth.HashPassword(req.Password)
	if err != nil {
		slog.Error("password_reset: failed to hash password", "error", err)
		RespondError(w, http.StatusInternalServerError, "HASH_FAILED", "Unable to process password", nil)
		return
	}

	// Update password and mark token as used (in transaction)
	if err := h.store.UpdateUserPassword(r.Context(), user.ID.Bytes, passwordHash); err != nil {
		slog.Error("password_reset: failed to update password", "error", err)
		RespondError(w, http.StatusInternalServerError, "UPDATE_FAILED", "Unable to update password", nil)
		return
	}

	if err := h.store.MarkPasswordResetTokenUsed(r.Context(), tokenHash); err != nil {
		slog.Error("password_reset: failed to mark token used", "error", err)
	}

	slog.Info("password_reset: password updated", "email", maskEmail(email))
	RespondSuccess(w, map[string]string{"message": "Password has been reset successfully"})
}

// ListEmailLogs returns the email delivery log for admin diagnostics.
// GET /admin/email-logs?limit=&offset=&status=&email=
func (h *PasswordResetHandler) ListEmailLogs(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	status := r.URL.Query().Get("status")
	email := r.URL.Query().Get("email")

	logs, err := h.store.ListEmailLogs(r.Context(), limit, offset, status, email)
	if err != nil {
		slog.Error("email_logs: failed to list", "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to list email logs", nil)
		return
	}
	if logs == nil {
		logs = []store.EmailLog{}
	}
	RespondSuccess(w, logs)
}

// resendEmailResponse is the subset of the Resend POST /emails response we need.
type resendEmailResponse struct {
	ID string `json:"id"`
}

// resendErrorResponse is the error body returned by Resend on non-2xx.
type resendErrorResponse struct {
	Message string `json:"message"`
	Name    string `json:"name"`
}

// emailSendError carries both the message and whether a retry is worthwhile
// (network failures and 5xx are retryable; 4xx validation errors are not).
type emailSendError struct {
	message   string
	retryable bool
}

func (e *emailSendError) Error() string { return e.message }

// emailAddressFromFrom strips the display name from a Resend "Name <addr>"
// from-address so the bare address can be used in a mailto: footer link.
func emailAddressFromFrom(from string) string {
	start := strings.LastIndex(from, "<")
	if start >= 0 && strings.HasSuffix(from, ">") {
		return from[start+1 : len(from)-1]
	}
	return from
}

// sendResetEmail sends the password reset email via Resend API with one retry
// on transient failures. It runs in a goroutine and must never panic.
func (h *PasswordResetHandler) sendResetEmail(email, rawToken, name string, logID uuid.UUID) {
	defer func() {
		if rec := recover(); rec != nil {
			slog.Error("password_reset: panic in sendResetEmail", "error", rec, "email", maskEmail(email))
			if logID != uuid.Nil {
				msg := fmt.Sprintf("panic in send goroutine: %v", rec)
				h.markEmailFailed(logID, &msg)
			}
		}
	}()

	if h.cfg.ResendAPIKey == "" {
		slog.Warn("password_reset: no RESEND_API_KEY configured, skipping email", "email", maskEmail(email))
		msg := "RESEND_API_KEY not configured"
		if logID != uuid.Nil {
			h.markEmailFailed(logID, &msg)
		}
		return
	}
	if h.cfg.FrontendURL == "" {
		slog.Warn("password_reset: no FRONTEND_URL configured, skipping email", "email", maskEmail(email))
		msg := "FRONTEND_URL not configured"
		if logID != uuid.Nil {
			h.markEmailFailed(logID, &msg)
		}
		return
	}

	var lastErr error
	for attempt := 1; attempt <= 2; attempt++ {
		if logID != uuid.Nil {
			h.store.UpdateEmailLogAttempts(h.emailLogContext(), logID, attempt)
		}

		providerID, err := h.sendEmailOnce(email, rawToken, name)
		if err == nil {
			if logID != uuid.Nil {
				h.markEmailSent(logID, providerID)
			}
			slog.Info("password_reset: email sent", "email", maskEmail(email), "provider_email_id", providerID)
			return
		}
		lastErr = err
		slog.Error("password_reset: email attempt failed",
			"attempt", attempt, "email", maskEmail(email), "error", err)

		// Only retry transient failures (network error / 5xx)
		var sendErr *emailSendError
		if attempt == 1 && errors.As(err, &sendErr) && sendErr.retryable {
			time.Sleep(1 * time.Second)
			continue
		}
		break
	}

	if logID != uuid.Nil && lastErr != nil {
		msg := lastErr.Error()
		h.markEmailFailed(logID, &msg)
	}
	slog.Error("password_reset: email failed to send", "email", maskEmail(email), "error", lastErr)
}

// sendEmailOnce performs a single POST to the Resend API and returns the
// provider email id on success.
func (h *PasswordResetHandler) sendEmailOnce(email, rawToken, name string) (string, error) {
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", strings.TrimRight(h.cfg.FrontendURL, "/"), rawToken)

	subject := "Koder — Reset Your Password"
	textBody := fmt.Sprintf(`Hi %s,

We received a request to reset your password for your Koder account.

Click the link below to reset your password (valid for 1 hour):
%s

If you didn't request this, you can safely ignore this email.

— The Koder Team`, name, resetLink)

	htmlBody, err := emailtmpl.RenderPasswordResetString(emailtmpl.PasswordResetData{
		PlatformName: "Koder",
		FirstName:    name,
		ResetURL:     resetLink,
		LogoURL:      strings.TrimRight(h.cfg.FrontendURL, "/") + "/logo.png",
		SupportEmail: emailAddressFromFrom(h.cfg.EmailFrom),
		Tagline:      "Koder turns every problem into an instant feedback loop.",
		ExpiresIn:    "1 hour",
	})
	if err != nil {
		return "", &emailSendError{message: fmt.Sprintf("failed to render email template: %v", err)}
	}

	payload := map[string]interface{}{
		"from":    h.cfg.EmailFrom,
		"to":      []string{email},
		"subject": subject,
		"text":    textBody,
		"html":    htmlBody,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", &emailSendError{message: fmt.Sprintf("failed to marshal email: %v", err)}
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewReader(body))
	if err != nil {
		return "", &emailSendError{message: fmt.Sprintf("failed to create email request: %v", err)}
	}
	req.Header.Set("Authorization", "Bearer "+h.cfg.ResendAPIKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		// Network-level failure — always retryable
		return "", &emailSendError{message: fmt.Sprintf("failed to send email: %v", err), retryable: true}
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(io.LimitReader(resp.Body, 64*1024))
	if err != nil {
		return "", &emailSendError{message: fmt.Sprintf("failed to read email response: %v", err), retryable: true}
	}

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		var ok resendEmailResponse
		if err := json.Unmarshal(respBody, &ok); err != nil {
			slog.Warn("password_reset: email sent but response unparseable", "status", resp.StatusCode, "body", string(respBody))
			return "", nil
		}
		return ok.ID, nil
	}

	// Non-2xx — parse the error body for a useful message
	var errBody resendErrorResponse
	msg := fmt.Sprintf("Resend API error (status %d)", resp.StatusCode)
	if err := json.Unmarshal(respBody, &errBody); err == nil && errBody.Message != "" {
		msg = fmt.Sprintf("Resend API error: %s", errBody.Message)
	}

	// 4xx errors (invalid recipient, domain not verified, auth) will not
	// succeed on retry; 5xx and HTTP 429 are transient.
	retryable := resp.StatusCode >= 500 || resp.StatusCode == http.StatusTooManyRequests
	return "", &emailSendError{message: msg, retryable: retryable}
}

// markEmailSent records a successful send on the email log.
func (h *PasswordResetHandler) markEmailSent(logID uuid.UUID, providerID string) {
	var provider *string
	if providerID != "" {
		provider = &providerID
	}
	if err := h.store.UpdateEmailLogStatus(h.emailLogContext(), logID, "sent", provider, nil); err != nil {
		slog.Error("password_reset: failed to mark email log sent", "error", err, "log_id", logID)
	}
}

// markEmailFailed records a failed send on the email log.
func (h *PasswordResetHandler) markEmailFailed(logID uuid.UUID, message *string) {
	if err := h.store.UpdateEmailLogStatus(h.emailLogContext(), logID, "failed", nil, message); err != nil {
		slog.Error("password_reset: failed to mark email log failed", "error", err, "log_id", logID)
	}
}

// emailLogContext returns a context for background email-log writes that
// outlive the request context (send goroutine).
func (h *PasswordResetHandler) emailLogContext() context.Context {
	return context.Background()
}

func maskEmail(email string) string {
	parts := strings.SplitN(email, "@", 2)
	if len(parts) != 2 {
		return "***"
	}
	name := parts[0]
	if len(name) <= 2 {
		return name[:1] + "***@" + parts[1]
	}
	return name[:1] + "***" + name[len(name)-1:] + "@" + parts[1]
}
