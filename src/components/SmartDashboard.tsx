
import { useGlobalData } from "@/contexts/GlobalDataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Wallet, Target, CreditCard, AlertTriangle, Award } from "lucide-react";
import { format } from "date-fns";

const SmartDashboard = () => {
  const { data, getCurrentMonthData, getPreviousMonthData } = useGlobalData();
  const currentMonthData = getCurrentMonthData();
  const previousMonthData = getPreviousMonthData();

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const getIncomeChange = () => {
    if (previousMonthData && currentMonthData) {
      if (previousMonthData.income === 0) return 100;
      const change = ((currentMonthData.income - previousMonthData.income) / previousMonthData.income) * 100;
      return Math.round(change);
    }
    return 0;
  };

  const getExpenseChange = () => {
    if (previousMonthData && currentMonthData) {
      if (previousMonthData.expenses === 0) return 0;
      const change = ((currentMonthData.expenses - previousMonthData.expenses) / previousMonthData.expenses) * 100;
      return Math.round(change);
    }
    return 0;
  };

  const getExpensesByCategory = () => {
    const expensesByCategory: Record<string, number> = {};
    
    data.transactions
      .filter(tx => tx.type === "expense" && tx.date.startsWith(new Date().getFullYear().toString()))
      .forEach(tx => {
        if (!expensesByCategory[tx.category]) {
          expensesByCategory[tx.category] = 0;
        }
        expensesByCategory[tx.category] += tx.amount;
      });
    
    return Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const getTotalSavings = () => {
    return data.savingsGoals.reduce((total, goal) => total + goal.currentAmount, 0);
  };

  const getTotalSavingsTarget = () => {
    return data.savingsGoals.reduce((total, goal) => total + goal.targetAmount, 0);
  };

  const getTotalDebt = () => {
    return data.debts.reduce((total, debt) => total + debt.remainingAmount, 0);
  };

  const getBudgetProgress = (category: string) => {
    const budget = data.budgets.find(b => b.category === category);
    if (!budget) return 0;
    
    const spent = data.transactions
      .filter(tx => 
        tx.category === category && 
        tx.type === "expense" &&
        new Date(tx.date).getMonth() === new Date().getMonth() &&
        new Date(tx.date).getFullYear() === new Date().getFullYear()
      )
      .reduce((total, tx) => total + tx.amount, 0);
    
    return Math.min(Math.round((spent / budget.amount) * 100), 100);
  };

  const getTopInsight = () => {
    // Check savings rate
    if (currentMonthData && currentMonthData.savingsRate < 10) {
      return {
        title: "Low Savings Rate",
        description: "Your current savings rate is below 10%. Consider reducing non-essential expenses.",
        icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
        color: "text-amber-500"
      };
    }
    
    // Check budget overruns
    const overBudgetCategories = data.budgets.filter(budget => {
      const progress = getBudgetProgress(budget.category);
      return progress > 90;
    });
    
    if (overBudgetCategories.length > 0) {
      return {
        title: "Budget Alert",
        description: `You're close to or over budget in ${overBudgetCategories.length} categories.`,
        icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
        color: "text-red-500"
      };
    }
    
    // Check debt levels
    const totalDebt = getTotalDebt();
    const monthlyIncome = currentMonthData?.income || 0;
    
    if (totalDebt > monthlyIncome * 6) {
      return {
        title: "High Debt Level",
        description: "Your total debt exceeds 6 months of income. Consider focusing on debt reduction.",
        icon: <CreditCard className="h-8 w-8 text-rose-500" />,
        color: "text-rose-500"
      };
    }
    
    // Positive feedback
    if (currentMonthData && currentMonthData.savingsRate > 20) {
      return {
        title: "Great Savings Rate!",
        description: "You're saving more than 20% of your income. Keep up the good work!",
        icon: <Award className="h-8 w-8 text-green-500" />,
        color: "text-green-500"
      };
    }
    
    return {
      title: "Financial Overview",
      description: "Track your income, expenses, and savings goals all in one place.",
      icon: <Wallet className="h-8 w-8 text-blue-500" />,
      color: "text-blue-500"
    };
  };

  const insight = getTopInsight();
  const topExpenseCategories = getExpensesByCategory();
  const totalSavings = getTotalSavings();
  const savingsTarget = getTotalSavingsTarget();
  const savingsProgress = savingsTarget > 0 ? Math.round((totalSavings / savingsTarget) * 100) : 0;
  const incomeChange = getIncomeChange();
  const expenseChange = getExpenseChange();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Smart Finance Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Last updated: {format(new Date(), "MMMM d, yyyy")}
        </p>
      </div>

      {/* Smart Insight Card */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            {insight.icon}
            <span className={insight.color}>{insight.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{insight.description}</p>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonthData?.income || 0)}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              {incomeChange > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{incomeChange}% from last month</span>
                </>
              ) : incomeChange < 0 ? (
                <>
                  <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">{Math.abs(incomeChange)}% from last month</span>
                </>
              ) : (
                <span>No change from last month</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonthData?.expenses || 0)}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              {expenseChange > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">{expenseChange}% from last month</span>
                </>
              ) : expenseChange < 0 ? (
                <>
                  <TrendingDown className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">{Math.abs(expenseChange)}% from last month</span>
                </>
              ) : (
                <span>No change from last month</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonthData?.savingsRate || 0}%</div>
            <Progress value={currentMonthData?.savingsRate || 0} className="mt-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              Goal: 20% (Financial independence)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalDebt())}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.debts.filter(d => !d.isCompleted).length} active debts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Savings Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Savings Goals Progress</CardTitle>
          <CardDescription>
            {formatCurrency(totalSavings)} saved of {formatCurrency(savingsTarget)} target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={savingsProgress} className="h-2" />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.savingsGoals.map((goal) => {
              const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);
              return (
                <div key={goal.id} className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{goal.name}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Top Expense Categories</CardTitle>
          <CardDescription>Where your money is going this year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topExpenseCategories.map(([category, amount]) => {
              const budget = data.budgets.find(b => b.category === category);
              const progress = getBudgetProgress(category);
              const progressColor = progress > 90 ? "bg-red-500" : progress > 75 ? "bg-amber-500" : "bg-primary";
              
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category}</span>
                    <span>{formatCurrency(amount)}</span>
                  </div>
                  {budget && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="w-full">
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div 
                            className={`h-2 rounded-full ${progressColor}`} 
                            style={{ width: `${progress}%` }} 
                          />
                        </div>
                      </div>
                      <span className="ml-2 min-w-[40px] text-right">
                        {progress}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartDashboard;
