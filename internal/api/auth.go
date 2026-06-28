package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jerryjuche/koder/internal/auth"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
	"golang.org/x/oauth2"
)

type AuthHandler struct {
	store       store.Store
	config      *config.Config
	giteaOAuth  *oauth2.Config
}

func NewAuthHandler(store store.Store, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		store:  store,
		config: cfg,
	}
}

type registerRequest struct {
	StudentID string `json:"student_id"`
	Name      string `json:"name"`
	Password  string `json:"password"`
}

type loginRequest struct {
	StudentID string `json:"student_id"`
	Password  string `json:"password"`
}

type authResponse struct {
	Token string `json:"token"`
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

	if req.StudentID == "" || req.Name == "" || req.Password == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "student_id, name, and password are required", nil)
		return
	}

	role := "student"
	if h.config.AdminEmail != "" && req.StudentID == h.config.AdminEmail && req.Password == h.config.AdminPassword {
		role = "admin"
	}

	newUser := &store.NewUser{
		StudentID: req.StudentID,
		Name:      req.Name,
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

	token, err := auth.SignToken(userID, user.StudentID, user.Role, h.config.JWTSecret, h.config.JWTExpiry())
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate JWT", err.Error())
		return
	}

	RespondCreated(w, authResponse{Token: token})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", err.Error())
		return
	}

	if req.StudentID == "" || req.Password == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "student_id and password are required", nil)
		return
	}

	user, err := h.store.GetUserByStudentID(r.Context(), req.StudentID)
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
	if user.Role != "admin" && h.config.AdminEmail != "" && req.StudentID == h.config.AdminEmail && req.Password == h.config.AdminPassword {
		uID, _ := uuid.Parse(userID)
		if err := h.store.UpdateUserRole(r.Context(), uID, "admin"); err == nil {
			user.Role = "admin"
		}
	}

	token, err := auth.SignToken(userID, user.StudentID, user.Role, h.config.JWTSecret, h.config.JWTExpiry())
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate JWT", err.Error())
		return
	}

	RespondSuccess(w, authResponse{Token: token})
}

// SetGiteaOAuthConfig sets the Gitea OAuth2 configuration for this handler.
// Called during router setup when all config values are available.
func (h *AuthHandler) SetGiteaOAuthConfig(oauthCfg *oauth2.Config) {
	h.giteaOAuth = oauthCfg
}

// GiteaLogin redirects the user to Gitea's OAuth authorization page.
func (h *AuthHandler) GiteaLogin(w http.ResponseWriter, r *http.Request) {
	if h.giteaOAuth == nil {
		RespondError(w, http.StatusInternalServerError, "OAUTH_CONFIG_ERROR", "Gitea OAuth is not configured", nil)
		return
	}

	state := auth.GenerateOAuthState(h.config.JWTSecret)
	url := h.giteaOAuth.AuthCodeURL(state, oauth2.AccessTypeOnline)
	http.Redirect(w, r, url, http.StatusFound)
}

// GiteaCallback handles the OAuth callback from Gitea.
// It verifies the state parameter, exchanges the code for a token,
// fetches the user's Gitea profile, creates or looks up the local user,
// and redirects the frontend with a JWT.
func (h *AuthHandler) GiteaCallback(w http.ResponseWriter, r *http.Request) {
	if h.giteaOAuth == nil {
		RespondError(w, http.StatusInternalServerError, "OAUTH_CONFIG_ERROR", "Gitea OAuth is not configured", nil)
		return
	}

	// Verify state parameter (CSRF protection)
	state := r.URL.Query().Get("state")
	if !auth.VerifyOAuthState(state, h.config.JWTSecret) {
		http.Redirect(w, r, h.config.AllowedOrigin+"/oauth/callback?error=invalid_state", http.StatusFound)
		return
	}

	// Exchange authorization code for access token
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Redirect(w, r, h.config.AllowedOrigin+"/oauth/callback?error=missing_code", http.StatusFound)
		return
	}

	ctx := context.Background()
	token, err := h.giteaOAuth.Exchange(ctx, code)
	if err != nil {
		http.Redirect(w, r, h.config.AllowedOrigin+"/oauth/callback?error=token_exchange_failed", http.StatusFound)
		return
	}

	// Fetch Gitea user profile — token is used here and then discarded (not stored)
	giteaUser, err := auth.FetchGiteaUser(ctx, h.config.GiteaURL, token)
	if err != nil {
		http.Redirect(w, r, h.config.AllowedOrigin+"/oauth/callback?error=user_info_failed", http.StatusFound)
		return
	}

	// Look up or create local user
	user, err := h.store.GetUserByGiteaID(ctx, giteaUser.ID)
	if err != nil {
		// User does not exist — try linking to existing by student_id, or create new
		existingUser, lookupErr := h.store.GetUserByStudentID(ctx, giteaUser.Login)
		if lookupErr == nil && existingUser != nil {
			// Link Gitea profile to existing account with matching student_id
			uIDStr, err := uuidStringFromPGType(existingUser.ID)
			if err != nil {
				http.Redirect(w, r, h.config.AllowedOrigin+"/oauth/callback?error=user_id_invalid", http.StatusFound)
				return
			}
			uID, _ := uuid.Parse(uIDStr)
			if linkErr := h.store.LinkGiteaToUser(ctx, uID, giteaUser); linkErr != nil {
				http.Redirect(w, r, h.config.AllowedOrigin+"/oauth/callback?error=link_failed", http.StatusFound)
				return
			}
			existingUser.GiteaID = &giteaUser.ID
			existingUser.GiteaUsername = &giteaUser.Login
			existingUser.GiteaEmail = &giteaUser.Email
			existingUser.GiteaAvatarURL = &giteaUser.AvatarURL
			user = existingUser
		} else {
			// Create completely new user from Gitea profile
			newUser, createErr := h.store.CreateUserFromGitea(ctx, giteaUser)
			if createErr != nil {
				http.Redirect(w, r, h.config.AllowedOrigin+"/oauth/callback?error=user_creation_failed", http.StatusFound)
				return
			}
			user = newUser
		}
	}

	userID, err := uuidStringFromPGType(user.ID)
	if err != nil {
		http.Redirect(w, r, h.config.AllowedOrigin+"/oauth/callback?error=user_id_invalid", http.StatusFound)
		return
	}

	// Issue JWT — same as password login
	jwt, err := auth.SignToken(userID, user.StudentID, user.Role, h.config.JWTSecret, h.config.JWTExpiry())
	if err != nil {
		http.Redirect(w, r, h.config.AllowedOrigin+"/oauth/callback?error=token_failed", http.StatusFound)
		return
	}

	// Redirect to frontend callback page with JWT (always same domain, never open redirect)
	http.Redirect(w, r, h.config.AllowedOrigin+"/oauth/callback?token="+jwt, http.StatusFound)
}

// giteaLinkRequest is the payload for linking a Gitea PAT.
type giteaLinkRequest struct {
	Token string `json:"token"`
}

// giteaStatusResponse is returned by the Gitea status and link endpoints.
type giteaStatusResponse struct {
	Linked      bool    `json:"linked"`
	GiteaUsername *string `json:"gitea_username,omitempty"`
	GiteaAvatarURL *string `json:"gitea_avatar_url,omitempty"`
}

// GiteaLink links the authenticated user's Gitea account via a Personal Access Token.
// POST /auth/gitea/link
func (h *AuthHandler) GiteaLink(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	var req giteaLinkRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", err.Error())
		return
	}

	if req.Token == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Gitea PAT token is required", nil)
		return
	}

	// Fetch Gitea user info using the PAT
	giteaUser, err := auth.FetchGiteaUser(r.Context(), h.config.GiteaURL, &oauth2.Token{AccessToken: req.Token})
	if err != nil {
		RespondError(w, http.StatusBadRequest, "GITEA_FETCH_FAILED", "Failed to verify Gitea token", err.Error())
		return
	}

	// Encrypt the PAT before storage
	encryptedToken, err := auth.EncryptToken(req.Token, h.config.JWTSecret)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "ENCRYPTION_FAILED", "Failed to encrypt token", nil)
		return
	}

	userUUID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER_ID", "Invalid user ID in token", nil)
		return
	}

	if err := h.store.UpdateGiteaProfile(r.Context(), userUUID, giteaUser.Login, giteaUser.AvatarURL, encryptedToken); err != nil {
		RespondError(w, http.StatusInternalServerError, "LINK_FAILED", "Failed to link Gitea account", err.Error())
		return
	}

	InvalidateUserCache(claims.UserID)

	RespondSuccess(w, giteaStatusResponse{
		Linked:         true,
		GiteaUsername:  &giteaUser.Login,
		GiteaAvatarURL: &giteaUser.AvatarURL,
	})
}

// GiteaUnlink removes the Gitea PAT-linked profile from the authenticated user.
// DELETE /auth/gitea/link
func (h *AuthHandler) GiteaUnlink(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	userUUID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER_ID", "Invalid user ID in token", nil)
		return
	}

	if err := h.store.ClearGiteaProfile(r.Context(), userUUID); err != nil {
		RespondError(w, http.StatusInternalServerError, "UNLINK_FAILED", "Failed to unlink Gitea account", err.Error())
		return
	}

	InvalidateUserCache(claims.UserID)

	RespondSuccess(w, giteaStatusResponse{Linked: false})
}

// GiteaStatus returns the Gitea linking status for the authenticated user.
// GET /auth/gitea/status
func (h *AuthHandler) GiteaStatus(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	userUUID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER_ID", "Invalid user ID in token", nil)
		return
	}

	user, err := h.store.GetUserByID(r.Context(), userUUID)
	if err != nil {
		RespondError(w, http.StatusNotFound, "USER_NOT_FOUND", "User not found", nil)
		return
	}

	linked := user.GiteaUsername != nil && *user.GiteaUsername != ""
	RespondSuccess(w, giteaStatusResponse{
		Linked:         linked,
		GiteaUsername:  user.GiteaUsername,
		GiteaAvatarURL: user.GiteaAvatarURL,
	})
}

// GiteaSync re-fetches the Gitea profile using the stored encrypted PAT.
// POST /auth/gitea/sync
func (h *AuthHandler) GiteaSync(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	userUUID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER_ID", "Invalid user ID in token", nil)
		return
	}

	user, err := h.store.GetUserByID(r.Context(), userUUID)
	if err != nil {
		RespondError(w, http.StatusNotFound, "USER_NOT_FOUND", "User not found", nil)
		return
	}

	if user.GiteaToken == nil || *user.GiteaToken == "" {
		RespondError(w, http.StatusBadRequest, "NOT_LINKED", "No Gitea account is linked", nil)
		return
	}

	// Decrypt the stored token
	plainToken, err := auth.DecryptToken(*user.GiteaToken, h.config.JWTSecret)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DECRYPTION_FAILED", "Failed to decrypt stored token", nil)
		return
	}

	// Re-fetch Gitea profile
	giteaUser, err := auth.FetchGiteaUser(r.Context(), h.config.GiteaURL, &oauth2.Token{AccessToken: plainToken})
	if err != nil {
		RespondError(w, http.StatusBadRequest, "GITEA_FETCH_FAILED", "Failed to fetch Gitea profile", err.Error())
		return
	}

	// Re-encrypt with the same key (rotation-safe)
	encryptedToken, err := auth.EncryptToken(plainToken, h.config.JWTSecret)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "ENCRYPTION_FAILED", "Failed to encrypt token", nil)
		return
	}

	if err := h.store.UpdateGiteaProfile(r.Context(), userUUID, giteaUser.Login, giteaUser.AvatarURL, encryptedToken); err != nil {
		RespondError(w, http.StatusInternalServerError, "SYNC_FAILED", "Failed to sync Gitea profile", err.Error())
		return
	}

	InvalidateUserCache(claims.UserID)

	RespondSuccess(w, giteaStatusResponse{
		Linked:         true,
		GiteaUsername:  &giteaUser.Login,
		GiteaAvatarURL: &giteaUser.AvatarURL,
	})
}
