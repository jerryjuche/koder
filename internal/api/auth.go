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
	return &AuthHandler{store: store, config: cfg}
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

	newUser := &store.NewUser{
		StudentID: req.StudentID,
		Name:      req.Name,
		Password:  req.Password,
		Role:      "student",
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

	token, err := auth.SignToken(userID, user.StudentID, user.Role, h.config.JWTSecret, h.config.JWTExpiry())
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate JWT", err.Error())
		return
	}

	RespondSuccess(w, authResponse{Token: token})
}
