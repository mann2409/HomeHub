import React from "react";
import { View, Text, ScrollView } from "react-native";
import GradientBackground from "../components/GradientBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ShoppingList from "../components/ShoppingList";

export default function ShoppingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <GradientBackground style={{ paddingTop: insets.top }}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900 mb-6">
            Shopping List
          </Text>
          
          <ShoppingList />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}