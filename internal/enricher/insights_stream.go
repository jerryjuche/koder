package enricher

import "strings"

// ── Incremental JSON narrative extraction ─────────────────────────────────
//
// The analyst returns one JSON object. To stream the answer as it is written we
// need the decoded value of the "summary" string from a partially received
// document. encoding/json cannot decode a truncated object, so this scanner
// walks the raw text once, decodes JSON string escapes, and reports how much of
// the narrative is final. It never guesses: an incomplete escape or an
// unterminated \uXXXX sequence is withheld until more bytes arrive.

type narrativeExtractor struct {
	key     string
	needle  string
	emitted int
	done    bool
}

func newNarrativeExtractor(key string) *narrativeExtractor {
	return &narrativeExtractor{key: key, needle: `"` + key + `"`}
}

// Push takes the raw document received so far and returns only the newly
// decoded narrative text. It is idempotent: feeding the same accumulated text
// twice returns "".
func (n *narrativeExtractor) Push(raw string) string {
	if n.done {
		return ""
	}

	keyIdx := strings.Index(raw, n.needle)
	if keyIdx < 0 {
		return ""
	}
	rest := raw[keyIdx+len(n.needle):]

	colon := strings.IndexByte(rest, ':')
	if colon < 0 {
		return ""
	}
	rest = rest[colon+1:]

	// Skip whitespace between the colon and the opening quote.
	start := 0
	for start < len(rest) && (rest[start] == ' ' || rest[start] == '\t' || rest[start] == '\n' || rest[start] == '\r') {
		start++
	}
	if start >= len(rest) || rest[start] != '"' {
		return ""
	}
	rest = rest[start+1:]

	var decoded strings.Builder
	for i := 0; i < len(rest); {
		c := rest[i]
		switch c {
		case '"':
			// Closing quote: the value is final.
			n.done = true
			return n.sliceNew(decoded.String())
		case '\\':
			if i+1 >= len(rest) {
				// Escape straddles the chunk boundary; wait for more bytes.
				return n.sliceNew(decoded.String())
			}
			esc := rest[i+1]
			switch esc {
			case '"':
				decoded.WriteByte('"')
				i += 2
			case '\\':
				decoded.WriteByte('\\')
				i += 2
			case '/':
				decoded.WriteByte('/')
				i += 2
			case 'b':
				decoded.WriteByte('\b')
				i += 2
			case 'f':
				decoded.WriteByte('\f')
				i += 2
			case 'n':
				decoded.WriteByte('\n')
				i += 2
			case 'r':
				decoded.WriteByte('\r')
				i += 2
			case 't':
				decoded.WriteByte('\t')
				i += 2
			case 'u':
				if i+6 > len(rest) {
					// Partial \uXXXX; wait for the rest.
					return n.sliceNew(decoded.String())
				}
				r, ok := decodeUnicodeEscape(rest[i+2 : i+6])
				if !ok {
					// Malformed escape — surface it literally and move on, so a
					// provider quirk cannot stall the whole stream.
					decoded.WriteString(rest[i : i+6])
					i += 6
					continue
				}
				decoded.WriteRune(r)
				i += 6
			default:
				decoded.WriteByte(esc)
				i += 2
			}
		default:
			decoded.WriteByte(c)
			i++
		}
	}

	return n.sliceNew(decoded.String())
}

// sliceNew returns the suffix of value that has not been emitted yet.
func (n *narrativeExtractor) sliceNew(value string) string {
	runes := []rune(value)
	if n.emitted >= len(runes) {
		return ""
	}
	chunk := string(runes[n.emitted:])
	n.emitted = len(runes)
	return chunk
}

func decodeUnicodeEscape(hex string) (rune, bool) {
	if len(hex) != 4 {
		return 0, false
	}
	var v rune
	for _, c := range hex {
		v <<= 4
		switch {
		case c >= '0' && c <= '9':
			v += c - '0'
		case c >= 'a' && c <= 'f':
			v += c - 'a' + 10
		case c >= 'A' && c <= 'F':
			v += c - 'A' + 10
		default:
			return 0, false
		}
	}
	return v, true
}
