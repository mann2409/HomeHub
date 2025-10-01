import React from "react";
import { View, Text, ScrollView } from "react-native";
import GradientBackground from "../components/GradientBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import WeeklyMealPlanner from "../components/WeeklyMealPlanner";

export default function MealsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <GradientBackground>
      <AppHeader title="Meal Planner" />
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="p-4">
          
          <WeeklyMealPlanner />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}