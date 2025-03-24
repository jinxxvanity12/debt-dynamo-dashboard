
import { useState } from "react";
import { useAppData } from "@/contexts/AppDataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { parse } from "date-fns";

const Reports = () => {
  const { data, selectedMonth } = useAppData();
  const [reportType, setReportType] = useState("income-vs-expenses");
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
  };

  // Prepare data for Income vs Expenses report (6 months)
  const incomeVsExpensesData = data.monthlyData.slice(0, 6).map(md => ({
    name: md.month.split(" ")[0].slice(0, 3),
    income: md.income,
    expenses: md.expenses,
    savings: md.income - md.expenses
  }));

  // Prepare data for Spending by Category report
  const spendingByCategoryData = () => {
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

    return Object.keys(categoryTotals).map(category => {
      const categoryObj = data.categories.find(c => c.name === category);
      return {
        name: category,
        value: categoryTotals[category],
        color: categoryObj?.color || "#8884d8"
      };
    });
  };

  // Prepare data for Monthly Savings Rate report
  const savingsRateData = data.monthlyData.slice(0, 6).map(md => ({
    name: md.month.split(" ")[0].slice(0, 3),
    rate: md.savingsRate
  }));

  // Pie chart colors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B"];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Select
          value={reportType}
          onValueChange={setReportType}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income-vs-expenses">Income vs Expenses</SelectItem>
            <SelectItem value="spending-by-category">Spending by Category</SelectItem>
            <SelectItem value="savings-rate">Savings Rate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {reportType === "income-vs-expenses" && (
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>
              Comparison of your income and expenses over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={incomeVsExpensesData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#22C55E" />
                  <Bar dataKey="expenses" name="Expenses" fill="#EF4444" />
                  <Bar dataKey="savings" name="Savings" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === "spending-by-category" && (
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>
              Breakdown of your expenses by category for {selectedMonth}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingByCategoryData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {spendingByCategoryData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === "savings-rate" && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Savings Rate</CardTitle>
            <CardDescription>
              Your savings rate as a percentage of income over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={savingsRateData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    name="Savings Rate (%)" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    dot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
