
import { useState } from "react";
import { useAppData, Debt } from "@/contexts/AppDataContext";
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
  CreditCard, 
  Home, 
  GraduationCap, 
  Car, 
  Plus, 
  Calendar,
  DollarSign,
  Percent,
  Edit,
  Trash2,
  Check,
  AlertCircle,
  BadgeCheck
} from "lucide-react";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import { format, parseISO, differenceInDays } from "date-fns";

const ICONS = {
  creditCard: <CreditCard className="h-5 w-5" />,
  mortgage: <Home className="h-5 w-5" />,
  student: <GraduationCap className="h-5 w-5" />,
  car: <Car className="h-5 w-5" />
};

const DebtTracker = () => {
  const { 
    data, 
    addDebt,
    updateDebt,
    deleteDebt,
    makeDebtPayment,
    markDebtComplete
  } = useAppData();
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [completingDebt, setCompletingDebt] = useState<Debt | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [minimumPayment, setMinimumPayment] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [icon, setIcon] = useState("creditCard");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
  };

  // Filter active and paid off debts
  const activeDebts = data.debts.filter(debt => !debt.isCompleted);
  const paidOffDebts = data.debts.filter(debt => debt.isCompleted);

  // Calculate total debt amounts
  const totalDebtAmount = activeDebts.reduce(
    (sum, debt) => sum + debt.remainingAmount, 
    0
  );
  
  const totalOriginalDebt = activeDebts.reduce(
    (sum, debt) => sum + debt.totalAmount, 
    0
  );
  
  const totalPaidOff = paidOffDebts.reduce(
    (sum, debt) => sum + debt.totalAmount, 
    0
  );
  
  const overallProgress = Math.round(
    ((totalOriginalDebt - totalDebtAmount) / totalOriginalDebt) * 100
  ) || 0;

  // Validate add/edit form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!totalAmount || isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
      newErrors.totalAmount = "Please enter a valid total amount greater than 0";
    }
    
    if (!remainingAmount || isNaN(Number(remainingAmount)) || Number(remainingAmount) < 0) {
      newErrors.remainingAmount = "Please enter a valid remaining amount (0 or greater)";
    }
    
    if (Number(remainingAmount) > Number(totalAmount)) {
      newErrors.remainingAmount = "Remaining amount cannot be greater than total amount";
    }
    
    if (!interestRate || isNaN(Number(interestRate)) || Number(interestRate) < 0) {
      newErrors.interestRate = "Please enter a valid interest rate (0 or greater)";
    }
    
    if (!minimumPayment || isNaN(Number(minimumPayment)) || Number(minimumPayment) <= 0) {
      newErrors.minimumPayment = "Please enter a valid minimum payment greater than 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate payment form
  const validatePayment = () => {
    const newErrors: Record<string, string> = {};
    
    if (!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
      newErrors.paymentAmount = "Please enter a valid payment amount greater than 0";
    }
    
    if (payingDebt && Number(paymentAmount) > payingDebt.remainingAmount) {
      newErrors.paymentAmount = "Payment cannot exceed the remaining amount";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle adding a new debt
  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    addDebt({
      name,
      totalAmount: Number(totalAmount),
      remainingAmount: Number(remainingAmount),
      interestRate: Number(interestRate),
      minimumPayment: Number(minimumPayment),
      dueDate: dueDate || undefined
    });
    
    // Reset form and close modal
    resetForm();
    setShowAddModal(false);
  };

  // Handle editing a debt
  const handleEditDebt = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !editingDebt) {
      return;
    }
    
    updateDebt({
      ...editingDebt,
      name,
      totalAmount: Number(totalAmount),
      remainingAmount: Number(remainingAmount),
      interestRate: Number(interestRate),
      minimumPayment: Number(minimumPayment),
      dueDate: dueDate || undefined
    });
    
    // Reset form and close modal
    resetForm();
    setEditingDebt(null);
  };

  // Handle debt payment
  const handleDebtPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePayment() || !payingDebt) {
      return;
    }
    
    makeDebtPayment(payingDebt.id, Number(paymentAmount));
    
    // Reset form and close modal
    setPaymentAmount("");
    setPayingDebt(null);
  };

  // Confirm mark debt as complete
  const confirmMarkComplete = () => {
    if (completingDebt) {
      markDebtComplete(completingDebt.id);
      setCompletingDebt(null);
    }
  };

  // Confirm delete debt
  const confirmDelete = () => {
    if (deletingDebt) {
      deleteDebt(deletingDebt.id);
      setDeletingDebt(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setName("");
    setTotalAmount("");
    setRemainingAmount("");
    setInterestRate("");
    setMinimumPayment("");
    setDueDate("");
    setIcon("creditCard");
    setErrors({});
  };

  // Open edit modal
  const openEditModal = (debt: Debt) => {
    setName(debt.name);
    setTotalAmount(debt.totalAmount.toString());
    setRemainingAmount(debt.remainingAmount.toString());
    setInterestRate(debt.interestRate.toString());
    setMinimumPayment(debt.minimumPayment.toString());
    setDueDate(debt.dueDate || "");
    setEditingDebt(debt);
  };

  // Check if due date is soon or overdue
  const getDueDateStatus = (dueDate: string | undefined) => {
    if (!dueDate) return null;
    
    const today = new Date();
    const dueDateObj = parseISO(dueDate);
    const daysUntilDue = differenceInDays(dueDateObj, today);
    
    if (daysUntilDue < 0) return "overdue";
    if (daysUntilDue <= 7) return "soon";
    
    return "ok";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Debt Tracker</h1>
        <Button 
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }} 
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Debt
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Debt Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">{formatCurrency(totalDebtAmount)}</div>
            <div className="text-sm text-muted-foreground">
              {activeDebts.length} active debts
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Debt Paid Off</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(totalOriginalDebt - totalDebtAmount + totalPaidOff)}
            </div>
            <div className="text-sm text-muted-foreground">
              {paidOffDebts.length} debts completely paid
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Debt Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}% Complete</div>
            <Progress className="h-2 mt-2" value={overallProgress} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Active Debts */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Debts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeDebts.length > 0 ? (
              activeDebts.map((debt) => {
                const progress = Math.round(((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100);
                const dueDateStatus = getDueDateStatus(debt.dueDate);
                
                return (
                  <Card key={debt.id} className="overflow-hidden card-hover">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="bg-danger/10 p-2 rounded-full text-danger">
                            {ICONS[icon as keyof typeof ICONS] || <CreditCard className="h-5 w-5" />}
                          </div>
                          <CardTitle>{debt.name}</CardTitle>
                        </div>
                        <div className="text-sm font-medium bg-primary/10 text-primary rounded-full px-2 py-1">
                          {progress}%
                        </div>
                      </div>
                      <CardDescription>
                        {debt.dueDate && (
                          <div className="flex items-center text-sm mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className={`
                              ${dueDateStatus === "overdue" ? "text-danger" : ""}
                              ${dueDateStatus === "soon" ? "text-warning" : ""}
                            `}>
                              {dueDateStatus === "overdue" && (
                                <AlertCircle className="h-3 w-3 mr-1 inline-block" />
                              )}
                              Due: {format(parseISO(debt.dueDate), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-4">
                        <Progress className="h-2" value={progress} />
                        
                        <div className="flex justify-between text-sm">
                          <div>Remaining</div>
                          <div className="font-medium text-danger">
                            {formatCurrency(debt.remainingAmount)}
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <div>Original Balance</div>
                          <div className="font-medium">
                            {formatCurrency(debt.totalAmount)}
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <div>Interest Rate</div>
                          <div className="font-medium flex items-center">
                            <Percent className="h-3 w-3 mr-1" />
                            {debt.interestRate.toFixed(2)}%
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <div>Minimum Payment</div>
                          <div className="font-medium">
                            {formatCurrency(debt.minimumPayment)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(debt)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-danger"
                          onClick={() => setDeletingDebt(debt)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCompletingDebt(debt)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Mark Paid
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setPaymentAmount(debt.minimumPayment.toString());
                            setPayingDebt(debt);
                          }}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Payment
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8 bg-muted/20 rounded-lg border border-border">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No active debts</h3>
                <p className="mt-2 text-muted-foreground">
                  Add a debt to start tracking your payments
                </p>
                <Button 
                  onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }} 
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Debt
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Paid Off Debts */}
        {paidOffDebts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              <BadgeCheck className="h-5 w-5 mr-2 text-success" />
              Paid Off Debts
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paidOffDebts.map((debt) => (
                <Card key={debt.id} className="overflow-hidden bg-success/5 border-success/20">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="bg-success/10 p-2 rounded-full text-success">
                          <Check className="h-5 w-5" />
                        </div>
                        <CardTitle>{debt.name}</CardTitle>
                      </div>
                      <div className="text-sm font-medium bg-success/10 text-success rounded-full px-2 py-1">
                        100%
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4">
                      <Progress className="h-2 bg-success/20" value={100} />
                      
                      <div className="flex justify-between text-sm">
                        <div>Total Paid</div>
                        <div className="font-medium">
                          {formatCurrency(debt.totalAmount)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div>Interest Rate</div>
                        <div className="font-medium flex items-center">
                          <Percent className="h-3 w-3 mr-1" />
                          {debt.interestRate.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-danger"
                      onClick={() => setDeletingDebt(debt)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Debt Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Debt</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDebt}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Debt Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Credit Card, Mortgage, Student Loan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="text-sm text-danger">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="totalAmount">Total Amount</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                  />
                  {errors.totalAmount && <p className="text-sm text-danger">{errors.totalAmount}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="remainingAmount">Remaining Amount</Label>
                  <Input
                    id="remainingAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={remainingAmount}
                    onChange={(e) => setRemainingAmount(e.target.value)}
                  />
                  {errors.remainingAmount && <p className="text-sm text-danger">{errors.remainingAmount}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                  {errors.interestRate && <p className="text-sm text-danger">{errors.interestRate}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="minimumPayment">Minimum Payment</Label>
                  <Input
                    id="minimumPayment"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={minimumPayment}
                    onChange={(e) => setMinimumPayment(e.target.value)}
                  />
                  {errors.minimumPayment && <p className="text-sm text-danger">{errors.minimumPayment}</p>}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="icon">Icon</Label>
                <div className="grid grid-cols-4 gap-2">
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
              <Button type="submit">Add Debt</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Debt Modal */}
      <Dialog open={!!editingDebt} onOpenChange={(open) => !open && setEditingDebt(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Debt</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditDebt}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Debt Name</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g. Credit Card, Mortgage, Student Loan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="text-sm text-danger">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-totalAmount">Total Amount</Label>
                  <Input
                    id="edit-totalAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                  />
                  {errors.totalAmount && <p className="text-sm text-danger">{errors.totalAmount}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-remainingAmount">Remaining Amount</Label>
                  <Input
                    id="edit-remainingAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={remainingAmount}
                    onChange={(e) => setRemainingAmount(e.target.value)}
                  />
                  {errors.remainingAmount && <p className="text-sm text-danger">{errors.remainingAmount}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-interestRate">Interest Rate (%)</Label>
                  <Input
                    id="edit-interestRate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                  {errors.interestRate && <p className="text-sm text-danger">{errors.interestRate}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-minimumPayment">Minimum Payment</Label>
                  <Input
                    id="edit-minimumPayment"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={minimumPayment}
                    onChange={(e) => setMinimumPayment(e.target.value)}
                  />
                  {errors.minimumPayment && <p className="text-sm text-danger">{errors.minimumPayment}</p>}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-dueDate">Due Date (Optional)</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingDebt(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Debt</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Make Payment Modal */}
      <Dialog open={!!payingDebt} onOpenChange={(open) => !open && setPayingDebt(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
          </DialogHeader>
          {payingDebt && (
            <form onSubmit={handleDebtPayment}>
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-danger/10 p-2 rounded-full text-danger">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{payingDebt.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Remaining: {formatCurrency(payingDebt.remainingAmount)}
                    </div>
                  </div>
                </div>

                <Progress 
                  className="h-2" 
                  value={Math.round(((payingDebt.totalAmount - payingDebt.remainingAmount) / payingDebt.totalAmount) * 100)} 
                />
                
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="paymentAmount">Payment Amount</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={payingDebt.remainingAmount}
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                  {errors.paymentAmount && (
                    <p className="text-sm text-danger">{errors.paymentAmount}</p>
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Minimum payment: {formatCurrency(payingDebt.minimumPayment)}</span>
                    <Button 
                      type="button" 
                      variant="link" 
                      className="h-auto p-0 text-xs"
                      onClick={() => setPaymentAmount(payingDebt.minimumPayment.toString())}
                    >
                      Pay minimum
                    </Button>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Full amount: {formatCurrency(payingDebt.remainingAmount)}</span>
                    <Button 
                      type="button" 
                      variant="link" 
                      className="h-auto p-0 text-xs"
                      onClick={() => setPaymentAmount(payingDebt.remainingAmount.toString())}
                    >
                      Pay in full
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPayingDebt(null)}>
                  Cancel
                </Button>
                <Button type="submit">Make Payment</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Mark Debt Complete Confirmation */}
      {completingDebt && (
        <DeleteConfirmationModal
          title={`Mark ${completingDebt.name} as Paid Off`}
          description={`Are you sure you want to mark this debt as completely paid off? This will set the remaining balance to $0.`}
          open={!!completingDebt}
          onOpenChange={(open) => !open && setCompletingDebt(null)}
          onConfirm={confirmMarkComplete}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingDebt && (
        <DeleteConfirmationModal
          title="Delete Debt"
          description={`Are you sure you want to delete "${deletingDebt.name}"? This action cannot be undone.`}
          open={!!deletingDebt}
          onOpenChange={(open) => !open && setDeletingDebt(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default DebtTracker;
