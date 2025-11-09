import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Expense, ExpenseCategory } from "../types";
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import useFamilyStore from './familyStore';

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
        if (!userId) return;

        const { activeFamilyId } = useFamilyStore.getState();
        
        if (!activeFamilyId) {
          console.error('⚠️ No active family - expense will NOT be saved to Firestore!');
          console.error('Please create or join a family in Settings first');
        }

        const expenseId = Date.now().toString() + Math.random().toString(36).substring(2, 11);
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
        
        // Save to Firestore if family exists
        if (activeFamilyId) {
          try {
            console.log('Saving expense to Firestore...', { familyId: activeFamilyId, expenseId });
            
            // Clean data - remove undefined values for Firestore
            const cleanExpense = Object.fromEntries(
              Object.entries(newExpense).filter(([_, value]) => value !== undefined)
            );

            await setDoc(doc(db, 'families', activeFamilyId, 'expenses', expenseId), {
              ...cleanExpense,
              date: Timestamp.fromDate(new Date(newExpense.date)),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            console.log('✅ Expense successfully saved to Firestore:', expenseId);
          } catch (error) {
            console.error('❌ Error saving expense to Firestore:', error);
          }
        }
      },

      updateExpense: async (id, updates) => {
        const { userId } = get();
        if (!userId) return;

        const { activeFamilyId } = useFamilyStore.getState();

        // Update locally
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id && expense.userId === userId
              ? { ...expense, ...updates, updatedAt: new Date() }
              : expense
          ),
        }));

        // Update in Firestore
        if (activeFamilyId) {
          try {
            const updateData: any = {
              ...updates,
              updatedAt: serverTimestamp(),
            };

            // Convert date if it's being updated
            if (updates.date) {
              updateData.date = Timestamp.fromDate(new Date(updates.date));
            }

            await updateDoc(doc(db, 'families', activeFamilyId, 'expenses', id), updateData);
            console.log('Expense updated in Firestore:', id);
          } catch (error) {
            console.error('Error updating expense in Firestore:', error);
          }
        }
      },

      deleteExpense: async (id) => {
        const { userId } = get();
        if (!userId) return;

        const { activeFamilyId } = useFamilyStore.getState();

        // Delete locally
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id || expense.userId !== userId),
        }));

        // Delete from Firestore
        if (activeFamilyId) {
          try {
            await deleteDoc(doc(db, 'families', activeFamilyId, 'expenses', id));
            console.log('Expense deleted from Firestore:', id);
          } catch (error) {
            console.error('Error deleting expense from Firestore:', error);
          }
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
        const { activeFamilyId } = useFamilyStore.getState();

        if (!activeFamilyId) {
          console.log('No active family - not subscribing to expenses');
          return () => {};
        }

        console.log('📊 Subscribing to family expenses:', activeFamilyId);

        const unsubscribe = onSnapshot(
          collection(db, 'families', activeFamilyId, 'expenses'),
          (snapshot) => {
            const firestoreExpenses: Expense[] = [];
            console.log('Firestore snapshot received - expenses:', snapshot.size);
            
            snapshot.forEach((docSnapshot) => {
              const data = docSnapshot.data();
              
              // Convert Firestore Timestamp to Date
              let date = new Date();
              if (data.date) {
                if (data.date?.toDate) {
                  date = data.date.toDate();
                } else {
                  date = new Date(data.date);
                }
              }
              
              console.log('Expense from Firestore:', { 
                id: docSnapshot.id, 
                description: data.description,
                amount: data.amount,
                dateRaw: data.date,
                dateParsed: date 
              });
              
              firestoreExpenses.push({
                ...data,
                id: docSnapshot.id,
                date,
                createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
              } as Expense);
            });
            
            console.log(`✅ Loaded ${firestoreExpenses.length} expenses from Firestore`);
            console.log('Expense descriptions:', firestoreExpenses.map(e => e.description));
            set({ expenses: firestoreExpenses });
          },
          (error) => {
            console.error('❌ Error subscribing to expenses:', error);
          }
        );

        return unsubscribe;
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