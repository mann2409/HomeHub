import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PantryItem, PantryStatus } from "../types/pantry";
import { supabase } from "../config/supabase";
import useAuthStore from "./authStore";

const BRIDGE_URL = "https://facnpdpzhxvybisxlpbp.supabase.co/functions/v1/external-bridge";
// Support either the public Expo-style name or the provided env name.
const EXTERNAL_BRIDGE_API_KEY =
  process.env.EXPO_PUBLIC_EXTERNAL_BRIDGE_API_KEY ?? process.env.YOUR_EXTERNAL_APP_API_KEY;

async function sendPantryToBridge(newItems: PantryItem[]) {
  if (!EXTERNAL_BRIDGE_API_KEY) {
    console.warn("⚠️ External bridge API key missing; skipping bridge call");
    return;
  }

  const user = useAuthStore.getState().user;
  const payload = {
    user_id: user?.uid ?? null,
    pantry_items: newItems.map((item) => ({
      name: item.name,
      quantity: item.quantity ?? null,
    })),
    expenses: [],
  };

  try {
    const res = await fetch(BRIDGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": EXTERNAL_BRIDGE_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Bridge call failed:", res.status, text);
    }
  } catch (err) {
    console.error("❌ Bridge call error:", err);
  }
}

interface PantryState {
  items: PantryItem[];
  addItems: (items: PantryItem[]) => void;
  deleteItem: (id: string) => void;
  clearAll: () => void;
  getStatus: (item: PantryItem) => PantryStatus;
  syncFromSupabase: () => Promise<void>;
}

const usePantryStore = create<PantryState>()(
  persist(
    (set, get) => ({
      items: [],

      addItems: (newItems) => {
        set((state) => {
          const now = new Date();
          const itemsWithMeta = newItems.map((item) => ({
            ...item,
            createdAt: item.createdAt || now,
          }));

          return {
            items: [...itemsWithMeta, ...state.items],
          };
        });

        // Send to bridge (fire and forget)
        sendPantryToBridge(newItems);
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));

        supabase
          .from("pantry_items")
          .delete()
          .eq("id", id)
          .then(({ error }) => {
            if (error) {
              console.error("❌ Error deleting pantry item from Supabase:", error);
            }
          })
          .catch((err) => {
            console.error("❌ Unexpected Supabase error (pantry delete):", err);
          });
      },

      clearAll: () => {
        set({ items: [] });

        supabase
          .from("pantry_items")
          .delete()
          .then(({ error }) => {
            if (error) {
              console.error("❌ Error clearing pantry items in Supabase:", error);
            }
          })
          .catch((err) => {
            console.error("❌ Unexpected Supabase error (pantry clear):", err);
          });
      },

      getStatus: (item) => {
        const today = new Date();
        const diffMs = item.expiryDate.getTime() - today.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 1) return "expired"; // red
        if (diffDays <= 3) return "warning"; // yellow
        return "good"; // green
      },

      syncFromSupabase: async () => {
        try {
          const { data, error } = await supabase
            .from("pantry_items")
            .select("*")
            .order("purchased_at", { ascending: false });

          if (error) {
            console.error("❌ Error loading pantry items from Supabase:", error);
            return;
          }

          const today = new Date();
          const mapped: PantryItem[] = (data ?? []).map((row: any) => {
            const purchasedAt = row.purchased_at ? new Date(row.purchased_at) : today;
            // Default expiry: 7 days after purchase if we don't have AI data
            const expiryDate = new Date(purchasedAt);
            expiryDate.setDate(purchasedAt.getDate() + 7);

            return {
              id: row.id,
              name: row.name,
              quantity: row.quantity ?? undefined,
              expiryDate,
              createdAt: row.created_at ? new Date(row.created_at) : purchasedAt,
            };
          });

          set({ items: mapped });
        } catch (err) {
          console.error("❌ Unexpected Supabase error (pantry sync):", err);
        }
      },
    }),
    {
      name: "pantry-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default usePantryStore;


