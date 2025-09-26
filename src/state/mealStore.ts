import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Meal, MealType } from "../types";

interface MealState {
  meals: Meal[];
  addMeal: (meal: Omit<Meal, "id" | "createdAt" | "updatedAt">) => void;
  updateMeal: (id: string, updates: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  getMealsByDate: (date: Date) => Meal[];
  getMealsByWeek: (startDate: Date) => Record<string, Meal[]>;
  getMealByDateAndType: (date: Date, mealType: MealType) => Meal | undefined;
  getWeeklyMealPlan: (startDate: Date) => Record<string, Record<MealType, Meal | null>>;
}

const useMealStore = create<MealState>()(
  persist(
    (set, get) => ({
      meals: [],

      addMeal: (mealData) => {
        const newMeal: Meal = {
          ...mealData,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          meals: [...state.meals, newMeal],
        }));
      },

      updateMeal: (id, updates) => {
        set((state) => ({
          meals: state.meals.map((meal) =>
            meal.id === id
              ? { ...meal, ...updates, updatedAt: new Date() }
              : meal
          ),
        }));
      },

      deleteMeal: (id) => {
        set((state) => ({
          meals: state.meals.filter((meal) => meal.id !== id),
        }));
      },

      getMealsByDate: (date) => {
        const meals = get().meals;
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        return meals.filter((meal) => {
          const mealDate = new Date(meal.date);
          mealDate.setHours(0, 0, 0, 0);
          return mealDate.getTime() === targetDate.getTime();
        });
      },

      getMealsByWeek: (startDate) => {
        const weekMeals: Record<string, Meal[]> = {};
        
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          const dateKey = date.toISOString().split("T")[0];
          weekMeals[dateKey] = get().getMealsByDate(date);
        }
        
        return weekMeals;
      },

      getMealByDateAndType: (date, mealType) => {
        const mealsForDate = get().getMealsByDate(date);
        return mealsForDate.find((meal) => meal.mealType === mealType);
      },

      getWeeklyMealPlan: (startDate) => {
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
    }),
    {
      name: "meal-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useMealStore;