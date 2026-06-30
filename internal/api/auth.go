package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jerryjuche/koder/internal/auth"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
)

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
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", err.Error())
		return
	}

	if req.Name == "" || req.Password == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "name and password are required", nil)
		return
	}

	// Generate temporary username and student_id
	tempUsername := "u_" + uuid.New().String()[:8]

	role := "student"
	if h.config.AdminEmail != "" && req.Email != nil && *req.Email == h.config.AdminEmail && req.Password == h.config.AdminPassword {
		role = "admin"
	}

	newUser := &store.NewUser{
		StudentID: tempUsername,
		Username:  tempUsername,
		Name:      req.Name,
		Email:     req.Email,
		Password:  req.Password,
		Role:      role,
	}

	user, err := h.store.CreateUser(r.Context(), newUser)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "USER_CREATION_FAILED", "Unable to create user", err.Error())
		return
	}

	userID, err := uuidStringFromPGType(user.ID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "USER_ID_INVALID", "Unable to encode user ID", err.Error())
		return
	}

	// Issue JWT with onboarding flag — user must set their username
	token, err := auth.SignToken(userID, user.StudentID, user.Username, user.Role, h.config.JWTSecret, h.config.JWTExpiry(), true)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate JWT", err.Error())
		return
	}

	RespondCreated(w, authResponse{Token: token, Onboarding: true})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", err.Error())
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
		RespondError(w, http.StatusInternalServerError, "USER_ID_INVALID", "Unable to encode user ID", err.Error())
		return
	}

	// Dynamic admin upgrade if environment variables changed after user creation
	if user.Role != "admin" && h.config.AdminEmail != "" && (req.Login == h.config.AdminEmail || req.Login == user.Username) && req.Password == h.config.AdminPassword {
		uID, _ := uuid.Parse(userID)
		if err := h.store.UpdateUserRole(r.Context(), uID, "admin"); err == nil {
			user.Role = "admin"
		}
	}

	token, err := auth.SignToken(userID, user.StudentID, user.Username, user.Role, h.config.JWTSecret, h.config.JWTExpiry(), false)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate JWT", err.Error())
		return
	}

	RespondSuccess(w, authResponse{Token: token})
}

// GoogleAuth handles Google Sign-In.
// POST /auth/google
func (h *AuthHandler) GoogleAuth(w http.ResponseWriter, r *http.Request) {
	var req googleAuthRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", err.Error())
		return
	}

	if req.IDToken == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "id_token is required", nil)
		return
	}

	info, err := auth.VerifyGoogleToken(req.IDToken, h.config.GoogleClientID)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "GOOGLE_AUTH_FAILED", "Failed to verify Google token", err.Error())
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
		token, err := auth.SignToken(userID, user.StudentID, user.Username, user.Role, h.config.JWTSecret, h.config.JWTExpiry(), false)
		if err != nil {
			RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate JWT", err.Error())
			return
		}

		RespondSuccess(w, authResponse{Token: token})
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
		token, err := auth.SignToken(userID, existingUser.StudentID, existingUser.Username, existingUser.Role, h.config.JWTSecret, h.config.JWTExpiry(), false)
		if err != nil {
			RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate JWT", err.Error())
			return
		}

		RespondSuccess(w, authResponse{Token: token})
		return
	}

	// New user — create with temporary username
	newUser, err := h.store.CreateUserFromGoogle(r.Context(), info)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "USER_CREATION_FAILED", "Unable to create user from Google", err.Error())
		return
	}

	userID, err := uuidStringFromPGType(newUser.ID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "USER_ID_INVALID", "Unable to encode user ID", err.Error())
		return
	}

	// Issue token with onboarding flag
	token, err := auth.SignToken(userID, newUser.StudentID, newUser.Username, newUser.Role, h.config.JWTSecret, h.config.JWTExpiry(), true)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate JWT", err.Error())
		return
	}

	RespondSuccess(w, authResponse{Token: token, Onboarding: true})
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
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", err.Error())
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
		RespondError(w, http.StatusInternalServerError, "UPDATE_FAILED", "Unable to set username", err.Error())
		return
	}
	if err := h.store.UpdateUserStudentID(r.Context(), userUUID, req.Username); err != nil {
		RespondError(w, http.StatusInternalServerError, "UPDATE_FAILED", "Unable to set student ID", err.Error())
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
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate JWT", err.Error())
		return
	}

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
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", err.Error())
		return
	}

	if req.IDToken == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "id_token is required", nil)
		return
	}

	info, err := auth.VerifyGoogleToken(req.IDToken, h.config.GoogleClientID)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "GOOGLE_AUTH_FAILED", "Failed to verify Google token", err.Error())
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
		RespondError(w, http.StatusInternalServerError, "LINK_FAILED", "Failed to link Google account", err.Error())
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
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate JWT", err.Error())
		return
	}

	RespondSuccess(w, authResponse{Token: token})
}

// CheckUsername checks if a username is available.
// GET /auth/check-username?username=xxx
func (h *AuthHandler) CheckUsername(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "username query parameter is required", nil)
		return
	}

	_, err := h.store.GetUserByUsername(r.Context(), username)
	available := err != nil

	RespondSuccess(w, map[string]interface{}{
		"username":   username,
		"available":  available,
	})
}
