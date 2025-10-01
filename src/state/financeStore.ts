import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Expense, ExpenseCategory } from "../types";

interface FinanceState {
  expenses: Expense[];
  userId: string | null;
  setUserId: (userId: string | null) => void;
  addExpense: (expense: Omit<Expense, "id" | "createdAt" | "updatedAt" | "userId">) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpensesByDate: (date: Date) => Expense[];
  getExpensesByDateRange: (startDate: Date, endDate: Date) => Expense[];
  getExpensesByCategory: (category: ExpenseCategory) => Expense[];
  getTotalSpending: (startDate: Date, endDate: Date) => number;
  getWeeklySpending: () => number;
  getDailySpending: (days: number) => Record<string, number>;
  getCategorySpending: (startDate: Date, endDate: Date) => Record<ExpenseCategory, number>;
  getRecentExpenses: (limit?: number) => Expense[];
  clearUserData: () => void;
}

const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      expenses: [],
      userId: null,

      setUserId: (userId) => set({ userId }),

      addExpense: (expenseData) => {
        const { userId } = get();
        if (!userId) return;

        const newExpense: Expense = {
          ...expenseData,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          expenses: [...state.expenses, newExpense],
        }));
      },

      updateExpense: (id, updates) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id && expense.userId === userId
              ? { ...expense, ...updates, updatedAt: new Date() }
              : expense
          ),
        }));
      },

      deleteExpense: (id) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id || expense.userId !== userId),
        }));
      },

      getExpensesByDate: (date) => {
        const { expenses, userId } = get();
        if (!userId) return [];
        
        const userExpenses = expenses.filter(expense => expense.userId === userId);
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        return userExpenses.filter((expense) => {
          const expenseDate = new Date(expense.date);
          expenseDate.setHours(0, 0, 0, 0);
          return expenseDate.getTime() === targetDate.getTime();
        });
      },

      getExpensesByDateRange: (startDate, endDate) => {
        const { expenses, userId } = get();
        if (!userId) return [];
        
        const userExpenses = expenses.filter(expense => expense.userId === userId);
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        return userExpenses.filter((expense) => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= start && expenseDate <= end;
        });
      },

      getExpensesByCategory: (category) => {
        const { expenses, userId } = get();
        if (!userId) return [];
        return expenses.filter((expense) => expense.category === category && expense.userId === userId);
      },

      getTotalSpending: (startDate, endDate) => {
        const expenses = get().getExpensesByDateRange(startDate, endDate);
        return expenses.reduce((total, expense) => total + expense.amount, 0);
      },

      getWeeklySpending: () => {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        return get().getTotalSpending(weekStart, weekEnd);
      },

      getDailySpending: (days) => {
        const dailySpending: Record<string, number> = {};
        const today = new Date();
        
        for (let i = 0; i < days; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateKey = date.toISOString().split("T")[0];
          const dayExpenses = get().getExpensesByDate(date);
          dailySpending[dateKey] = dayExpenses.reduce((total, expense) => total + expense.amount, 0);
        }
        
        return dailySpending;
      },

      getCategorySpending: (startDate, endDate) => {
        const expenses = get().getExpensesByDateRange(startDate, endDate);
        const categorySpending: Record<ExpenseCategory, number> = {
          food: 0,
          transport: 0,
          utilities: 0,
          entertainment: 0,
          health: 0,
          shopping: 0,
          home: 0,
          other: 0,
        };
        
        expenses.forEach((expense) => {
          categorySpending[expense.category] += expense.amount;
        });
        
        return categorySpending;
      },

      getRecentExpenses: (limit = 5) => {
        const { expenses, userId } = get();
        if (!userId) return [];
        
        return expenses
          .filter(expense => expense.userId === userId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit);
      },

      clearUserData: () => {
        set({ expenses: [], userId: null });
      },
    }),
    {
      name: "finance-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        expenses: state.expenses.filter(expense => expense.userId === state.userId),
        userId: state.userId 
      }),
    }
  )
);

export default useFinanceStore;