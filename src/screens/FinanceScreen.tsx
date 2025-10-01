import React from "react";
import { View, Text, ScrollView } from "react-native";
import GradientBackground from "../components/GradientBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import FinanceTracker from "../components/FinanceTracker";

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();

  return (
    <GradientBackground>
      <AppHeader title="Finance Tracker" />
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="p-4">
          
          <FinanceTracker />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}