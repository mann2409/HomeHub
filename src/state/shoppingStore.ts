import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ShoppingItem, ShoppingCategory } from "../types";

interface ShoppingState {
  items: ShoppingItem[];
  addItem: (item: Omit<ShoppingItem, "id" | "createdAt" | "updatedAt">) => void;
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

      addItem: (itemData) => {
        const newItem: ShoppingItem = {
          ...itemData,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
          category: itemData.category || get().autoCategorizeName(itemData.name),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date() }
              : item
          ),
        }));
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      toggleItem: (id) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, completed: !item.completed, updatedAt: new Date() }
              : item
          ),
        }));
      },

      getItemsByCategory: (category) => {
        return get().items.filter((item) => item.category === category);
      },

      getCategorizedItems: () => {
        const items = get().items;
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

        items.forEach((item) => {
          categorized[item.category].push(item);
        });

        return categorized;
      },

      getTotalEstimatedCost: () => {
        return get().items.reduce((total, item) => {
          return total + (item.estimatedPrice || 0) * item.quantity;
        }, 0);
      },

      getCompletedItems: () => {
        return get().items.filter((item) => item.completed);
      },

      getPendingItems: () => {
        return get().items.filter((item) => !item.completed);
      },

      clearCompleted: () => {
        set((state) => ({
          items: state.items.filter((item) => !item.completed),
        }));
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
    }
  )
);

export default useShoppingStore;