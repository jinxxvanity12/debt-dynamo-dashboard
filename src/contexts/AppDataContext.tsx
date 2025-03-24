
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

// Types
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon?: string;
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment: number;
  dueDate?: string;
  isCompleted: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  type: "income" | "expense";
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
}

export interface AppData {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  debts: Debt[];
  categories: Category[];
  monthlyData: MonthlyData[];
  selectedMonth: string;
}

interface AppDataContextType {
  data: AppData;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (budget: Omit<Budget, "id">) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  addSavingsGoal: (savingsGoal: Omit<SavingsGoal, "id">) => void;
  updateSavingsGoal: (savingsGoal: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeSavings: (id: string, amount: number) => void;
  addDebt: (debt: Omit<Debt, "id" | "isCompleted">) => void;
  updateDebt: (debt: Debt) => void;
  deleteDebt: (id: string) => void;
  makeDebtPayment: (id: string, amount: number) => void;
  markDebtComplete: (id: string) => void;
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  getCurrentMonthData: () => MonthlyData | undefined;
  getPreviousMonthData: () => MonthlyData | undefined;
  loading: boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
};

// Default categories for new users
const defaultCategories: Category[] = [
  { id: "cat-1", name: "Housing", color: "#3B82F6", icon: "home", type: "expense" },
  { id: "cat-2", name: "Food", color: "#F97316", icon: "utensils", type: "expense" },
  { id: "cat-3", name: "Transportation", color: "#8B5CF6", icon: "car", type: "expense" },
  { id: "cat-4", name: "Utilities", color: "#10B981", icon: "bolt", type: "expense" },
  { id: "cat-5", name: "Entertainment", color: "#EC4899", icon: "film", type: "expense" },
  { id: "cat-6", name: "Shopping", color: "#F43F5E", icon: "shopping-bag", type: "expense" },
  { id: "cat-7", name: "Healthcare", color: "#06B6D4", icon: "heart-pulse", type: "expense" },
  { id: "cat-8", name: "Salary", color: "#22C55E", icon: "briefcase", type: "income" },
  { id: "cat-9", name: "Investments", color: "#EAB308", icon: "trending-up", type: "income" },
  { id: "cat-10", name: "Gifts", color: "#D946EF", icon: "gift", type: "income" },
];

// Generate 12 months of demo data
const generateMonthlyData = (): MonthlyData[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 12 }, (_, i) => {
    const month = format(new Date(currentYear, i, 1), "MMMM yyyy");
    const income = 3000 + Math.floor(Math.random() * 1000);
    const expenses = 2000 + Math.floor(Math.random() * 500);
    const balance = income - expenses;
    const savingsRate = Math.round((balance / income) * 100);
    
    return {
      month,
      income,
      expenses,
      balance,
      savingsRate
    };
  });
};

// Sample demo data
const generateDemoData = (): AppData => {
  const monthlyData = generateMonthlyData();
  const currentMonth = format(new Date(), "MMMM yyyy");
  
  const demoTransactions: Transaction[] = [
    {
      id: "tx-1",
      date: format(new Date(), "yyyy-MM-dd"),
      description: "Salary deposit",
      amount: 3500,
      category: "Salary",
      type: "income"
    },
    {
      id: "tx-2",
      date: format(new Date(), "yyyy-MM-dd"),
      description: "Rent payment",
      amount: 1200,
      category: "Housing",
      type: "expense"
    },
    {
      id: "tx-3",
      date: format(new Date(), "yyyy-MM-dd"),
      description: "Grocery shopping",
      amount: 150,
      category: "Food",
      type: "expense"
    },
    {
      id: "tx-4",
      date: format(new Date(), "yyyy-MM-dd"),
      description: "Gas",
      amount: 45,
      category: "Transportation",
      type: "expense"
    },
    {
      id: "tx-5",
      date: format(new Date(), "yyyy-MM-dd"),
      description: "Restaurant dinner",
      amount: 80,
      category: "Food",
      type: "expense"
    }
  ];
  
  const demoBudgets: Budget[] = [
    { id: "budget-1", category: "Housing", amount: 1200 },
    { id: "budget-2", category: "Food", amount: 500 },
    { id: "budget-3", category: "Transportation", amount: 300 },
    { id: "budget-4", category: "Utilities", amount: 200 },
    { id: "budget-5", category: "Entertainment", amount: 150 }
  ];
  
  const demoSavingsGoals: SavingsGoal[] = [
    {
      id: "savings-1",
      name: "Emergency Fund",
      targetAmount: 10000,
      currentAmount: 5000,
      deadline: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), "yyyy-MM-dd")
    },
    {
      id: "savings-2",
      name: "Vacation",
      targetAmount: 3000,
      currentAmount: 1200,
      deadline: format(new Date(new Date().setMonth(new Date().getMonth() + 3)), "yyyy-MM-dd")
    },
    {
      id: "savings-3",
      name: "New Car",
      targetAmount: 20000,
      currentAmount: 2500,
      deadline: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), "yyyy-MM-dd")
    }
  ];
  
  const demoDebts: Debt[] = [
    {
      id: "debt-1",
      name: "Credit Card",
      totalAmount: 5000,
      remainingAmount: 3200,
      interestRate: 17.99,
      minimumPayment: 100,
      dueDate: format(new Date(new Date().setDate(new Date().getDate() + 15)), "yyyy-MM-dd"),
      isCompleted: false
    },
    {
      id: "debt-2",
      name: "Student Loan",
      totalAmount: 25000,
      remainingAmount: 18000,
      interestRate: 4.5,
      minimumPayment: 250,
      dueDate: format(new Date(new Date().setDate(new Date().getDate() + 20)), "yyyy-MM-dd"),
      isCompleted: false
    },
    {
      id: "debt-3",
      name: "Car Loan",
      totalAmount: 15000,
      remainingAmount: 8500,
      interestRate: 3.9,
      minimumPayment: 350,
      dueDate: format(new Date(new Date().setDate(new Date().getDate() + 10)), "yyyy-MM-dd"),
      isCompleted: false
    }
  ];
  
  return {
    transactions: demoTransactions,
    budgets: demoBudgets,
    savingsGoals: demoSavingsGoals,
    debts: demoDebts,
    categories: defaultCategories,
    monthlyData,
    selectedMonth: currentMonth
  };
};

// Local storage keys
const STORAGE_KEY_PREFIX = "savings-saga-";
const getStorageKey = (userId: string, key: string) => `${STORAGE_KEY_PREFIX}${userId}-${key}`;

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<AppData>({
    transactions: [],
    budgets: [],
    savingsGoals: [],
    debts: [],
    categories: [],
    monthlyData: [],
    selectedMonth: format(new Date(), "MMMM yyyy")
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadData(user.id);
    } else {
      // If not authenticated, reset data to empty
      setData({
        transactions: [],
        budgets: [],
        savingsGoals: [],
        debts: [],
        categories: [],
        monthlyData: [],
        selectedMonth: format(new Date(), "MMMM yyyy")
      });
    }
  }, [isAuthenticated, user]);

  const loadData = (userId: string) => {
    setLoading(true);
    
    try {
      // For each data type, try to load from localStorage or use demo data
      let userData: AppData | null = null;
      
      const storedData = localStorage.getItem(getStorageKey(userId, "appData"));
      if (storedData) {
        userData = JSON.parse(storedData);
      } else {
        // If no data is found, use demo data
        userData = generateDemoData();
        // Save demo data to localStorage
        localStorage.setItem(getStorageKey(userId, "appData"), JSON.stringify(userData));
      }
      
      setData(userData);
    } catch (error) {
      console.error("Error loading app data:", error);
      toast.error("Failed to load your financial data");
      
      // Fallback to demo data
      const demoData = generateDemoData();
      setData(demoData);
    } finally {
      setLoading(false);
    }
  };

  // Save all data to localStorage
  const saveData = (newData: AppData) => {
    if (user) {
      localStorage.setItem(getStorageKey(user.id, "appData"), JSON.stringify(newData));
    }
  };

  // Set selected month
  const setSelectedMonth = (month: string) => {
    const updatedData = { ...data, selectedMonth: month };
    setData(updatedData);
    saveData(updatedData);
  };

  // Transaction methods
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: `tx-${Date.now()}`
    };
    
    const updatedData = {
      ...data,
      transactions: [...data.transactions, newTransaction]
    };
    
    setData(updatedData);
    saveData(updatedData);
    toast.success("Transaction added successfully");
  };

  const updateTransaction = (transaction: Transaction) => {
    const updatedTransactions = data.transactions.map((tx) =>
      tx.id === transaction.id ? transaction : tx
    );
    
    const updatedData = {
      ...data,
      transactions: updatedTransactions
    };
    
    setData(updatedData);
    saveData(updatedData);
    toast.success("Transaction updated successfully");
  };

  const deleteTransaction = (id: string) => {
    const updatedTransactions = data.transactions.filter((tx) => tx.id !== id);
    
    const updatedData = {
      ...data,
      transactions: updatedTransactions
    };
    
    setData(updatedData);
    saveData(updatedData);
    toast.success("Transaction deleted successfully");
  };

  // Budget methods
  const addBudget = (budget: Omit<Budget, "id">) => {
    const newBudget = {
      ...budget,
      id: `budget-${Date.now()}`
    };
    
    const updatedData = {
      ...data,
      budgets: [...data.budgets, newBudget]
    };
    
    setData(updatedData);
    saveData(updatedData);
    toast.success("Budget added successfully");
  };

  const updateBudget = (budget: Budget) => {
    const updatedBudgets = data.budgets.map((b) =>
      b.id === budget.id ? budget : b
    );
    
    const updatedData = {
      ...data,
      budgets: updatedBudgets
    };
    
    setData(updatedData);
    saveData(updatedData);
    toast.success("Budget updated successfully");
  };

  const deleteBudget = (id: string) => {
    const updatedBudgets = data.budgets.filter((b) => b.id !== id);
    
    const updatedData = {
      ...data,
      budgets: updatedBudgets
    };
    
    setData(updatedData);
    saveData(updatedData);
    toast.success("Budget deleted successfully");
  };

  // Savings goal methods
  const addSavingsGoal = (savingsGoal: Omit<SavingsGoal, "id">) => {
    const newSavingsGoal = {
      ...savingsGoal,
      id: `savings-${Date.now()}`
    };
    
    const updatedData = {
      ...data,
      savingsGoals: [...data.savingsGoals, newSavingsGoal]
    };
    
    setData(updatedData);
    saveData(updatedData);
    toast.success("Savings goal added successfully");
  };

  const updateSavingsGoal = (savingsGoal: SavingsGoal) => {
    const updatedSavingsGoals = data.savingsGoals.map((sg) =>
      sg.id === savingsGoal.id ? savingsGoal : sg
    );
    
    const updatedData = {
      ...data,
      savingsGoals: updatedSavingsGoals
    };
    
    setData(updatedData);
    saveData(updatedData);
    toast.success("Savings goal updated successfully");
  };

  const deleteSavingsGoal = (id: string) => {
    const updatedSavingsGoals = data.savingsGoals.filter((sg) => sg.id !== id);
    
    const updatedData = {
      ...data,
      savingsGoals: updatedSavingsGoals
    };
    
    setData(updatedData);
    saveData(updatedData);
    toast.success("Savings goal deleted successfully");
  };

  const contributeSavings = (id: string, amount: number) => {
    const updatedSavingsGoals = data.savingsGoals.map((sg) => {
      if (sg.id === id) {
        const currentAmount = sg.currentAmount + amount;
        return {
          ...sg,
          currentAmount
        };
      }
      return sg;
    });
    
    // Add a transaction for this contribution
    const savingsGoal = data.savingsGoals.find(sg => sg.id === id);
    if (savingsGoal) {
      const newTransaction = {
        id: `tx-${Date.now()}`,
        date: format(new Date(), "yyyy-MM-dd"),
        description: `Contribution to ${savingsGoal.name}`,
        amount,
        category: "Savings",
        type: "expense" as const
      };
      
      const updatedData = {
        ...data,
        savingsGoals: updatedSavingsGoals,
        transactions: [...data.transactions, newTransaction]
      };
      
      setData(updatedData);
      saveData(updatedData);
      toast.success(`Added ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} to ${savingsGoal.name}`);
    }
  };

  // Debt methods
  const addDebt = (debt: Omit<Debt, "id" | "isCompleted">) => {
    const newDebt = {
      ...debt,
      id: `debt-${Date.now()}`,
      isCompleted: false
    };
    
    const updatedData = {
      ...data,
      debts: [...data.debts, newDebt]
    };
    
    setData(updatedData);
    saveData(updatedData);
    toast.success("Debt added successfully");
  };

  const updateDebt = (debt: Debt) => {
    const updatedDebts = data.debts.map((d) =>
      d.id === debt.id ? debt : d
    );
    
    const updatedData = {
      ...data,
      debts: updatedDebts
    };
    
    setData(updatedData);
    saveData(updatedData);
    toast.success("Debt updated successfully");
  };

  const deleteDebt = (id: string) => {
    const updatedDebts = data.debts.filter((d) => d.id !== id);
    
    const updatedData = {
      ...data,
      debts: updatedDebts
    };
    
    setData(updatedData);
    saveData(updatedData);
    toast.success("Debt deleted successfully");
  };

  const makeDebtPayment = (id: string, amount: number) => {
    const updatedDebts = data.debts.map((d) => {
      if (d.id === id) {
        const remainingAmount = Math.max(0, d.remainingAmount - amount);
        const isCompleted = remainingAmount === 0;
        
        return {
          ...d,
          remainingAmount,
          isCompleted
        };
      }
      return d;
    });
    
    // Add a transaction for this payment
    const debt = data.debts.find(d => d.id === id);
    if (debt) {
      const newTransaction = {
        id: `tx-${Date.now()}`,
        date: format(new Date(), "yyyy-MM-dd"),
        description: `Payment to ${debt.name}`,
        amount,
        category: "Debt Payment",
        type: "expense" as const
      };
      
      const updatedData = {
        ...data,
        debts: updatedDebts,
        transactions: [...data.transactions, newTransaction]
      };
      
      setData(updatedData);
      saveData(updatedData);
      
      if (updatedDebts.find(d => d.id === id)?.isCompleted) {
        toast.success(`Congratulations! ${debt.name} is now fully paid off!`);
      } else {
        toast.success(`Payment of ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} to ${debt.name} recorded`);
      }
    }
  };

  const markDebtComplete = (id: string) => {
    const updatedDebts = data.debts.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          remainingAmount: 0,
          isCompleted: true
        };
      }
      return d;
    });
    
    const updatedData = {
      ...data,
      debts: updatedDebts
    };
    
    setData(updatedData);
    saveData(updatedData);
    toast.success("Debt marked as completed");
  };

  // Category methods
  const addCategory = (category: Omit<Category, "id">) => {
    const newCategory = {
      ...category,
      id: `cat-${Date.now()}`
    };
    
    const updatedData = {
      ...data,
      categories: [...data.categories, newCategory]
    };
    
    setData(updatedData);
    saveData(updatedData);
    toast.success("Category added successfully");
  };

  const updateCategory = (category: Category) => {
    const updatedCategories = data.categories.map((c) =>
      c.id === category.id ? category : c
    );
    
    const updatedData = {
      ...data,
      categories: updatedCategories
    };
    
    setData(updatedData);
    saveData(updatedData);
    toast.success("Category updated successfully");
  };

  const deleteCategory = (id: string) => {
    // Check if category is in use
    const isInUse = data.transactions.some(tx => {
      const category = data.categories.find(c => c.id === id);
      return category && tx.category === category.name;
    }) || data.budgets.some(b => {
      const category = data.categories.find(c => c.id === id);
      return category && b.category === category.name;
    });
    
    if (isInUse) {
      toast.error("Cannot delete a category that is in use");
      return;
    }
    
    const updatedCategories = data.categories.filter((c) => c.id !== id);
    
    const updatedData = {
      ...data,
      categories: updatedCategories
    };
    
    setData(updatedData);
    saveData(updatedData);
    toast.success("Category deleted successfully");
  };

  // Helper methods for monthly data
  const getCurrentMonthData = () => {
    return data.monthlyData.find(md => md.month === data.selectedMonth);
  };

  const getPreviousMonthData = () => {
    const currentIndex = data.monthlyData.findIndex(md => md.month === data.selectedMonth);
    if (currentIndex > 0) {
      return data.monthlyData[currentIndex - 1];
    }
    return undefined;
  };

  const value = {
    data,
    selectedMonth: data.selectedMonth,
    setSelectedMonth,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    contributeSavings,
    addDebt,
    updateDebt,
    deleteDebt,
    makeDebtPayment,
    markDebtComplete,
    addCategory,
    updateCategory,
    deleteCategory,
    getCurrentMonthData,
    getPreviousMonthData,
    loading
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};
