package api

import (
	"strings"
	"unicode"

	"github.com/jerryjuche/koder/internal/store"
)

// ── Named-student resolution ───────────────────────────────────────────────
//
// Grouping the model's answer for "how is Aisha doing?" needs Aisha's profile,
// and the model cannot look her up. The handler resolves the mention itself
// against the student directory, deterministically, before generating:
//
//  1. a full name ("aisha bello") or username (@aisha, aisha_b) beats
//  2. a unique first name ("aisha") of at least three characters, which is only
//     accepted when exactly one student matches — ambiguous names resolve to
//     nobody rather than to the wrong student.
//
// No email or id is ever sent to the model beyond the matched profile.

// questionTokens lowercases a question into word tokens, dropping punctuation
// but keeping underscores and hyphens (usernames rely on them).
func questionTokens(question string) []string {
	fields := strings.FieldsFunc(strings.ToLower(question), func(r rune) bool {
		return !(unicode.IsLetter(r) || unicode.IsDigit(r) || r == '_' || r == '-')
	})
	out := make([]string, 0, len(fields))
	for _, f := range fields {
		f = strings.Trim(f, "-_")
		if f != "" {
			out = append(out, f)
		}
	}
	return out
}

// resolveStudentMention returns the single student the question refers to, or
// nil when there is no confident match.
func resolveStudentMention(question string, directory []store.InsightsStudentRef) *store.InsightsStudentRef {
	if len(directory) == 0 {
		return nil
	}
	tokens := questionTokens(question)
	if len(tokens) == 0 {
		return nil
	}

	lower := " " + strings.Join(tokens, " ") + " "

	// 1. Full name match (two or more words), longest name wins so
	// "mary ann" is not shadowed by a student called "Mary".
	var bestFull *store.InsightsStudentRef
	bestLen := 0
	for i := range directory {
		name := normalizeName(directory[i].Name)
		if name == "" || !strings.Contains(name, " ") {
			continue
		}
		if strings.Contains(lower, " "+name+" ") && len(name) > bestLen {
			bestFull = &directory[i]
			bestLen = len(name)
		}
	}
	if bestFull != nil {
		return bestFull
	}

	// 2. Username match, exact token or @handle.
	for i := range directory {
		username := normalizeName(directory[i].Username)
		if username == "" {
			continue
		}
		for _, t := range tokens {
			if t == username || t == "@"+username {
				return &directory[i]
			}
		}
	}

	// 3. Unique first name.
	var match *store.InsightsStudentRef
	matches := 0
	for i := range directory {
		first := firstWord(directory[i].Name)
		if len([]rune(first)) < 3 {
			continue
		}
		if containsToken(tokens, first) {
			matches++
			match = &directory[i]
			if matches > 1 {
				return nil // ambiguous — do not guess
			}
		}
	}
	return match
}

func normalizeName(s string) string {
	return strings.Join(strings.Fields(strings.ToLower(s)), " ")
}

func firstWord(s string) string {
	fields := strings.Fields(strings.ToLower(s))
	if len(fields) == 0 {
		return ""
	}
	return fields[0]
}

func containsToken(tokens []string, want string) bool {
	for _, t := range tokens {
		if t == want {
			return true
		}
	}
	return false
}
