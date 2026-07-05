package auth

import (
	"testing"
	"time"
)

var (
	testUsername   = "testuser"
	testOnboarding = false
)

func TestHashPassword_Success(t *testing.T) {
	plainPassword := "mySecurePassword123!"
	hash, err := HashPassword(plainPassword)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if hash == plainPassword {
		t.Error("hash should not equal plainPassword")
	}

	if len(hash) == 0 {
		t.Error("hash should not be empty")
	}
}

func TestHashPassword_EmptyPassword(t *testing.T) {
	_, err := HashPassword("")
	if err == nil {
		t.Fatal("expected error for empty password")
	}
}

func TestComparePassword_Match(t *testing.T) {
	plainPassword := "mySecurePassword123!"
	hash, err := HashPassword(plainPassword)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	matches := ComparePassword(hash, plainPassword)
	if !matches {
		t.Error("expected passwords to match")
	}
}

func TestComparePassword_NoMatch(t *testing.T) {
	plainPassword := "mySecurePassword123!"
	wrongPassword := "wrongPassword456!"
	hash, err := HashPassword(plainPassword)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	matches := ComparePassword(hash, wrongPassword)
	if matches {
		t.Error("expected passwords to not match")
	}
}

func TestSignToken_Success(t *testing.T) {
	userID := "user-id-123"
	studentID := "student-001"
	role := "student"
	secret := "this-is-a-very-long-secret-string-of-at-least-32-chars"
	expiry := 24 * time.Hour

	token, err := SignToken(userID, studentID, testUsername, role, secret, expiry, testOnboarding)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(token) == 0 {
		t.Error("token should not be empty")
	}
}

func TestSignToken_EmptyUserID(t *testing.T) {
	_, err := SignToken("", "student-001", testUsername, "student", "secret", 24*time.Hour, testOnboarding)
	if err == nil {
		t.Fatal("expected error for empty userID")
	}
}

func TestSignToken_EmptyStudentID(t *testing.T) {
	_, err := SignToken("user-id", "", testUsername, "student", "secret", 24*time.Hour, testOnboarding)
	if err == nil {
		t.Fatal("expected error for empty studentID")
	}
}

func TestSignToken_EmptyRole(t *testing.T) {
	_, err := SignToken("user-id", "student-001", testUsername, "", "secret", 24*time.Hour, testOnboarding)
	if err == nil {
		t.Fatal("expected error for empty role")
	}
}

func TestSignToken_EmptySecret(t *testing.T) {
	_, err := SignToken("user-id", "student-001", testUsername, "student", "", 24*time.Hour, testOnboarding)
	if err == nil {
		t.Fatal("expected error for empty secret")
	}
}

func TestSignToken_InvalidExpiry(t *testing.T) {
	_, err := SignToken("user-id", "student-001", testUsername, "student", "secret", -1*time.Hour, testOnboarding)
	if err == nil {
		t.Fatal("expected error for negative expiry")
	}
}

func TestVerifyToken_Success(t *testing.T) {
	userID := "user-id-123"
	studentID := "student-001"
	role := "student"
	secret := "this-is-a-very-long-secret-string-of-at-least-32-chars"
	expiry := 24 * time.Hour

	token, err := SignToken(userID, studentID, testUsername, role, secret, expiry, testOnboarding)
	if err != nil {
		t.Fatalf("failed to sign token: %v", err)
	}

	claims, err := VerifyToken(token, secret)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("expected UserID %s, got %s", userID, claims.UserID)
	}
	if claims.StudentID != studentID {
		t.Errorf("expected StudentID %s, got %s", studentID, claims.StudentID)
	}
	if claims.Role != role {
		t.Errorf("expected Role %s, got %s", role, claims.Role)
	}
}

func TestVerifyToken_InvalidSecret(t *testing.T) {
	userID := "user-id-123"
	studentID := "student-001"
	role := "student"
	secret := "this-is-a-very-long-secret-string-of-at-least-32-chars"
	wrongSecret := "this-is-a-different-secret-string-longer-than-32"
	expiry := 24 * time.Hour

	token, err := SignToken(userID, studentID, testUsername, role, secret, expiry, testOnboarding)
	if err != nil {
		t.Fatalf("failed to sign token: %v", err)
	}

	_, err = VerifyToken(token, wrongSecret)
	if err == nil {
		t.Fatal("expected error for invalid secret")
	}
}

func TestVerifyToken_ExpiredToken(t *testing.T) {
	userID := "user-id-123"
	studentID := "student-001"
	role := "student"
	secret := "this-is-a-very-long-secret-string-of-at-least-32-chars"
	// Use a very short expiry so token expires quickly
	expiry := 1 * time.Millisecond

	token, err := SignToken(userID, studentID, testUsername, role, secret, expiry, testOnboarding)
	if err != nil {
		t.Fatalf("failed to sign token: %v", err)
	}

	// Sleep to ensure token expires
	time.Sleep(100 * time.Millisecond)

	_, err = VerifyToken(token, secret)
	if err == nil {
		t.Fatal("expected error for expired token")
	}
}

func TestVerifyToken_EmptyToken(t *testing.T) {
	secret := "this-is-a-very-long-secret-string-of-at-least-32-chars"

	_, err := VerifyToken("", secret)
	if err == nil {
		t.Fatal("expected error for empty token")
	}
}

func TestVerifyToken_EmptySecret(t *testing.T) {
	userID := "user-id-123"
	studentID := "student-001"
	role := "student"
	secret := "this-is-a-very-long-secret-string-of-at-least-32-chars"
	expiry := 24 * time.Hour

	token, err := SignToken(userID, studentID, testUsername, role, secret, expiry, testOnboarding)
	if err != nil {
		t.Fatalf("failed to sign token: %v", err)
	}

	_, err = VerifyToken(token, "")
	if err == nil {
		t.Fatal("expected error for empty secret")
	}
}
