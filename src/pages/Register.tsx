
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { CircleDollarSign } from "lucide-react";

const Register = () => {
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/monthly-overview" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <CircleDollarSign className="h-6 w-6" />
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-bold">Welcome to SavingsSaga</h1>
          <p className="mt-2 text-muted-foreground">Your financial data is automatically saved</p>
        </div>

        <div className="mt-8 p-6 bg-white shadow-sm rounded-lg border border-border glass">
          <div className="text-center">
            <p>No registration needed. You're automatically signed in.</p>
            <div className="mt-4">
              <Button
                onClick={() => window.location.href = '/monthly-overview'}
                className="w-full"
              >
                Start Using App
              </Button>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <p className="text-sm text-center text-muted-foreground">
              Your data is persistently stored across all your devices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
