import "react-native-get-random-values";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PantryItem, PantryStatus } from "../types/pantry";
import { supabase } from "../config/supabase";
import useAuthStore from "./authStore";

const BRIDGE_URL = "https://facnpdpzhxvybisxlpbp.supabase.co/functions/v1/external-bridge";
// Support either the public Expo-style name or the provided env name.
const EXTERNAL_BRIDGE_API_KEY =
  process.env.EXPO_PUBLIC_EXTERNAL_BRIDGE_API_KEY ??
  process.env.EXPO_EXTERNAL_APP_API_KEY ??
  process.env.YOUR_EXTERNAL_APP_API_KEY;
const USE_BRIDGE_ONLY = !!EXTERNAL_BRIDGE_API_KEY;

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
  addItems: (items: PantryItem[]) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  getStatus: (item: PantryItem) => PantryStatus;
  syncFromSupabase: () => Promise<void>;
}

function normalizePantryItem(item: PantryItem): PantryItem {
  return {
    ...item,
    expiryDate: item?.expiryDate ? new Date(item.expiryDate) : new Date(),
    createdAt: item?.createdAt ? new Date(item.createdAt) : new Date(),
  };
}

function ensurePantryId(id?: string) {
  if (id && uuidValidate(id)) return id;
  return uuidv4();
}

const usePantryStore = create<PantryState>()(
  persist(
    (set, get) => ({
      items: [],

      addItems: async (newItems) => {
        const now = new Date();
        const normalizedItems = newItems.map((item) => {
          const normalized = normalizePantryItem(item);
          // Always use a fresh UUID for Supabase compatibility (id column is UUID)
          const id = uuidv4();
          const createdAt = normalized.createdAt || now;
          return {
            ...normalized,
            id,
            createdAt,
          };
        });

        set((state) => ({
          items: [...normalizedItems, ...state.items],
        }));

        // If we have a bridge key, prefer bridge-only and skip direct Supabase writes (avoids RLS/user_id issues)
        if (USE_BRIDGE_ONLY) {
          sendPantryToBridge(normalizedItems);
          return;
        }

        const user = useAuthStore.getState().user;
        const userId = user?.uid;
        const userIdToSend = userId && uuidValidate(userId) ? userId : null;
        if (userId && !userIdToSend) {
          console.warn("⚠️ Skipping user_id in Supabase upsert (not a UUID)", userId);
        }

        const payload = normalizedItems.map((item) => {
          // Double-ensure UUID at payload time
          const id = uuidv4();
          return {
            id,
            name: item.name,
            quantity: item.quantity ?? null,
            purchased_at: item.createdAt,
            created_at: item.createdAt,
            user_id: userIdToSend,
          };
        });

        // Helpful debug log to confirm IDs being sent
        console.log("🧾 Pantry upsert payload IDs", payload.map((p) => p.id));

        try {
          const { error } = await supabase.from("pantry_items").upsert(payload);
          if (error) {
            console.error("❌ Error saving pantry items to Supabase:", error);
          }
        } catch (err) {
          console.error("❌ Unexpected Supabase error (pantry add):", err);
        }

        // Send to bridge (fire and forget)
        sendPantryToBridge(newItems);
      },

      deleteItem: async (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));

        try {
          const { error } = await supabase.from("pantry_items").delete().eq("id", id);
          if (error) {
            console.error("❌ Error deleting pantry item from Supabase:", error);
          }
        } catch (err) {
          console.error("❌ Unexpected Supabase error (pantry delete):", err);
        }
      },

      clearAll: async () => {
        set({ items: [] });

        const user = useAuthStore.getState().user;
        const userId = user?.uid;

        // If Supabase user_id column is UUID, guard invalid IDs to avoid 22P02.
        if (!userId || !uuidValidate(userId)) {
          console.warn("⚠️ Skipping Supabase pantry clear: userId missing or not a UUID", userId);
          return;
        }

        try {
          const { error } = await supabase.from("pantry_items").delete().eq("user_id", userId);
          if (error) {
            console.error("❌ Error clearing pantry items in Supabase:", error);
          }
        } catch (err) {
          console.error("❌ Unexpected Supabase error (pantry clear):", err);
        }
      },

      getStatus: (item) => {
        const today = new Date();
        const expiryDate = item?.expiryDate ? new Date(item.expiryDate) : today;
        const diffMs = expiryDate.getTime() - today.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 1) return "expired"; // red
        if (diffDays <= 3) return "warning"; // yellow
        return "good"; // green
      },

      syncFromSupabase: async () => {
        const user = useAuthStore.getState().user;
        const userId = user?.uid;
        try {
          const query = supabase.from("pantry_items").select("*").order("purchased_at", { ascending: false });
          const { data, error } = userId ? await query.eq("user_id", userId) : await query;

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
      onRehydrateStorage: () => (state) => {
        if (state?.items) {
          state.items = state.items.map(normalizePantryItem);
        }
      },
    }
  )
);

export default usePantryStore;


