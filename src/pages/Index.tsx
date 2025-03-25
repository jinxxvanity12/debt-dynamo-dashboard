
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      title: "Expense Tracking",
      description: "Track all your income and expenses in one place"
    },
    {
      title: "Budget Management",
      description: "Create budgets for different categories and track your spending"
    },
    {
      title: "Savings Goals",
      description: "Set savings goals and track your progress"
    },
    {
      title: "Debt Tracking",
      description: "Manage your debts and track your repayment progress"
    },
    {
      title: "Custom Dashboard",
      description: "Customize your dashboard layout to see what matters most to you"
    },
    {
      title: "Monthly Reports",
      description: "Get insights into your spending habits with detailed reports"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <Card className="max-w-5xl w-full mx-4 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-4xl font-bold text-primary">Savings Saga</CardTitle>
          <CardDescription className="text-xl mt-2">Your personal finance journey starts here</CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Take control of your finances</h2>
                <p className="text-muted-foreground">
                  Track expenses, set budgets, and achieve your financial goals with a 
                  customizable dashboard that gives you insights into your spending habits.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="rounded-lg border p-3">
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button onClick={() => navigate("/login")} size="lg" className="flex-1">
                  Log in
                </Button>
                <Button onClick={() => navigate("/register")} variant="outline" size="lg" className="flex-1">
                  Create an account
                </Button>
              </div>
            </div>
            
            <div className="relative hidden md:block">
              <div className="aspect-square bg-primary/10 rounded-lg p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover opacity-30"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="font-bold text-xl">Your Financial Dashboard</div>
                    <p className="text-sm text-muted-foreground">Customizable, drag-and-drop interface</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded bg-white/90 p-3 shadow-sm">
                      <div className="text-sm font-medium">Monthly Balance</div>
                      <div className="text-xl font-bold text-primary">$2,450</div>
                    </div>
                    <div className="rounded bg-white/90 p-3 shadow-sm">
                      <div className="text-sm font-medium">Savings Rate</div>
                      <div className="text-xl font-bold text-success">25%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
