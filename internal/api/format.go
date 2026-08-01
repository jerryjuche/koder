package api

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/jerryjuche/koder/internal/executor"
)

// Formatter formats source code for the requested language. Defined as an
// interface so handler tests can substitute a fake without a live sandbox.
type Formatter interface {
	FormatCode(ctx context.Context, language, code string) (string, error)
}

// FormatHandler handles POST /api/format — real gofmt/black formatting for the
// Monaco workspace, replacing the client-side lightweight indenter.
type FormatHandler struct {
	formatter Formatter
}

// NewFormatHandler creates a new FormatHandler.
func NewFormatHandler(formatter Formatter) *FormatHandler {
	return &FormatHandler{formatter: formatter}
}

// Format handles POST /api/format.
func (h *FormatHandler) Format(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication claims are missing", nil)
		return
	}

	var req struct {
		Language string `json:"language"`
		Code     string `json:"code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_REQUEST", "Invalid request body", nil)
		return
	}

	if req.Language != "go" && req.Language != "python" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Language must be 'go' or 'python'", nil)
		return
	}

	if len(req.Code) > 50*1024 {
		RespondError(w, http.StatusBadRequest, "CODE_TOO_LARGE", "Code exceeds 50KB limit", "")
		return
	}

	formatted, err := h.formatter.FormatCode(r.Context(), req.Language, req.Code)
	if err != nil {
		var syntaxErr *executor.FormatSyntaxError
		if errors.As(err, &syntaxErr) {
			slog.Warn("format: syntax error", "language", req.Language, "error", err)
			RespondError(w, http.StatusUnprocessableEntity, "FORMAT_SYNTAX_ERROR", err.Error(), "")
			return
		}
		slog.Warn("format: failed", "language", req.Language, "error", err)
		friendly := executor.FormatFriendlySandboxError(err)
		RespondError(w, http.StatusBadGateway, "FORMAT_FAILED", friendly, nil)
		return
	}

	RespondSuccess(w, map[string]string{"formatted": formatted})
}
