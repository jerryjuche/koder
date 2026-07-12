package api

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/store"
)

type UsersHandler struct {
	store store.Store
}

func NewUsersHandler(store store.Store) *UsersHandler {
	return &UsersHandler{store: store}
}

func (h *UsersHandler) GetUserPublicData(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	userID, err := uuid.Parse(idStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER_ID", "Invalid user ID", nil)
		return
	}

	data, err := h.store.GetUserPublicData(r.Context(), userID)
	if err != nil {
		RespondError(w, http.StatusNotFound, "USER_NOT_FOUND", "User not found", nil)
		return
	}

	RespondSuccess(w, data)
}
