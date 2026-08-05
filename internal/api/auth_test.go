package api

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
)

// fakeRefreshStore implements only the store methods the RefreshToken handler
// reaches for the revoked-token branch (rotation-grace decision).
type fakeRefreshStore struct {
	store.Store
	token               *store.RefreshToken
	getErr              error
	revokeAllCalled     bool
	revokeAllCallUserID string
}

func (f *fakeRefreshStore) GetRefreshToken(_ context.Context, _ string) (*store.RefreshToken, error) {
	return f.token, f.getErr
}

func (f *fakeRefreshStore) RevokeAllUserRefreshTokens(_ context.Context, userID uuid.UUID) error {
	f.revokeAllCalled = true
	f.revokeAllCallUserID = userID.String()
	return nil
}

func refreshTokenRow(revokedAt *time.Time) *store.RefreshToken {
	return &store.RefreshToken{
		ID:        pgtype.UUID{Bytes: uuid.MustParse("22222222-2222-2222-2222-222222222222"), Valid: true},
		UserID:    pgtype.UUID{Bytes: uuid.MustParse("11111111-1111-1111-1111-111111111111"), Valid: true},
		TokenHash: "stub-hash",
		ExpiresAt: time.Now().Add(24 * time.Hour),
		Revoked:   true,
		RevokedAt: revokedAt,
	}
}

func callRefresh(t *testing.T, f *fakeRefreshStore) *httptest.ResponseRecorder {
	t.Helper()
	h := NewAuthHandler(f, &config.Config{})
	body, _ := json.Marshal(map[string]string{"refresh_token": "any-token"})
	req := httptest.NewRequest(http.MethodPost, "/auth/refresh", strings.NewReader(string(body)))
	rec := httptest.NewRecorder()
	h.RefreshToken(rec, req)
	return rec
}

func TestRefreshToken_FreshReuseIsBenignRace(t *testing.T) {
	now := time.Now()
	f := &fakeRefreshStore{token: refreshTokenRow(&now)}
	rec := callRefresh(t, f)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), "REFRESH_TOKEN_ROTATED") {
		t.Fatalf("expected REFRESH_TOKEN_ROTATED code, got %s", rec.Body.String())
	}
	if f.revokeAllCalled {
		t.Fatal("expected NO cascade revocation for a freshly-rotated token (concurrent-refresh race)")
	}
}

func TestRefreshToken_StaleReuseTriggersCascadeRevoke(t *testing.T) {
	old := time.Now().Add(-time.Minute)
	f := &fakeRefreshStore{token: refreshTokenRow(&old)}
	rec := callRefresh(t, f)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), "REFRESH_TOKEN_REVOKED") {
		t.Fatalf("expected REFRESH_TOKEN_REVOKED code, got %s", rec.Body.String())
	}
	if !f.revokeAllCalled {
		t.Fatal("expected cascade revocation for stale reuse (replay attack)")
	}
	if f.revokeAllCallUserID != "11111111-1111-1111-1111-111111111111" {
		t.Fatalf("expected revoke-all for the token owner, got %q", f.revokeAllCallUserID)
	}
}

func TestRefreshToken_RevokedWithoutTimestampTreatedAsStale(t *testing.T) {
	// A revoked row with no revoked_at (legacy/pre-migration) is treated as
	// stale reuse and revokes the user's sessions — safe default.
	f := &fakeRefreshStore{token: refreshTokenRow(nil)}
	rec := callRefresh(t, f)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), "REFRESH_TOKEN_REVOKED") {
		t.Fatalf("expected REFRESH_TOKEN_REVOKED code, got %s", rec.Body.String())
	}
	if !f.revokeAllCalled {
		t.Fatal("expected cascade revocation when revoked_at is missing")
	}
}

func TestRefreshToken_LookupErrorIsServerError(t *testing.T) {
	f := &fakeRefreshStore{getErr: errors.New("db down")}
	rec := callRefresh(t, f)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500 on lookup error, got %d", rec.Code)
	}
}
