import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import * as ImagePicker from "expo-image-picker";
import { format } from "date-fns";
import GradientBackground from "../components/GradientBackground";
import AppHeader from "../components/AppHeader";
import MealsScreen from "./MealsScreen";
import ShoppingScreen from "./ShoppingScreen";
import usePantryStore from "../state/pantryStore";
import { scanPantryFromImage, toPantryItems } from "../api/pantryScanner";

const TopTab = createMaterialTopTabNavigator();

function PantryScreen() {
  const { items, addItems, deleteItem, clearAll, getStatus, syncFromSupabase } = usePantryStore();
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Load existing pantry items from Supabase on mount
    syncFromSupabase();
  }, [syncFromSupabase]);

  const totalItems = items.length;
  const lastPurchase = items.length
    ? items.reduce<Date | null>((latest, item) => {
        const created = item?.createdAt ? new Date(item.createdAt) : null;
        if (!created) return latest;
        if (!latest) return created;
        return created > latest ? created : latest;
      }, null)
    : null;
  const lastScanned = lastPurchase;

  const handleUploadReceipt = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission needed", "Please allow photo library access to scan receipts.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const uri = result.assets[0].uri;
      if (!uri) return;

      setIsScanning(true);
      const scanned = await scanPantryFromImage(uri);
      setIsScanning(false);

      if (!scanned) {
        Alert.alert("Couldn’t read receipt", "Try another photo with clearer text.");
        return;
      }

      const pantryItems = toPantryItems(scanned);
      addItems(pantryItems);
    } catch (error) {
      console.error("Error scanning pantry receipt:", error);
      setIsScanning(false);
      Alert.alert("Error", "Something went wrong while scanning the receipt.");
    }
  };

  const getStatusColor = (status: ReturnType<typeof getStatus>) => {
    switch (status) {
      case "expired":
        return "#F97373"; // red
      case "warning":
        return "#FBBF24"; // yellow
      default:
        return "#10B981"; // green
    }
  };

  return (
    <View className="flex-1 bg-[#111827]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary cards */}
        <View className="flex-row mb-4">
          <View className="flex-1 bg-white/10 rounded-xl px-4 py-3 mr-2">
            <Text className="text-xs text-white/60 mb-1">Total items</Text>
            <Text className="text-xl font-semibold text-white">{totalItems}</Text>
          </View>
          <View className="flex-1 bg-white/10 rounded-xl px-4 py-3 mr-2">
            <Text className="text-xs text-white/60 mb-1">Last purchase</Text>
            <Text className="text-sm text-white">
              {lastPurchase ? format(lastPurchase, "MMM d, yyyy") : "—"}
            </Text>
          </View>
          <View className="flex-1 bg-white/10 rounded-xl px-4 py-3">
            <Text className="text-xs text-white/60 mb-1">Last receipt</Text>
            <Text className="text-sm text-white">
              {lastScanned ? format(lastScanned, "MMM d, yyyy") : "—"}
            </Text>
          </View>
        </View>

        {/* Upload area */}
        <View className="bg-white/5 rounded-2xl border border-white/10 px-4 py-5 mb-6">
          <Text className="text-sm font-semibold text-white mb-1">
            Receipt scanning
          </Text>
          <Text className="text-xs text-white/70 mb-4">
            Upload a grocery receipt and we&apos;ll use AI to add pantry items and estimate expiry dates.
          </Text>
          <Pressable
            onPress={handleUploadReceipt}
            disabled={isScanning}
            className="self-center px-5 py-3 rounded-full"
            style={{ backgroundColor: isScanning ? "rgba(16,163,127,0.4)" : "#10A37F" }}
          >
            {isScanning ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold">Upload receipt</Text>
            )}
          </Pressable>
          {items.length > 0 && (
            <Pressable
              onPress={() => {
                Alert.alert(
                  "Clear pantry?",
                  "This removes all pantry items locally and in Supabase.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear",
                      style: "destructive",
                      onPress: () => clearAll(),
                    },
                  ]
                );
              }}
              className="self-center mt-4 px-5 py-2 rounded-full border border-white/30"
            >
              <Text className="text-white/80 text-sm font-semibold">Clear pantry</Text>
            </Pressable>
          )}
        </View>

        {/* Items list */}
        {items.length === 0 ? (
          <View className="items-center mt-8">
            <Text className="text-white/70 text-sm text-center">
              No pantry items yet. Upload a receipt to get started.
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {items.map((item) => {
              const status = getStatus(item);
              const color = getStatusColor(status);
              const today = new Date();
              const expiryDate = item?.expiryDate ? new Date(item.expiryDate) : null;
              const diffMs = expiryDate ? expiryDate.getTime() - today.getTime() : 0;
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

              let statusLabel = "Fresh";
              if (status === "expired") {
                statusLabel = diffDays < 0 ? "Expired" : "Expires soon";
              } else if (status === "warning") {
                statusLabel = `Expires in ${diffDays} days`;
              }

              return (
                <View
                  key={item.id}
                  className="flex-row items-center justify-between bg-white/5 rounded-xl px-4 py-3"
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-sm font-semibold text-white">
                      {item.name}
                    </Text>
                    {item.quantity && (
                      <Text className="text-xs text-white/60">
                        {item.quantity}
                      </Text>
                    )}
                    <Text className="text-xs text-white/60 mt-1">
                      {expiryDate ? `Expires ${format(expiryDate, "MMM d, yyyy")}` : "No expiry date"}
                    </Text>
                  </View>
                  <View className="items-end">
                    <View
                      className="px-2 py-1 rounded-full mb-2"
                      style={{ backgroundColor: color }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: status === "good" ? "#111827" : "#FFFFFF" }}
                      >
                        {statusLabel}
                      </Text>
                    </View>
                    <Pressable onPress={() => deleteItem(item.id)}>
                      <Text className="text-xs text-white/60">Delete</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default function HouseholdScreen() {
  return (
    <GradientBackground>
      <AppHeader title="Household" />
      <View style={{ flex: 1 }}>
        <TopTab.Navigator
          screenOptions={{
            tabBarIndicatorStyle: { backgroundColor: "#10B981", height: 3 },
            tabBarStyle: { backgroundColor: "transparent", elevation: 0 },
            tabBarActiveTintColor: "#FFFFFF",
            tabBarInactiveTintColor: "rgba(255,255,255,0.7)",
            tabBarLabelStyle: { fontWeight: "600" },
          }}
        >
          <TopTab.Screen
            name="HouseholdEat"
            component={MealsScreen}
            options={{ title: "Eat" }}
          />
          <TopTab.Screen
            name="HouseholdPantry"
            component={PantryScreen}
            options={{ title: "Pantry" }}
          />
          <TopTab.Screen
            name="HouseholdShopping"
            component={ShoppingScreen}
            options={{ title: "Shopping" }}
          />
        </TopTab.Navigator>
      </View>
    </GradientBackground>
  );
}


