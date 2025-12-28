import "react-native-get-random-values";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Expense, ExpenseCategory } from "../types";
import { supabase } from "../config/supabase";

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
  getMonthlySpending: (year: number, month: number) => Record<string, number>;
  getCategorySpending: (startDate: Date, endDate: Date) => Record<ExpenseCategory, number>;
  getRecentExpenses: (limit?: number) => Expense[];
  subscribeToExpenses: () => () => void;
  clearUserData: () => void;
}

const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      expenses: [],
      userId: null,

      setUserId: (userId) => set({ userId }),

      addExpense: async (expenseData) => {
        const { userId } = get();
        const hasValidUser = userId && uuidValidate(userId);

        const expenseId = uuidv4();
        const newExpense: Expense = {
          ...expenseData,
          id: expenseId,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Save locally first
        set((state) => ({
          expenses: [...state.expenses, newExpense],
        }));

        // Save to Supabase only if userId is a valid UUID (matches table schema)
        if (!hasValidUser) {
          console.warn("⚠️ Skipping Supabase expense save: userId is not a valid UUID", userId);
          return;
        }

        try {
          console.log("💾 Saving expense to Supabase...", {
            userId,
            expenseId,
          });

          const { data, error } = await supabase
            .from("expenses")
            .insert({
              id: expenseId,
              user_id: userId,
              amount: newExpense.amount,
              description: newExpense.description,
              category: newExpense.category,
              expense_date: newExpense.date.toISOString(),
              receipt_url: (newExpense as any).receiptUrl ?? null,
              created_at: newExpense.createdAt.toISOString(),
            })
            .select()
            .single();

          if (error) {
            console.error("❌ Error saving expense to Supabase:", error);
          } else {
            console.log("✅ Expense successfully saved to Supabase:", data?.id || expenseId);
            // Update local expense with the actual ID from Supabase if different
            if (data?.id && data.id !== expenseId) {
              set((state) => ({
                expenses: state.expenses.map((e) =>
                  e.id === expenseId ? { ...e, id: data.id } : e
                ),
              }));
            }
          }
        } catch (error) {
          console.error("❌ Unexpected error saving expense to Supabase:", error);
        }
      },

      updateExpense: async (id, updates) => {
        const { userId } = get();
        if (!userId) return;

        // Update locally
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id && expense.userId === userId
              ? { ...expense, ...updates, updatedAt: new Date() }
              : expense
          ),
        }));

        // Update in Supabase
        try {
          const payload: any = {};

          if (updates.amount !== undefined) payload.amount = updates.amount;
          if (updates.description !== undefined) payload.description = updates.description;
          if (updates.category !== undefined) payload.category = updates.category;
          if (updates.date !== undefined) {
            payload.expense_date = new Date(updates.date).toISOString();
          }
          if ((updates as any).receiptUrl !== undefined) {
            payload.receipt_url = (updates as any).receiptUrl;
          }

          const { error } = await supabase
            .from("expenses")
            .update(payload)
            .eq("id", id)
            .eq("user_id", userId);

          if (error) {
            console.error("❌ Error updating expense in Supabase:", error);
          } else {
            console.log("✅ Expense updated in Supabase:", id);
          }
        } catch (error) {
          console.error("❌ Unexpected error updating expense in Supabase:", error);
        }
      },

      deleteExpense: async (id) => {
        const { userId } = get();
        if (!userId) return;

        // Delete locally
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id || expense.userId !== userId),
        }));

        // Delete from Supabase
        try {
          const { error } = await supabase
            .from("expenses")
            .delete()
            .eq("id", id)
            .eq("user_id", userId);

          if (error) {
            console.error("❌ Error deleting expense from Supabase:", error);
          } else {
            console.log("✅ Expense deleted from Supabase:", id);
          }
        } catch (error) {
          console.error("❌ Unexpected error deleting expense from Supabase:", error);
        }
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

      getMonthlySpending: (year, month) => {
        const weeklySpending: Record<string, number> = {};
        
        // Get the number of days in the month
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // Group expenses by week (Monday to Sunday)
        const weekTotals: Record<string, number> = {};
        
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month - 1, day); // month is 0-indexed
          
          // Get the Saturday of this week (end of week)
          const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
          const daysToSaturday = (6 - dayOfWeek) % 7; // Calculate days to next Saturday
          const saturday = new Date(date);
          saturday.setDate(date.getDate() + daysToSaturday);
          
          const saturdayKey = saturday.toISOString().split("T")[0];
          const dayExpenses = get().getExpensesByDate(date);
          const dayTotal = dayExpenses.reduce((total, expense) => total + expense.amount, 0);
          
          if (!weekTotals[saturdayKey]) {
            weekTotals[saturdayKey] = 0;
          }
          weekTotals[saturdayKey] += dayTotal;
        }
        
        // Convert to format with readable week labels
        Object.entries(weekTotals).forEach(([saturdayKey, total]) => {
          const saturdayDate = new Date(saturdayKey);
          const weekLabel = `Week ${Math.ceil(saturdayDate.getDate() / 7)}`;
          weeklySpending[weekLabel] = total;
        });
        
        return weeklySpending;
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
          education: 0,
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

      subscribeToExpenses: () => {
        const { userId } = get();

        if (!userId) {
          console.log('No user ID - not loading expenses');
          return () => {};
        }

        if (!uuidValidate(userId)) {
          console.warn("⚠️ Skipping Supabase expense load: userId is not a valid UUID", userId);
          return () => {};
        }

        console.log('📊 Loading expenses from Supabase for user:', userId);

        (async () => {
          try {
            const { data, error } = await supabase
              .from('expenses')
              .select('*')
              .eq('user_id', userId)
              .order('expense_date', { ascending: false });

            if (error) {
              console.error('❌ Error loading expenses from Supabase:', error);
              return;
            }

            const mapped: Expense[] = (data ?? []).map((row: any) => ({
              id: row.id,
              amount: row.amount,
              description: row.description,
              category: row.category,
              date: row.expense_date ? new Date(row.expense_date) : new Date(),
              userId: row.user_id,
              createdAt: row.created_at ? new Date(row.created_at) : new Date(),
              updatedAt: row.created_at ? new Date(row.created_at) : new Date(), // Use created_at as fallback
              // Store receipt_url in the expense object (even though TypeScript type doesn't have it)
              ...(row.receipt_url && { receiptUrl: row.receipt_url }),
            }));

            console.log(`✅ Loaded ${mapped.length} expenses from Supabase`);
            set({ expenses: mapped });
          } catch (err) {
            console.error('❌ Unexpected error loading expenses from Supabase:', err);
          }
        })();

        // No live subscription yet; return noop
        return () => {};
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