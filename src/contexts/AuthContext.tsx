
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

// Store users in localStorage for persistence with consistent keys
const USERS_STORAGE_KEY = "savings-saga-users";
const AUTH_USER_KEY = "savings-saga-auth-user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Enhanced user session restoration on initial load
  useEffect(() => {
    const restoreUserSession = () => {
      try {
        const storedUser = localStorage.getItem(AUTH_USER_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log("User session restored:", parsedUser.email);
        }
      } catch (error) {
        console.error("Failed to restore user session:", error);
        localStorage.removeItem(AUTH_USER_KEY);
      } finally {
        setLoading(false);
      }
    };

    restoreUserSession();
  }, []);

  // Get stored users or initialize empty object
  const getStoredUsers = (): Record<string, { id: string; name: string; email: string; password: string }> => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        return JSON.parse(storedUsers);
      }
    } catch (error) {
      console.error("Failed to parse stored users:", error);
    }
    return {};
  };

  // Save users to localStorage
  const saveUsers = (users: Record<string, { id: string; name: string; email: string; password: string }>) => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      // Also save to session storage to help with cross-browser persistence
      sessionStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      console.log("Users database updated, total users:", Object.keys(users).length);
    } catch (error) {
      console.error("Failed to save users:", error);
      toast.error("Failed to update user database");
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo account logic for quick testing
      if (email === "demo@example.com" && password === "password") {
        const userData = {
          id: "demo-user",
          name: "Demo User",
          email: "demo@example.com"
        };
        
        setUser(userData);
        // Store in both localStorage and sessionStorage for cross-browser support
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        document.cookie = `${AUTH_USER_KEY}=${JSON.stringify(userData)}; path=/; max-age=2592000`; // 30 days
        console.log("Demo user logged in");
        toast.success("Login successful");
        return true;
      }
      
      // Check stored users
      const users = getStoredUsers();
      const foundUser = Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (foundUser && foundUser.password === password) {
        const userData = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email
        };
        
        setUser(userData);
        // Store in both localStorage and sessionStorage for cross-browser support
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        document.cookie = `${AUTH_USER_KEY}=${JSON.stringify(userData)}; path=/; max-age=2592000`; // 30 days
        console.log("User logged in:", userData.email);
        toast.success("Login successful");
        return true;
      }
      
      console.log("Login failed for email:", email);
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
      
      // Check if email already exists (case insensitive)
      const users = getStoredUsers();
      
      if (Object.values(users).some(u => u.email.toLowerCase() === email.toLowerCase())) {
        console.log("Registration failed - email already exists:", email);
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
      // Store in both localStorage and sessionStorage for cross-browser support
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      document.cookie = `${AUTH_USER_KEY}=${JSON.stringify(userData)}; path=/; max-age=2592000`; // 30 days
      console.log("New user registered:", userData.email);
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
    sessionStorage.removeItem(AUTH_USER_KEY);
    document.cookie = `${AUTH_USER_KEY}=; path=/; max-age=0`;
    console.log("User logged out");
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
