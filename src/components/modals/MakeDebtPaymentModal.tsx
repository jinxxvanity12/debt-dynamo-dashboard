
import { useState } from "react";
import { useAppData } from "@/contexts/AppDataContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface MakeDebtPaymentModalProps {
  debtId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MakeDebtPaymentModal = ({ debtId, open, onOpenChange }: MakeDebtPaymentModalProps) => {
  const { data, makeDebtPayment } = useAppData();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const debt = data.debts.find(d => d.id === debtId);

  if (!debt) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentAmount = Number(amount);
    
    if (!amount || isNaN(paymentAmount) || paymentAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }
    
    if (paymentAmount > debt.remainingAmount) {
      setError(`The payment amount cannot exceed the remaining debt (${debt.remainingAmount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      })})`);
      return;
    }
    
    makeDebtPayment(debtId, paymentAmount);
    setAmount("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Make Payment to {debt.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1">
              <Label>Current Progress</Label>
              <div className="text-sm">
                {debt.remainingAmount.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })} 
                {" remaining of "}
                {debt.totalAmount.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 mt-1">
                <div
                  className="h-2.5 rounded-full bg-primary"
                  style={{ width: `${Math.min(Math.round(((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100), 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Payment Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={debt.remainingAmount}
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
              />
              {error && <p className="text-sm text-danger">{error}</p>}
              <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                <p>Minimum payment: {debt.minimumPayment.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}</p>
                {debt.dueDate && (
                  <p>Due date: {format(new Date(debt.dueDate), "MMMM dd, yyyy")}</p>
                )}
                <p>Interest rate: {debt.interestRate}%</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Make Payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MakeDebtPaymentModal;
