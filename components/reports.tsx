"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MonthSelector } from "@/components/month-selector"
import { LoadingSkeleton, CardSkeleton } from "@/components/loading-spinner"
import { BarChart3, PieChart, TrendingUp, Award, Calendar, DollarSign, AlertTriangle, Target } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api"
import { formatCurrency, getCurrentMonth } from "@/lib/utils"
import type { SummaryData, ReportData } from "@/lib/types"

export function Reports() {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      loadReportData()
    }
  }, [user, selectedMonth])

  const loadReportData = async () => {
    if (!user) return

    setLoading(true)
    setError("")

    try {
      // Load summary data
      const summaryResponse = await apiClient.getSummary(user.uid, selectedMonth)
      if (summaryResponse.success) {
        setSummaryData(summaryResponse.data)
      } else {
        throw new Error(summaryResponse.error || "Failed to load summary")
      }

      // Load report data
      const reportResponse = await apiClient.getReport(user.uid, selectedMonth)
      if (reportResponse.success) {
        setReportData(reportResponse.data)
      } else {
        throw new Error(reportResponse.error || "Failed to load report")
      }
    } catch (error: any) {
      setError(error.message || "Failed to load report data")
      console.error("Reports error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getBudgetStatusMessage = () => {
    if (!reportData || !summaryData) return { type: "info" as const, message: "Loading..." }

    if (reportData.over_budget_categories_count > 0) {
      return {
        type: "warning" as const,
        message: `You exceeded budget in ${reportData.over_budget_categories_count} categories with total overspend of ${formatCurrency(Math.abs(summaryData.remaining_budget))}`,
      }
    }
    return {
      type: "success" as const,
      message: "Excellent! You stayed within budget across all categories this month.",
    }
  }

  const budgetStatus = getBudgetStatusMessage()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <LoadingSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Analyze your spending patterns and budget performance</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <MonthSelector value={selectedMonth} onValueChange={setSelectedMonth} className="w-[180px]" />
        </div>
      </div>

      {/* Budget Status Alert */}
      <Alert
        className={`mb-8 ${budgetStatus.type === "warning" ? "border-orange-200 bg-orange-50" : budgetStatus.type === "success" ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}`}
      >
        <div className="flex items-center space-x-2">
          {budgetStatus.type === "warning" ? (
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          ) : budgetStatus.type === "success" ? (
            <Target className="h-4 w-4 text-green-600" />
          ) : (
            <Target className="h-4 w-4 text-blue-600" />
          )}
          <AlertDescription
            className={
              budgetStatus.type === "warning"
                ? "text-orange-800"
                : budgetStatus.type === "success"
                  ? "text-green-800"
                  : "text-blue-800"
            }
          >
            {budgetStatus.message}
          </AlertDescription>
        </div>
      </Alert>

      {/* Insights Cards */}
      {summaryData && reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              <Award className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{reportData.top_spending_category?.category || "No data"}</div>
              <p className="text-xs text-muted-foreground">
                {reportData.top_spending_category ? formatCurrency(reportData.top_spending_category.amount) : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{formatCurrency(summaryData.total_expenses)}</div>
              <p className="text-xs text-muted-foreground">{summaryData.expense_count} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
              <TrendingUp
                className={`h-4 w-4 ${summaryData.budget_usage_percent > 90 ? "text-red-600" : summaryData.budget_usage_percent > 75 ? "text-orange-600" : "text-green-600"}`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-lg font-bold ${summaryData.budget_usage_percent > 90 ? "text-red-600" : summaryData.budget_usage_percent > 75 ? "text-orange-600" : "text-green-600"}`}
              >
                {summaryData.budget_usage_percent.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Of total budget</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
              <DollarSign
                className={`h-4 w-4 ${reportData.over_budget_categories_count > 0 ? "text-red-600" : "text-green-600"}`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-lg font-bold ${reportData.over_budget_categories_count > 0 ? "text-red-600" : "text-green-600"}`}
              >
                {reportData.over_budget_categories_count > 0
                  ? `${reportData.over_budget_categories_count} Over`
                  : "All Good"}
              </div>
              <p className="text-xs text-muted-foreground">
                {reportData.over_budget_categories_count > 0 ? "Categories over budget" : "All within budget"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Breakdown with Budget Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Spending vs Budget by Category</span>
            </CardTitle>
            <CardDescription>Detailed breakdown with budget performance</CardDescription>
          </CardHeader>
          <CardContent>
            {!reportData || Object.keys(reportData.expenses_by_category).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <PieChart className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No spending data</h3>
                <p className="text-gray-600 text-center">
                  Add some expenses to see your spending breakdown and budget analysis.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(reportData.expenses_by_category).map(([category, data]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">{category}</span>
                        {data.over_budget && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{formatCurrency(data.total_amount)}</div>
                        <div className="text-xs text-gray-500">
                          Budget: {formatCurrency(data.budget)} ({data.percentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${data.over_budget ? "bg-red-500" : "bg-blue-500"}`}
                        style={{ width: `${Math.min((data.total_amount / data.budget) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs">
                      {data.over_budget ? (
                        <span className="text-red-600 font-medium">
                          {formatCurrency(data.total_amount - data.budget)} over budget
                        </span>
                      ) : (
                        <span className="text-green-600">
                          {formatCurrency(data.budget - data.total_amount)} under budget
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Budget Performance Trend</span>
            </CardTitle>
            <CardDescription>Track your budget adherence over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Budget performance chart will appear here</p>
                <p className="text-xs text-gray-500 mt-1">Historical data visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Spending Insights */}
      {reportData && summaryData && (
        <Card>
          <CardHeader>
            <CardTitle>Budget & Spending Insights</CardTitle>
            <CardDescription>AI-powered insights about your spending habits and budget performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {reportData.over_budget_categories_count > 0 ? (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="font-medium text-red-900 mb-2 flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Budget Alert</span>
                    </h3>
                    <p className="text-sm text-red-800">
                      You exceeded your budget in {reportData.over_budget_categories_count} categories. Consider
                      reviewing your spending habits or adjusting your budgets.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-medium text-green-900 mb-2 flex items-center space-x-2">
                      <Target className="h-4 w-4" />
                      <span>Budget Success</span>
                    </h3>
                    <p className="text-sm text-green-800">
                      Great job staying within budget across all categories! You have{" "}
                      {formatCurrency(summaryData.remaining_budget)} remaining this month.
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">💡 Spending Summary</h3>
                  <p className="text-sm text-blue-800">
                    You've spent {formatCurrency(summaryData.total_expenses)} across {reportData.total_categories}{" "}
                    categories with {summaryData.expense_count} transactions this month.
                  </p>
                </div>
                {reportData.top_spending_category && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h3 className="font-medium text-yellow-900 mb-2">🏆 Top Category</h3>
                    <p className="text-sm text-yellow-800">
                      Your highest spending category is {reportData.top_spending_category.category}
                      at {formatCurrency(reportData.top_spending_category.amount)}.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
