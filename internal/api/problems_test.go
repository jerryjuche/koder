package api

import (
	"testing"

	"github.com/jerryjuche/koder/internal/store"
)

func TestApplyLockedModuleFiltering(t *testing.T) {
	problems := []store.Problem{
		{Slug: "alpha", Module: "math"},
		{Slug: "beta", Module: "physics"},
	}

	locked := map[string]bool{"physics": true}

	filtered := applyLockedModuleFiltering(problems, locked, false)
	if len(filtered) != 1 {
		t.Fatalf("expected 1 unlocked problem, got %d", len(filtered))
	}
	if filtered[0].Slug != "alpha" {
		t.Fatalf("expected alpha to remain, got %s", filtered[0].Slug)
	}
	if filtered[0].Locked {
		t.Fatalf("expected unlocked problems to have Locked=false")
	}

	adminFiltered := applyLockedModuleFiltering(problems, locked, true)
	if len(adminFiltered) != 2 {
		t.Fatalf("expected admin to receive all problems, got %d", len(adminFiltered))
	}
	if adminFiltered[1].Locked != true {
		t.Fatalf("expected locked module problems to be marked locked for admin view")
	}
}
