import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Expense, ExpenseCategory } from "../types";

interface FinanceState {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) => void;
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
}

const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      expenses: [],

      addExpense: (expenseData) => {
        const newExpense: Expense = {
          ...expenseData,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          expenses: [...state.expenses, newExpense],
        }));
      },

      updateExpense: (id, updates) => {
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id
              ? { ...expense, ...updates, updatedAt: new Date() }
              : expense
          ),
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }));
      },

      getExpensesByDate: (date) => {
        const expenses = get().expenses;
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        return expenses.filter((expense) => {
          const expenseDate = new Date(expense.date);
          expenseDate.setHours(0, 0, 0, 0);
          return expenseDate.getTime() === targetDate.getTime();
        });
      },

      getExpensesByDateRange: (startDate, endDate) => {
        const expenses = get().expenses;
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        return expenses.filter((expense) => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= start && expenseDate <= end;
        });
      },

      getExpensesByCategory: (category) => {
        return get().expenses.filter((expense) => expense.category === category);
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
        return get().expenses
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit);
      },
    }),
    {
      name: "finance-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useFinanceStore;