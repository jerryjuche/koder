package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

// ── Admin insight conversations ────────────────────────────────────────────
//
// A thread is an admin's saved conversation with the platform analyst. Each
// assistant message stores the narrative plus the exact report/snapshot it was
// written from, so reopening a thread shows the numbers behind every claim.
// Reads are always scoped by admin_id: one admin can never read another's
// threads, even with a valid thread UUID.

// InsightThread is one saved conversation.
type InsightThread struct {
	ID           string    `json:"id"`
	Title        string    `json:"title"`
	Period       string    `json:"period"`
	MessageCount int       `json:"message_count"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// InsightMessage is one turn in a thread. User turns carry only content;
// assistant turns also carry the structured report and its snapshot.
type InsightMessage struct {
	ID        string          `json:"id"`
	ThreadID  string          `json:"thread_id"`
	Role      string          `json:"role"`
	Content   string          `json:"content"`
	Report    json.RawMessage `json:"report,omitempty"`
	Snapshot  json.RawMessage `json:"snapshot,omitempty"`
	Model     string          `json:"model,omitempty"`
	CreatedAt time.Time       `json:"created_at"`
}

// ErrInsightThreadNotFound is returned when an admin deletes a thread that does
// not exist or belongs to someone else.
var ErrInsightThreadNotFound = errors.New("insight thread not found")

// NewInsightMessage is the write shape for one turn.
type NewInsightMessage struct {
	ThreadID string
	Role     string
	Content  string
	Report   json.RawMessage
	Snapshot json.RawMessage
	Model    string
}

// InsightThreadHistory is the compact transcript handed to the model.
type InsightThreadHistory struct {
	Role    string
	Content string
}

// CreateInsightThread inserts an empty conversation for an admin.
func (s *PostgresStore) CreateInsightThread(ctx context.Context, adminID uuid.UUID, title, period string) (*InsightThread, error) {
	if title == "" {
		title = "New conversation"
	}
	if period == "" {
		period = "today"
	}
	row := s.pool.QueryRow(ctx, `
		INSERT INTO admin_insight_threads (admin_id, title, period)
		VALUES ($1, $2, $3)
		RETURNING id::text, title, period, created_at, updated_at
	`, adminID, title, period)

	var t InsightThread
	if err := row.Scan(&t.ID, &t.Title, &t.Period, &t.CreatedAt, &t.UpdatedAt); err != nil {
		return nil, fmt.Errorf("insights: create thread: %w", err)
	}
	return &t, nil
}

// ListInsightThreads returns an admin's live conversations, newest first.
func (s *PostgresStore) ListInsightThreads(ctx context.Context, adminID uuid.UUID, limit int) ([]InsightThread, error) {
	if limit <= 0 || limit > 50 {
		limit = 30
	}
	rows, err := s.pool.Query(ctx, `
		SELECT t.id::text, t.title, t.period, t.created_at, t.updated_at,
		       (SELECT COUNT(*)::int FROM admin_insight_messages m WHERE m.thread_id = t.id)
		  FROM admin_insight_threads t
		 WHERE t.admin_id = $1 AND t.deleted_at IS NULL
		 ORDER BY t.updated_at DESC
		 LIMIT $2
	`, adminID, limit)
	if err != nil {
		return nil, fmt.Errorf("insights: list threads: %w", err)
	}
	defer rows.Close()

	out := make([]InsightThread, 0, limit)
	for rows.Next() {
		var t InsightThread
		if err := rows.Scan(&t.ID, &t.Title, &t.Period, &t.CreatedAt, &t.UpdatedAt, &t.MessageCount); err != nil {
			return nil, fmt.Errorf("insights: scan thread: %w", err)
		}
		out = append(out, t)
	}
	return out, rows.Err()
}

// GetInsightThread loads one thread, scoped to its owner.
func (s *PostgresStore) GetInsightThread(ctx context.Context, adminID, threadID uuid.UUID) (*InsightThread, error) {
	var t InsightThread
	err := s.pool.QueryRow(ctx, `
		SELECT t.id::text, t.title, t.period, t.created_at, t.updated_at,
		       (SELECT COUNT(*)::int FROM admin_insight_messages m WHERE m.thread_id = t.id)
		  FROM admin_insight_threads t
		 WHERE t.id = $1 AND t.admin_id = $2 AND t.deleted_at IS NULL
	`, threadID, adminID).Scan(&t.ID, &t.Title, &t.Period, &t.CreatedAt, &t.UpdatedAt, &t.MessageCount)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("insights: get thread: %w", err)
	}
	return &t, nil
}

// UpdateInsightThread renames a thread and/or records its period.
func (s *PostgresStore) UpdateInsightThread(ctx context.Context, adminID, threadID uuid.UUID, title, period string) (*InsightThread, error) {
	var t InsightThread
	err := s.pool.QueryRow(ctx, `
		UPDATE admin_insight_threads
		   SET title = COALESCE(NULLIF($3, ''), title),
		       period = COALESCE(NULLIF($4, ''), period),
		       updated_at = NOW()
		 WHERE id = $1 AND admin_id = $2 AND deleted_at IS NULL
		RETURNING id::text, title, period, created_at, updated_at
	`, threadID, adminID, title, period).Scan(&t.ID, &t.Title, &t.Period, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("insights: update thread: %w", err)
	}
	return &t, nil
}

// DeleteInsightThread soft-deletes an admin's thread; messages are retained for
// audit and simply become unreachable.
func (s *PostgresStore) DeleteInsightThread(ctx context.Context, adminID, threadID uuid.UUID) error {
	tag, err := s.pool.Exec(ctx, `
		UPDATE admin_insight_threads
		   SET deleted_at = NOW()
		 WHERE id = $1 AND admin_id = $2 AND deleted_at IS NULL
	`, threadID, adminID)
	if err != nil {
		return fmt.Errorf("insights: delete thread: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrInsightThreadNotFound
	}
	return nil
}

// AppendInsightMessage stores one turn and bumps the thread's activity stamp.
func (s *PostgresStore) AppendInsightMessage(ctx context.Context, msg *NewInsightMessage) (*InsightMessage, error) {
	if msg == nil {
		return nil, fmt.Errorf("insights: message is nil")
	}
	threadID, err := uuid.Parse(msg.ThreadID)
	if err != nil {
		return nil, fmt.Errorf("insights: invalid thread id: %w", err)
	}

	row := s.pool.QueryRow(ctx, `
		INSERT INTO admin_insight_messages (thread_id, role, content, report, snapshot, model)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id::text, thread_id::text, role, content, report, snapshot, model, created_at
	`, threadID, msg.Role, msg.Content, nullableJSON(msg.Report), nullableJSON(msg.Snapshot), msg.Model)

	var m InsightMessage
	if err := row.Scan(&m.ID, &m.ThreadID, &m.Role, &m.Content, &m.Report, &m.Snapshot, &m.Model, &m.CreatedAt); err != nil {
		return nil, fmt.Errorf("insights: append message: %w", err)
	}

	if _, err := s.pool.Exec(ctx, `UPDATE admin_insight_threads SET updated_at = NOW() WHERE id = $1`, threadID); err != nil {
		return nil, fmt.Errorf("insights: touch thread: %w", err)
	}
	return &m, nil
}

// ListInsightMessages returns the newest messages of a thread in chronological
// order, capped so a long conversation cannot bloat the prompt.
func (s *PostgresStore) ListInsightMessages(ctx context.Context, threadID uuid.UUID, limit int) ([]InsightMessage, error) {
	if limit <= 0 || limit > 40 {
		limit = 20
	}
	rows, err := s.pool.Query(ctx, `
		SELECT id::text, thread_id::text, role, content, report, snapshot, model, created_at
		  FROM (
		        SELECT id, thread_id, role, content, report, snapshot, model, created_at
		          FROM admin_insight_messages
		         WHERE thread_id = $1
		         ORDER BY created_at DESC
		         LIMIT $2
		       ) recent
		 ORDER BY created_at ASC
	`, threadID, limit)
	if err != nil {
		return nil, fmt.Errorf("insights: list messages: %w", err)
	}
	defer rows.Close()

	out := make([]InsightMessage, 0, limit)
	for rows.Next() {
		var m InsightMessage
		if err := rows.Scan(&m.ID, &m.ThreadID, &m.Role, &m.Content, &m.Report, &m.Snapshot, &m.Model, &m.CreatedAt); err != nil {
			return nil, fmt.Errorf("insights: scan message: %w", err)
		}
		out = append(out, m)
	}
	return out, rows.Err()
}

// InsightHistory converts stored messages into the compact transcript the model
// needs. Only narrative text is sent; snapshots and reports stay server-side.
func InsightHistory(messages []InsightMessage, limit int) []InsightThreadHistory {
	if limit > 0 && len(messages) > limit {
		messages = messages[len(messages)-limit:]
	}
	out := make([]InsightThreadHistory, 0, len(messages))
	for _, m := range messages {
		out = append(out, InsightThreadHistory{Role: m.Role, Content: m.Content})
	}
	return out
}

// nullableJSON turns an empty payload into SQL NULL so the column stays clean.
func nullableJSON(raw json.RawMessage) any {
	if len(raw) == 0 {
		return nil
	}
	return []byte(raw)
}
