package api

import (
	"net/http"

	"github.com/jerryjuche/koder/internal/store"
)

type LeaderboardHandler struct {
	store store.Store
}

func NewLeaderboardHandler(store store.Store) *LeaderboardHandler {
	return &LeaderboardHandler{store: store}
}

func (h *LeaderboardHandler) GetLeaderboard(w http.ResponseWriter, r *http.Request) {
	entries, err := h.store.GetLeaderboard(r.Context())
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "LEADERBOARD_ERROR", "Failed to fetch leaderboard", err.Error())
		return
	}

	if entries == nil {
		entries = []store.LeaderboardEntry{}
	}

	RespondSuccess(w, entries)
}
