import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ShoppingItem, ShoppingCategory } from "../types";
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

interface ShoppingState {
  items: ShoppingItem[];
  userId: string | null;
  setUserId: (userId: string | null) => void;
  addItem: (item: Omit<ShoppingItem, "id" | "createdAt" | "updatedAt" | "userId">) => void;
  updateItem: (id: string, updates: Partial<ShoppingItem>) => void;
  deleteItem: (id: string) => void;
  deleteMultipleItems: (ids: string[]) => void;
  deleteAllItems: () => void;
  toggleItem: (id: string) => void;
  getItemsByCategory: (category: ShoppingCategory) => ShoppingItem[];
  getCategorizedItems: () => Record<ShoppingCategory, ShoppingItem[]>;
  getTotalEstimatedCost: () => number;
  getCompletedItems: () => ShoppingItem[];
  getPendingItems: () => ShoppingItem[];
  clearCompleted: () => void;
  autoCategorizeName: (name: string) => ShoppingCategory;
  clearUserData: () => void;
  subscribeToFamilyShopping: (familyId: string) => () => void;
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

      addItem: async (itemData) => {
        const { userId } = get();
        
        if (!userId) {
          console.error('❌ Cannot add shopping item: No userId set');
          return;
        }

        const { activeFamilyId } = useFamilyStore.getState();
        
        if (!activeFamilyId) {
          console.error('⚠️ No active family - shopping item will NOT be saved to Firestore!');
        }

        console.log('Adding shopping item:', itemData.name);

        const itemId = Date.now().toString() + Math.random().toString(36).substring(2, 11);
        const newItem: ShoppingItem = {
          ...itemData,
          id: itemId,
          category: itemData.category || get().autoCategorizeName(itemData.name),
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Save to Firestore if family exists
        if (activeFamilyId) {
          try {
            const cleanItem = Object.fromEntries(
              Object.entries(newItem).filter(([_, value]) => value !== undefined)
            );
            
            await setDoc(doc(db, 'families', activeFamilyId, 'shopping', itemId), {
              ...cleanItem,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            console.log('✅ Shopping item saved to Firestore:', newItem.name);
          } catch (error) {
            console.error('❌ Error saving shopping item to Firestore:', error);
          }
        }
        
        // Also save locally
        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      updateItem: async (id, updates) => {
        const { userId } = get();
        if (!userId) return;

        const { activeFamilyId } = useFamilyStore.getState();
        
        // Update in Firestore
        if (activeFamilyId) {
          try {
            await updateDoc(doc(db, 'families', activeFamilyId, 'shopping', id), {
              ...updates,
              updatedAt: serverTimestamp(),
            });
          } catch (error) {
            console.error('Error updating shopping item in Firestore:', error);
          }
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date() }
              : item
          ),
        }));
      },

      deleteItem: async (id) => {
        const { userId } = get();
        if (!userId) return;

        const { activeFamilyId } = useFamilyStore.getState();
        
        // Delete from Firestore
        if (activeFamilyId) {
          try {
            await deleteDoc(doc(db, 'families', activeFamilyId, 'shopping', id));
          } catch (error) {
            console.error('Error deleting shopping item from Firestore:', error);
          }
        }

        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      deleteMultipleItems: async (ids) => {
        const { userId } = get();
        if (!userId) return;

        const { activeFamilyId } = useFamilyStore.getState();
        
        console.log(`Deleting ${ids.length} items`);
        
        // Delete from Firestore
        if (activeFamilyId) {
          try {
            const deletePromises = ids.map(id => 
              deleteDoc(doc(db, 'families', activeFamilyId, 'shopping', id))
            );
            await Promise.all(deletePromises);
          } catch (error) {
            console.error('Error deleting multiple items from Firestore:', error);
          }
        }
        
        set((state) => ({
          items: state.items.filter((item) => !ids.includes(item.id)),
        }));
        console.log('✅ Items deleted successfully');
      },

      deleteAllItems: async () => {
        const { userId, items } = get();
        if (!userId) return;

        const { activeFamilyId } = useFamilyStore.getState();
        
        console.log('Deleting all items');
        
        // Delete all from Firestore
        if (activeFamilyId) {
          try {
            const deletePromises = items.map(item => 
              deleteDoc(doc(db, 'families', activeFamilyId, 'shopping', item.id))
            );
            await Promise.all(deletePromises);
          } catch (error) {
            console.error('Error deleting all items from Firestore:', error);
          }
        }
        
        set({ items: [] });
        console.log('✅ All items deleted successfully');
      },

      toggleItem: async (id) => {
        const { userId, items } = get();
        if (!userId) return;

        const item = items.find(i => i.id === id);
        if (!item) return;

        const { activeFamilyId } = useFamilyStore.getState();
        
        // Toggle in Firestore
        if (activeFamilyId) {
          try {
            await updateDoc(doc(db, 'families', activeFamilyId, 'shopping', id), {
              completed: !item.completed,
              updatedAt: serverTimestamp(),
            });
          } catch (error) {
            console.error('Error toggling shopping item in Firestore:', error);
          }
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, completed: !item.completed, updatedAt: new Date() }
              : item
          ),
        }));
      },

      getItemsByCategory: (category) => {
        const { items } = get();
        const { activeFamilyId } = useFamilyStore.getState();
        
        // Show all family items if in a family, otherwise only user's items
        return items.filter((item) => item.category === category);
      },

      getCategorizedItems: () => {
        const { items } = get();
        
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

        // Show all family items
        items.forEach((item) => {
          categorized[item.category].push(item);
        });

        return categorized;
      },

      getTotalEstimatedCost: () => {
        const { items } = get();
        
        // Calculate total for all family items
        return items.reduce((total, item) => {
          return total + (item.estimatedPrice || 0) * item.quantity;
        }, 0);
      },

      getCompletedItems: () => {
        const { items } = get();
        // Show all completed family items
        return items.filter((item) => item.completed);
      },

      getPendingItems: () => {
        const { items } = get();
        // Show all pending family items
        return items.filter((item) => !item.completed);
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

      subscribeToFamilyShopping: (familyId) => {
        console.log('Setting up real-time listener for family shopping:', familyId);
        const shoppingRef = collection(db, 'families', familyId, 'shopping');
        const q = query(shoppingRef);

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const firestoreItems: ShoppingItem[] = [];
            console.log('Firestore shopping snapshot received - changes:', snapshot.size);
            
            snapshot.forEach((docSnapshot) => {
              const data = docSnapshot.data();
              
              firestoreItems.push({
                ...data,
                id: docSnapshot.id,
                createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
              } as ShoppingItem);
            });
            
            console.log(`✅ Loaded ${firestoreItems.length} shopping items from Firestore`);
            set({ items: firestoreItems });
          },
          (error) => {
            console.error('❌ Error subscribing to shopping items:', error);
          }
        );

        return unsubscribe;
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