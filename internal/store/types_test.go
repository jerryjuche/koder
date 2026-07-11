package store

import (
	"testing"
)

func TestFlexibleBool_UnmarshalJSON(t *testing.T) {
	tests := []struct {
		input string
		want  bool
	}{
		{`true`, true},
		{`"true"`, true},
		{`false`, false},
		{`"false"`, false},
	}

	for _, tc := range tests {
		var b FlexibleBool
		err := b.UnmarshalJSON([]byte(tc.input))
		if err != nil {
			t.Errorf("UnmarshalJSON(%q) unexpected error: %v", tc.input, err)
		}
		if bool(b) != tc.want {
			t.Errorf("UnmarshalJSON(%q) = %v, want %v", tc.input, bool(b), tc.want)
		}
	}
}

func TestFlexibleBool_UnmarshalJSON_Invalid(t *testing.T) {
	tests := []string{
		`"invalid"`,
		`123`,
		`null`,
		`""`,
		`"TRUE"`,
		`"FALSE"`,
	}

	for _, input := range tests {
		var b FlexibleBool
		err := b.UnmarshalJSON([]byte(input))
		if err == nil {
			t.Errorf("expected error for %q", input)
		}
	}
}
