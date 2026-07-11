package parser

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"strings"
	"testing"
)

func TestIsReadmeFile(t *testing.T) {
	tests := []struct {
		name string
		want bool
	}{
		{"readme", true},
		{"README", true},
		{"Readme.md", true},
		{"README.markdown", true},
		{"readme.txt", true},
		{"README.TXT", true},
		{"notreadme.md", false},
		{"main.go", false},
		{"", false},
		{"readme.md.txt", false},
	}

	for _, tc := range tests {
		got := isReadmeFile(tc.name)
		if got != tc.want {
			t.Errorf("isReadmeFile(%q) = %v, want %v", tc.name, got, tc.want)
		}
	}
}

func TestDetectProblemType(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"Expected function: myFunc", "function"},
		{"expected function", "function"},
		{"## Description\nExpected function signature: foo", "function"},
		{"plain text without the trigger phrase", "program"},
		{"", "program"},
		{"random markdown content\n\nWith newlines", "program"},
	}

	for _, tc := range tests {
		got := detectProblemType(tc.input)
		if got != tc.want {
			t.Errorf("detectProblemType(%q) = %q, want %q", tc.input, got, tc.want)
		}
	}
}

func TestNormalizeSlug(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"Hello World", "hello-world"},
		{"UPPERCASE Slugs!", "uppercase-slugs-"},
		{"special/chars_here", "special-chars_here"},
		{"...dots...", "...dots..."},
		{"  spaces  ", "spaces"},
		{"repo.git", "repo"},
		{"/leading/trail/", "leading-trail"},
		{"", ""},
		{"a-b-c", "a-b-c"},
		{"test.problem_01", "test.problem_01"},
	}

	for _, tc := range tests {
		got := normalizeSlug(tc.input)
		if got != tc.want {
			t.Errorf("normalizeSlug(%q) = %q, want %q", tc.input, got, tc.want)
		}
	}
}

func TestNormalizeModule(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"Path/To/Module", "path/to/module"},
		{"/leading/slash/", "leading/slash"},
		{"repo.git", "repo"},
		{"UPPERCASE", "uppercase"},
		{"  spaces/trail  ", "spaces/trail"},
		{"", ""},
	}

	for _, tc := range tests {
		got := normalizeModule(tc.input)
		if got != tc.want {
			t.Errorf("normalizeModule(%q) = %q, want %q", tc.input, got, tc.want)
		}
	}
}

func TestComputeSourceHash(t *testing.T) {
	tests := []struct {
		input string
	}{
		{"hello world"},
		{""},
		{"multiple\nlines\ncontent"},
		{"  with trailing  "},
	}

	for _, tc := range tests {
		got := computeSourceHash(tc.input)
		expected := sha256.Sum256([]byte(tc.input))
		want := hex.EncodeToString(expected[:])
		if got != want {
			t.Errorf("computeSourceHash(%q) = %q, want %q", tc.input, got, want)
		}
	}
}

func TestComputeSourceHash_Deterministic(t *testing.T) {
	input := "same content"
	h1 := computeSourceHash(input)
	h2 := computeSourceHash(input)
	if h1 != h2 {
		t.Error("hash should be deterministic")
	}
}

func TestComputeSourceHash_Different(t *testing.T) {
	h1 := computeSourceHash("content A")
	h2 := computeSourceHash("content B")
	if h1 == h2 {
		t.Error("different inputs should produce different hashes")
	}
}

func TestCleanRepoURL(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{
			input: "https://github.com/jerryjuche/koder",
			want:  "https://github.com/jerryjuche/koder",
		},
		{
			input: "https://github.com/jerryjuche/koder.git",
			want:  "https://github.com/jerryjuche/koder",
		},
		{
			input: "https://github.com/jerryjuche/koder/tree/main/subdir",
			want:  "https://github.com/jerryjuche/koder",
		},
		{
			input: "https://github.com/jerryjuche/koder/blob/main/main.go",
			want:  "https://github.com/jerryjuche/koder",
		},
		{
			input: "git@github.com:jerryjuche/koder.git",
			want:  "git@github.com:jerryjuche/koder",
		},
		{
			input: "  https://github.com/jerryjuche/koder  ",
			want:  "https://github.com/jerryjuche/koder",
		},
	}

	for _, tc := range tests {
		got := cleanRepoURL(tc.input)
		if got != tc.want {
			t.Errorf("cleanRepoURL(%q) = %q, want %q", tc.input, got, tc.want)
		}
	}
}

func TestParseGitHubURL(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		wantURL string
		wantSub string
		wantErr bool
	}{
		{
			name:    "simple repo",
			input:   "https://github.com/jerryjuche/koder",
			wantURL: "https://github.com/jerryjuche/koder",
			wantSub: "",
		},
		{
			name:    "repo with .git",
			input:   "https://github.com/jerryjuche/koder.git",
			wantURL: "https://github.com/jerryjuche/koder",
			wantSub: "",
		},
		{
			name:    "repo with tree path",
			input:   "https://github.com/jerryjuche/koder/tree/main/exercises",
			wantURL: "https://github.com/jerryjuche/koder",
			wantSub: "exercises",
		},
		{
			name:    "repo with blob path",
			input:   "https://github.com/jerryjuche/koder/blob/main/src/main.go",
			wantURL: "https://github.com/jerryjuche/koder",
			wantSub: "src/main.go",
		},
		{
			name:    "ssh url",
			input:   "git@github.com:jerryjuche/koder.git",
			wantURL: "git@github.com:jerryjuche/koder",
			wantSub: "",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			repoURL, subPath, err := parseGitHubURL(tc.input)
			if tc.wantErr && err == nil {
				t.Fatal("expected error")
			}
			if !tc.wantErr && err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if repoURL != tc.wantURL {
				t.Errorf("repoURL = %q, want %q", repoURL, tc.wantURL)
			}
			if subPath != tc.wantSub {
				t.Errorf("subPath = %q, want %q", subPath, tc.wantSub)
			}
		})
	}
}

func TestParseRepoMetadata(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		wantSlug string
		wantMod  string
		wantErr  bool
	}{
		{
			name:     "https github",
			input:    "https://github.com/jerryjuche/koder",
			wantSlug: "koder",
			wantMod:  "jerryjuche/koder",
		},
		{
			name:     "ssh github",
			input:    "git@github.com:jerryjuche/koder.git",
			wantSlug: "koder",
			wantMod:  "jerryjuche/koder",
		},
		{
			name:     "with .git suffix",
			input:    "https://github.com/jerryjuche/koder.git",
			wantSlug: "koder",
			wantMod:  "jerryjuche/koder",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			slug, mod, err := parseRepoMetadata(tc.input)
			if tc.wantErr && err == nil {
				t.Fatal("expected error")
			}
			if !tc.wantErr && err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if slug != tc.wantSlug {
				t.Errorf("slug = %q, want %q", slug, tc.wantSlug)
			}
			if mod != tc.wantMod {
				t.Errorf("module = %q, want %q", mod, tc.wantMod)
			}
		})
	}
}

func TestParseGitSSHURL(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		wantSlug string
		wantMod  string
		wantErr  bool
	}{
		{
			name:     "valid ssh",
			input:    "git@github.com:jerryjuche/koder.git",
			wantSlug: "koder",
			wantMod:  "jerryjuche/koder",
		},
		{
			name:    "no colon",
			input:   "git@github.com/jerryjuche/koder",
			wantErr: true,
		},
		{
			name:    "empty path",
			input:   "git@github.com:",
			wantErr: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			slug, mod, err := parseGitSSHURL(tc.input)
			if tc.wantErr && err == nil {
				t.Fatal("expected error")
			}
			if !tc.wantErr && err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if slug != tc.wantSlug {
				t.Errorf("slug = %q, want %q", slug, tc.wantSlug)
			}
			if mod != tc.wantMod {
				t.Errorf("module = %q, want %q", mod, tc.wantMod)
			}
		})
	}
}

func TestNewParser(t *testing.T) {
	p := NewParser("/tmp/test")
	if p == nil {
		t.Fatal("NewParser returned nil")
	}
}

func TestIngestGitHubRepo_EmptyURL(t *testing.T) {
	p := NewParser("/tmp/test")
	_, err := p.IngestGitHubRepo(context.Background(), "")
	if err == nil {
		t.Error("expected error for empty URL")
	}
	if err != nil && !strings.Contains(err.Error(), "cannot be empty") {
		t.Errorf("unexpected error message: %v", err)
	}
}
