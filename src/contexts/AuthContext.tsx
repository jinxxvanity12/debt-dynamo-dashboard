
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Define a permanent user
const PERMANENT_USER: User = {
  id: "permanent-user",
  name: "Financial User",
  email: "user@financialapp.com"
};

// Global identifier for this app across all browsers and devices
const APP_IDENTIFIER = "savings-saga-global-app";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  // Simplified logout function that doesn't actually log out
  const logout = () => {
    toast.info("You're always signed in for persistent data access");
  };

  const value = {
    user: PERMANENT_USER,
    loading,
    isAuthenticated: true,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
