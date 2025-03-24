
import { useState } from "react";
import { useAppData, Budget as BudgetType } from "@/contexts/AppDataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parse } from "date-fns";
import { 
  Plus, 
  Edit,
  Trash2
} from "lucide-react";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";

const Budget = () => {
  const { 
    data, 
    selectedMonth, 
    addBudget, 
    updateBudget, 
    deleteBudget 
  } = useAppData();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetType | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<BudgetType | null>(null);
  
  // Form state
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate the spent amount for each budget category
  const budgetsWithSpending = data.budgets.map(budget => {
    const categoryTransactions = data.transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const selectedDate = parse(selectedMonth, "MMMM yyyy", new Date());
      return tx.category === budget.category && 
        tx.type === "expense" &&
        txDate.getMonth() === selectedDate.getMonth() &&
        txDate.getFullYear() === selectedDate.getFullYear();
    });
    
    const spent = categoryTransactions.reduce((total, tx) => total + tx.amount, 0);
    const percentage = Math.min(Math.round((spent / budget.amount) * 100), 100);
    const remaining = Math.max(budget.amount - spent, 0);
    
    return {
      ...budget,
      spent,
      percentage,
      remaining
    };
  });

  // Get expense categories not already in the budget
  const availableCategories = data.categories
    .filter(cat => 
      cat.type === "expense" && 
      !data.budgets.some(budget => budget.category === cat.name)
    );

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
  };

  // Validate the form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!category) {
      newErrors.category = "Category is required";
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle adding a new budget
  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    addBudget({
      category,
      amount: Number(amount)
    });
    
    // Reset form and close modal
    setCategory("");
    setAmount("");
    setShowAddModal(false);
  };

  // Handle editing a budget
  const handleEditBudget = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !editingBudget) {
      return;
    }
    
    updateBudget({
      ...editingBudget,
      category,
      amount: Number(amount)
    });
    
    // Reset form and close modal
    setEditingBudget(null);
  };

  // Handle deleting a budget
  const confirmDelete = () => {
    if (deletingBudget) {
      deleteBudget(deletingBudget.id);
      setDeletingBudget(null);
    }
  };

  // Open edit modal
  const openEditModal = (budget: BudgetType) => {
    setCategory(budget.category);
    setAmount(budget.amount.toString());
    setEditingBudget(budget);
  };

  // Total budget and spending
  const totalBudget = budgetsWithSpending.reduce((total, budget) => total + budget.amount, 0);
  const totalSpent = budgetsWithSpending.reduce((total, budget) => total + budget.spent, 0);
  const totalRemaining = Math.max(totalBudget - totalSpent, 0);
  const overallPercentage = Math.min(Math.round((totalSpent / totalBudget) * 100) || 0, 100);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Budget</h1>
        <Button 
          onClick={() => {
            setCategory("");
            setAmount("");
            setShowAddModal(true);
          }} 
          className="flex items-center"
          disabled={availableCategories.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Budget Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <div className="text-sm text-muted-foreground">
              for {selectedMonth}
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">{formatCurrency(totalSpent)}</div>
            <div className="text-sm text-muted-foreground">
              {overallPercentage}% of total budget
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalRemaining)}</div>
            <div className="text-sm text-muted-foreground">
              for the rest of {selectedMonth}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
          <CardDescription>
            Manage your budget categories and track spending for {selectedMonth}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {budgetsWithSpending.length > 0 ? (
              budgetsWithSpending.map((budget) => (
                <div key={budget.id} className="space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="font-medium">{budget.category}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(budget.spent)} of {formatCurrency(budget.amount)} ({budget.percentage}%)
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        Remaining: {formatCurrency(budget.remaining)}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => openEditModal(budget)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 px-2 text-danger"
                          onClick={() => setDeletingBudget(budget)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        budget.percentage >= 100
                          ? "bg-danger"
                          : budget.percentage >= 80
                          ? "bg-warning"
                          : "bg-success"
                      }`}
                      style={{ width: `${budget.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No budget categories found. Add a budget category to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Budget Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Budget Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBudget}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-danger">{errors.category}</p>}
                {availableCategories.length === 0 && (
                  <p className="text-sm text-warning">
                    All expense categories already have a budget. Add a new expense category first.
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">Monthly Budget Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {errors.amount && <p className="text-sm text-danger">{errors.amount}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={availableCategories.length === 0}>Add Budget</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Budget Modal */}
      <Dialog open={!!editingBudget} onOpenChange={(open) => !open && setEditingBudget(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditBudget}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  disabled
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-amount">Monthly Budget Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {errors.amount && <p className="text-sm text-danger">{errors.amount}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingBudget(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Budget</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      {deletingBudget && (
        <DeleteConfirmationModal
          title="Delete Budget Category"
          description={`Are you sure you want to delete the budget for "${deletingBudget.category}"? This action cannot be undone.`}
          open={!!deletingBudget}
          onOpenChange={(open) => !open && setDeletingBudget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default Budget;
