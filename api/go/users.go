package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/budget-buddy/api/lib"
)

// Handler handles user profile operations
func Handler(w http.ResponseWriter, r *http.Request) {
	config := lib.Config{
		RequireAuth:    true,
		AllowedMethods: []string{"GET", "PUT", "DELETE"},
		EnableCORS:     true,
	}

	handler := lib.CreateHandler(userHandler, config)
	handler(w, r)
}

func userHandler(w http.ResponseWriter, r *http.Request) {
	user, ok := lib.GetUserFromContext(r)
	if !ok {
		lib.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized, nil)
		return
	}

	switch r.Method {
	case "GET":
		handleGetProfile(w, r, user)
	case "PUT":
		handleUpdateProfile(w, r, user)
	case "DELETE":
		handleDeleteAccount(w, r, user)
	default:
		lib.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed, nil)
	}
}

func handleGetProfile(w http.ResponseWriter, r *http.Request, user *lib.User) {
	token := lib.GetTokenFromContext(r)
	client, err := lib.NewSupabaseClient()
	if err != nil {
		lib.ErrorResponse(w, "Server configuration error", http.StatusInternalServerError, nil)
		return
	}

	params := url.Values{}
	params.Set("select", "*")
	params.Set("id", "eq."+user.ID)

	body, statusCode, err := client.Query("profiles", params.Encode(), token)
	if err != nil {
		lib.ErrorResponse(w, "Failed to fetch profile", http.StatusInternalServerError, nil)
		return
	}

	if statusCode >= 400 {
		lib.ErrorResponse(w, "Database query failed", statusCode, nil)
		return
	}

	var profiles []map[string]interface{}
	if err := json.Unmarshal(body, &profiles); err != nil {
		lib.ErrorResponse(w, "Failed to parse profile", http.StatusInternalServerError, nil)
		return
	}

	if len(profiles) == 0 {
		lib.ErrorResponse(w, "Profile not found", http.StatusNotFound, nil)
		return
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"profile": profiles[0],
	}, http.StatusOK)
}

func handleUpdateProfile(w http.ResponseWriter, r *http.Request, user *lib.User) {
	var input lib.UpdateProfileInput
	if err := lib.ParseJSONBody(r, &input); err != nil {
		lib.ErrorResponse(w, "Invalid JSON body", http.StatusBadRequest, nil)
		return
	}

	token := lib.GetTokenFromContext(r)
	client, err := lib.NewSupabaseClient()
	if err != nil {
		lib.ErrorResponse(w, "Server configuration error", http.StatusInternalServerError, nil)
		return
	}

	// Build update data from non-empty fields only
	updateData := make(map[string]interface{})
	if input.FullName != "" {
		updateData["full_name"] = input.FullName
	}
	if input.PreferredCurrency != "" {
		updateData["preferred_currency"] = input.PreferredCurrency
	}
	if input.Timezone != "" {
		updateData["timezone"] = input.Timezone
	}
	if input.PreferredLanguage != "" {
		updateData["preferred_language"] = input.PreferredLanguage
	}
	if input.ThemePreference != "" {
		updateData["theme_preference"] = input.ThemePreference
	}
	if input.NotificationSettings != nil {
		updateData["notification_settings"] = input.NotificationSettings
	}

	if len(updateData) == 0 {
		lib.ErrorResponse(w, "No fields to update", http.StatusBadRequest, nil)
		return
	}

	filters := fmt.Sprintf("id=eq.%s", url.QueryEscape(user.ID))
	body, statusCode, err := client.Update("profiles", filters, updateData, token)
	if err != nil {
		lib.ErrorResponse(w, "Failed to update profile", http.StatusInternalServerError, nil)
		return
	}

	if statusCode >= 400 {
		lib.ErrorResponse(w, "Database update failed", statusCode, nil)
		return
	}

	var updated []map[string]interface{}
	if err := json.Unmarshal(body, &updated); err != nil || len(updated) == 0 {
		lib.ErrorResponse(w, "Profile not found", http.StatusNotFound, nil)
		return
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"profile": updated[0],
		"message": "Profile updated successfully",
	}, http.StatusOK)
}

func handleDeleteAccount(w http.ResponseWriter, r *http.Request, user *lib.User) {
	var input map[string]interface{}
	if err := lib.ParseJSONBody(r, &input); err != nil {
		lib.ErrorResponse(w, "Invalid JSON body", http.StatusBadRequest, nil)
		return
	}

	confirm, ok := input["confirm"].(bool)
	if !ok || !confirm {
		lib.ErrorResponse(w, "Account deletion requires confirmation", http.StatusBadRequest, map[string]interface{}{
			"hint": "Set 'confirm': true in request body",
		})
		return
	}

	token := lib.GetTokenFromContext(r)
	client, err := lib.NewSupabaseClient()
	if err != nil {
		lib.ErrorResponse(w, "Server configuration error", http.StatusInternalServerError, nil)
		return
	}

	// Delete user's data: transactions, budgets, goals, then profile
	tables := []string{"transactions", "budgets", "goals", "profiles"}
	for _, table := range tables {
		filters := fmt.Sprintf("user_id=eq.%s", url.QueryEscape(user.ID))
		if table == "profiles" {
			filters = fmt.Sprintf("id=eq.%s", url.QueryEscape(user.ID))
		}
		_, _, err := client.Delete(table, filters, token)
		if err != nil {
			// Log but continue — partial cleanup is better than none
			continue
		}
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"message": "Account data deleted successfully",
	}, http.StatusOK)
}

