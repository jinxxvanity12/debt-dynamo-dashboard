
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
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

// Store users in localStorage for persistence
const USERS_STORAGE_KEY = "savings-saga-users";
const AUTH_USER_KEY = "savings-saga-auth-user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }
    
    setLoading(false);
  }, []);

  // Get stored users or initialize empty array
  const getStoredUsers = (): Record<string, { id: string; name: string; email: string; password: string }> => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      try {
        return JSON.parse(storedUsers);
      } catch (error) {
        console.error("Failed to parse stored users:", error);
      }
    }
    return {};
  };

  // Save users to localStorage
  const saveUsers = (users: Record<string, { id: string; name: string; email: string; password: string }>) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo account logic for quick testing
      if (email === "demo@example.com" && password === "password") {
        const userData = {
          id: "user-1",
          name: "Demo User",
          email: "demo@example.com"
        };
        
        setUser(userData);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        toast.success("Login successful");
        return true;
      }
      
      // Check stored users
      const users = getStoredUsers();
      const foundUser = Object.values(users).find(u => u.email === email);
      
      if (foundUser && foundUser.password === password) {
        const userData = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email
        };
        
        setUser(userData);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        toast.success("Login successful");
        return true;
      }
      
      toast.error("Invalid email or password");
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      const users = getStoredUsers();
      
      if (Object.values(users).some(u => u.email === email)) {
        toast.error("Email already in use");
        return false;
      }
      
      const userId = `user-${Date.now()}`;
      const newUser = {
        id: userId,
        name,
        email,
        password
      };
      
      // Save new user
      users[userId] = newUser;
      saveUsers(users);
      
      const userData = {
        id: userId,
        name,
        email
      };
      
      setUser(userData);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      toast.success("Registration successful");
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
    toast.success("Logged out successfully");
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
