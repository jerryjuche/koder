package api

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"regexp"
	"strings"
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
	Name     string  `json:"name"`
	Password string  `json:"password"`
	Email    *string `json:"email,omitempty"`
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
	Token      string `json:"token"`
	Onboarding bool   `json:"onboarding,omitempty"`
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

	// Generate temporary username and student_id
	tempUsername := "u_" + uuid.New().String()[:8]

	newUser := &store.NewUser{
		StudentID: tempUsername,
		Username:  tempUsername,
		Name:      req.Name,
		Email:     req.Email,
		Password:  req.Password,
		Role:      "student",
	}

	user, err := h.store.CreateUser(r.Context(), newUser)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "USER_CREATION_FAILED", "Unable to create user", nil)
		return
	}

	userID, err := uuidStringFromPGType(user.ID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "USER_ID_INVALID", "Unable to encode user ID", nil)
		return
	}

	// Issue JWT with onboarding flag — user must set their username
	token, err := auth.SignToken(userID, user.StudentID, user.Username, user.Role, h.config.JWTSecret, h.config.JWTExpiry(), true)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate JWT", nil)
		return
	}

	SetAuthCookie(w, token, h.config)
	RespondCreated(w, authResponse{Token: token, Onboarding: true})
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

	needsOnboarding := strings.HasPrefix(user.Username, "u_") || strings.HasPrefix(user.Username, "g_")
	token, err := auth.SignToken(userID, user.StudentID, user.Username, user.Role, h.config.JWTSecret, h.config.JWTExpiry(), needsOnboarding)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate JWT", nil)
		return
	}

	SetAuthCookie(w, token, h.config)
	RespondSuccess(w, authResponse{Token: token, Onboarding: needsOnboarding})
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
			idStr, _ := uuidStringFromPGType(user.ID)
			if idStr != "" {
				userUUID, _ := uuid.Parse(idStr)
				_ = h.store.UpdateUserGoogleAvatar(r.Context(), userUUID, info.Picture)
				InvalidateUserCache(idStr)
			}
		}

		userID, _ := uuidStringFromPGType(user.ID)
		needsOnboarding := strings.HasPrefix(user.Username, "u_") || strings.HasPrefix(user.Username, "g_")
		token, err := auth.SignToken(userID, user.StudentID, user.Username, user.Role, h.config.JWTSecret, h.config.JWTExpiry(), needsOnboarding)
		if err != nil {
			RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate JWT", nil)
			return
		}

		SetAuthCookie(w, token, h.config)
		RespondSuccess(w, authResponse{Token: token, Onboarding: needsOnboarding})
		return
	}

	// Check if email already used by an existing email/password account
	existingUser, emailErr := h.store.GetUserByEmail(r.Context(), info.Email)
	if emailErr == nil && existingUser != nil {
		// Link Google to existing account
		existingID, _ := uuidStringFromPGType(existingUser.ID)
		if existingID != "" {
			existingUUID, _ := uuid.Parse(existingID)
			if err := h.store.LinkGoogleToUser(r.Context(), existingUUID, info); err == nil {
				InvalidateUserCache(existingID)
			}
		}

		userID, _ := uuidStringFromPGType(existingUser.ID)
		needsOnboarding := strings.HasPrefix(existingUser.Username, "u_") || strings.HasPrefix(existingUser.Username, "g_")
		token, err := auth.SignToken(userID, existingUser.StudentID, existingUser.Username, existingUser.Role, h.config.JWTSecret, h.config.JWTExpiry(), needsOnboarding)
		if err != nil {
			RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate JWT", nil)
			return
		}

		SetAuthCookie(w, token, h.config)
		RespondSuccess(w, authResponse{Token: token, Onboarding: needsOnboarding})
		return
	}

	// No existing user found — return an error instead of auto-creating a duplicate.
	// The user should sign in with their existing password-based account first
	// and link Google from their settings.
	RespondError(w, http.StatusNotFound, "GOOGLE_NOT_LINKED",
		"No account is linked to this Google profile. Please sign in with your password and link your Google account in Settings.",
		nil)
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

	// Update both username and student_id to the chosen value
	if err := h.store.UpdateUserUsername(r.Context(), userUUID, req.Username); err != nil {
		RespondError(w, http.StatusInternalServerError, "UPDATE_FAILED", "Unable to set username", nil)
		return
	}
	if err := h.store.UpdateUserStudentID(r.Context(), userUUID, req.Username); err != nil {
		RespondError(w, http.StatusInternalServerError, "UPDATE_FAILED", "Unable to set student ID", nil)
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
	token, err := auth.SignToken(userID, updatedUser.StudentID, updatedUser.Username, updatedUser.Role, h.config.JWTSecret, h.config.JWTExpiry(), false)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate JWT", nil)
		return
	}

	SetAuthCookie(w, token, h.config)
	RespondSuccess(w, authResponse{Token: token})
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
	token, err := auth.SignToken(userID, updatedUser.StudentID, updatedUser.Username, updatedUser.Role, h.config.JWTSecret, h.config.JWTExpiry(), false)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate JWT", nil)
		return
	}

	SetAuthCookie(w, token, h.config)
	RespondSuccess(w, authResponse{Token: token})
}

// CheckUsername checks if a username is available.
// Always returns available: true to prevent username enumeration.
// Actual uniqueness validation happens on submission during onboarding.
// GET /auth/check-username?username=xxx
func (h *AuthHandler) CheckUsername(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "username query parameter is required", nil)
		return
	}

	RespondSuccess(w, map[string]interface{}{
		"username":  username,
		"available": true,
	})
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
		RespondError(w, http.StatusInternalServerError, "LOGOUT_FAILED", "Failed to complete logout", nil)
		return
	}

	ClearAuthCookie(w)
	slog.Info("auth: token revoked", "user_id", claims.UserID)
	RespondSuccess(w, map[string]string{"message": "Logged out"})
}
