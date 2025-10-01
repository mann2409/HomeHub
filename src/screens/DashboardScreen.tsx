import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import GradientBackground from "../components/GradientBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import DailySummarySimple from "../components/DailySummarySimple";
import QuickStats from "../components/QuickStats";
// import MotivationalWidget from "../components/MotivationalWidget";
import NotificationsWidget from "../components/NotificationsWidget";
import QuickAccessGrid from "../components/QuickAccessGrid";
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


  return (
    <GradientBackground>
      <AppHeader title="Dashboard" />
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="p-4">
          
          {/* Daily Summary - Today's focus */}
          <DailySummarySimple />
          
          {/* Quick Stats - Financial and shopping overview */}
          <QuickStats />
          
          {/* Motivational Widget - Achievements and progress */}
          {/* <MotivationalWidget /> */}
          
          {/* Notifications - Urgent items and alerts */}
          {/* <View className="mb-4">
            <Text className="text-lg font-semibold text-gray-100 mb-3">
              Notifications
            </Text>
            <NotificationsWidget />
          </View> */}
          
          {/* Quick Actions */}
          <View className="mb-4">
            <QuickAccessGrid />
          </View>
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