import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Linking, ScrollView } from "react-native";
import Modal from "./Modal";
import useShoppingStore from "../state/shoppingStore";

type Retailer = "woolworths" | "coles";

interface RetailerLinksModalProps {
  visible: boolean;
  onClose: () => void;
  retailer: Retailer;
}

// Build a retailer search URL for a shopping item name with light normalization
function buildRetailerSearchUrl(retailer: Retailer, rawQuery: string): string {
  const q = encodeURIComponent(rawQuery.trim().replace(/\s+/g, " "));
  if (retailer === "woolworths") {
    return `https://www.woolworths.com.au/shop/search/products?searchTerm=${q}`;
  }
  return `https://www.coles.com.au/search?q=${q}`;
}

export default function RetailerLinksModal({ visible, onClose, retailer }: RetailerLinksModalProps) {
  const { getPendingItems } = useShoppingStore();
  const [opened, setOpened] = useState<Record<string, boolean>>({});

  const items = getPendingItems();

  const rows = useMemo(() => {
    return items.map((item) => {
      // Always search by base product name only (no numbers/units)
      const raw = (item.name || "").toLowerCase();
      // Remove common measurements and numbers (e.g., 1.5kg, 500 g, 2x, 12pcs)
      const withoutMeasures = raw
        .replace(/\b\d+[\d.,]*\s*(kg|g|ml|l|litre|liter|pack|packs|x|pcs|pieces|dozen)\b/gi, " ")
        .replace(/\b(kg|g|ml|l|litre|liter|pack|packs|x|pcs|pieces|dozen)\b/gi, " ")
        .replace(/\d+/g, " ");
      const baseQuery = withoutMeasures.replace(/\s+/g, " ").trim();
      const finalQuery = baseQuery || raw.trim();

      return { id: item.id, label: item.name, url: buildRetailerSearchUrl(retailer, finalQuery) };
    });
  }, [items, retailer]);

  return (
    <Modal visible={visible} onClose={onClose} title={`Open in ${retailer === "woolworths" ? "Woolworths" : "Coles"}`} navigationMode>
      <ScrollView className="p-4">
        {rows.length === 0 ? (
          <Text className="text-white/80">No pending items.</Text>
        ) : (
          rows.map((row) => (
            <View key={row.id} className="flex-row items-center justify-between py-2">
              <Text className="text-white flex-1 mr-3">{row.label}</Text>
              <Pressable
                onPress={async () => {
                  setOpened((s) => ({ ...s, [row.id]: true }));
                  try { await Linking.openURL(row.url); } catch {}
                }}
                className="px-3 py-2 rounded-lg bg-white/15"
              >
                <Text className="text-white text-sm">Open</Text>
              </Pressable>
              {opened[row.id] && (
                <Text className="text-xs text-white/60 ml-2">Opened</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Footer actions */}
      <View className="px-4 pb-4">
        <Pressable onPress={onClose} className="w-full items-center justify-center py-3 rounded-lg bg-white/15 active:opacity-80">
          <Text className="text-white font-semibold">Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}


