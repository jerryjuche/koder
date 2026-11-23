package enricher

import (
	"context"
	"strings"
	"testing"

	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
)

func TestNarrativeExtractorStreamsAcrossChunks(t *testing.T) {
	full := `{"summary":"Hello world","headline":"H"}`
	ext := newNarrativeExtractor("summary")

	var got strings.Builder
	// Feed one byte at a time, the worst case for a streaming provider.
	for i := 0; i < len(full); i++ {
		got.WriteString(ext.Push(full[:i+1]))
	}
	if got.String() != "Hello world" {
		t.Errorf("streamed %q, want %q", got.String(), "Hello world")
	}
	if again := ext.Push(full); again != "" {
		t.Errorf("extractor emitted duplicate text: %q", again)
	}
}

func TestNarrativeExtractorDecodesEscapes(t *testing.T) {
	raw := `{"summary":"Line one\nLine **two** \"quoted\" \u00e9 and \\ end","headline":"H"}`
	ext := newNarrativeExtractor("summary")
	got := ext.Push(raw)
	want := "Line one\nLine **two** \"quoted\" é and \\ end"
	if got != want {
		t.Errorf("decoded %q, want %q", got, want)
	}
}

func TestNarrativeExtractorWithholdsIncompleteEscapes(t *testing.T) {
	ext := newNarrativeExtractor("summary")
	// A trailing backslash means the escape is split across chunks; the
	// decoder must not emit anything it cannot decode yet.
	if got := ext.Push(`{"summary":"done\`); got != "done" {
		t.Errorf("first chunk = %q, want %q", got, "done")
	}
	if got := ext.Push(`{"summary":"done\`); got != "" {
		t.Errorf("re-feeding the same partial text emitted %q", got)
	}
	if got := ext.Push(`{"summary":"done\ntail`); got != "\ntail" {
		t.Errorf("resumed chunk = %q, want %q", got, "\ntail")
	}
}

func TestNarrativeExtractorWithoutKey(t *testing.T) {
	ext := newNarrativeExtractor("summary")
	if got := ext.Push(`{"headline":"no narrative here"}`); got != "" {
		t.Errorf("emitted %q for a document without the key", got)
	}
}

func TestGenerateInsightsStreamForwardsNarrative(t *testing.T) {
	fp := &fakeProvider{out: `{"summary":"## Today\n\n**5 of 10** passed.","headline":"Half passed","highlights":[],"concerns":[],"recommendations":[],"follow_ups":["Who struggled?"],"metrics_used":["totals.pass_rate"]}`}
	e := &Enricher{cfg: &config.Config{NVIDIAModel: "test-model"}, provider: fp}

	var streamed strings.Builder
	resp, err := e.GenerateInsightsStream(context.Background(), &AdminInsightsRequest{
		Question: "How was today?",
		Period:   "today",
		Snapshot: testInsightsSnapshot(),
	}, func(delta string) error {
		streamed.WriteString(delta)
		return nil
	})
	if err != nil {
		t.Fatalf("GenerateInsightsStream: %v", err)
	}
	if resp.Report == nil || resp.Report.Summary == "" {
		t.Fatalf("no report returned")
	}
	if streamed.String() != resp.Report.Summary {
		t.Errorf("streamed %q, want %q", streamed.String(), resp.Report.Summary)
	}
}

func TestGenerateInsightsPromptCarriesHistoryAndStudent(t *testing.T) {
	fp := &fakeProvider{out: `{"headline":"Aisha is steady","summary":"## Aisha\n\nShe solved 4 problems and is level 5."}`}
	e := &Enricher{cfg: &config.Config{}, provider: fp}

	_, err := e.GenerateInsights(context.Background(), &AdminInsightsRequest{
		Question: "why did she slow down?",
		Period:   "week",
		Snapshot: testInsightsSnapshot(),
		History: []AdminInsightTurn{
			{Role: "user", Content: "how is Aisha doing?"},
			{Role: "assistant", Content: "She solved four problems."},
		},
		Subject: &store.StudentInsight{UserID: "u9", Name: "Aisha Bello", LifetimeXP: 4200, Level: 5},
	})
	if err != nil {
		t.Fatalf("GenerateInsights: %v", err)
	}

	if !strings.Contains(fp.user, "CONVERSATION HISTORY") {
		t.Error("history block missing from the prompt")
	}
	if !strings.Contains(fp.user, "ATLAS: She solved four problems.") {
		t.Error("assistant history turn missing")
	}
	if !strings.Contains(fp.user, "STUDENT PROFILE") || !strings.Contains(fp.user, "Aisha Bello") {
		t.Error("student profile missing from the prompt")
	}
	if !strings.Contains(fp.system, "Resolve follow-ups from CONVERSATION HISTORY") {
		t.Error("system prompt does not instruct follow-up resolution")
	}
}
