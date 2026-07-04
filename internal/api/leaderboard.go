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
	period := r.URL.Query().Get("period")
	if period == "" {
		period = "all"
	}

	entries, err := h.store.GetLeaderboard(r.Context(), period)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "LEADERBOARD_ERROR", "Failed to fetch leaderboard", nil)
		return
	}

	if entries == nil {
		entries = []store.LeaderboardEntry{}
	}

	RespondSuccess(w, entries)
}
