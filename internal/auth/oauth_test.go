package auth

import (
	"crypto/rand"
	"crypto/rsa"
	"encoding/base64"
	"math/big"
	"testing"

	"github.com/golang-jwt/jwt/v5"
)

func TestIsExpectedAudience(t *testing.T) {
	tests := []struct {
		name     string
		audience jwt.ClaimStrings
		expected string
		want     bool
	}{
		{"exact match", jwt.ClaimStrings{"my-client-id"}, "my-client-id", true},
		{"multiple matches", jwt.ClaimStrings{"other", "my-client-id", "another"}, "my-client-id", true},
		{"no match", jwt.ClaimStrings{"other", "wrong"}, "my-client-id", false},
		{"empty audience", jwt.ClaimStrings{}, "my-client-id", false},
		{"nil audience", nil, "my-client-id", false},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := isExpectedAudience(tc.audience, tc.expected)
			if got != tc.want {
				t.Errorf("isExpectedAudience(%v, %q) = %v, want %v", tc.audience, tc.expected, got, tc.want)
			}
		})
	}
}

func TestIsExpectedIssuer(t *testing.T) {
	tests := []struct {
		issuer string
		want   bool
	}{
		{"https://accounts.google.com", true},
		{"accounts.google.com", true},
		{"https://other.com", false},
		{"", false},
		{"accounts.google.com.evil.com", false},
	}

	for _, tc := range tests {
		got := isExpectedIssuer(tc.issuer)
		if got != tc.want {
			t.Errorf("isExpectedIssuer(%q) = %v, want %v", tc.issuer, got, tc.want)
		}
	}
}

func TestJwksKeyToPublicKey_ValidKey(t *testing.T) {
	// Generate a real RSA key pair to test with
	realKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("failed to generate RSA key: %v", err)
	}

	n := base64.RawURLEncoding.EncodeToString(realKey.N.Bytes())
	e := base64.RawURLEncoding.EncodeToString(big.NewInt(int64(realKey.E)).Bytes())

	key := jwksKey{
		Kid: "test-key",
		Kty: "RSA",
		Use: "sig",
		N:   n,
		E:   e,
		Alg: "RS256",
	}

	pub, err := jwksKeyToPublicKey(key)
	if err != nil {
		t.Fatalf("jwksKeyToPublicKey() unexpected error: %v", err)
	}
	if pub == nil {
		t.Fatal("jwksKeyToPublicKey() returned nil")
	}
	if pub.N.Cmp(realKey.N) != 0 {
		t.Error("modulus mismatch")
	}
	if pub.E != realKey.E {
		t.Error("exponent mismatch")
	}
}

func TestJwksKeyToPublicKey_InvalidBase64(t *testing.T) {
	key := jwksKey{
		N: "not-valid-base64!!!",
		E: "AQAB",
	}
	_, err := jwksKeyToPublicKey(key)
	if err == nil {
		t.Error("expected error for invalid base64 modulus")
	}
}

func TestJwksKeyToPublicKey_InvalidExponent(t *testing.T) {
	key := jwksKey{
		N: "YWJj",
		E: "not-valid!!!",
	}
	_, err := jwksKeyToPublicKey(key)
	if err == nil {
		t.Error("expected error for invalid base64 exponent")
	}
}
