
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md animate-fade-in">
        <div className="bg-primary/10 p-4 rounded-full inline-flex mx-auto">
          <CircleDollarSign className="h-12 w-12 text-primary" />
        </div>
        
        <h1 className="text-7xl font-bold text-primary">404</h1>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Button 
          onClick={() => navigate("/")} 
          className="mt-8"
          size="lg"
        >
          <Home className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
