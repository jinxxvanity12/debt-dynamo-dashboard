
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

interface ContributeSavingsModalProps {
  savingsGoalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContributeSavingsModal = ({ savingsGoalId, open, onOpenChange }: ContributeSavingsModalProps) => {
  const { data, contributeSavings } = useAppData();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const savingsGoal = data.savingsGoals.find(goal => goal.id === savingsGoalId);

  if (!savingsGoal) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const contributionAmount = Number(amount);
    
    if (!amount || isNaN(contributionAmount) || contributionAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }
    
    contributeSavings(savingsGoalId, contributionAmount);
    setAmount("");
    onOpenChange(false);
  };

  const remaining = savingsGoal.targetAmount - savingsGoal.currentAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Contribute to {savingsGoal.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1">
              <Label>Current Progress</Label>
              <div className="text-sm">
                {savingsGoal.currentAmount.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })} 
                {" of "}
                {savingsGoal.targetAmount.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
                {" ("}
                {Math.round((savingsGoal.currentAmount / savingsGoal.targetAmount) * 100)}%
                {")"}
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 mt-1">
                <div
                  className="h-2.5 rounded-full bg-success"
                  style={{ width: `${Math.min(Math.round((savingsGoal.currentAmount / savingsGoal.targetAmount) * 100), 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Contribution Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
              />
              {error && <p className="text-sm text-danger">{error}</p>}
              <p className="text-sm text-muted-foreground">
                {remaining.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })} remaining to reach goal
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Contribute</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContributeSavingsModal;
