package api

import (
	"encoding/json"
	"net/http"
)

// APIError represents an error returned by the API.
type APIError struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

// APIResponse is the standardized response envelope.
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Error   interface{} `json:"error"`
}

func respondJSON(w http.ResponseWriter, status int, data interface{}, err interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	resp := APIResponse{
		Success: status >= 200 && status < 300,
		Data:    data,
		Error:   err,
	}
	_ = json.NewEncoder(w).Encode(resp)
}

// RespondSuccess writes a successful response.
func RespondSuccess(w http.ResponseWriter, data interface{}) {
	respondJSON(w, http.StatusOK, data, nil)
}

// RespondCreated writes a 201 response.
func RespondCreated(w http.ResponseWriter, data interface{}) {
	respondJSON(w, http.StatusCreated, data, nil)
}

// RespondError writes an error response with a structured APIError.
func RespondError(w http.ResponseWriter, status int, code, message string, details interface{}) {
	respondJSON(w, status, nil, APIError{
		Code:    code,
		Message: message,
		Details: details,
	})
}
