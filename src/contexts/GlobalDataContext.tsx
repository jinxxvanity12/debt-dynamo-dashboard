
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

// Types - reusing the same types from AppDataContext
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

export interface GlobalData {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  debts: Debt[];
  categories: Category[];
  monthlyData: MonthlyData[];
  selectedMonth: string;
}

interface GlobalDataContextType {
  data: GlobalData;
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

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

export const useGlobalData = () => {
  const context = useContext(GlobalDataContext);
  if (!context) {
    throw new Error("useGlobalData must be used within a GlobalDataProvider");
  }
  return context;
};

// Default categories
const defaultCategories: Category[] = [
  { id: "cat-1", name: "Housing", color: "#3B82F6", icon: "home", type: "expense" },
  { id: "cat-2", name: "Food", color: "#F97316", icon: "utensils", type: "expense" },
  { id: "cat-3", name: "Transportation", color: "#8B5CF6", icon: "car", type: "expense" },
  { id: "cat-4", name: "Utilities", color: "#10B981", icon: "bolt", type: "expense" },
  { id: "cat-5", name: "Entertainment", color: "#EC4899", icon: "music", type: "expense" },
  { id: "cat-6", name: "Healthcare", color: "#EF4444", icon: "heart", type: "expense" },
  { id: "cat-7", name: "Education", color: "#F59E0B", icon: "book", type: "expense" },
  { id: "cat-8", name: "Clothing", color: "#6366F1", icon: "shirt", type: "expense" },
  { id: "cat-9", name: "Salary", color: "#22C55E", icon: "briefcase", type: "income" },
  { id: "cat-10", name: "Investments", color: "#14B8A6", icon: "trending-up", type: "income" },
  { id: "cat-11", name: "Gifts", color: "#D946EF", icon: "gift", type: "income" },
  { id: "cat-12", name: "Other Income", color: "#0EA5E9", icon: "plus-circle", type: "income" },
];

// Sample transactions for demo
const sampleTransactions: Transaction[] = [
  {
    id: "tx-1",
    date: format(new Date(new Date().setDate(new Date().getDate() - 5)), "yyyy-MM-dd"),
    description: "Rent payment",
    amount: 1200,
    category: "Housing",
    type: "expense"
  },
  {
    id: "tx-2",
    date: format(new Date(new Date().setDate(new Date().getDate() - 3)), "yyyy-MM-dd"),
    description: "Grocery shopping",
    amount: 85.50,
    category: "Food",
    type: "expense"
  },
  {
    id: "tx-3",
    date: format(new Date(new Date().setDate(new Date().getDate() - 1)), "yyyy-MM-dd"),
    description: "Monthly salary",
    amount: 3200,
    category: "Salary",
    type: "income"
  },
  {
    id: "tx-4",
    date: format(new Date(new Date().setDate(new Date().getDate() - 7)), "yyyy-MM-dd"),
    description: "Electricity bill",
    amount: 120.75,
    category: "Utilities",
    type: "expense"
  },
  {
    id: "tx-5",
    date: format(new Date(new Date().setDate(new Date().getDate() - 10)), "yyyy-MM-dd"),
    description: "Investment dividend",
    amount: 250,
    category: "Investments",
    type: "income"
  }
];

// Sample budgets
const sampleBudgets: Budget[] = [
  { id: "budget-1", category: "Housing", amount: 1300 },
  { id: "budget-2", category: "Food", amount: 400 },
  { id: "budget-3", category: "Transportation", amount: 200 },
  { id: "budget-4", category: "Utilities", amount: 200 },
  { id: "budget-5", category: "Entertainment", amount: 150 }
];

// Sample savings goals
const sampleSavingsGoals: SavingsGoal[] = [
  { 
    id: "savings-1", 
    name: "Emergency Fund", 
    targetAmount: 10000, 
    currentAmount: 3500,
    icon: "shield"
  },
  { 
    id: "savings-2", 
    name: "Vacation", 
    targetAmount: 2500, 
    currentAmount: 1200,
    deadline: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), "yyyy-MM-dd"),
    icon: "plane"
  }
];

// Sample debts
const sampleDebts: Debt[] = [
  {
    id: "debt-1",
    name: "Credit Card",
    totalAmount: 2500,
    remainingAmount: 1800,
    interestRate: 19.99,
    minimumPayment: 100,
    isCompleted: false
  },
  {
    id: "debt-2",
    name: "Student Loan",
    totalAmount: 15000,
    remainingAmount: 8500,
    interestRate: 4.5,
    minimumPayment: 200,
    dueDate: format(new Date(new Date().setDate(new Date().getDate() + 15)), "yyyy-MM-dd"),
    isCompleted: false
  }
];

// Generate empty monthly data for the entire current year
const generateMonthlyData = (transactions: Transaction[]): MonthlyData[] => {
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

// Default data for new users
const generateDefaultData = (): GlobalData => {
  const monthlyData = generateMonthlyData(sampleTransactions);
  const currentMonth = format(new Date(), "MMMM yyyy");
  
  return {
    transactions: sampleTransactions,
    budgets: sampleBudgets,
    savingsGoals: sampleSavingsGoals,
    debts: sampleDebts,
    categories: defaultCategories,
    monthlyData,
    selectedMonth: currentMonth
  };
};

// Storage keys for multi-browser and multi-device syncing
const STORAGE_KEY = "savings-saga-global-data";

// Function to store data in localStorage, sessionStorage, and cookies for maximum persistence
const storeInAllStorages = (data: GlobalData) => {
  const dataJSON = JSON.stringify(data);
  
  // Store in localStorage (persists across sessions)
  try {
    localStorage.setItem(STORAGE_KEY, dataJSON);
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
  
  // Store in sessionStorage (persists during the session)
  try {
    sessionStorage.setItem(STORAGE_KEY, dataJSON);
  } catch (error) {
    console.error("Failed to save to sessionStorage:", error);
  }
  
  // Store in cookies (accessible across subdomains)
  try {
    const domain = window.location.hostname;
    const maxAge = 365 * 24 * 60 * 60; // 1 year
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(dataJSON)}; path=/; max-age=${maxAge}; domain=${domain}; SameSite=Lax`;
  } catch (error) {
    console.error("Failed to save to cookies:", error);
  }
};

export const GlobalDataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<GlobalData>(generateDefaultData());
  const [loading, setLoading] = useState(true);

  // Load data from storage on initial load
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      
      try {
        // Try to get data from localStorage first
        let storedData = localStorage.getItem(STORAGE_KEY);
        
        // If not in localStorage, try sessionStorage
        if (!storedData) {
          storedData = sessionStorage.getItem(STORAGE_KEY);
        }
        
        // If not in sessionStorage, try cookies
        if (!storedData) {
          const cookies = document.cookie.split(';').map(cookie => cookie.trim());
          const dataCookie = cookies.find(cookie => cookie.startsWith(`${STORAGE_KEY}=`));
          if (dataCookie) {
            storedData = decodeURIComponent(dataCookie.split('=')[1]);
          }
        }
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setData(parsedData);
          console.log("Data loaded successfully");
          
          // Sync across all storage mechanisms
          storeInAllStorages(parsedData);
        } else {
          // If no data found, use default data
          const defaultData = generateDefaultData();
          setData(defaultData);
          storeInAllStorages(defaultData);
          console.log("No existing data found, using default data");
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load your financial data");
        
        // Use default data in case of error
        const defaultData = generateDefaultData();
        setData(defaultData);
        storeInAllStorages(defaultData);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up storage event listener to sync data across tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const newData = JSON.parse(event.newValue);
          setData(newData);
          console.log("Data updated from another tab/window");
        } catch (error) {
          console.error("Error parsing data from storage event:", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Recalculate monthly data when transactions change
  useEffect(() => {
    if (data.transactions.length > 0) {
      const updatedMonthlyData = generateMonthlyData(data.transactions);
      
      if (JSON.stringify(updatedMonthlyData) !== JSON.stringify(data.monthlyData)) {
        setData(prevData => ({
          ...prevData,
          monthlyData: updatedMonthlyData
        }));
        
        storeInAllStorages({
          ...data,
          monthlyData: updatedMonthlyData
        });
      }
    }
  }, [data.transactions]);

  const setSelectedMonth = (month: string) => {
    const updatedData = { ...data, selectedMonth: month };
    setData(updatedData);
    storeInAllStorages(updatedData);
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
    storeInAllStorages(updatedData);
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
    storeInAllStorages(updatedData);
    toast.success("Transaction updated successfully");
  };

  const deleteTransaction = (id: string) => {
    const updatedTransactions = data.transactions.filter((tx) => tx.id !== id);
    
    const updatedData = {
      ...data,
      transactions: updatedTransactions
    };
    
    setData(updatedData);
    storeInAllStorages(updatedData);
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
    storeInAllStorages(updatedData);
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
    storeInAllStorages(updatedData);
    toast.success("Budget updated successfully");
  };

  const deleteBudget = (id: string) => {
    const updatedBudgets = data.budgets.filter((b) => b.id !== id);
    
    const updatedData = {
      ...data,
      budgets: updatedBudgets
    };
    
    setData(updatedData);
    storeInAllStorages(updatedData);
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
    storeInAllStorages(updatedData);
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
    storeInAllStorages(updatedData);
    toast.success("Savings goal updated successfully");
  };

  const deleteSavingsGoal = (id: string) => {
    const updatedSavingsGoals = data.savingsGoals.filter((sg) => sg.id !== id);
    
    const updatedData = {
      ...data,
      savingsGoals: updatedSavingsGoals
    };
    
    setData(updatedData);
    storeInAllStorages(updatedData);
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
      storeInAllStorages(updatedData);
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
    storeInAllStorages(updatedData);
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
    storeInAllStorages(updatedData);
    toast.success("Debt updated successfully");
  };

  const deleteDebt = (id: string) => {
    const updatedDebts = data.debts.filter((d) => d.id !== id);
    
    const updatedData = {
      ...data,
      debts: updatedDebts
    };
    
    setData(updatedData);
    storeInAllStorages(updatedData);
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
      storeInAllStorages(updatedData);
      
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
    storeInAllStorages(updatedData);
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
    storeInAllStorages(updatedData);
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
    storeInAllStorages(updatedData);
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
    storeInAllStorages(updatedData);
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

  return <GlobalDataContext.Provider value={value}>{children}</GlobalDataContext.Provider>;
};
