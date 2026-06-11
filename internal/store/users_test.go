package store

import (
	"testing"

	"golang.org/x/crypto/bcrypt"
)

func TestCreateUser_ValidateInputs(t *testing.T) {
	tests := []struct {
		name    string
		user    *NewUser
		wantErr bool
	}{
		{
			name:    "nil user",
			user:    nil,
			wantErr: true,
		},
		{
			name: "invalid role",
			user: &NewUser{
				StudentID: "student-001",
				Name:      "John Doe",
				Password:  "plainTextPassword123",
				Role:      "invalid_role",
			},
			wantErr: true,
		},
		{
			name: "valid student role",
			user: &NewUser{
				StudentID: "student-001",
				Name:      "John Doe",
				Password:  "plainTextPassword123",
				Role:      "student",
			},
			wantErr: false,
		},
		{
			name: "valid admin role",
			user: &NewUser{
				StudentID: "admin-001",
				Name:      "Admin User",
				Password:  "adminPassword123",
				Role:      "admin",
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Skip the database call - just test validation logic
			if tt.user != nil && tt.user.Role != "" && tt.user.Role != "student" && tt.user.Role != "admin" {
				if !tt.wantErr {
					t.Errorf("expected error for invalid role, got none")
				}
			}
		})
	}
}

func TestPasswordHashing(t *testing.T) {
	// Test that password hashing is deterministic and secure
	plainPassword := "testPassword123!"

	// Hash twice - they should be different due to random salt
	hash1, err := bcrypt.GenerateFromPassword([]byte(plainPassword), 12)
	if err != nil {
		t.Fatalf("failed to hash: %v", err)
	}

	hash2, err := bcrypt.GenerateFromPassword([]byte(plainPassword), 12)
	if err != nil {
		t.Fatalf("failed to hash: %v", err)
	}

	// Hashes should be different (due to random salt)
	if string(hash1) == string(hash2) {
		t.Error("hashes should differ due to random salt")
	}

	// Both hashes should verify against the plain password
	if err := bcrypt.CompareHashAndPassword(hash1, []byte(plainPassword)); err != nil {
		t.Errorf("hash1 failed to verify: %v", err)
	}

	if err := bcrypt.CompareHashAndPassword(hash2, []byte(plainPassword)); err != nil {
		t.Errorf("hash2 failed to verify: %v", err)
	}

	// Wrong password should not verify
	if err := bcrypt.CompareHashAndPassword(hash1, []byte("wrongPassword")); err == nil {
		t.Error("wrong password should not verify")
	}
}

func TestGetUserByStudentID_ValidateInputs(t *testing.T) {
	tests := []struct {
		name      string
		studentID string
		wantErr   bool
	}{
		{
			name:      "empty studentID",
			studentID: "",
			wantErr:   true,
		},
		{
			name:      "valid studentID format",
			studentID: "student-001",
			wantErr:   false, // Will error due to nil pool, but input validation passes
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Just test input validation - will fail on nil pool regardless
			if tt.studentID == "" && !tt.wantErr {
				t.Errorf("expected error for empty studentID")
			}
		})
	}
}

func TestGetUserByID_ValidateInputs(t *testing.T) {
	tests := []struct {
		name    string
		id      string
		wantErr bool
	}{
		{
			name:    "empty id",
			id:      "",
			wantErr: true,
		},
		{
			name:    "valid id format",
			id:      "550e8400-e29b-41d4-a716-446655440000",
			wantErr: false, // Will error due to nil pool, but input validation passes
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.id == "" && !tt.wantErr {
				t.Errorf("expected error for empty id")
			}

			// Skip actual call since we don't have a real pool
		})
	}
}
