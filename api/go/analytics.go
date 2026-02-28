package handler

import (
	"encoding/json"
	"net/http"
	"net/url"
	"time"

	"github.com/budget-buddy/api/lib"
)

// Handler handles analytics requests
func Handler(w http.ResponseWriter, r *http.Request) {
	config := lib.Config{
		RequireAuth:    true,
		AllowedMethods: []string{"GET"},
		EnableCORS:     true,
	}

	handler := lib.CreateHandler(analyticsHandler, config)
	handler(w, r)
}

func analyticsHandler(w http.ResponseWriter, r *http.Request) {
	user, ok := lib.GetUserFromContext(r)
	if !ok {
		lib.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized, nil)
		return
	}

	analyticsType := lib.GetQueryParam(r, "type", "summary")
	startDate := lib.GetQueryParam(r, "start_date", "")
	endDate := lib.GetQueryParam(r, "end_date", "")

	switch analyticsType {
	case "summary":
		handleSummaryAnalytics(w, r, user, startDate, endDate)
	case "category":
		handleCategoryAnalytics(w, r, user, startDate, endDate)
	case "trend":
		handleTrendAnalytics(w, r, user, startDate, endDate)
	default:
		lib.ErrorResponse(w, "Invalid analytics type", http.StatusBadRequest, map[string]interface{}{
			"allowed": []string{"summary", "category", "trend"},
		})
	}
}

// fetchTransactions fetches transactions with optional date range filters
func fetchTransactions(r *http.Request, client *lib.SupabaseClient, userID, startDate, endDate string) ([]map[string]interface{}, error) {
	token := lib.GetTokenFromContext(r)

	params := url.Values{}
	params.Set("select", "id,amount,type,category,date")
	params.Set("user_id", "eq."+userID)
	params.Set("order", "date.desc")

	if startDate != "" {
		params.Set("date", "gte."+startDate)
	}
	if endDate != "" {
		// Use a separate key for the upper bound
		params.Add("date", "lte."+endDate)
	}

	body, statusCode, err := client.Query("transactions", params.Encode(), token)
	if err != nil {
		return nil, err
	}
	if statusCode >= 400 {
		return []map[string]interface{}{}, nil
	}

	var transactions []map[string]interface{}
	if err := json.Unmarshal(body, &transactions); err != nil {
		return nil, err
	}
	return transactions, nil
}

func handleSummaryAnalytics(w http.ResponseWriter, r *http.Request, user *lib.User, startDate, endDate string) {
	client, err := lib.NewSupabaseClient()
	if err != nil {
		lib.ErrorResponse(w, "Server configuration error", http.StatusInternalServerError, nil)
		return
	}

	transactions, err := fetchTransactions(r, client, user.ID, startDate, endDate)
	if err != nil {
		lib.ErrorResponse(w, "Failed to fetch transactions", http.StatusInternalServerError, nil)
		return
	}

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

	netSavings := totalIncome - totalExpenses
	savingsRate := 0.0
	if totalIncome > 0 {
		savingsRate = (netSavings / totalIncome) * 100
	}

	summary := lib.AnalyticsSummary{
		TotalIncome:      totalIncome,
		TotalExpenses:    totalExpenses,
		NetSavings:       netSavings,
		SavingsRate:      savingsRate,
		TransactionCount: len(transactions),
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"summary": summary,
	}, http.StatusOK)
}

func handleCategoryAnalytics(w http.ResponseWriter, r *http.Request, user *lib.User, startDate, endDate string) {
	client, err := lib.NewSupabaseClient()
	if err != nil {
		lib.ErrorResponse(w, "Server configuration error", http.StatusInternalServerError, nil)
		return
	}

	transactions, err := fetchTransactions(r, client, user.ID, startDate, endDate)
	if err != nil {
		lib.ErrorResponse(w, "Failed to fetch transactions", http.StatusInternalServerError, nil)
		return
	}

	// Aggregate by category
	type catStats struct {
		Income       float64
		Expenses     float64
		Transactions int
	}
	catMap := make(map[string]*catStats)

	for _, t := range transactions {
		cat, _ := t["category"].(string)
		if cat == "" {
			cat = "Uncategorized"
		}
		amount, _ := t["amount"].(float64)
		txType, _ := t["type"].(string)

		if catMap[cat] == nil {
			catMap[cat] = &catStats{}
		}
		catMap[cat].Transactions++
		if txType == "income" {
			catMap[cat].Income += amount
		} else {
			catMap[cat].Expenses += amount
		}
	}

	categories := make([]lib.CategoryAnalytics, 0, len(catMap))
	for cat, stats := range catMap {
		categories = append(categories, lib.CategoryAnalytics{
			Category:     cat,
			Income:       stats.Income,
			Expenses:     stats.Expenses,
			Transactions: stats.Transactions,
		})
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"categories": categories,
	}, http.StatusOK)
}

func handleTrendAnalytics(w http.ResponseWriter, r *http.Request, user *lib.User, startDate, endDate string) {
	// Default to last 6 months if no date range specified
	if startDate == "" {
		startDate = time.Now().AddDate(0, -6, 0).Format("2006-01-02")
	}

	client, err := lib.NewSupabaseClient()
	if err != nil {
		lib.ErrorResponse(w, "Server configuration error", http.StatusInternalServerError, nil)
		return
	}

	transactions, err := fetchTransactions(r, client, user.ID, startDate, endDate)
	if err != nil {
		lib.ErrorResponse(w, "Failed to fetch transactions", http.StatusInternalServerError, nil)
		return
	}

	// Aggregate by month
	type monthStats struct {
		Income   float64
		Expenses float64
	}
	monthMap := make(map[string]*monthStats)

	for _, t := range transactions {
		dateStr, _ := t["date"].(string)
		// Extract YYYY-MM from the date
		month := ""
		if len(dateStr) >= 7 {
			month = dateStr[:7]
		} else {
			continue
		}

		amount, _ := t["amount"].(float64)
		txType, _ := t["type"].(string)

		if monthMap[month] == nil {
			monthMap[month] = &monthStats{}
		}
		if txType == "income" {
			monthMap[month].Income += amount
		} else {
			monthMap[month].Expenses += amount
		}
	}

	// Sort months and build trend data
	trend := make([]lib.TrendData, 0, len(monthMap))
	for month, stats := range monthMap {
		trend = append(trend, lib.TrendData{
			Month:    month,
			Income:   stats.Income,
			Expenses: stats.Expenses,
			Net:      stats.Income - stats.Expenses,
		})
	}

	lib.SuccessResponse(w, map[string]interface{}{
		"trend": trend,
	}, http.StatusOK)
}

