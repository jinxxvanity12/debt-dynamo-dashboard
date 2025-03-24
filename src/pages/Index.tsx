
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4">Welcome to Savings Saga</h1>
        <p className="text-xl text-gray-600 mb-8">Your personal finance journey starts here. Track expenses, set budgets, and achieve your financial goals.</p>
        <div className="space-x-4">
          <Button onClick={() => navigate("/login")} variant="default" size="lg">
            Login
          </Button>
          <Button onClick={() => navigate("/register")} variant="outline" size="lg">
            Register
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
