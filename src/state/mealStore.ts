import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Meal, MealType } from "../types";

interface MealState {
  meals: Meal[];
  userId: string | null;
  setUserId: (userId: string | null) => void;
  addMeal: (meal: Omit<Meal, "id" | "createdAt" | "updatedAt" | "userId">) => void;
  updateMeal: (id: string, updates: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  getMealsByDate: (date: Date) => Meal[];
  getMealsByWeek: (startDate: Date) => Record<string, Meal[]>;
  getMealsByDateRange: (startDate: Date, endDate: Date) => Meal[];
  getMealByDateAndType: (date: Date, mealType: MealType) => Meal | undefined;
  getWeeklyMealPlan: (startDate: Date) => Record<string, Record<MealType, Meal | null>>;
  clearUserData: () => void;
}

const useMealStore = create<MealState>()(
  persist(
    (set, get) => ({
      meals: [],
      userId: null,

      setUserId: (userId) => set({ userId }),

      addMeal: (mealData) => {
        const { userId } = get();
        if (!userId) return;

        const newMeal: Meal = {
          ...mealData,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          meals: [...state.meals, newMeal],
        }));
      },

      updateMeal: (id, updates) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          meals: state.meals.map((meal) =>
            meal.id === id && meal.userId === userId
              ? { ...meal, ...updates, updatedAt: new Date() }
              : meal
          ),
        }));
      },

      deleteMeal: (id) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          meals: state.meals.filter((meal) => meal.id !== id || meal.userId !== userId),
        }));
      },

      getMealsByDate: (date) => {
        const { meals, userId } = get();
        if (!userId) return [];
        
        const userMeals = meals.filter(meal => meal.userId === userId);
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        return userMeals.filter((meal) => {
          const mealDate = new Date(meal.date);
          mealDate.setHours(0, 0, 0, 0);
          return mealDate.getTime() === targetDate.getTime();
        });
      },

      getMealsByWeek: (startDate) => {
        const { userId } = get();
        if (!userId) return {};
        
        const weekMeals: Record<string, Meal[]> = {};
        
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          const dateKey = date.toISOString().split("T")[0];
          weekMeals[dateKey] = get().getMealsByDate(date);
        }
        
        return weekMeals;
      },

      getMealsByDateRange: (startDate, endDate) => {
        const { meals, userId } = get();
        if (!userId) return [];
        
        const userMeals = meals.filter(meal => meal.userId === userId);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        return userMeals.filter((meal) => {
          const mealDate = new Date(meal.date);
          return mealDate >= start && mealDate <= end;
        });
      },

      getMealByDateAndType: (date, mealType) => {
        const { userId } = get();
        if (!userId) return undefined;
        
        const mealsForDate = get().getMealsByDate(date);
        return mealsForDate.find((meal) => meal.mealType === mealType);
      },

      getWeeklyMealPlan: (startDate) => {
        const { userId } = get();
        if (!userId) return {};
        
        const weekPlan: Record<string, Record<MealType, Meal | null>> = {};
        
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          const dateKey = date.toISOString().split("T")[0];
          
          weekPlan[dateKey] = {
            breakfast: get().getMealByDateAndType(date, "breakfast") || null,
            lunch: get().getMealByDateAndType(date, "lunch") || null,
            dinner: get().getMealByDateAndType(date, "dinner") || null,
            snack: get().getMealByDateAndType(date, "snack") || null,
          };
        }
        
        return weekPlan;
      },

      clearUserData: () => {
        set({ meals: [], userId: null });
      },
    }),
    {
      name: "meal-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        meals: state.meals.filter(meal => meal.userId === state.userId),
        userId: state.userId 
      }),
    }
  )
);

export default useMealStore;