package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Claims represents the JWT claims.
type Claims struct {
	UserID    string `json:"user_id"`
	StudentID string `json:"student_id"`
	Username  string `json:"username"`
	Role      string `json:"role"`
	Onboarding bool `json:"onboarding"`
	jwt.RegisteredClaims
}

// SignToken creates and signs a JWT token using HS256.
func SignToken(userID, studentID, username, role, secret string, expiryDuration time.Duration, onboarding bool) (string, error) {
	if userID == "" {
		return "", fmt.Errorf("userID cannot be empty")
	}
	if studentID == "" {
		return "", fmt.Errorf("studentID cannot be empty")
	}
	if role == "" {
		return "", fmt.Errorf("role cannot be empty")
	}
	if secret == "" {
		return "", fmt.Errorf("secret cannot be empty")
	}
	if expiryDuration <= 0 {
		return "", fmt.Errorf("expiryDuration must be positive")
	}

	now := time.Now()
	expiryTime := now.Add(expiryDuration)

	claims := &Claims{
		UserID:     userID,
		StudentID:  studentID,
		Username:   username,
		Role:       role,
		Onboarding: onboarding,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(expiryTime),
			NotBefore: jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, nil
}

// VerifyToken verifies a JWT token and returns the claims.
func VerifyToken(tokenString, secret string) (*Claims, error) {
	if tokenString == "" {
		return nil, fmt.Errorf("token cannot be empty")
	}
	if secret == "" {
		return nil, fmt.Errorf("secret cannot be empty")
	}

	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if !token.Valid {
		return nil, fmt.Errorf("token is invalid")
	}

	// Explicitly check expiry to handle edge cases
	if claims.ExpiresAt != nil && claims.ExpiresAt.Before(time.Now()) {
		return nil, fmt.Errorf("token has expired")
	}

	return claims, nil
}
