import React from "react";
import { View, Text, ScrollView } from "react-native";
import GradientBackground from "../components/GradientBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import ShoppingList from "../components/ShoppingList";

export default function ShoppingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <GradientBackground>
      <AppHeader title="Shopping List" />
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="p-4">
          
          <ShoppingList />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}