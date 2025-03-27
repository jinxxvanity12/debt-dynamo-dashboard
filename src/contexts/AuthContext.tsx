
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Create a default user that will be used for all sessions
const DEFAULT_USER: User = {
  id: "default-user",
  name: "Default User",
  email: "user@example.com"
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always set the default user for all sessions
    setUser(DEFAULT_USER);
    setLoading(false);
    console.log("Default user set:", DEFAULT_USER.email);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: true, // Always authenticated with default user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
