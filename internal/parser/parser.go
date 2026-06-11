package parser

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/google/uuid"
)

type Parser struct {
	baseDir string
}

type RawProblem struct {
	Slug       string
	Module     string
	SourceHash string
	RawReadme  string
	RepoURL    string
}

func NewParser(baseDir string) *Parser {
	return &Parser{baseDir: baseDir}
}

func (p *Parser) IngestGitHubRepo(ctx context.Context, repoURL string) (*RawProblem, error) {
	if repoURL == "" {
		return nil, fmt.Errorf("repo_url cannot be empty")
	}

	slug, module, err := parseRepoMetadata(repoURL)
	if err != nil {
		return nil, fmt.Errorf("invalid repository URL: %w", err)
	}

	repoPath, cleanup, err := p.cloneRepository(ctx, repoURL)
	if err != nil {
		return nil, err
	}
	defer cleanup()

	readme, err := extractReadme(repoPath)
	if err != nil {
		return nil, fmt.Errorf("failed to extract README: %w", err)
	}

	sourceHash := computeSourceHash(readme)

	return &RawProblem{
		Slug:       slug,
		Module:     module,
		SourceHash: sourceHash,
		RawReadme:  readme,
		RepoURL:    repoURL,
	}, nil
}

func (p *Parser) cloneRepository(ctx context.Context, repoURL string) (string, func(), error) {
	tempDir := filepath.Join(p.baseDir, uuid.NewString())
	if err := os.MkdirAll(tempDir, 0o755); err != nil {
		return "", nil, fmt.Errorf("failed to create temp directory: %w", err)
	}

	cleanup := func() {
		_ = os.RemoveAll(tempDir)
	}

	cmd := exec.CommandContext(ctx, "git", "clone", "--depth", "1", repoURL, tempDir)
	output, err := cmd.CombinedOutput()
	if err != nil {
		cleanup()
		return "", nil, fmt.Errorf("git clone failed: %w - %s", err, strings.TrimSpace(string(output)))
	}

	return tempDir, cleanup, nil
}

func extractReadme(repoPath string) (string, error) {
	entries, err := os.ReadDir(repoPath)
	if err != nil {
		return "", fmt.Errorf("unable to read repository directory: %w", err)
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		name := entry.Name()
		lower := strings.ToLower(name)
		if lower == "readme" || lower == "readme.md" || lower == "readme.markdown" || lower == "readme.txt" {
			readmePath := filepath.Join(repoPath, name)
			bytes, err := os.ReadFile(readmePath)
			if err != nil {
				return "", fmt.Errorf("unable to read %s: %w", name, err)
			}
			return string(bytes), nil
		}
	}

	return "", fmt.Errorf("README file not found in repository root")
}

func computeSourceHash(rawReadme string) string {
	hash := sha256.Sum256([]byte(rawReadme))
	return hex.EncodeToString(hash[:])
}

func parseRepoMetadata(repoURL string) (slug string, module string, err error) {
	if strings.HasPrefix(repoURL, "git@") {
		return parseGitSSHURL(repoURL)
	}

	parsed, err := url.Parse(repoURL)
	if err != nil {
		parsed, err = url.Parse("https://" + repoURL)
		if err != nil {
			return "", "", err
		}
	}

	pathValue := strings.TrimSuffix(strings.Trim(parsed.Path, "/"), ".git")
	if pathValue == "" {
		return "", "", fmt.Errorf("repository path cannot be empty")
	}

	slug = normalizeSlug(filepath.Base(pathValue))
	module = normalizeModule(pathValue)
	return slug, module, nil
}

func parseGitSSHURL(repoURL string) (slug string, module string, err error) {
	parts := strings.SplitN(repoURL, ":", 2)
	if len(parts) != 2 {
		return "", "", fmt.Errorf("invalid ssh repository URL")
	}

	pathValue := strings.TrimSuffix(strings.Trim(parts[1], "/"), ".git")
	if pathValue == "" {
		return "", "", fmt.Errorf("repository path cannot be empty")
	}

	slug = normalizeSlug(filepath.Base(pathValue))
	module = normalizeModule(pathValue)
	return slug, module, nil
}

func normalizeSlug(name string) string {
	name = strings.TrimSpace(name)
	name = strings.TrimSuffix(name, ".git")
	name = strings.Trim(name, "/")
	name = strings.ToLower(name)
	nonAlpha := regexp.MustCompile(`[^a-z0-9._-]+`)
	return nonAlpha.ReplaceAllString(name, "-")
}

func normalizeModule(pathValue string) string {
	normalized := strings.TrimSpace(pathValue)
	normalized = strings.TrimSuffix(normalized, ".git")
	normalized = strings.Trim(normalized, "/")
	return strings.ToLower(normalized)
}
