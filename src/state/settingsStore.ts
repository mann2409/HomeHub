import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserSettings, CategoryColors } from "../types";

interface SettingsState extends UserSettings {
  userId: string | null;
  setUserId: (userId: string | null) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetSettings: () => void;
  updateModuleVisibility: (module: keyof UserSettings["moduleVisibility"], visible: boolean) => void;
  updateCategoryColor: (category: string, color: string) => void;
  clearUserData: () => void;
}

const defaultCategoryColors: CategoryColors = {
  taskCategories: {
    personal: "#3B82F6",
    work: "#EF4444",
    health: "#10B981",
    home: "#F59E0B",
    shopping: "#8B5CF6",
    finance: "#EC4899",
    other: "#6B7280",
  },
  eventCategories: {
    personal: "#3B82F6",
    work: "#EF4444",
    health: "#10B981",
    appointment: "#F59E0B",
    social: "#8B5CF6",
    travel: "#EC4899",
    other: "#6B7280",
  },
  mealCategories: {
    healthy: "#10B981",
    quick: "#F59E0B",
    comfort: "#EC4899",
    vegetarian: "#8B5CF6",
    vegan: "#14B8A6",
    protein: "#EF4444",
    other: "#6B7280",
  },
  expenseCategories: {
    food: "#10B981",
    transport: "#3B82F6",
    utilities: "#F59E0B",
    entertainment: "#EC4899",
    health: "#EF4444",
    shopping: "#8B5CF6",
    home: "#F97316",
    education: "#06B6D4",
    other: "#6B7280",
  },
  shoppingCategories: {
    produce: "#10B981",
    dairy: "#F59E0B",
    meat: "#EF4444",
    pantry: "#8B5CF6",
    frozen: "#14B8A6",
    household: "#F97316",
    personal_care: "#EC4899",
    other: "#6B7280",
  },
};

const defaultSettings: UserSettings = {
  theme: "system",
  currency: "USD",
  dateFormat: "MM/dd/yyyy",
  weekStartsOn: 0, // Sunday
  notifications: {
    tasks: true,
    events: true,
    meals: true,
    expenses: false,
    shopping: true,
  },
  moduleVisibility: {
    calendar: true,
    tasks: true,
    meals: true,
    finance: true,
    shopping: true,
    quickAccess: true,
  },
  categoryColors: defaultCategoryColors,
};

const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      userId: null,

      setUserId: (userId) => set({ userId }),

      updateSettings: (updates) => {
        set((state) => ({
          ...state,
          ...updates,
        }));
      },

      resetSettings: () => {
        set(defaultSettings);
      },

      updateModuleVisibility: (module, visible) => {
        set((state) => ({
          ...state,
          moduleVisibility: {
            ...state.moduleVisibility,
            [module]: visible,
          },
        }));
      },

      updateCategoryColor: (category, color) => {
        const state = get();
        const updatedColors = { ...state.categoryColors };
        
        // Find which category type this belongs to and update it
        Object.keys(updatedColors).forEach((categoryType) => {
          const categoryObj = updatedColors[categoryType as keyof CategoryColors];
          if (category in categoryObj) {
            (categoryObj as any)[category] = color;
          }
        });

        set({
          ...state,
          categoryColors: updatedColors,
        });
      },

      clearUserData: () => {
        set({ ...defaultSettings, userId: null });
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        ...state,
        userId: state.userId 
      }),
    }
  )
);

export default useSettingsStore;