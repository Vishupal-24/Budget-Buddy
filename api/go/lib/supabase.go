package lib

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// SupabaseClient is a lightweight client for the Supabase PostgREST API
type SupabaseClient struct {
	URL     string
	AnonKey string
	client  *http.Client
}

// NewSupabaseClient creates a new Supabase client from environment variables
func NewSupabaseClient() (*SupabaseClient, error) {
	url := os.Getenv("SUPABASE_URL")
	if url == "" {
		url = os.Getenv("NEXT_PUBLIC_SUPABASE_URL")
	}
	anonKey := os.Getenv("SUPABASE_ANON_KEY")
	if anonKey == "" {
		anonKey = os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
	}

	if url == "" || anonKey == "" {
		return nil, fmt.Errorf("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
	}

	return &SupabaseClient{
		URL:     url,
		AnonKey: anonKey,
		client:  &http.Client{Timeout: 15 * time.Second},
	}, nil
}

// AuthUser represents a user returned from Supabase Auth
type AuthUser struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// ValidateToken validates a JWT token via Supabase Auth and returns the user
func (s *SupabaseClient) ValidateToken(token string) (*User, error) {
	req, err := http.NewRequest("GET", s.URL+"/auth/v1/user", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create auth request: %w", err)
	}

	req.Header.Set("apikey", s.AnonKey)
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("auth request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("invalid token (status %d)", resp.StatusCode)
	}

	var authUser AuthUser
	if err := json.NewDecoder(resp.Body).Decode(&authUser); err != nil {
		return nil, fmt.Errorf("failed to decode auth response: %w", err)
	}

	if authUser.ID == "" {
		return nil, fmt.Errorf("invalid user: no ID returned")
	}

	return &User{ID: authUser.ID, Email: authUser.Email}, nil
}

// Query performs a GET request to the Supabase REST API
// queryParams should be PostgREST filter params like "user_id=eq.xxx&order=date.desc"
func (s *SupabaseClient) Query(table, queryParams, userToken string) ([]byte, int, error) {
	url := fmt.Sprintf("%s/rest/v1/%s?%s", s.URL, table, queryParams)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, 0, err
	}

	s.setHeaders(req, userToken)
	return s.doRequest(req)
}

// QueryWithCount performs a GET with exact count header
func (s *SupabaseClient) QueryWithCount(table, queryParams, userToken string) ([]byte, int, int, error) {
	url := fmt.Sprintf("%s/rest/v1/%s?%s", s.URL, table, queryParams)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, 0, 0, err
	}

	s.setHeaders(req, userToken)
	req.Header.Set("Prefer", "count=exact")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, 0, 0, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, resp.StatusCode, 0, err
	}

	// Parse content-range for total count
	total := 0
	contentRange := resp.Header.Get("Content-Range")
	if contentRange != "" {
		fmt.Sscanf(contentRange, "%*d-%*d/%d", &total)
	}

	return body, resp.StatusCode, total, nil
}

// Insert performs a POST to insert a row
func (s *SupabaseClient) Insert(table string, data interface{}, userToken string) ([]byte, int, error) {
	jsonBody, err := json.Marshal(data)
	if err != nil {
		return nil, 0, err
	}

	url := fmt.Sprintf("%s/rest/v1/%s", s.URL, table)
	req, err := http.NewRequest("POST", url, bytes.NewReader(jsonBody))
	if err != nil {
		return nil, 0, err
	}

	s.setHeaders(req, userToken)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	return s.doRequest(req)
}

// Update performs a PATCH to update rows matching filters
func (s *SupabaseClient) Update(table, filters string, data interface{}, userToken string) ([]byte, int, error) {
	jsonBody, err := json.Marshal(data)
	if err != nil {
		return nil, 0, err
	}

	url := fmt.Sprintf("%s/rest/v1/%s?%s", s.URL, table, filters)
	req, err := http.NewRequest("PATCH", url, bytes.NewReader(jsonBody))
	if err != nil {
		return nil, 0, err
	}

	s.setHeaders(req, userToken)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	return s.doRequest(req)
}

// Delete performs a DELETE on rows matching filters
func (s *SupabaseClient) Delete(table, filters, userToken string) ([]byte, int, error) {
	url := fmt.Sprintf("%s/rest/v1/%s?%s", s.URL, table, filters)
	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return nil, 0, err
	}

	s.setHeaders(req, userToken)

	return s.doRequest(req)
}

// RPC calls a Supabase database function
func (s *SupabaseClient) RPC(funcName string, params interface{}, userToken string) ([]byte, int, error) {
	jsonBody, err := json.Marshal(params)
	if err != nil {
		return nil, 0, err
	}

	url := fmt.Sprintf("%s/rest/v1/rpc/%s", s.URL, funcName)
	req, err := http.NewRequest("POST", url, bytes.NewReader(jsonBody))
	if err != nil {
		return nil, 0, err
	}

	s.setHeaders(req, userToken)
	req.Header.Set("Content-Type", "application/json")

	return s.doRequest(req)
}

func (s *SupabaseClient) setHeaders(req *http.Request, userToken string) {
	req.Header.Set("apikey", s.AnonKey)
	if userToken != "" {
		req.Header.Set("Authorization", "Bearer "+userToken)
	}
}

func (s *SupabaseClient) doRequest(req *http.Request) ([]byte, int, error) {
	resp, err := s.client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, resp.StatusCode, err
	}

	return body, resp.StatusCode, nil
}
