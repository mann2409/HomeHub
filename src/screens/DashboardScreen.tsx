import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import GradientBackground from "../components/GradientBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderSection from "../components/HeaderSection";
import CalendarTasksModule from "../components/CalendarTasksModule";
import FinanceTracker from "../components/FinanceTracker";
import QuickAccessGrid from "../components/QuickAccessGrid";
import ContextAwareFAB from "../components/ContextAwareFAB";
import AddTaskModal from "../components/AddTaskModal";
import AddExpenseModal from "../components/AddExpenseModal";
import AddShoppingItemModal from "../components/AddShoppingItemModal";
import AddMealModal from "../components/AddMealModal";
import QuickNoteModal from "../components/QuickNoteModal";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const fabActions = [
    {
      id: "add_task",
      label: "Add Task",
      icon: "checkmark-circle" as const,
      color: "#3B82F6",
      onPress: () => setShowTaskModal(true),
    },
    {
      id: "add_expense",
      label: "Add Expense",
      icon: "card" as const,
      color: "#EF4444",
      onPress: () => setShowExpenseModal(true),
    },
    {
      id: "add_shopping",
      label: "Shopping Item",
      icon: "basket" as const,
      color: "#10B981",
      onPress: () => setShowShoppingModal(true),
    },
    {
      id: "add_meal",
      label: "Add Meal",
      icon: "restaurant" as const,
      color: "#8B5CF6",
      onPress: () => setShowMealModal(true),
    },
    {
      id: "quick_note",
      label: "Quick Note",
      icon: "document-text" as const,
      color: "#F59E0B",
      onPress: () => setShowNoteModal(true),
    },
  ];

  return (
    <GradientBackground style={{ paddingTop: insets.top }}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-100 mb-6">
            HomeBoard
          </Text>
          
          <HeaderSection />
          <CalendarTasksModule />
          <FinanceTracker showRecent={false} />
          <QuickAccessGrid />
        </View>
      </ScrollView>
      
      

      {/* Modals */}
      <AddTaskModal
        visible={showTaskModal}
        onClose={() => setShowTaskModal(false)}
      />
      
      <AddExpenseModal
        visible={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
      />
      
      <AddShoppingItemModal
        visible={showShoppingModal}
        onClose={() => setShowShoppingModal(false)}
      />
      
      <AddMealModal
        visible={showMealModal}
        onClose={() => setShowMealModal(false)}
      />
      
      <QuickNoteModal
        visible={showNoteModal}
        onClose={() => setShowNoteModal(false)}
      />
    </GradientBackground>
  );
}