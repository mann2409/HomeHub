import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Meal, MealType } from "../types";
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import useFamilyStore from './familyStore';

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
  subscribeToFamilyMeals: (familyId: string) => () => void;
}

const useMealStore = create<MealState>()(
  persist(
    (set, get) => ({
      meals: [],
      userId: null,

      setUserId: (userId) => set({ userId }),

      addMeal: async (mealData) => {
        const { userId } = get();
        if (!userId) {
          console.error('❌ Cannot add meal: No userId set');
          return;
        }

        const { activeFamilyId } = useFamilyStore.getState();
        
        if (!activeFamilyId) {
          console.error('⚠️ No active family - meal will NOT be saved to Firestore!');
        }

        console.log('Adding meal:', mealData.name);

        const mealId = Date.now().toString() + Math.random().toString(36).substring(2, 11);
        const newMeal: Meal = {
          ...mealData,
          id: mealId,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Save to Firestore if family exists
        if (activeFamilyId) {
          try {
            const cleanMeal = Object.fromEntries(
              Object.entries(newMeal).filter(([_, value]) => value !== undefined)
            );
            
            await setDoc(doc(db, 'families', activeFamilyId, 'meals', mealId), {
              ...cleanMeal,
              date: newMeal.date, // Keep as Date, Firestore will convert
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            console.log('✅ Meal saved to Firestore:', newMeal.name);
          } catch (error) {
            console.error('❌ Error saving meal to Firestore:', error);
          }
        }
        
        // Also save locally
        set((state) => ({
          meals: [...state.meals, newMeal],
        }));
      },

      updateMeal: async (id, updates) => {
        const { userId } = get();
        if (!userId) return;

        const { activeFamilyId } = useFamilyStore.getState();
        
        // Update in Firestore
        if (activeFamilyId) {
          try {
            await updateDoc(doc(db, 'families', activeFamilyId, 'meals', id), {
              ...updates,
              updatedAt: serverTimestamp(),
            });
            console.log('✅ Meal updated in Firestore');
          } catch (error) {
            console.error('❌ Error updating meal in Firestore:', error);
          }
        }

        set((state) => ({
          meals: state.meals.map((meal) =>
            meal.id === id
              ? { ...meal, ...updates, updatedAt: new Date() }
              : meal
          ),
        }));
      },

      deleteMeal: async (id) => {
        const { userId } = get();
        if (!userId) return;

        const { activeFamilyId } = useFamilyStore.getState();
        
        // Delete from Firestore
        if (activeFamilyId) {
          try {
            await deleteDoc(doc(db, 'families', activeFamilyId, 'meals', id));
            console.log('✅ Meal deleted from Firestore');
          } catch (error) {
            console.error('❌ Error deleting meal from Firestore:', error);
          }
        }

        set((state) => ({
          meals: state.meals.filter((meal) => meal.id !== id),
        }));
      },

      getMealsByDate: (date) => {
        const { meals } = get();
        
        // Show all family meals
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
        
        // Show all family meals for the week
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          const dateKey = date.toISOString().split("T")[0];
          weekMeals[dateKey] = get().getMealsByDate(date);
        }
        
        return weekMeals;
      },

      getMealsByDateRange: (startDate, endDate) => {
        const { meals } = get();
        
        // Show all family meals in date range
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        return meals.filter((meal) => {
          const mealDate = new Date(meal.date);
          return mealDate >= start && mealDate <= end;
        });
      },

      getMealByDateAndType: (date, mealType) => {
        // Show family meal for specific date and type
        const mealsForDate = get().getMealsByDate(date);
        return mealsForDate.find((meal) => meal.mealType === mealType);
      },

      getWeeklyMealPlan: (startDate) => {
        const weekPlan: Record<string, Record<MealType, Meal | null>> = {};
        
        // Show family meal plan for the week
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

      subscribeToFamilyMeals: (familyId) => {
        console.log('Setting up real-time listener for family meals:', familyId);
        const mealsRef = collection(db, 'families', familyId, 'meals');
        const q = query(mealsRef);

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const firestoreMeals: Meal[] = [];
            console.log('Firestore meals snapshot received - changes:', snapshot.size);
            
            snapshot.forEach((docSnapshot) => {
              const data = docSnapshot.data();
              
              firestoreMeals.push({
                ...data,
                id: docSnapshot.id,
                date: data.date?.toDate?.() || new Date(data.date),
                createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
              } as Meal);
            });
            
            console.log(`✅ Loaded ${firestoreMeals.length} meals from Firestore`);
            set({ meals: firestoreMeals });
          },
          (error) => {
            console.error('❌ Error subscribing to meals:', error);
          }
        );

        return unsubscribe;
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