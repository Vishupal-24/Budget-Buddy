package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/budget-buddy/api/lib"
)

// Handler handles budget CRUD operations
func Handler(w http.ResponseWriter, r *http.Request) {
	config := lib.Config{
		RequireAuth:    true,
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		EnableCORS:     true,
	}

	handler := lib.CreateHandler(budgetHandler, config)
	handler(w, r)
}

func budgetHandler(w http.ResponseWriter, r *http.Request) {
	user, ok := lib.GetUserFromContext(r)
	if !ok {
		lib.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized, nil)
		return
	}

	switch r.Method {
	case "GET":
		handleGetBudgets(w, r, user)
	case "POST":
		handleCreateBudget(w, r, user)
	case "PUT":
		handleUpdateBudget(w, r, user)
	case "DELETE":
		handleDeleteBudget(w, r, user)
	default:
		lib.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed, nil)
	}
}

func handleGetBudgets(w http.ResponseWriter, r *http.Request, user *lib.User) {
	period := lib.GetQueryParam(r, "period", "")

	token := lib.GetTokenFromContext(r)
	client, err := lib.NewSupabaseClient()
	if err != nil {
		lib.ErrorResponse(w, "Server configuration error", http.StatusInternalServerError, nil)
		return
	}

	params := url.Values{}
	params.Set("select", "*")
	params.Set("user_id", "eq."+user.ID)
	params.Set("order", "created_at.desc")

	if period != "" {
		params.Set("period", "eq."+period)
	}

	body, statusCode, err := client.Query("budgets", params.Encode(), token)
	if err != nil {
		lib.ErrorResponse(w, "Failed to fetch budgets", http.StatusInternalServerError, nil)
		return
	}

	if statusCode >= 400 {
		lib.ErrorResponse(w, "Database query failed", statusCode, nil)
		return
	}

	var budgets []map[string]interface{}
	if err := json.Unmarshal(body, &budgets); err != nil {
		lib.ErrorResponse(w, "Failed to parse budgets", http.StatusInternalServerError, nil)
		return
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"budgets": budgets,
	}, http.StatusOK)
}

func handleCreateBudget(w http.ResponseWriter, r *http.Request, user *lib.User) {
	var input lib.CreateBudgetInput
	if err := lib.ParseJSONBody(r, &input); err != nil {
		lib.ErrorResponse(w, "Invalid JSON body", http.StatusBadRequest, nil)
		return
	}

	if input.Category == "" {
		lib.ErrorResponse(w, "Category is required", http.StatusBadRequest, nil)
		return
	}
	if input.Amount <= 0 {
		lib.ErrorResponse(w, "Amount must be positive", http.StatusBadRequest, nil)
		return
	}
	if input.Period != "weekly" && input.Period != "monthly" && input.Period != "yearly" {
		lib.ErrorResponse(w, "Period must be 'weekly', 'monthly', or 'yearly'", http.StatusBadRequest, nil)
		return
	}

	token := lib.GetTokenFromContext(r)
	client, err := lib.NewSupabaseClient()
	if err != nil {
		lib.ErrorResponse(w, "Server configuration error", http.StatusInternalServerError, nil)
		return
	}

	row := map[string]interface{}{
		"user_id":         user.ID,
		"category":        input.Category,
		"amount":          input.Amount,
		"period":          input.Period,
		"alert_threshold": input.AlertThreshold,
	}
	if input.StartDate != "" {
		row["start_date"] = input.StartDate
	}
	if input.EndDate != "" {
		row["end_date"] = input.EndDate
	}

	body, statusCode, err := client.Insert("budgets", row, token)
	if err != nil {
		lib.ErrorResponse(w, "Failed to create budget", http.StatusInternalServerError, nil)
		return
	}

	if statusCode >= 400 {
		lib.ErrorResponse(w, "Database insert failed", statusCode, nil)
		return
	}

	var created []map[string]interface{}
	if err := json.Unmarshal(body, &created); err != nil || len(created) == 0 {
		lib.ErrorResponse(w, "Failed to parse created budget", http.StatusInternalServerError, nil)
		return
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"budget": created[0],
	}, http.StatusCreated)
}

func handleUpdateBudget(w http.ResponseWriter, r *http.Request, user *lib.User) {
	id := lib.GetQueryParam(r, "id", "")
	if id == "" {
		lib.ErrorResponse(w, "Budget ID required", http.StatusBadRequest, nil)
		return
	}

	var input map[string]interface{}
	if err := lib.ParseJSONBody(r, &input); err != nil {
		lib.ErrorResponse(w, "Invalid JSON body", http.StatusBadRequest, nil)
		return
	}

	delete(input, "id")
	delete(input, "user_id")

	token := lib.GetTokenFromContext(r)
	client, err := lib.NewSupabaseClient()
	if err != nil {
		lib.ErrorResponse(w, "Server configuration error", http.StatusInternalServerError, nil)
		return
	}

	filters := fmt.Sprintf("id=eq.%s&user_id=eq.%s", url.QueryEscape(id), url.QueryEscape(user.ID))
	body, statusCode, err := client.Update("budgets", filters, input, token)
	if err != nil {
		lib.ErrorResponse(w, "Failed to update budget", http.StatusInternalServerError, nil)
		return
	}

	if statusCode >= 400 {
		lib.ErrorResponse(w, "Database update failed", statusCode, nil)
		return
	}

	var updated []map[string]interface{}
	if err := json.Unmarshal(body, &updated); err != nil || len(updated) == 0 {
		lib.ErrorResponse(w, "Budget not found", http.StatusNotFound, nil)
		return
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"budget": updated[0],
	}, http.StatusOK)
}

func handleDeleteBudget(w http.ResponseWriter, r *http.Request, user *lib.User) {
	id := lib.GetQueryParam(r, "id", "")
	if id == "" {
		lib.ErrorResponse(w, "Budget ID required", http.StatusBadRequest, nil)
		return
	}

	token := lib.GetTokenFromContext(r)
	client, err := lib.NewSupabaseClient()
	if err != nil {
		lib.ErrorResponse(w, "Server configuration error", http.StatusInternalServerError, nil)
		return
	}

	filters := fmt.Sprintf("id=eq.%s&user_id=eq.%s", url.QueryEscape(id), url.QueryEscape(user.ID))
	_, statusCode, err := client.Delete("budgets", filters, token)
	if err != nil {
		lib.ErrorResponse(w, "Failed to delete budget", http.StatusInternalServerError, nil)
		return
	}

	if statusCode >= 400 {
		lib.ErrorResponse(w, "Database delete failed", statusCode, nil)
		return
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"message": "Budget deleted successfully",
		"id":      id,
	}, http.StatusOK)
}

