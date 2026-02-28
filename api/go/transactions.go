package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"github.com/budget-buddy/api/lib"
)

// Handler handles transaction CRUD operations
func Handler(w http.ResponseWriter, r *http.Request) {
	config := lib.Config{
		RequireAuth:    true,
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		EnableCORS:     true,
	}

	handler := lib.CreateHandler(transactionHandler, config)
	handler(w, r)
}

func transactionHandler(w http.ResponseWriter, r *http.Request) {
	user, ok := lib.GetUserFromContext(r)
	if !ok {
		lib.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized, nil)
		return
	}

	switch r.Method {
	case "GET":
		handleGetTransactions(w, r, user)
	case "POST":
		handleCreateTransaction(w, r, user)
	case "PUT":
		handleUpdateTransaction(w, r, user)
	case "DELETE":
		handleDeleteTransaction(w, r, user)
	default:
		lib.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed, nil)
	}
}

func handleGetTransactions(w http.ResponseWriter, r *http.Request, user *lib.User) {
	limitStr := lib.GetQueryParam(r, "limit", "50")
	offsetStr := lib.GetQueryParam(r, "offset", "0")
	transactionType := lib.GetQueryParam(r, "type", "")
	category := lib.GetQueryParam(r, "category", "")

	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	token := lib.GetTokenFromContext(r)
	client, err := lib.NewSupabaseClient()
	if err != nil {
		lib.ErrorResponse(w, "Server configuration error", http.StatusInternalServerError, nil)
		return
	}

	// Build PostgREST query
	params := url.Values{}
	params.Set("select", "*")
	params.Set("user_id", "eq."+user.ID)
	params.Set("order", "date.desc")
	params.Set("limit", strconv.Itoa(limit))
	params.Set("offset", strconv.Itoa(offset))

	if transactionType != "" {
		params.Set("type", "eq."+transactionType)
	}
	if category != "" {
		params.Set("category", "eq."+category)
	}

	body, statusCode, total, err := client.QueryWithCount("transactions", params.Encode(), token)
	if err != nil {
		lib.ErrorResponse(w, "Failed to fetch transactions", http.StatusInternalServerError, nil)
		return
	}

	if statusCode >= 400 {
		lib.ErrorResponse(w, "Database query failed", statusCode, nil)
		return
	}

	var transactions []map[string]interface{}
	if err := json.Unmarshal(body, &transactions); err != nil {
		lib.ErrorResponse(w, "Failed to parse transactions", http.StatusInternalServerError, nil)
		return
	}

	// Calculate summary
	totalIncome := 0.0
	totalExpenses := 0.0
	for _, t := range transactions {
		amount, _ := t["amount"].(float64)
		txType, _ := t["type"].(string)
		if txType == "income" {
			totalIncome += amount
		} else {
			totalExpenses += amount
		}
	}

	response := map[string]interface{}{
		"transactions": transactions,
		"summary": map[string]interface{}{
			"totalIncome":   totalIncome,
			"totalExpenses": totalExpenses,
			"count":         len(transactions),
		},
		"pagination": map[string]interface{}{
			"total":   total,
			"limit":   limit,
			"offset":  offset,
			"hasMore": offset+limit < total,
		},
	}

	lib.SuccessResponse(w, response, http.StatusOK)
}

func handleCreateTransaction(w http.ResponseWriter, r *http.Request, user *lib.User) {
	var input lib.CreateTransactionInput
	if err := lib.ParseJSONBody(r, &input); err != nil {
		lib.ErrorResponse(w, "Invalid JSON body", http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
		return
	}

	if input.Amount <= 0 {
		lib.ErrorResponse(w, "Amount must be positive", http.StatusBadRequest, nil)
		return
	}
	if input.Category == "" {
		lib.ErrorResponse(w, "Category is required", http.StatusBadRequest, nil)
		return
	}
	if input.Type != "income" && input.Type != "expense" {
		lib.ErrorResponse(w, "Type must be 'income' or 'expense'", http.StatusBadRequest, nil)
		return
	}

	token := lib.GetTokenFromContext(r)
	client, err := lib.NewSupabaseClient()
	if err != nil {
		lib.ErrorResponse(w, "Server configuration error", http.StatusInternalServerError, nil)
		return
	}

	row := map[string]interface{}{
		"user_id":     user.ID,
		"amount":      input.Amount,
		"category":    input.Category,
		"type":        input.Type,
		"description": input.Description,
		"merchant":    input.Merchant,
	}
	if input.Date != "" {
		row["date"] = input.Date
	}
	if input.PaymentMethod != "" {
		row["payment_method"] = input.PaymentMethod
	}

	body, statusCode, err := client.Insert("transactions", row, token)
	if err != nil {
		lib.ErrorResponse(w, "Failed to create transaction", http.StatusInternalServerError, nil)
		return
	}

	if statusCode >= 400 {
		lib.ErrorResponse(w, "Database insert failed", statusCode, nil)
		return
	}

	var created []map[string]interface{}
	if err := json.Unmarshal(body, &created); err != nil || len(created) == 0 {
		lib.ErrorResponse(w, "Failed to parse created transaction", http.StatusInternalServerError, nil)
		return
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"transaction": created[0],
	}, http.StatusCreated)
}

func handleUpdateTransaction(w http.ResponseWriter, r *http.Request, user *lib.User) {
	id := lib.GetQueryParam(r, "id", "")
	if id == "" {
		lib.ErrorResponse(w, "Transaction ID required", http.StatusBadRequest, nil)
		return
	}

	var input map[string]interface{}
	if err := lib.ParseJSONBody(r, &input); err != nil {
		lib.ErrorResponse(w, "Invalid JSON body", http.StatusBadRequest, nil)
		return
	}

	// Prevent overriding user_id or id
	delete(input, "id")
	delete(input, "user_id")

	token := lib.GetTokenFromContext(r)
	client, err := lib.NewSupabaseClient()
	if err != nil {
		lib.ErrorResponse(w, "Server configuration error", http.StatusInternalServerError, nil)
		return
	}

	filters := fmt.Sprintf("id=eq.%s&user_id=eq.%s", url.QueryEscape(id), url.QueryEscape(user.ID))
	body, statusCode, err := client.Update("transactions", filters, input, token)
	if err != nil {
		lib.ErrorResponse(w, "Failed to update transaction", http.StatusInternalServerError, nil)
		return
	}

	if statusCode >= 400 {
		lib.ErrorResponse(w, "Database update failed", statusCode, nil)
		return
	}

	var updated []map[string]interface{}
	if err := json.Unmarshal(body, &updated); err != nil || len(updated) == 0 {
		lib.ErrorResponse(w, "Transaction not found", http.StatusNotFound, nil)
		return
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"transaction": updated[0],
	}, http.StatusOK)
}

func handleDeleteTransaction(w http.ResponseWriter, r *http.Request, user *lib.User) {
	id := lib.GetQueryParam(r, "id", "")
	if id == "" {
		lib.ErrorResponse(w, "Transaction ID required", http.StatusBadRequest, nil)
		return
	}

	token := lib.GetTokenFromContext(r)
	client, err := lib.NewSupabaseClient()
	if err != nil {
		lib.ErrorResponse(w, "Server configuration error", http.StatusInternalServerError, nil)
		return
	}

	filters := fmt.Sprintf("id=eq.%s&user_id=eq.%s", url.QueryEscape(id), url.QueryEscape(user.ID))
	_, statusCode, err := client.Delete("transactions", filters, token)
	if err != nil {
		lib.ErrorResponse(w, "Failed to delete transaction", http.StatusInternalServerError, nil)
		return
	}

	if statusCode >= 400 {
		lib.ErrorResponse(w, "Database delete failed", statusCode, nil)
		return
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"message": "Transaction deleted successfully",
		"id":      id,
	}, http.StatusOK)
}

