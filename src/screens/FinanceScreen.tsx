import React from "react";
import { View, Text, ScrollView } from "react-native";
import GradientBackground from "../components/GradientBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FinanceTracker from "../components/FinanceTracker";

export default function FinanceScreen() {
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
            Finance Tracker
          </Text>
          
          <FinanceTracker />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}