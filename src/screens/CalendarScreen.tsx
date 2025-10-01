import React from "react";
import { View, Text, ScrollView } from "react-native";
import GradientBackground from "../components/GradientBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import CalendarTasksModule from "../components/CalendarTasksModule";

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();

  return (
    <GradientBackground>
      <AppHeader title="Calendar" />
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="p-4">
          
          <CalendarTasksModule />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}