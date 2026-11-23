package api

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/enricher"
	"github.com/jerryjuche/koder/internal/store"
)

// adminInsightCacheTTL bounds how stale a cached first-turn answer may be.
// Within the TTL an identical question returns the cached narrative *and* the
// snapshot it was written from, so the prose never disagrees with the numbers.
const adminInsightCacheTTL = 30 * time.Minute

const defaultAdminInsightQuestion = "Give me a complete breakdown of how the platform is doing, who is performing best, and what needs attention."

// InsightGenerator turns grounded data into a narrative report. Declared as an
// interface so handler tests run without a live model.
type InsightGenerator interface {
	GenerateInsights(ctx context.Context, req *enricher.AdminInsightsRequest) (*enricher.AdminInsightsResponse, error)
	GenerateInsightsStream(ctx context.Context, req *enricher.AdminInsightsRequest, onNarrative func(string) error) (*enricher.AdminInsightsResponse, error)
}

// InsightsHandler serves the admin analyst endpoints. Numbers come from SQL,
// narration comes from the model, and both are returned together so the admin
// can audit every claim.
type InsightsHandler struct {
	store     store.Store
	generator InsightGenerator
	now       func() time.Time
}

func NewInsightsHandler(s store.Store, g InsightGenerator) *InsightsHandler {
	return &InsightsHandler{store: s, generator: g, now: time.Now}
}

type adminInsightsRequest struct {
	Question string `json:"question"`
	Period   string `json:"period"`
}

type adminInsightsResponse struct {
	Report      *enricher.InsightReport `json:"report"`
	Snapshot    *store.InsightsSnapshot `json:"snapshot"`
	Cached      bool                    `json:"cached"`
	Model       string                  `json:"model,omitempty"`
	GeneratedAt time.Time               `json:"generated_at"`
}

// Generate handles POST /admin/ai/insights — a one-shot (threadless) question.
// The conversational UI uses the thread endpoint instead; this remains for
// scripts and for clients written against the first version of the API.
func (h *InsightsHandler) Generate(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}
	adminID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER_ID", "Invalid user ID", nil)
		return
	}

	var req adminInsightsRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	period := strings.ToLower(strings.TrimSpace(req.Period))
	if period == "" {
		period = "today"
	}
	windowStart, windowEnd, ok := insightWindow(period, h.now())
	if !ok {
		RespondError(w, http.StatusBadRequest, "INVALID_PERIOD",
			"period must be one of: today, yesterday, week, month, all", nil)
		return
	}

	question := strings.TrimSpace(req.Question)
	if question == "" {
		question = defaultAdminInsightQuestion
	}
	if utf8.RuneCountInString(question) > 500 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "question must be 500 characters or fewer", nil)
		return
	}

	// 1. Deterministic numbers first. A failure here is a real database problem.
	snapshot, err := h.store.GetInsightsSnapshot(r.Context(), period, windowStart, windowEnd)
	if err != nil {
		slog.Error("insights: failed to build snapshot", "period", period, "error", err)
		RespondError(w, http.StatusInternalServerError, "SNAPSHOT_FAILED", "Failed to read platform metrics", nil)
		return
	}

	questionHash := hashInsightQuestion(period, question, "")

	// 2. Cache hit → zero AI cost, same snapshot the report was written from.
	if cached, ok := h.loadCachedReport(r.Context(), period, questionHash); ok {
		RespondSuccess(w, cached)
		return
	}

	// 3. Cache miss → ask the model to narrate the snapshot.
	start := time.Now()
	result, err := h.generator.GenerateInsights(r.Context(), &enricher.AdminInsightsRequest{
		Question: question,
		Period:   period,
		Snapshot: snapshot,
	})
	duration := time.Since(start)

	tokensIn := len(question)/4 + 800 // snapshot grounding is roughly 4-8k chars
	tokensOut := 0
	if err == nil && result != nil && result.Report != nil {
		tokensOut = len(result.Report.Summary)/4 + len(result.Report.Highlights)*8
		if tokensOut < 5 {
			tokensOut = 5
		}
	}

	// ai_usage_logs.problem_slug is NOT NULL with a default; an empty string
	// keeps this row grouped under platform-level AI spend.
	if logErr := h.store.LogAIUsage(r.Context(), adminID, "admin_insights", "", tokensIn, tokensOut, int(duration.Milliseconds()), err == nil, errorText(err)); logErr != nil {
		slog.Warn("insights: failed to log ai usage", "error", logErr)
	}

	if err != nil {
		slog.Warn("insights: generation failed", "period", period, "error", err)
		respondAIError(w, r, err, "ADMIN_INSIGHTS_FAILED", "The AI could not build this report. Please try again.")
		return
	}
	if result == nil || result.Report == nil {
		slog.Error("insights: generator returned no report")
		RespondError(w, http.StatusBadGateway, "ADMIN_INSIGHTS_FAILED", "The AI returned an empty report. Please try again.", nil)
		return
	}

	resp := adminInsightsResponse{
		Report:      result.Report,
		Snapshot:    snapshot,
		Cached:      false,
		Model:       result.Model,
		GeneratedAt: result.GeneratedAt,
	}

	// 4. Cache best-effort — a write failure must not hide a good answer.
	h.storeCachedReport(r.Context(), adminID, period, questionHash, question, result, snapshot)

	if logErr := h.store.LogActivity(r.Context(), "info",
		fmt.Sprintf("Admin AI insights (%s) in %dms", period, duration.Milliseconds()),
		"text-brand-cool-accent", "BrainCircuit"); logErr != nil {
		slog.Warn("insights: failed to log activity", "error", logErr)
	}

	RespondSuccess(w, resp)
}

// loadCachedReport returns a cached answer when one is fresh and decodable.
// A corrupt cache row is treated as a miss, never as an error.
func (h *InsightsHandler) loadCachedReport(ctx context.Context, period, questionHash string) (adminInsightsResponse, bool) {
	notBefore := h.now().Add(-adminInsightCacheTTL)
	reportJSON, snapshotJSON, model, createdAt, err := h.store.GetAdminInsightReport(ctx, period, questionHash, notBefore)
	if err != nil {
		slog.Warn("insights: cache read failed, regenerating", "error", err)
		return adminInsightsResponse{}, false
	}
	if len(reportJSON) == 0 {
		return adminInsightsResponse{}, false
	}

	var report enricher.InsightReport
	var snapshot store.InsightsSnapshot
	if err := json.Unmarshal(reportJSON, &report); err != nil {
		slog.Warn("insights: cached report is corrupt, regenerating", "error", err)
		return adminInsightsResponse{}, false
	}
	if err := json.Unmarshal(snapshotJSON, &snapshot); err != nil {
		slog.Warn("insights: cached snapshot is corrupt, regenerating", "error", err)
		return adminInsightsResponse{}, false
	}

	return adminInsightsResponse{
		Report:      &report,
		Snapshot:    &snapshot,
		Cached:      true,
		Model:       model,
		GeneratedAt: createdAt,
	}, true
}

func (h *InsightsHandler) storeCachedReport(ctx context.Context, adminID uuid.UUID, period, questionHash, question string, result *enricher.AdminInsightsResponse, snapshot *store.InsightsSnapshot) {
	reportJSON, err := json.Marshal(result.Report)
	if err != nil {
		slog.Warn("insights: failed to marshal report for cache", "error", err)
		return
	}
	snapshotJSON, err := json.Marshal(snapshot)
	if err != nil {
		slog.Warn("insights: failed to marshal snapshot for cache", "error", err)
		return
	}
	if err := h.store.UpsertAdminInsightReport(ctx, adminID, period, questionHash, question, result.Model, reportJSON, snapshotJSON); err != nil {
		slog.Warn("insights: failed to cache report", "error", err)
	}
}

// insightWindow maps a period label to a half-open UTC window.
func insightWindow(period string, now time.Time) (time.Time, time.Time, bool) {
	now = now.UTC()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)

	switch period {
	case "today":
		return today, now, true
	case "yesterday":
		return today.AddDate(0, 0, -1), today, true
	case "week":
		return now.AddDate(0, 0, -7), now, true
	case "month":
		return now.AddDate(0, 0, -30), now, true
	case "all":
		// A fixed epoch predates the platform, so the window covers all history
		// while keeping the same half-open semantics as every other period.
		return time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC), now, true
	default:
		return time.Time{}, time.Time{}, false
	}
}

// hashInsightQuestion keys the cache. Case and surrounding whitespace are
// normalised so "How was today?" and "how was today?" share one entry. A
// subject id is part of the key so platform answers and student answers never
// collide.
func hashInsightQuestion(period, question, subjectID string) string {
	sum := sha256.Sum256([]byte(period + "\x00" + subjectID + "\x00" + strings.ToLower(strings.TrimSpace(question))))
	return hex.EncodeToString(sum[:])
}

func errorText(err error) string {
	if err == nil {
		return ""
	}
	return err.Error()
}

// respondAIError classifies an AI failure into a stable machine code hint and
// returns 502. Upstream provider failures carry Retry-After so the client can
// back off instead of hammering a degraded free-tier endpoint.
func respondAIError(w http.ResponseWriter, r *http.Request, err error, code, message string) {
	details := classifyAIError(err)
	if details == "upstream_error" {
		w.Header().Set("Retry-After", "30")
	}

	slog.Warn("ai endpoint: responding failure",
		"path", r.URL.Path,
		"code", code,
		"details", details,
		"error", err,
	)

	RespondError(w, http.StatusBadGateway, code, message, details)
}

func classifyAIError(err error) string {
	switch {
	case errors.Is(err, enricher.ErrAIValidation):
		return "validation_error"
	case errors.Is(err, enricher.ErrAIInvalidResponse):
		return "invalid_response"
	case errors.Is(err, enricher.ErrAIUpstream):
		return "upstream_error"
	default:
		return "unknown_error"
	}
}
