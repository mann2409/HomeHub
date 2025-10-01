import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ShoppingItem, ShoppingCategory } from "../types";

interface ShoppingState {
  items: ShoppingItem[];
  userId: string | null;
  setUserId: (userId: string | null) => void;
  addItem: (item: Omit<ShoppingItem, "id" | "createdAt" | "updatedAt" | "userId">) => void;
  updateItem: (id: string, updates: Partial<ShoppingItem>) => void;
  deleteItem: (id: string) => void;
  toggleItem: (id: string) => void;
  getItemsByCategory: (category: ShoppingCategory) => ShoppingItem[];
  getCategorizedItems: () => Record<ShoppingCategory, ShoppingItem[]>;
  getTotalEstimatedCost: () => number;
  getCompletedItems: () => ShoppingItem[];
  getPendingItems: () => ShoppingItem[];
  clearCompleted: () => void;
  autoCategorizeName: (name: string) => ShoppingCategory;
  clearUserData: () => void;
}

const categoryKeywords: Record<ShoppingCategory, string[]> = {
  produce: ["apple", "banana", "orange", "lettuce", "tomato", "carrot", "onion", "potato", "fruit", "vegetable"],
  dairy: ["milk", "cheese", "yogurt", "butter", "cream", "eggs"],
  meat: ["chicken", "beef", "pork", "fish", "turkey", "bacon", "sausage"],
  pantry: ["rice", "pasta", "bread", "flour", "sugar", "salt", "oil", "spice", "sauce", "cereal"],
  frozen: ["frozen", "ice cream", "pizza"],
  household: ["detergent", "soap", "paper", "towel", "cleaner", "trash bag"],
  personal_care: ["shampoo", "toothpaste", "deodorant", "lotion", "razor"],
  other: [],
};

const useShoppingStore = create<ShoppingState>()(
  persist(
    (set, get) => ({
      items: [],
      userId: null,

      setUserId: (userId) => set({ userId }),

      addItem: (itemData) => {
        const { userId } = get();
        if (!userId) return;

        const newItem: ShoppingItem = {
          ...itemData,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
          category: itemData.category || get().autoCategorizeName(itemData.name),
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      updateItem: (id, updates) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id && item.userId === userId
              ? { ...item, ...updates, updatedAt: new Date() }
              : item
          ),
        }));
      },

      deleteItem: (id) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          items: state.items.filter((item) => item.id !== id || item.userId !== userId),
        }));
      },

      toggleItem: (id) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id && item.userId === userId
              ? { ...item, completed: !item.completed, updatedAt: new Date() }
              : item
          ),
        }));
      },

      getItemsByCategory: (category) => {
        const { items, userId } = get();
        if (!userId) return [];
        return items.filter((item) => item.category === category && item.userId === userId);
      },

      getCategorizedItems: () => {
        const { items, userId } = get();
        if (!userId) return {
          produce: [], dairy: [], meat: [], pantry: [], frozen: [],
          household: [], personal_care: [], other: [],
        };
        
        const userItems = items.filter(item => item.userId === userId);
        const categorized: Record<ShoppingCategory, ShoppingItem[]> = {
          produce: [],
          dairy: [],
          meat: [],
          pantry: [],
          frozen: [],
          household: [],
          personal_care: [],
          other: [],
        };

        userItems.forEach((item) => {
          categorized[item.category].push(item);
        });

        return categorized;
      },

      getTotalEstimatedCost: () => {
        const { items, userId } = get();
        if (!userId) return 0;
        
        return items
          .filter(item => item.userId === userId)
          .reduce((total, item) => {
            return total + (item.estimatedPrice || 0) * item.quantity;
          }, 0);
      },

      getCompletedItems: () => {
        const { items, userId } = get();
        if (!userId) return [];
        return items.filter((item) => item.completed && item.userId === userId);
      },

      getPendingItems: () => {
        const { items, userId } = get();
        if (!userId) return [];
        return items.filter((item) => !item.completed && item.userId === userId);
      },

      clearCompleted: () => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          items: state.items.filter((item) => !item.completed || item.userId !== userId),
        }));
      },

      clearUserData: () => {
        set({ items: [], userId: null });
      },

      autoCategorizeName: (name) => {
        const lowerName = name.toLowerCase();
        
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
          if (keywords.some((keyword) => lowerName.includes(keyword))) {
            return category as ShoppingCategory;
          }
        }
        
        return "other";
      },
    }),
    {
      name: "shopping-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        items: state.items.filter(item => item.userId === state.userId),
        userId: state.userId 
      }),
    }
  )
);

export default useShoppingStore;