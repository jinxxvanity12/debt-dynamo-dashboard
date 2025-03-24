
import { useState, useEffect } from "react";
import { useAppData } from "@/contexts/AppDataContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, ChevronLeft, ChevronRight, Plus, PencilLine } from "lucide-react";
import { Link } from "react-router-dom";
import { format, addMonths, parse, isThisMonth, isThisYear } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import AddTransactionModal from "@/components/modals/AddTransactionModal";

const Dashboard = () => {
  const { 
    data, 
    selectedMonth, 
    setSelectedMonth, 
    getCurrentMonthData, 
    getPreviousMonthData 
  } = useAppData();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const isMobile = useIsMobile();

  const currentMonthData = getCurrentMonthData();
  const previousMonthData = getPreviousMonthData();

  // Calculate spending by category
  const spendingByCategory = () => {
    const currentMonthTransactions = data.transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const selectedDate = parse(selectedMonth, "MMMM yyyy", new Date());
      return tx.type === "expense" && 
        txDate.getMonth() === selectedDate.getMonth() &&
        txDate.getFullYear() === selectedDate.getFullYear();
    });

    const categoryTotals = currentMonthTransactions.reduce((acc, transaction) => {
      const { category, amount } = transaction;
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(categoryTotals).map(category => ({
      name: category,
      value: categoryTotals[category],
      color: data.categories.find(c => c.name === category)?.color || "#8884d8"
    }));
  };

  // Calculate income vs expenses data
  const incomeVsExpensesData = () => {
    const monthsData = data.monthlyData.slice(0, 6);
    return monthsData.map(md => ({
      name: md.month.split(" ")[0].slice(0, 3),
      income: md.income,
      expenses: md.expenses
    }));
  };

  // Get recent transactions
  const recentTransactions = data.transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Navigate between months
  const handlePreviousMonth = () => {
    const currentDate = parse(selectedMonth, "MMMM yyyy", new Date());
    const previousMonth = addMonths(currentDate, -1);
    setSelectedMonth(format(previousMonth, "MMMM yyyy"));
  };

  const handleNextMonth = () => {
    const currentDate = parse(selectedMonth, "MMMM yyyy", new Date());
    const nextMonth = addMonths(currentDate, 1);
    const currentYear = new Date().getFullYear();
    
    // Prevent navigating beyond the current month in the current year
    if (nextMonth.getFullYear() > currentYear) {
      return;
    }
    
    if (nextMonth.getFullYear() === currentYear && nextMonth.getMonth() > new Date().getMonth()) {
      return;
    }
    
    setSelectedMonth(format(nextMonth, "MMMM yyyy"));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
  };

  // Calculate percentage change
  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const totalIncome = currentMonthData?.income || 0;
  const totalExpenses = currentMonthData?.expenses || 0;
  const currentBalance = currentMonthData?.balance || 0;
  const savingsRate = currentMonthData?.savingsRate || 0;

  const previousIncome = previousMonthData?.income || 0;
  const previousExpenses = previousMonthData?.expenses || 0;
  const previousBalance = previousMonthData?.balance || 0;
  const previousSavingsRate = previousMonthData?.savingsRate || 0;

  const incomeChange = calculateChange(totalIncome, previousIncome);
  const expenseChange = calculateChange(totalExpenses, previousExpenses);
  const balanceChange = calculateChange(currentBalance, previousBalance);
  const savingsRateChange = savingsRate - previousSavingsRate;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B"];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowAddTransaction(true)} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h2 className="text-2xl font-semibold mb-4 sm:mb-0">Dashboard</h2>
        <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-border p-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 font-medium">{selectedMonth}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className={`h-8 w-8 ${
              isThisMonth(parse(selectedMonth, "MMMM yyyy", new Date())) &&
              isThisYear(parse(selectedMonth, "MMMM yyyy", new Date()))
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={
              isThisMonth(parse(selectedMonth, "MMMM yyyy", new Date())) &&
              isThisYear(parse(selectedMonth, "MMMM yyyy", new Date()))
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold">{formatCurrency(currentBalance)}</div>
                <div className={`inline-flex items-center text-xs ${balanceChange >= 0 ? 'text-success' : 'text-danger'}`}>
                  <span>{balanceChange >= 0 ? '+' : ''}{balanceChange}%</span>
                </div>
              </div>
              <div className={`text-xs text-muted-foreground`}>
                {balanceChange >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(currentBalance - previousBalance))} from last month
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</div>
                <div className={`inline-flex items-center text-xs ${incomeChange >= 0 ? 'text-success' : 'text-danger'}`}>
                  <span>{incomeChange >= 0 ? '+' : ''}{incomeChange}%</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {incomeChange >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(totalIncome - previousIncome))} from last month
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold text-danger">{formatCurrency(totalExpenses)}</div>
                <div className={`inline-flex items-center text-xs ${expenseChange <= 0 ? 'text-success' : 'text-danger'}`}>
                  <span>{expenseChange >= 0 ? '+' : ''}{expenseChange}%</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {expenseChange >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(totalExpenses - previousExpenses))} from last month
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold">{savingsRate}%</div>
                <div className={`inline-flex items-center text-xs ${savingsRateChange >= 0 ? 'text-success' : 'text-danger'}`}>
                  <span>{savingsRateChange >= 0 ? '+' : ''}{savingsRateChange}%</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {savingsRateChange >= 0 ? '↑' : '↓'} {Math.abs(savingsRateChange)}% from last month
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Where your money is going this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingByCategory()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {spendingByCategory().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(name) => `Category: ${name}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Monthly comparison for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={incomeVsExpensesData()}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#22C55E" />
                  <Bar dataKey="expenses" name="Expenses" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">Recent Transactions</CardTitle>
            <Link to="/transactions">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-3 font-medium text-sm text-muted-foreground">Date</div>
                  <div className="col-span-4 font-medium text-sm text-muted-foreground">Description</div>
                  <div className="col-span-3 font-medium text-sm text-muted-foreground">Category</div>
                  <div className="col-span-2 font-medium text-sm text-muted-foreground text-right">Amount</div>
                  
                  {recentTransactions.map((transaction) => (
                    <React.Fragment key={transaction.id}>
                      <div className="col-span-3 text-sm">
                        {format(new Date(transaction.date), "MMM dd, yyyy")}
                      </div>
                      <div className="col-span-4 text-sm truncate-text">{transaction.description}</div>
                      <div className="col-span-3 text-sm">{transaction.category}</div>
                      <div className={`col-span-2 text-sm font-medium text-right ${
                        transaction.type === "income" ? "text-success" : "text-danger"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No recent transactions found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">Monthly Budget</CardTitle>
            <Link to="/budget">
              <Button variant="ghost" size="sm" className="gap-1">
                <PencilLine className="h-4 w-4 mr-1" />
                Adjust Budget
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.budgets.length > 0 ? (
                data.budgets.slice(0, 4).map((budget) => {
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
                  
                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{budget.category}</span>
                        <span>
                          {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            percentage >= 100
                              ? "bg-danger"
                              : percentage >= 80
                              ? "bg-warning"
                              : "bg-success"
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No budget categories found
                </div>
              )}
              
              {data.budgets.length > 4 && (
                <div className="text-center pt-2">
                  <Link to="/budget">
                    <Button variant="outline" size="sm">
                      Show {data.budgets.length - 4} more categories
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {showAddTransaction && (
        <AddTransactionModal 
          open={showAddTransaction} 
          onOpenChange={setShowAddTransaction} 
        />
      )}
    </div>
  );
};

export default Dashboard;
