import React from "react";
import { View, Text, ScrollView } from "react-native";
import GradientBackground from "../components/GradientBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CalendarTasksModule from "../components/CalendarTasksModule";

export default function CalendarScreen() {
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
            Calendar
          </Text>
          
          <CalendarTasksModule />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}