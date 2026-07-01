package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/enricher"
	"github.com/jerryjuche/koder/internal/parser"
	"github.com/jerryjuche/koder/internal/store"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type AdminHandler struct {
	store    store.Store
	parser   *parser.Parser
	enricher *enricher.Enricher
}

func NewAdminHandler(store store.Store, cfg *config.Config) (*AdminHandler, error) {
	parser := parser.NewParser(cfg.SandboxBaseDir)
	enricher, err := enricher.NewEnricher(context.Background(), cfg)
	if err != nil {
		return nil, err
	}

	return &AdminHandler{store: store, parser: parser, enricher: enricher}, nil
}

type ingestRequest struct {
	RepoURL string `json:"repo_url"`
}

type enrichRequest struct {
	Slug string `json:"slug"`
}

type ingestionResponse struct {
	Slug       string `json:"slug"`
	Module     string `json:"module"`
	SourceHash string `json:"source_hash"`
	Status     string `json:"status"`
}

func (h *AdminHandler) Ingest(w http.ResponseWriter, r *http.Request) {
	var req ingestRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", err.Error())
		return
	}

	if req.RepoURL == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "repo_url is required", nil)
		return
	}

	rawProblems, err := h.parser.IngestGitHubRepo(r.Context(), req.RepoURL)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INGEST_FAILED", "Unable to ingest GitHub repository", err.Error())
		return
	}

	responses := make([]ingestionResponse, 0, len(rawProblems))
	for _, rawProblem := range rawProblems {
		existingProblem, err := h.store.GetProblemBySlugAny(r.Context(), rawProblem.Slug)
		if err != nil && !errors.Is(err, pgx.ErrNoRows) {
			RespondError(w, http.StatusInternalServerError, "INGEST_FAILED", "Unable to check existing problem", err.Error())
			return
		}
		if err == nil && existingProblem.SourceHash == rawProblem.SourceHash {
			responses = append(responses, ingestionResponse{Slug: existingProblem.Slug, Module: existingProblem.Module, SourceHash: existingProblem.SourceHash, Status: "unchanged"})
			continue
		}

		problem := &store.Problem{
			Slug:       rawProblem.Slug,
			Module:     rawProblem.Module,
			Type:       rawProblem.Type,
			Language:   "go",
			Title:      fmt.Sprintf("%s exercise", cases.Title(language.English).String(strings.ReplaceAll(rawProblem.Slug, "-", " "))),
			Statement:  "Problem ingestion pending AI enrichment.",
			FuncName:   "",
			ReturnType: "",
			ParamTypes: []string{},
			Hints:      []string{"Pending enrichment."},
			Difficulty: 1,
			XPReward:   10,
			Tags:       []string{"go", "ai-generated"},
			Visible:    false,
			SourceHash: rawProblem.SourceHash,
			RawReadme:  rawProblem.RawReadme,
		}

		if err := h.store.UpsertProblem(r.Context(), problem); err != nil {
			RespondError(w, http.StatusInternalServerError, "INGEST_FAILED", "Unable to save ingested problem", err.Error())
			return
		}

		status := "created"
		if err == nil {
			status = "updated"
		}
		responses = append(responses, ingestionResponse{Slug: problem.Slug, Module: problem.Module, SourceHash: problem.SourceHash, Status: status})
	}

	h.store.LogActivity(r.Context(), "info", fmt.Sprintf("GitHub repo ingested: %d new problems queued", len(rawProblems)), "text-brand-success", "Github")

	RespondCreated(w, responses)
}

func (h *AdminHandler) Enrich(w http.ResponseWriter, r *http.Request) {
	var req enrichRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", err.Error())
		return
	}

	if req.Slug == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "slug is required", nil)
		return
	}

	problem, err := h.store.GetProblemBySlugAny(r.Context(), req.Slug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Problem not found", nil)
			return
		}
		RespondError(w, http.StatusInternalServerError, "ENRICH_FAILED", "Unable to load problem", err.Error())
		return
	}

	enriched, testCases, err := h.enricher.EnrichProblem(r.Context(), problem.RawReadme)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "ENRICH_FAILED", "Unable to enrich problem", err.Error())
		return
	}

	problem.Title = enriched.Title
	problem.Statement = enriched.Statement
	problem.FuncName = enriched.FuncName
	problem.ReturnType = enriched.ReturnType
	problem.ParamTypes = enriched.ParamTypes
	problem.Hints = enriched.Hints
	problem.Difficulty = enriched.Difficulty
	problem.XPReward = enriched.XPReward
	problem.Tags = enriched.Tags
	problem.Visible = true

	if err := h.store.UpsertProblem(r.Context(), problem); err != nil {
		RespondError(w, http.StatusInternalServerError, "ENRICH_FAILED", "Unable to save enriched problem", err.Error())
		return
	}

	if !problem.ID.Valid {
		RespondError(w, http.StatusInternalServerError, "ENRICH_FAILED", "Invalid problem id", nil)
		return
	}

	problemID := uuid.UUID(problem.ID.Bytes)
	if err := h.store.UpsertTestCasesForProblem(r.Context(), problemID, testCases); err != nil {
		RespondError(w, http.StatusInternalServerError, "ENRICH_FAILED", "Unable to save test cases", err.Error())
		return
	}

	RespondSuccess(w, map[string]string{"slug": req.Slug})
}

func (h *AdminHandler) EnrichAll(w http.ResponseWriter, r *http.Request) {
	problems, err := h.store.ListProblemsNeedingEnrichment(r.Context())
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "ENRICH_FAILED", "Unable to list problems for enrichment", err.Error())
		return
	}

	results := make([]map[string]any, 0, len(problems))
	for _, problem := range problems {
		enriched, testCases, err := h.enricher.EnrichProblem(r.Context(), problem.RawReadme)
		if err != nil {
			results = append(results, map[string]any{"slug": problem.Slug, "status": "failed", "error": err.Error()})
			continue
		}

		problem.Title = enriched.Title
		problem.Statement = enriched.Statement
		problem.FuncName = enriched.FuncName
		problem.ReturnType = enriched.ReturnType
		problem.ParamTypes = enriched.ParamTypes
		problem.Hints = enriched.Hints
		problem.Difficulty = enriched.Difficulty
		problem.XPReward = enriched.XPReward
		problem.Tags = enriched.Tags
		problem.Visible = true

		if err := h.store.UpsertProblem(r.Context(), &problem); err != nil {
			results = append(results, map[string]any{"slug": problem.Slug, "status": "failed", "error": err.Error()})
			continue
		}

		if !problem.ID.Valid {
			results = append(results, map[string]any{"slug": problem.Slug, "status": "failed", "error": "invalid problem id"})
			continue
		}

		problemID := uuid.UUID(problem.ID.Bytes)
		if err := h.store.UpsertTestCasesForProblem(r.Context(), problemID, testCases); err != nil {
			results = append(results, map[string]any{"slug": problem.Slug, "status": "failed", "error": err.Error()})
			continue
		}

		results = append(results, map[string]any{"slug": problem.Slug, "status": "enriched"})
	}

	h.store.LogActivity(r.Context(), "success", fmt.Sprintf("Batch enrichment completed. %d problems processed.", len(results)), "text-brand-success", "Wand2")

	RespondSuccess(w, results)
}

func (h *AdminHandler) GetAdminStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.store.GetAdminStats(r.Context())
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "STATS_FAILED", "Unable to get admin stats", err.Error())
		return
	}
	RespondSuccess(w, stats)
}

func (h *AdminHandler) GetAdminActivity(w http.ResponseWriter, r *http.Request) {
	logs, err := h.store.GetRecentActivity(r.Context(), 50)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "ACTIVITY_FAILED", "Unable to get activity logs", err.Error())
		return
	}
	RespondSuccess(w, logs)
}

func (h *AdminHandler) ListAllProblems(w http.ResponseWriter, r *http.Request) {
	problems, err := h.store.ListAllProblemsAdmin(r.Context())
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "PROBLEMS_FAILED", "Unable to list problems", err.Error())
		return
	}
	RespondSuccess(w, problems)
}

// ToggleVisibility sets the visible flag for a problem.
// PATCH /admin/problems/{id}/visibility
func (h *AdminHandler) ToggleVisibility(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "id")
	problemID, err := uuid.Parse(slug)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Invalid problem ID", err.Error())
		return
	}

	var req struct {
		Visible bool `json:"visible"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", err.Error())
		return
	}

	if err := h.store.UpdateProblemVisibility(r.Context(), problemID, req.Visible); err != nil {
		RespondError(w, http.StatusInternalServerError, "UPDATE_FAILED", "Unable to update problem visibility", err.Error())
		return
	}

	status := "hidden"
	if req.Visible {
		status = "visible"
	}
	h.store.LogActivity(r.Context(), "info", fmt.Sprintf("Problem %s set to %s", problemID.String(), status), "text-brand-muted-gold", "Eye")

	RespondSuccess(w, map[string]any{"id": problemID.String(), "visible": req.Visible})
}

// PublishAllDrafts sets all draft (invisible) problems to visible.
// POST /admin/problems/publish-all
func (h *AdminHandler) PublishAllDrafts(w http.ResponseWriter, r *http.Request) {
	problems, err := h.store.ListAllProblemsAdmin(r.Context())
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to list problems", err.Error())
		return
	}

	published := 0
	for _, p := range problems {
		if !p.Visible && p.ID.Valid {
			problemID := uuid.UUID(p.ID.Bytes)
			if err := h.store.UpdateProblemVisibility(r.Context(), problemID, true); err == nil {
				published++
			}
		}
	}

	h.store.LogActivity(r.Context(), "info", fmt.Sprintf("Published %d draft problems", published), "text-brand-muted-gold", "Eye")

	RespondSuccess(w, map[string]any{"published": published})
}

// ListPendingUserProblems returns all pending community contributions.
func (h *AdminHandler) ListPendingUserProblems(w http.ResponseWriter, r *http.Request) {
	problems, err := h.store.ListPendingUserProblems(r.Context())
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch pending problems", err.Error())
		return
	}
	RespondSuccess(w, problems)
}

// ApproveUserProblem approves a pending community contribution.
func (h *AdminHandler) ApproveUserProblem(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "id")
	id, err := uuid.Parse(slug)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Invalid problem ID", err.Error())
		return
	}

	var payload struct {
		AdminNotes string `json:"admin_notes"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		// allow empty payload
	}

	up, newProblemID, err := h.store.ApproveUserProblem(r.Context(), id, payload.AdminNotes)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to approve problem", err.Error())
		return
	}

	upID := uuid.UUID(up.ID.Bytes)
	submitterID := uuid.UUID(up.UserID.Bytes)
	// Notify the submitter that their contribution was approved
	h.store.CreateNotification(r.Context(), submitterID, "contribution_approved", fmt.Sprintf("Your contribution '%s' has been approved!", up.Title), &upID)
	// Notify all users about the new problem
	h.store.NotifyAllUsers(r.Context(), "new_problem", fmt.Sprintf("New problem available: %s", up.Title), newProblemID)

	h.store.LogActivity(r.Context(), "success", fmt.Sprintf("Approved community contribution %s", id.String()), "brand-muted-gold", "check")
	RespondSuccess(w, map[string]string{"status": "approved"})
}

// RejectUserProblem rejects a pending community contribution.
func (h *AdminHandler) RejectUserProblem(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "id")
	id, err := uuid.Parse(slug)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Invalid problem ID", err.Error())
		return
	}

	var payload struct {
		AdminNotes string `json:"admin_notes"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Invalid payload", err.Error())
		return
	}

	if payload.AdminNotes == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Admin notes are required for rejection", nil)
		return
	}

	up, err := h.store.RejectUserProblem(r.Context(), id, payload.AdminNotes)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to reject problem", err.Error())
		return
	}

	upID := uuid.UUID(up.ID.Bytes)
	submitterID := uuid.UUID(up.UserID.Bytes)
	h.store.CreateNotification(r.Context(), submitterID, "contribution_rejected", fmt.Sprintf("Your contribution '%s' was rejected. Note: %s", up.Title, payload.AdminNotes), &upID)

	h.store.LogActivity(r.Context(), "error", fmt.Sprintf("Rejected community contribution %s", id.String()), "red-500", "x")
	RespondSuccess(w, map[string]string{"status": "rejected"})
}
