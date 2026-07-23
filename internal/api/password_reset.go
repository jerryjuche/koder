package api

import (
	"bytes"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/jerryjuche/koder/internal/auth"
	"github.com/jerryjuche/koder/internal/config"
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

	// Send email with reset link (async)
	go h.sendResetEmail(req.Email, rawToken, user.Name)

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

// sendResetEmail sends the password reset email via Resend API.
func (h *PasswordResetHandler) sendResetEmail(email, rawToken, name string) {
	if h.cfg.ResendAPIKey == "" {
		slog.Warn("password_reset: no RESEND_API_KEY configured, skipping email")
		return
	}
	if h.cfg.FrontendURL == "" {
		slog.Warn("password_reset: no FRONTEND_URL configured, skipping email")
		return
	}

	resetLink := fmt.Sprintf("%s/reset-password?token=%s", strings.TrimRight(h.cfg.FrontendURL, "/"), rawToken)

	subject := "Koder — Reset Your Password"
	textBody := fmt.Sprintf(`Hi %s,

We received a request to reset your password for your Koder account.

Click the link below to reset your password (valid for 1 hour):
%s

If you didn't request this, you can safely ignore this email.

— The Koder Team`, name, resetLink)

	htmlBody := fmt.Sprintf(`<h2>Reset Your Koder Password</h2>
<p>Hi %s,</p>
<p>We received a request to reset your password for your Koder account.</p>
<p><a href="%s" style="display:inline-block;padding:12px 24px;background-color:#f59e0b;color:#000;text-decoration:none;border-radius:6px;font-weight:bold;">Reset Password</a></p>
<p style="margin-top:24px;">Or copy this link into your browser:</p>
<p style="word-break:break-all;color:#666;">%s</p>
<p style="margin-top:24px;color:#999;font-size:14px;">This link is valid for 1 hour. If you didn't request this, you can safely ignore this email.</p>
<p style="color:#999;font-size:14px;">— The Koder Team</p>`, name, resetLink, resetLink)

	payload := map[string]interface{}{
		"from":    h.cfg.EmailFrom,
		"to":      []string{email},
		"subject": subject,
		"text":    textBody,
		"html":    htmlBody,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		slog.Error("password_reset: failed to marshal email", "error", err)
		return
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewReader(body))
	if err != nil {
		slog.Error("password_reset: failed to create email request", "error", err)
		return
	}
	req.Header.Set("Authorization", "Bearer "+h.cfg.ResendAPIKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		slog.Error("password_reset: failed to send email", "error", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		slog.Error("password_reset: email API error", "status", resp.StatusCode)
	} else {
		slog.Info("password_reset: email sent", "email", maskEmail(email))
	}
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
