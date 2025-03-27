
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

  // Enhanced user session restoration on initial load with synchronization
  useEffect(() => {
    const restoreUserSession = async () => {
      try {
        // Try to get user from localStorage first
        let storedUser = localStorage.getItem(AUTH_USER_KEY);
        
        // If not in localStorage, try sessionStorage
        if (!storedUser) {
          storedUser = sessionStorage.getItem(AUTH_USER_KEY);
        }
        
        // If not in sessionStorage, try cookies
        if (!storedUser) {
          const cookies = document.cookie.split(';').map(cookie => cookie.trim());
          const authCookie = cookies.find(cookie => cookie.startsWith(`${AUTH_USER_KEY}=`));
          if (authCookie) {
            storedUser = decodeURIComponent(authCookie.split('=')[1]);
          }
        }
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Ensure the user exists in local storage database
          const users = getStoredUsers();
          const userExists = Object.values(users).some(u => 
            u.email.toLowerCase() === parsedUser.email.toLowerCase()
          );
          
          if (userExists) {
            setUser(parsedUser);
            
            // Sync the user across all storage mechanisms
            storeUserInAllStorages(parsedUser);
            
            console.log("User session restored:", parsedUser.email);
          } else {
            console.warn("User found in session but not in users database");
            clearAllStorages();
          }
        }
      } catch (error) {
        console.error("Failed to restore user session:", error);
        clearAllStorages();
      } finally {
        setLoading(false);
      }
    };

    restoreUserSession();
    
    // Setup storage event listener to sync across tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === AUTH_USER_KEY) {
        if (event.newValue) {
          try {
            const parsedUser = JSON.parse(event.newValue);
            setUser(parsedUser);
          } catch (error) {
            console.error("Failed to parse user from storage event", error);
          }
        } else {
          // User logged out in another tab
          setUser(null);
        }
      } else if (event.key === USERS_STORAGE_KEY) {
        // Users database updated in another tab, no action needed here
        console.log("Users database updated in another tab");
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Clear all storage mechanisms
  const clearAllStorages = () => {
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    document.cookie = `${AUTH_USER_KEY}=; path=/; max-age=0; domain=${window.location.hostname}; SameSite=Lax`;
  };
  
  // Store user in all storage mechanisms
  const storeUserInAllStorages = (userData: User) => {
    const userJSON = JSON.stringify(userData);
    
    // Store in localStorage (persists across sessions)
    localStorage.setItem(AUTH_USER_KEY, userJSON);
    
    // Store in sessionStorage (persists during the session)
    sessionStorage.setItem(AUTH_USER_KEY, userJSON);
    
    // Store in cookies (accessible across subdomains)
    const domain = window.location.hostname;
    const maxAge = 365 * 24 * 60 * 60; // 1 year
    document.cookie = `${AUTH_USER_KEY}=${encodeURIComponent(userJSON)}; path=/; max-age=${maxAge}; domain=${domain}; SameSite=Lax; secure`;
  };

  // Get stored users or initialize empty object
  const getStoredUsers = (): Record<string, { id: string; name: string; email: string; password: string }> => {
    try {
      // First check localStorage
      let storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      
      if (!storedUsers) {
        // Check if users are in sessionStorage (less likely but possible)
        storedUsers = sessionStorage.getItem(USERS_STORAGE_KEY);
      }
      
      if (storedUsers) {
        return JSON.parse(storedUsers);
      }
    } catch (error) {
      console.error("Failed to parse stored users:", error);
    }
    return {};
  };

  // Save users to all storage mechanisms
  const saveUsers = (users: Record<string, { id: string; name: string; email: string; password: string }>) => {
    try {
      const usersJSON = JSON.stringify(users);
      
      // Save to localStorage (persists across sessions)
      localStorage.setItem(USERS_STORAGE_KEY, usersJSON);
      
      // Also save to sessionStorage for redundancy
      sessionStorage.setItem(USERS_STORAGE_KEY, usersJSON);
      
      console.log("Users database updated, total users:", Object.keys(users).length);
    } catch (error) {
      console.error("Failed to save users:", error);
      toast.error("Failed to update user database");
    }
  };

  // Auto-login with demo account for convenience
  useEffect(() => {
    const autoLogin = async () => {
      // Skip if already loaded or user is already authenticated
      if (!loading && !user) {
        // Create demo account if it doesn't exist
        const users = getStoredUsers();
        const demoUser = Object.values(users).find(u => u.email === "demo@example.com");
        
        if (!demoUser) {
          // Create demo account
          const userId = "demo-user";
          const newUser = {
            id: userId,
            name: "Demo User",
            email: "demo@example.com",
            password: "password"
          };
          
          users[userId] = newUser;
          saveUsers(users);
          
          // Auto-login with demo account
          const userData = {
            id: userId,
            name: "Demo User",
            email: "demo@example.com"
          };
          
          setUser(userData);
          storeUserInAllStorages(userData);
          toast.success("Logged in with demo account");
        } else {
          // Auto-login with existing demo account
          const userData = {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email
          };
          
          setUser(userData);
          storeUserInAllStorages(userData);
          toast.success("Logged in with demo account");
        }
      }
    };
    
    // Auto-login after a short delay
    const timer = setTimeout(autoLogin, 500);
    return () => clearTimeout(timer);
  }, [loading, user]);

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
        storeUserInAllStorages(userData);
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
        storeUserInAllStorages(userData);
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
      storeUserInAllStorages(userData);
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
    clearAllStorages();
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
