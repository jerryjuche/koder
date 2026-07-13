package api

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"regexp"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jerryjuche/koder/internal/auth"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
)

var validUsername = regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)

type AuthHandler struct {
	store  store.Store
	config *config.Config
}

func NewAuthHandler(store store.Store, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		store:  store,
		config: cfg,
	}
}

type registerRequest struct {
	Name         string  `json:"name"`
	Password     string  `json:"password"`
	Email        *string `json:"email,omitempty"`
	Pin          string  `json:"pin"`
}

type loginRequest struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

type googleAuthRequest struct {
	IDToken string `json:"id_token"`
}

type completeGoogleRequest struct {
	Username string `json:"username"`
}

type authResponse struct {
	Token        string `json:"token"`
	RefreshToken string `json:"refresh_token,omitempty"`
	Onboarding   bool   `json:"onboarding,omitempty"`
}

func uuidStringFromPGType(id pgtype.UUID) (string, error) {
	if !id.Valid {
		return "", fmt.Errorf("invalid UUID bytes")
	}
	return uuid.UUID(id.Bytes).String(), nil
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if req.Name == "" || req.Password == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "name and password are required", nil)
		return
	}

	if len(req.Name) > 100 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "name must be at most 100 characters", nil)
		return
	}

	if len(req.Password) < 8 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "password must be at least 8 characters", nil)
		return
	}
	if len(req.Password) > 128 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "password must be at most 128 characters", nil)
		return
	}

	if req.Pin == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "PIN is required", nil)
		return
	}
	if matched, _ := regexp.MatchString(`^\d{6}$`, req.Pin); !matched {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "PIN must be exactly 6 digits", nil)
		return
	}

	// Hash the PIN with bcrypt
	pinHash, err := auth.HashPassword(req.Pin)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "PIN_HASH_FAILED", "Unable to process PIN", nil)
		return
	}

	// Generate temporary username and student_id
	tempUsername := "u_" + uuid.New().String()[:8]

	newUser := &store.NewUser{
		StudentID: tempUsername,
		Username:  tempUsername,
		Name:      req.Name,
		Email:     req.Email,
		Password:  req.Password,
		PINHash:   pinHash,
		Role:      "student",
	}

	user, err := h.store.CreateUser(r.Context(), newUser)
	if err != nil {
		msg := "Unable to create user"
		if code, friendly, ok := store.IsFriendlyError(err); ok {
			RespondError(w, http.StatusConflict, code, friendly, nil)
			return
		}
		RespondError(w, http.StatusBadRequest, "USER_CREATION_FAILED", msg, nil)
		return
	}

	userID, err := uuidStringFromPGType(user.ID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "USER_ID_INVALID", "Unable to encode user ID", nil)
		return
	}

	// Issue access token + refresh token with onboarding flag
	resp, err := h.issueTokens(r.Context(), userID, user.StudentID, user.Username, user.Role, true, true, w, r)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate tokens", nil)
		return
	}
	RespondCreated(w, resp)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if req.Login == "" || req.Password == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "login and password are required", nil)
		return
	}

	user, err := h.store.GetUserByLogin(r.Context(), req.Login)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_FAILED", "Invalid credentials", nil)
		return
	}

	if !auth.ComparePassword(user.Password, req.Password) {
		RespondError(w, http.StatusUnauthorized, "AUTH_FAILED", "Invalid credentials", nil)
		return
	}

	userID, err := uuidStringFromPGType(user.ID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "USER_ID_INVALID", "Unable to encode user ID", nil)
		return
	}

	resp, err := h.issueTokens(r.Context(), userID, user.StudentID, user.Username, user.Role, !user.UsernameSet, true, w, r)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate tokens", nil)
		return
	}
	RespondSuccess(w, resp)
}

// GoogleAuth handles Google Sign-In.
// POST /auth/google
func (h *AuthHandler) GoogleAuth(w http.ResponseWriter, r *http.Request) {
	var req googleAuthRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if req.IDToken == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "id_token is required", nil)
		return
	}

	info, err := auth.VerifyGoogleToken(req.IDToken, h.config.GoogleClientID)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "GOOGLE_AUTH_FAILED", "Failed to verify Google token", nil)
		return
	}

	// Check if user already exists by Google ID
	user, err := h.store.GetUserByGoogleID(r.Context(), info.Sub)
	if err == nil && user != nil {
		// Existing Google user — sync avatar
		if info.Picture != "" && (user.GoogleAvatarURL == nil || *user.GoogleAvatarURL != info.Picture) {
			if idStr, err := uuidStringFromPGType(user.ID); err == nil {
				if userUUID, err := uuid.Parse(idStr); err == nil {
					if err := h.store.UpdateUserGoogleAvatar(r.Context(), userUUID, info.Picture); err != nil {
						slog.Error("google_auth: failed to sync avatar", "error", err)
					}
					InvalidateUserCache(idStr)
				}
			}
		}

		userID, err := uuidStringFromPGType(user.ID)
		if err != nil {
			slog.Error("google_auth: invalid user ID for existing Google user", "error", err)
			RespondError(w, http.StatusInternalServerError, "USER_ID_ERROR", "Invalid user ID", nil)
			return
		}
		resp, err := h.issueTokens(r.Context(), userID, user.StudentID, user.Username, user.Role, !user.UsernameSet, true, w, r)
		if err != nil {
			RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate tokens", nil)
			return
		}
		RespondSuccess(w, resp)
		return
	}

	// Check if email already used by an existing email/password account
	existingUser, emailErr := h.store.GetUserByEmail(r.Context(), info.Email)
	if emailErr == nil && existingUser != nil {
		// Link Google to existing account
		if existingID, err := uuidStringFromPGType(existingUser.ID); err == nil {
			if existingUUID, err := uuid.Parse(existingID); err == nil {
				if err := h.store.LinkGoogleToUser(r.Context(), existingUUID, info); err != nil {
					slog.Error("google_auth: failed to auto-link Google to existing user", "error", err, "email", info.Email)
				} else {
					InvalidateUserCache(existingID)
				}
			}
		}

		userID, err := uuidStringFromPGType(existingUser.ID)
		if err != nil {
			slog.Error("google_auth: invalid user ID for email-linked user", "error", err)
			RespondError(w, http.StatusInternalServerError, "USER_ID_ERROR", "Invalid user ID", nil)
			return
		}
		resp, err := h.issueTokens(r.Context(), userID, existingUser.StudentID, existingUser.Username, existingUser.Role, !existingUser.UsernameSet, true, w, r)
		if err != nil {
			RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate tokens", nil)
			return
		}
		RespondSuccess(w, resp)
		return
	}

	// No existing user found — auto-create a new account from Google info
	user, err = h.store.CreateUserFromGoogle(r.Context(), info)
	if err != nil {
		if code, friendly, ok := store.IsFriendlyError(err); ok {
			RespondError(w, http.StatusConflict, code, friendly, nil)
			return
		}
		slog.Error("google_auth: failed to create user from Google", "error", err)
		RespondError(w, http.StatusInternalServerError, "USER_CREATION_FAILED", "Unable to create account from Google profile", nil)
		return
	}

	userID, err := uuidStringFromPGType(user.ID)
	if err != nil {
		slog.Error("google_auth: invalid user ID for new Google user", "error", err)
		RespondError(w, http.StatusInternalServerError, "USER_ID_ERROR", "Invalid user ID", nil)
		return
	}
	resp, err := h.issueTokens(r.Context(), userID, user.StudentID, user.Username, user.Role, !user.UsernameSet, true, w, r)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate tokens", nil)
		return
	}
	RespondCreated(w, resp)
}

// CompleteOnboarding completes the onboarding flow by setting a username and student_id.
// POST /auth/complete-google (legacy) / POST /auth/complete-onboarding
func (h *AuthHandler) CompleteOnboarding(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	var req completeGoogleRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if req.Username == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "username is required", nil)
		return
	}

	if len(req.Username) < 3 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "username must be at least 3 characters", nil)
		return
	}
	if len(req.Username) > 30 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "username must be at most 30 characters", nil)
		return
	}
	if !validUsername.MatchString(req.Username) {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "username can only contain letters, numbers, underscores, and hyphens", nil)
		return
	}

	userUUID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER_ID", "Invalid user ID in token", nil)
		return
	}

	// Check username uniqueness
	existingUser, err := h.store.GetUserByUsername(r.Context(), req.Username)
	if err == nil && existingUser != nil {
		existingID, _ := uuidStringFromPGType(existingUser.ID)
		if existingID == claims.UserID {
			// Same user, just re-submitting their current username — allow it
		} else {
			RespondError(w, http.StatusConflict, "USERNAME_TAKEN", "Username is already taken", nil)
			return
		}
	}

	// Atomically set username, student_id, and username_set
	if err := h.store.CompleteUserOnboarding(r.Context(), userUUID, req.Username); err != nil {
		if code, friendly, ok := store.IsFriendlyError(err); ok {
			RespondError(w, http.StatusConflict, code, friendly, nil)
			return
		}
		RespondError(w, http.StatusInternalServerError, "UPDATE_FAILED", "Unable to set username", nil)
		return
	}

	InvalidateUserCache(claims.UserID)

	// Fetch updated user to get fresh data
	updatedUser, err := h.store.GetUserByID(r.Context(), userUUID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "USER_NOT_FOUND", "User not found after update", nil)
		return
	}

	userID, _ := uuidStringFromPGType(updatedUser.ID)
	resp, err := h.issueTokens(r.Context(), userID, updatedUser.StudentID, updatedUser.Username, updatedUser.Role, !updatedUser.UsernameSet, true, w, r)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate tokens", nil)
		return
	}
	RespondSuccess(w, resp)
}

// LinkGoogle links a Google account to the currently authenticated user.
// POST /auth/link-google
func (h *AuthHandler) LinkGoogle(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	var req googleAuthRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if req.IDToken == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "id_token is required", nil)
		return
	}

	info, err := auth.VerifyGoogleToken(req.IDToken, h.config.GoogleClientID)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "GOOGLE_AUTH_FAILED", "Failed to verify Google token", nil)
		return
	}

	// Check if Google ID already linked to another user
	existingGoogleUser, err := h.store.GetUserByGoogleID(r.Context(), info.Sub)
	if err == nil && existingGoogleUser != nil {
		existingID, _ := uuidStringFromPGType(existingGoogleUser.ID)
		if existingID != claims.UserID {
			RespondError(w, http.StatusConflict, "GOOGLE_ALREADY_LINKED", "This Google account is already linked to another user", nil)
			return
		}
		// Already linked to this user — just update avatar
		userUUID := uuid.MustParse(claims.UserID)
		if info.Picture != "" {
			_ = h.store.UpdateUserGoogleAvatar(r.Context(), userUUID, info.Picture)
		}
		RespondSuccess(w, authResponse{Token: ""})
		return
	}

	// Check if Google email already used by another user
	existingEmailUser, err := h.store.GetUserByEmail(r.Context(), info.Email)
	if err == nil && existingEmailUser != nil {
		existingID, _ := uuidStringFromPGType(existingEmailUser.ID)
		if existingID != claims.UserID {
			RespondError(w, http.StatusConflict, "EMAIL_ALREADY_USED", "This Google email is already associated with another account", nil)
			return
		}
	}

	// Link Google to the authenticated user
	userUUID := uuid.MustParse(claims.UserID)
	if err := h.store.LinkGoogleToUser(r.Context(), userUUID, info); err != nil {
		RespondError(w, http.StatusInternalServerError, "LINK_FAILED", "Failed to link Google account", nil)
		return
	}

	InvalidateUserCache(claims.UserID)

	// Fetch updated user for fresh JWT
	updatedUser, err := h.store.GetUserByID(r.Context(), userUUID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "USER_NOT_FOUND", "User not found after linking", nil)
		return
	}

	userID, _ := uuidStringFromPGType(updatedUser.ID)
	resp, err := h.issueTokens(r.Context(), userID, updatedUser.StudentID, updatedUser.Username, updatedUser.Role, !updatedUser.UsernameSet, true, w, r)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate tokens", nil)
		return
	}
	RespondSuccess(w, resp)
}

// GET /auth/check-username?username=xxx
func (h *AuthHandler) CheckUsername(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "username query parameter is required", nil)
		return
	}

	available, err := h.store.CheckUsernameAvailable(r.Context(), username)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "failed to check username", nil)
		return
	}

	RespondSuccess(w, map[string]interface{}{
		"username":  username,
		"available": available,
	})
}

// issueTokens creates a short-lived access token + cryptographically random refresh token,
// persists the refresh token (SHA-256 hashed), and returns the auth response.
func (h *AuthHandler) issueTokens(ctx context.Context, userID, studentID, username, role string, onboarding bool, setCookie bool, w http.ResponseWriter, r *http.Request) (authResponse, error) {
	accessToken, err := auth.SignToken(userID, studentID, username, role, h.config.JWTSecret, h.config.AccessTokenExpiry(), onboarding)
	if err != nil {
		return authResponse{}, fmt.Errorf("failed to sign access token: %w", err)
	}

	rawRefresh, refreshHash, err := auth.GenerateRefreshToken()
	if err != nil {
		return authResponse{}, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return authResponse{}, fmt.Errorf("failed to parse user ID: %w", err)
	}

	if err := h.store.CreateRefreshToken(ctx, userUUID, refreshHash, time.Now().Add(h.config.RefreshTokenExpiry())); err != nil {
		return authResponse{}, fmt.Errorf("failed to store refresh token: %w", err)
	}

	if setCookie {
		SetAuthCookie(w, r, accessToken, h.config)
	}

	return authResponse{
		Token:        accessToken,
		RefreshToken: rawRefresh,
		Onboarding:   onboarding,
	}, nil
}

// refreshRequest is the payload for POST /auth/refresh.
type refreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// RefreshToken issues a new access token and refresh token (rotation) given a valid refresh token.
// POST /auth/refresh
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req refreshRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if req.RefreshToken == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "refresh_token is required", nil)
		return
	}

	// Hash the incoming token to look it up
	hash := auth.SHA256Hash(req.RefreshToken)

	stored, err := h.store.GetRefreshToken(r.Context(), hash)
	if err != nil {
		slog.Error("auth: refresh token lookup failed", "error", err)
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to verify refresh token", nil)
		return
	}
	if stored == nil {
		RespondError(w, http.StatusUnauthorized, "INVALID_REFRESH_TOKEN", "Refresh token not found", nil)
		return
	}

	// Check revoked
	if stored.Revoked {
		// Token reuse detected — revoke all tokens for this user (rotation compromise)
		userUUID := uuid.UUID(stored.UserID.Bytes)
		_ = h.store.RevokeAllUserRefreshTokens(r.Context(), userUUID)
		RespondError(w, http.StatusUnauthorized, "REFRESH_TOKEN_REVOKED", "Refresh token has been revoked. All sessions invalidated.", nil)
		return
	}

	if time.Now().After(stored.ExpiresAt) {
		RespondError(w, http.StatusUnauthorized, "REFRESH_TOKEN_EXPIRED", "Refresh token has expired. Please log in again.", nil)
		return
	}

	// Revoke the old refresh token (rotation)
	tokenUUID := uuid.UUID(stored.ID.Bytes)
	if err := h.store.RevokeRefreshToken(r.Context(), tokenUUID); err != nil {
		slog.Error("auth: failed to revoke old refresh token", "error", err)
	}

	// Issue new tokens
	userUUID := uuid.UUID(stored.UserID.Bytes)
	user, err := h.store.GetUserByID(r.Context(), userUUID)
	if err != nil {
		slog.Error("auth: failed to fetch user for refresh", "user_id", userUUID, "error", err)
		RespondError(w, http.StatusInternalServerError, "USER_LOOKUP_FAILED", "Failed to refresh token", nil)
		return
	}

	userID, err := uuidStringFromPGType(user.ID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "USER_ID_INVALID", "Unable to encode user ID", nil)
		return
	}

	resp, err := h.issueTokens(r.Context(), userID, user.StudentID, user.Username, user.Role, false, true, w, r)
	if err != nil {
		slog.Error("auth: failed to issue new tokens on refresh", "error", err)
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Failed to issue new tokens", nil)
		return
	}

	RespondSuccess(w, resp)
}

// Logout revokes the current JWT token by adding it to the blacklist.
// POST /auth/logout
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	if claims.ID == "" {
		// Token without jti — can't blacklist, just acknowledge logout
		RespondSuccess(w, map[string]string{"message": "Logged out"})
		return
	}

	expiresAt := time.Time{}
	if claims.ExpiresAt != nil {
		expiresAt = claims.ExpiresAt.Time
	}

	if err := h.store.BlacklistToken(r.Context(), claims.ID, expiresAt); err != nil {
		slog.Error("auth: failed to blacklist token", "error", err)
	}

	// Revoke all refresh tokens for this user
	if userUUID, err := uuid.Parse(claims.UserID); err == nil {
		if err := h.store.RevokeAllUserRefreshTokens(r.Context(), userUUID); err != nil {
			slog.Error("auth: failed to revoke refresh tokens on logout", "user_id", claims.UserID, "error", err)
		}
	}

	ClearAuthCookie(w, r)
	slog.Info("auth: token revoked", "user_id", claims.UserID)
	RespondSuccess(w, map[string]string{"message": "Logged out"})
}
