package api

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/broker"
	"github.com/jerryjuche/koder/internal/store"
)

// likeFakeStore simulates the store interactions of the like-notification path.
type likeFakeStore struct {
	*store.PostgresStore
	inserted   bool
	sum        *store.SubmissionLikeSummary
	notifs     []string
	likedBy    uuid.UUID
	likedSub   uuid.UUID
}

func (f *likeFakeStore) LikeSubmission(_ context.Context, submissionID, userID uuid.UUID) (bool, error) {
	f.likedSub = submissionID
	f.likedBy = userID
	return f.inserted, nil
}
func (f *likeFakeStore) GetSubmissionLikeSummary(_ context.Context, _ uuid.UUID) (*store.SubmissionLikeSummary, error) {
	return f.sum, nil
}
func (f *likeFakeStore) CreateNotification(_ context.Context, _ uuid.UUID, notifType, message string, _ *uuid.UUID) error {
	f.notifs = append(f.notifs, notifType+"|"+message)
	return nil
}

func likeRequest(submissionID string) *http.Request {
	req := httptest.NewRequest(http.MethodPost, "/submissions/"+submissionID+"/like", strings.NewReader(""))
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", submissionID)
	return req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
}

func TestLikeNotificationOnNewLike(t *testing.T) {
	authorID := uuid.New()
	likerID := uuid.New()
	subID := uuid.New()
	problemID := uuid.New()

	fs := &likeFakeStore{
		inserted: true,
		sum: &store.SubmissionLikeSummary{
			AuthorID:     authorID,
			ProblemID:    problemID,
			ProblemTitle: "Sum Two Numbers",
			ProblemSlug:  "sum-two-numbers",
		},
	}
	b := broker.New()
	_, ch := b.Subscribe()

	h := NewCommunityHandler(fs, b)
	rec := httptest.NewRecorder()
	h.LikeSubmission(rec, withClaims(likeRequest(subID.String()), likerID.String()))

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", rec.Code, rec.Body.String())
	}
	if len(fs.notifs) != 1 {
		t.Fatalf("expected 1 notification, got %v", fs.notifs)
	}
	if !strings.Contains(fs.notifs[0], "solution_liked") || !strings.Contains(fs.notifs[0], "Sum Two Numbers") {
		t.Fatalf("unexpected notification: %v", fs.notifs[0])
	}

	select {
	case ev := <-ch:
		if ev.Type != "solution.liked" {
			t.Fatalf("expected solution.liked event, got %q", ev.Type)
		}
		data, ok := ev.Data.(map[string]interface{})
		if !ok {
			t.Fatalf("unexpected event data type: %T", ev.Data)
		}
		if data["user_id"] != authorID.String() {
			t.Fatalf("expected author user_id, got %v", data["user_id"])
		}
		if data["problem_slug"] != "sum-two-numbers" {
			t.Fatalf("expected problem slug, got %v", data["problem_slug"])
		}
	case <-time.After(100 * time.Millisecond):
		t.Fatal("timed out waiting for solution.liked event")
	}
}

func TestLikeNotificationSkippedOnDuplicateLike(t *testing.T) {
	fs := &likeFakeStore{inserted: false, sum: &store.SubmissionLikeSummary{
		AuthorID:     uuid.New(),
		ProblemID:    uuid.New(),
		ProblemTitle: "Sum Two Numbers",
		ProblemSlug:  "sum-two-numbers",
	}}
	b := broker.New()
	h := NewCommunityHandler(fs, b)
	rec := httptest.NewRecorder()
	h.LikeSubmission(rec, withClaims(likeRequest(uuid.NewString()), uuid.NewString()))

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	if len(fs.notifs) != 0 {
		t.Fatalf("expected no notification for duplicate like, got %v", fs.notifs)
	}
}

func TestLikeNotificationSkippedForSelfLike(t *testing.T) {
	userID := uuid.New()
	fs := &likeFakeStore{
		inserted: true,
		sum: &store.SubmissionLikeSummary{
			AuthorID:     userID,
			ProblemID:    uuid.New(),
			ProblemTitle: "Sum Two Numbers",
			ProblemSlug:  "sum-two-numbers",
		},
	}
	b := broker.New()
	h := NewCommunityHandler(fs, b)
	rec := httptest.NewRecorder()
	h.LikeSubmission(rec, withClaims(likeRequest(uuid.NewString()), userID.String()))

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	if len(fs.notifs) != 0 {
		t.Fatalf("expected no notification for self-like, got %v", fs.notifs)
	}
}