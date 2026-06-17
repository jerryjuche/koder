package parser

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io/fs"
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
	Type       string
}

func NewParser(baseDir string) *Parser {
	return &Parser{baseDir: baseDir}
}

func (p *Parser) IngestGitHubRepo(ctx context.Context, repoURL string) ([]*RawProblem, error) {
	if repoURL == "" {
		return nil, fmt.Errorf("repo_url cannot be empty")
	}

	repoSlug, repoModule, err := parseRepoMetadata(repoURL)
	if err != nil {
		return nil, fmt.Errorf("invalid repository URL: %w", err)
	}

	repoPath, cleanup, err := p.cloneRepository(ctx, repoURL)
	if err != nil {
		return nil, err
	}
	defer cleanup()

	problems, err := collectExerciseReadmes(repoPath, repoURL, repoSlug, repoModule)
	if err != nil {
		return nil, err
	}

	if len(problems) == 0 {
		readme, err := extractReadme(repoPath)
		if err != nil {
			return nil, fmt.Errorf("no exercises found and root README extraction failed: %w", err)
		}

		problems = append(problems, &RawProblem{
			Slug:       repoSlug,
			Module:     repoModule,
			SourceHash: computeSourceHash(readme),
			RawReadme:  strings.TrimSpace(readme),
			RepoURL:    repoURL,
			Type:       detectProblemType(readme),
		})
	}

	return problems, nil
}

func collectExerciseReadmes(repoPath, repoURL, repoSlug, repoModule string) ([]*RawProblem, error) {
	var problems []*RawProblem

	err := filepath.WalkDir(repoPath, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		if !isReadmeFile(d.Name()) {
			return nil
		}

		raw, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("unable to read %s: %w", path, err)
		}

		content := strings.TrimSpace(string(raw))
		if content == "" {
			return nil
		}

		dir := filepath.Dir(path)
		relPath, err := filepath.Rel(repoPath, dir)
		if err != nil {
			return err
		}

		slashPath := filepath.ToSlash(relPath)
		if slashPath == "." || (!strings.HasPrefix(slashPath, "exercises/") && slashPath != "exercises" && !strings.Contains(slashPath, "/exercises/")) {
			return nil
		}

		exerciseSlug := normalizeSlug(fmt.Sprintf("%s-%s", repoSlug, strings.ReplaceAll(slashPath, "/", "-")))
		problems = append(problems, &RawProblem{
			Slug:       exerciseSlug,
			Module:     normalizeModule(filepath.Join(repoModule, relPath)),
			SourceHash: computeSourceHash(content),
			RawReadme:  content,
			RepoURL:    repoURL,
			Type:       detectProblemType(content),
		})
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to scan repository for exercise READMEs: %w", err)
	}

	return problems, nil
}

func isReadmeFile(name string) bool {
	lower := strings.ToLower(name)
	return lower == "readme" || lower == "readme.md" || lower == "readme.markdown" || lower == "readme.txt"
}

func detectProblemType(rawReadme string) string {
	lower := strings.ToLower(rawReadme)
	if strings.Contains(lower, "expected function") {
		return "function"
	}
	return "program"
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
		if isReadmeFile(name) {
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
