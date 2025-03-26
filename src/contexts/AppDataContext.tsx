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

// Default categories for new users - reduced to just essentials
const defaultCategories: Category[] = [
  { id: "cat-1", name: "Housing", color: "#3B82F6", icon: "home", type: "expense" },
  { id: "cat-2", name: "Food", color: "#F97316", icon: "utensils", type: "expense" },
  { id: "cat-3", name: "Transportation", color: "#8B5CF6", icon: "car", type: "expense" },
  { id: "cat-4", name: "Utilities", color: "#10B981", icon: "bolt", type: "expense" },
  { id: "cat-5", name: "Salary", color: "#22C55E", icon: "briefcase", type: "income" },
];

// Generate empty monthly data for the entire current year
const generateEmptyMonthlyData = (): MonthlyData[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 12 }, (_, i) => {
    const month = format(new Date(currentYear, i, 1), "MMMM yyyy");
    
    return {
      month,
      income: 0,
      expenses: 0,
      balance: 0,
      savingsRate: 0
    };
  });
};

// Empty data structure
const generateEmptyData = (): AppData => {
  const monthlyData = generateEmptyMonthlyData();
  const currentMonth = format(new Date(), "MMMM yyyy");
  
  return {
    transactions: [],
    budgets: [],
    savingsGoals: [],
    debts: [],
    categories: defaultCategories,
    monthlyData,
    selectedMonth: currentMonth
  };
};

// Local storage keys
const STORAGE_KEY_PREFIX = "savings-saga-";
const getStorageKey = (userId: string) => `${STORAGE_KEY_PREFIX}${userId}-data`;

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
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (data.transactions.length > 0 || data.monthlyData.length > 0) {
      const updatedMonthlyData = calculateMonthlyData(data.transactions);
      
      if (JSON.stringify(updatedMonthlyData) !== JSON.stringify(data.monthlyData)) {
        setData(prevData => ({
          ...prevData,
          monthlyData: updatedMonthlyData
        }));
        
        if (user) {
          saveData({
            ...data,
            monthlyData: updatedMonthlyData
          });
        }
      }
    }
  }, [data.transactions, user]);

  const calculateMonthlyData = (transactions: Transaction[]): MonthlyData[] => {
    const currentYear = new Date().getFullYear();
    const monthsInYear = Array.from({ length: 12 }, (_, i) => {
      return format(new Date(currentYear, i, 1), "MMMM yyyy");
    });
    
    const monthlyData: MonthlyData[] = monthsInYear.map(month => ({
      month,
      income: 0,
      expenses: 0,
      balance: 0,
      savingsRate: 0
    }));
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      
      if (transactionDate.getFullYear() === currentYear) {
        const monthIndex = transactionDate.getMonth();
        const monthData = monthlyData[monthIndex];
        
        if (transaction.type === "income") {
          monthData.income += transaction.amount;
        } else if (transaction.type === "expense") {
          monthData.expenses += transaction.amount;
        }
      }
    });
    
    monthlyData.forEach(monthData => {
      monthData.balance = monthData.income - monthData.expenses;
      
      if (monthData.income > 0) {
        monthData.savingsRate = Math.round((monthData.balance / monthData.income) * 100);
      } else {
        monthData.savingsRate = 0;
      }
    });
    
    return monthlyData;
  };

  const loadData = (userId: string) => {
    setLoading(true);
    
    try {
      let userData: AppData | null = null;
      
      const storedData = localStorage.getItem(getStorageKey(userId));
      if (storedData) {
        userData = JSON.parse(storedData);
      } else {
        userData = generateEmptyData();
        saveData(userData);
      }
      
      setData(userData);
      console.log(`Loaded data for user ${userId}`, userData);
    } catch (error) {
      console.error("Error loading app data:", error);
      toast.error("Failed to load your financial data");
      
      const emptyData = generateEmptyData();
      setData(emptyData);
    } finally {
      setLoading(false);
    }
  };

  const saveData = (newData: AppData) => {
    if (user) {
      localStorage.setItem(getStorageKey(user.id), JSON.stringify(newData));
      console.log(`Saved data for user ${user.id}`);
    }
  };

  const setSelectedMonth = (month: string) => {
    const updatedData = { ...data, selectedMonth: month };
    setData(updatedData);
    saveData(updatedData);
  };

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
    
    const updatedMonthlyData = calculateMonthlyData(updatedTransactions);
    
    const updatedData = {
      ...data,
      transactions: updatedTransactions,
      monthlyData: updatedMonthlyData
    };
    
    setData(updatedData);
    saveData(updatedData);
    toast.success("Transaction deleted successfully");
  };

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
