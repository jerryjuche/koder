package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/enricher"
	"github.com/jerryjuche/koder/internal/parser"
	"github.com/jerryjuche/koder/internal/store"
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
			Title:      fmt.Sprintf("%s exercise", strings.Title(strings.ReplaceAll(rawProblem.Slug, "-", " "))),
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
	problem.Visible = false

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
		problem.Visible = false

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

	RespondSuccess(w, results)
}
