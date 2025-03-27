
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "@/contexts/AppDataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parse, isWithinInterval, startOfYear, endOfYear } from "date-fns";
import { ArrowRight, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const MonthlyOverview = () => {
  const { data, setSelectedMonth } = useAppData();
  const navigate = useNavigate();
  const [currentYear] = useState(new Date().getFullYear());
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  useEffect(() => {
    // Generate all months for the current year
    const months = [];
    const startDate = startOfYear(new Date(currentYear, 0, 1));
    const endDate = endOfYear(new Date(currentYear, 0, 1));
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, i, 1);
      if (isWithinInterval(date, { start: startDate, end: endDate })) {
        months.push(format(date, "MMMM yyyy"));
      }
    }
    
    setAvailableMonths(months);
  }, [currentYear]);

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    navigate("/dashboard");
  };

  const getMonthData = (month: string) => {
    return data.monthlyData.find(md => md.month === month);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Monthly Overview</h1>
        <div className="text-xl text-muted-foreground">{currentYear}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableMonths.map((month) => {
          const monthData = getMonthData(month);
          const income = monthData?.income || 0;
          const expenses = monthData?.expenses || 0;
          const balance = monthData?.balance || 0;
          const savingsRate = monthData?.savingsRate || 0;
          
          const monthDate = parse(month, "MMMM yyyy", new Date());
          const isCurrentMonth = format(new Date(), "MMMM yyyy") === month;
          const isPastMonth = monthDate < new Date();
          
          return (
            <Card 
              key={month} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                isCurrentMonth ? "border-primary border-2" : ""
              }`}
              onClick={() => handleMonthSelect(month)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>{month}</span>
                  {isCurrentMonth && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Current
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {isPastMonth ? "Historical data" : "Future planning"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-success">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Income</span>
                    </div>
                    <span className="text-sm font-bold">{formatCurrency(income)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-danger">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Expenses</span>
                    </div>
                    <span className="text-sm font-bold">{formatCurrency(expenses)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Balance</span>
                    </div>
                    <span className={`text-sm font-bold ${balance >= 0 ? "text-success" : "text-danger"}`}>
                      {formatCurrency(balance)}
                    </span>
                  </div>
                  
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-sm font-medium">Savings Rate</span>
                    <span className="text-sm font-bold">{savingsRate}%</span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                    <div
                      className={`h-2.5 rounded-full ${
                        savingsRate < 0 ? "bg-danger" : 
                        savingsRate < 10 ? "bg-warning" : "bg-success"
                      }`}
                      style={{ width: `${Math.max(0, savingsRate)}%` }}
                    ></div>
                  </div>
                </div>
                
                <Button className="w-full mt-4 flex items-center justify-center" variant="outline">
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyOverview;
