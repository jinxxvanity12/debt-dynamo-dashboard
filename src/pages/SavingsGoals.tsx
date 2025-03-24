
import { useState } from "react";
import { useAppData, SavingsGoal } from "@/contexts/AppDataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Home, 
  Car, 
  Plane, 
  GraduationCap, 
  Plus, 
  PiggyBank,
  Calendar,
  DollarSign,
  Edit,
  Trash2
} from "lucide-react";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import { differenceInDays, format, parseISO, formatDistanceToNow } from "date-fns";

const ICONS = {
  home: <Home className="h-5 w-5" />,
  car: <Car className="h-5 w-5" />,
  travel: <Plane className="h-5 w-5" />,
  education: <GraduationCap className="h-5 w-5" />,
  savings: <PiggyBank className="h-5 w-5" />
};

const SavingsGoals = () => {
  const { 
    data, 
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    contributeSavings
  } = useAppData();
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<SavingsGoal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [icon, setIcon] = useState("savings");
  const [contributionAmount, setContributionAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
  };

  // Calculate total savings goals
  const totalSavingsGoalAmount = data.savingsGoals.reduce(
    (sum, goal) => sum + goal.targetAmount, 
    0
  );
  
  const totalCurrentSavings = data.savingsGoals.reduce(
    (sum, goal) => sum + goal.currentAmount, 
    0
  );
  
  const overallProgress = Math.round(
    (totalCurrentSavings / totalSavingsGoalAmount) * 100
  ) || 0;

  // Validate add/edit form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
      newErrors.targetAmount = "Please enter a valid target amount greater than 0";
    }
    
    if (!currentAmount || isNaN(Number(currentAmount)) || Number(currentAmount) < 0) {
      newErrors.currentAmount = "Please enter a valid current amount (0 or greater)";
    }
    
    if (Number(currentAmount) > Number(targetAmount)) {
      newErrors.currentAmount = "Current amount cannot be greater than target amount";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate contribution form
  const validateContribution = () => {
    const newErrors: Record<string, string> = {};
    
    if (!contributionAmount || isNaN(Number(contributionAmount)) || Number(contributionAmount) <= 0) {
      newErrors.contributionAmount = "Please enter a valid amount greater than 0";
    }
    
    if (contributingGoal && 
        Number(contributionAmount) > (contributingGoal.targetAmount - contributingGoal.currentAmount)) {
      newErrors.contributionAmount = "Contribution cannot exceed the remaining amount needed";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle adding a new savings goal
  const handleAddSavingsGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    addSavingsGoal({
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      deadline: deadline || undefined,
      icon
    });
    
    // Reset form and close modal
    resetForm();
    setShowAddModal(false);
  };

  // Handle editing a savings goal
  const handleEditSavingsGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !editingGoal) {
      return;
    }
    
    updateSavingsGoal({
      ...editingGoal,
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      deadline: deadline || undefined,
      icon
    });
    
    // Reset form and close modal
    resetForm();
    setEditingGoal(null);
  };

  // Handle contribution to savings goal
  const handleContribution = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateContribution() || !contributingGoal) {
      return;
    }
    
    contributeSavings(contributingGoal.id, Number(contributionAmount));
    
    // Reset form and close modal
    setContributionAmount("");
    setContributingGoal(null);
  };

  // Confirm delete savings goal
  const confirmDelete = () => {
    if (deletingGoal) {
      deleteSavingsGoal(deletingGoal.id);
      setDeletingGoal(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setName("");
    setTargetAmount("");
    setCurrentAmount("");
    setDeadline("");
    setIcon("savings");
    setErrors({});
  };

  // Open edit modal
  const openEditModal = (goal: SavingsGoal) => {
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setDeadline(goal.deadline || "");
    setIcon(goal.icon || "savings");
    setEditingGoal(goal);
  };

  // Calculate days left and progress
  const calculateTimeLeft = (deadline: string | undefined) => {
    if (!deadline) return null;
    
    const today = new Date();
    const deadlineDate = parseISO(deadline);
    const daysLeft = differenceInDays(deadlineDate, today);
    
    if (daysLeft < 0) return "Past due";
    if (daysLeft === 0) return "Due today";
    
    return formatDistanceToNow(deadlineDate, { addSuffix: true });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Savings Goals</h1>
        <Button 
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }} 
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Savings Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Savings Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSavingsGoalAmount)}</div>
            <div className="text-sm text-muted-foreground">
              across {data.savingsGoals.length} goals
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Current Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalCurrentSavings)}</div>
            <div className="text-sm text-muted-foreground">
              {overallProgress}% of goal
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining to Save</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalSavingsGoalAmount - totalCurrentSavings)}
            </div>
            <Progress className="h-2 mt-2" value={overallProgress} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.savingsGoals.length > 0 ? (
          data.savingsGoals.map((goal) => {
            const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);
            const timeLeft = calculateTimeLeft(goal.deadline);
            
            return (
              <Card key={goal.id} className="overflow-hidden card-hover">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        {ICONS[goal.icon as keyof typeof ICONS] || <PiggyBank className="h-5 w-5" />}
                      </div>
                      <CardTitle>{goal.name}</CardTitle>
                    </div>
                    <div className="text-sm font-medium bg-primary/10 text-primary rounded-full px-2 py-1">
                      {progress}%
                    </div>
                  </div>
                  <CardDescription>
                    {goal.deadline && (
                      <div className="flex items-center text-sm mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{timeLeft} ({format(parseISO(goal.deadline), "MMM d, yyyy")})</span>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <Progress className="h-2" value={progress} />
                    
                    <div className="flex justify-between text-sm">
                      <div>Current</div>
                      <div className="font-medium">
                        {formatCurrency(goal.currentAmount)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div>Target</div>
                      <div className="font-medium">
                        {formatCurrency(goal.targetAmount)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div>Remaining</div>
                      <div className="font-medium">
                        {formatCurrency(goal.targetAmount - goal.currentAmount)}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex justify-between">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(goal)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-danger"
                      onClick={() => setDeletingGoal(goal)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setContributionAmount("");
                      setContributingGoal(goal);
                    }}
                    disabled={goal.currentAmount >= goal.targetAmount}
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Contribute
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 bg-muted/20 rounded-lg border border-border">
            <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No savings goals yet</h3>
            <p className="mt-2 text-muted-foreground">
              Create your first savings goal to start tracking your progress
            </p>
            <Button 
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }} 
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Savings Goal
            </Button>
          </div>
        )}
      </div>

      {/* Add Savings Goal Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Savings Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSavingsGoal}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Emergency Fund, Vacation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="text-sm text-danger">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="targetAmount">Target Amount</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                  />
                  {errors.targetAmount && <p className="text-sm text-danger">{errors.targetAmount}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="currentAmount">Current Amount</Label>
                  <Input
                    id="currentAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                  />
                  {errors.currentAmount && <p className="text-sm text-danger">{errors.currentAmount}</p>}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="icon">Icon</Label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.keys(ICONS).map((iconKey) => (
                    <Button
                      key={iconKey}
                      type="button"
                      variant={icon === iconKey ? "default" : "outline"}
                      className="h-10 p-0"
                      onClick={() => setIcon(iconKey)}
                    >
                      <div className="flex items-center justify-center w-full h-full">
                        {ICONS[iconKey as keyof typeof ICONS]}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Savings Goal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Savings Goal Modal */}
      <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Savings Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSavingsGoal}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Goal Name</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g. Emergency Fund, Vacation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="text-sm text-danger">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-targetAmount">Target Amount</Label>
                  <Input
                    id="edit-targetAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                  />
                  {errors.targetAmount && <p className="text-sm text-danger">{errors.targetAmount}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-currentAmount">Current Amount</Label>
                  <Input
                    id="edit-currentAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                  />
                  {errors.currentAmount && <p className="text-sm text-danger">{errors.currentAmount}</p>}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-deadline">Deadline (Optional)</Label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-icon">Icon</Label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.keys(ICONS).map((iconKey) => (
                    <Button
                      key={iconKey}
                      type="button"
                      variant={icon === iconKey ? "default" : "outline"}
                      className="h-10 p-0"
                      onClick={() => setIcon(iconKey)}
                    >
                      <div className="flex items-center justify-center w-full h-full">
                        {ICONS[iconKey as keyof typeof ICONS]}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingGoal(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Savings Goal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contribute to Savings Modal */}
      <Dialog open={!!contributingGoal} onOpenChange={(open) => !open && setContributingGoal(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Contribute to Savings</DialogTitle>
          </DialogHeader>
          {contributingGoal && (
            <form onSubmit={handleContribution}>
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    {ICONS[contributingGoal.icon as keyof typeof ICONS] || <PiggyBank className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-medium">{contributingGoal.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(contributingGoal.currentAmount)} of {formatCurrency(contributingGoal.targetAmount)}
                    </div>
                  </div>
                </div>

                <Progress 
                  className="h-2" 
                  value={Math.round((contributingGoal.currentAmount / contributingGoal.targetAmount) * 100)} 
                />
                
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="contributionAmount">Contribution Amount</Label>
                  <Input
                    id="contributionAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={contributingGoal.targetAmount - contributingGoal.currentAmount}
                    placeholder="0.00"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                  />
                  {errors.contributionAmount && (
                    <p className="text-sm text-danger">{errors.contributionAmount}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Amount needed to reach goal: {formatCurrency(contributingGoal.targetAmount - contributingGoal.currentAmount)}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setContributingGoal(null)}>
                  Cancel
                </Button>
                <Button type="submit">Add Contribution</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      {deletingGoal && (
        <DeleteConfirmationModal
          title="Delete Savings Goal"
          description={`Are you sure you want to delete "${deletingGoal.name}"? This action cannot be undone.`}
          open={!!deletingGoal}
          onOpenChange={(open) => !open && setDeletingGoal(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default SavingsGoals;
