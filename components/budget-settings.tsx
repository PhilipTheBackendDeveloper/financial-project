// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { MonthSelector } from "@/components/month-selector"
// import { LoadingSkeleton } from "@/components/loading-spinner"
// import { ArrowLeft, Settings, DollarSign, Tag, Trash2, Plus } from "lucide-react"
// import { useAuth } from "@/hooks/use-auth"
// import { apiClient } from "@/lib/api"
// import { formatCurrency, formatMonth, getCurrentMonth } from "@/lib/utils"
// import type { Page, Budget } from "@/lib/types"

// interface BudgetSettingsProps {
//   onNavigate: (page: Page) => void
// }

// export function BudgetSettings({ onNavigate }: BudgetSettingsProps) {
//   const { user } = useAuth()
//   const [budgets, setBudgets] = useState<Budget[]>([])
//   const [loading, setLoading] = useState(true)
//   const [isEditing, setIsEditing] = useState<string | null>(null)
//   const [newBudget, setNewBudget] = useState({
//     category: "",
//     amount: "",
//     month: getCurrentMonth(),
//   })
//   const [error, setError] = useState("")
//   const [success, setSuccess] = useState("")
//   const [actionLoading, setActionLoading] = useState(false)

//   const categories = [
//     "Food & Dining",
//     "Transportation",
//     "Shopping",
//     "Entertainment",
//     "Utilities",
//     "Healthcare",
//     "Education",
//     "Travel",
//     "Other",
//   ]

//   useEffect(() => {
//     if (user) {
//       loadBudgets()
//     }
//   }, [user])

//   const loadBudgets = async () => {
//     if (!user) return

//     setLoading(true)
//     try {
//       const response = await apiClient.getBudgets(user.uid)
//       if (response.success) {
//         setBudgets(response.data.budgets)
//       } else {
//         setError(response.error || "Failed to load budgets")
//       }
//     } catch (error: any) {
//       setError(error.message || "Failed to load budgets")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleAddBudget = async () => {
//     if (!user) return

//     setError("")
//     setSuccess("")

//     if (!newBudget.category || !newBudget.amount || !newBudget.month) {
//       setError("Please fill in all fields")
//       return
//     }

//     if (isNaN(Number(newBudget.amount)) || Number(newBudget.amount) <= 0) {
//       setError("Please enter a valid amount")
//       return
//     }

//     // Check if budget already exists for this category and month
//     const existingBudget = budgets.find((b) => b.category === newBudget.category && b.month === newBudget.month)

//     if (existingBudget) {
//       setError("Budget already exists for this category and month")
//       return
//     }

//     setActionLoading(true)

//     try {
//       const response = await apiClient.setBudget(user.uid, {
//         amount: Number(newBudget.amount),
//         category: newBudget.category,
//         month: newBudget.month,
//       })

//       if (response.success) {
//         setBudgets([...budgets, response.data.budget])
//         setNewBudget({ category: "", amount: "", month: getCurrentMonth() })
//         setSuccess("Budget added successfully!")
//         setTimeout(() => setSuccess(""), 3000)
//       } else {
//         setError(response.error || "Failed to add budget")
//       }
//     } catch (error: any) {
//       setError(error.message || "Failed to add budget")
//     } finally {
//       setActionLoading(false)
//     }
//   }

//   const handleDeleteBudget = async (budgetId: string) => {
//     if (!user) return

//     setActionLoading(true)

//     try {
//       const response = await apiClient.deleteBudget(user.uid, budgetId)
//       if (response.success) {
//         setBudgets(budgets.filter((b) => b.id !== budgetId))
//         setSuccess("Budget deleted successfully!")
//         setTimeout(() => setSuccess(""), 3000)
//       } else {
//         setError(response.error || "Failed to delete budget")
//       }
//     } catch (error: any) {
//       setError(error.message || "Failed to delete budget")
//     } finally {
//       setActionLoading(false)
//     }
//   }

//   const groupedBudgets = budgets.reduce(
//     (acc, budget) => {
//       if (!acc[budget.month]) {
//         acc[budget.month] = []
//       }
//       acc[budget.month].push(budget)
//       return acc
//     },
//     {} as Record<string, Budget[]>,
//   )

//   if (loading) {
//     return (
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <LoadingSkeleton />
//       </div>
//     )
//   }

//   return (
//     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       {/* Header */}
//       <div className="flex items-center space-x-4 mb-8">
//         <Button variant="ghost" onClick={() => onNavigate("dashboard")} className="flex items-center space-x-2">
//           <ArrowLeft className="h-4 w-4" />
//           <span>Back to Dashboard</span>
//         </Button>
//       </div>

//       <div className="space-y-8">
//         {/* Page Title */}
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
//             <Settings className="h-8 w-8 text-blue-600" />
//             <span>Budget Settings</span>
//           </h1>
//           <p className="text-gray-600 mt-2">Set and manage your monthly budgets by category</p>
//         </div>

//         {/* Add New Budget */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <Plus className="h-5 w-5 text-green-600" />
//               <span>Add New Budget</span>
//             </CardTitle>
//             <CardDescription>Set a spending limit for a specific category and month</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {error && (
//               <Alert variant="destructive" className="mb-6">
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             {success && (
//               <Alert className="mb-6 border-green-200 bg-green-50">
//                 <AlertDescription className="text-green-800">{success}</AlertDescription>
//               </Alert>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               <div className="space-y-2">
//                 <Label htmlFor="new-category" className="flex items-center space-x-2">
//                   <Tag className="h-4 w-4" />
//                   <span>Category</span>
//                 </Label>
//                 <Select
//                   value={newBudget.category}
//                   onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {categories.map((cat) => (
//                       <SelectItem key={cat} value={cat}>
//                         {cat}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="new-amount" className="flex items-center space-x-2">
//                   <DollarSign className="h-4 w-4" />
//                   <span>Amount</span>
//                 </Label>
//                 <Input
//                   id="new-amount"
//                   type="number"
//                   step="0.01"
//                   placeholder="0.00"
//                   value={newBudget.amount}
//                   onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="new-month">Month</Label>
//                 <MonthSelector
//                   value={newBudget.month}
//                   onValueChange={(value) => setNewBudget({ ...newBudget, month: value })}
//                   placeholder="Select month"
//                 />
//               </div>
//             </div>

//             <Button onClick={handleAddBudget} disabled={actionLoading} className="flex items-center space-x-2">
//               <Plus className="h-4 w-4" />
//               <span>{actionLoading ? "Adding Budget..." : "Add Budget"}</span>
//             </Button>
//           </CardContent>
//         </Card>

//         {/* Existing Budgets */}
//         <div className="space-y-6">
//           {Object.keys(groupedBudgets).length === 0 ? (
//             <Card>
//               <CardContent className="flex flex-col items-center justify-center py-12">
//                 <Settings className="h-12 w-12 text-gray-400 mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets set</h3>
//                 <p className="text-gray-600 text-center">
//                   Start by adding your first budget above to track your spending limits.
//                 </p>
//               </CardContent>
//             </Card>
//           ) : (
//             Object.entries(groupedBudgets)
//               .sort(([a], [b]) => b.localeCompare(a))
//               .map(([month, monthBudgets]) => (
//                 <Card key={month}>
//                   <CardHeader>
//                     <CardTitle className="text-xl">{formatMonth(month)}</CardTitle>
//                     <CardDescription>
//                       Total Budget: {formatCurrency(monthBudgets.reduce((sum, b) => sum + b.amount, 0))}
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-4">
//                       {monthBudgets.map((budget) => (
//                         <div
//                           key={budget.id}
//                           className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
//                         >
//                           <div className="flex items-center space-x-4">
//                             <div className="w-3 h-3 bg-blue-500 rounded-full" />
//                             <div>
//                               <h4 className="font-medium text-gray-900">{budget.category}</h4>
//                               <p className="text-sm text-gray-600">Monthly limit</p>
//                             </div>
//                           </div>

//                           <div className="flex items-center space-x-4">
//                             <span className="text-lg font-bold text-gray-900">{formatCurrency(budget.amount)}</span>
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => handleDeleteBudget(budget.id)}
//                               disabled={actionLoading}
//                               className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
//                             >
//                               <Trash2 className="h-3 w-3" />
//                               <span>Delete</span>
//                             </Button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }
