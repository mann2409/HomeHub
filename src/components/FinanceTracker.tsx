import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, subDays } from "date-fns";
import Card from "./Card";
import GlassCard from "./GlassCard";
import CircularChart from "./CircularChart";
import BarChart from "./BarChart";
import AddExpenseModal from "./AddExpenseModal";
import EditExpenseModal from "./EditExpenseModal";
import useFinanceStore from "../state/financeStore";
import { Expense } from "../types";
import { exportExpensesToJson } from "../utils/export";

interface FinanceTrackerProps {
  showRecent?: boolean;
}

export default function FinanceTracker({ showRecent = true }: FinanceTrackerProps) {
  const { 
    getWeeklySpending, 
    getDailySpending, 
    getCategorySpending,
    getRecentExpenses
  } = useFinanceStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const weeklyTotal = getWeeklySpending();
  const dailySpending = getDailySpending(7);
  const recentExpenses = getRecentExpenses(5);
  
  // Get category spending for the current week
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  const categorySpending = getCategorySpending(weekStart, weekEnd);

  // Format daily spending data for chart
  const chartData: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dateKey = date.toISOString().split("T")[0];
    chartData[format(date, "MMM d")] = dailySpending[dateKey] || 0;
  }

  const handleExpensePress = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowEditModal(true);
  };

  return (
    <>
      <GlassCard className="mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-white">
            Finance Tracker
          </Text>
          <View className="flex-row items-center">
            <Pressable
              onPress={async () => {
                try {
                  const uri = await exportExpensesToJson(useFinanceStore.getState().expenses);
                  console.log("Exported expenses to:", uri);
                } catch (e) {
                  console.warn("Export failed", e);
                }
              }}
              className="w-8 h-8 rounded-full items-center justify-center mr-2 overflow-hidden"
            >
              <Ionicons name="download" size={18} color="#374151" />
            </Pressable>
            <Pressable
              onPress={() => setShowAddModal(true)}
              className="w-8 h-8 rounded-full items-center justify-center overflow-hidden"
            >
              <View className="absolute inset-0 rounded-full" style={{ backgroundColor: "transparent" }} />
              <Ionicons name="add" size={20} color="#3B82F6" />
            </Pressable>
          </View>
        </View>

        {/* Weekly Total */}
        <View className="bg-white/60 rounded-xl p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-blue-600 font-medium">
                This Week
              </Text>
              <Text className="text-2xl font-bold text-blue-900">
                ${weeklyTotal.toFixed(2)}
              </Text>
            </View>
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
              <Ionicons name="wallet" size={24} color="#1D4ED8" />
            </View>
          </View>
        </View>

        {/* Charts Section */}
        <View>
          {/* Category Spending - Pie Chart */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-200 mb-3">
              Spending by Category
            </Text>
            <CircularChart 
              data={categorySpending} 
              totalAmount={weeklyTotal}
            />
          </View>

          {/* Daily Spending - Bar Chart */}
          <View>
            <Text className="text-base font-medium text-gray-200 mb-3">
              Daily Spending (Last 7 Days)
            </Text>
            <BarChart 
              data={chartData}
            />
          </View>
        </View>

        {/* Recent Expenses */}
        {showRecent && (
          <View className="mt-6 pt-4 border-t border-gray-100">
            <Text className="text-base font-medium text-gray-200 mb-3">
              Recent Expenses
            </Text>
            {recentExpenses.length === 0 ? (
              <Text className="text-gray-500 text-center py-4">
                No expenses yet
              </Text>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {recentExpenses.map((expense) => (
                  <Pressable
                    key={expense.id}
                    onPress={() => handleExpensePress(expense)}
                    className="flex-row items-center justify-between py-3 border-b border-gray-100"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {expense.description}
                      </Text>
                      <Text className="text-xs text-gray-500 capitalize">
                        {expense.category} • {format(new Date(expense.date), "MMM d")}
                      </Text>
                    </View>
                    <Text className="text-sm font-semibold text-gray-900">
                      ${expense.amount.toFixed(2)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Quick Stats */}
        <View className="mt-6 pt-4 border-t border-gray-100">
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-xs text-gray-500">Daily Avg</Text>
              <Text className="text-sm font-semibold text-gray-900">
                ${(weeklyTotal / 7).toFixed(2)}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-gray-500">Highest Day</Text>
              <Text className="text-sm font-semibold text-gray-900">
                ${Math.max(...Object.values(chartData)).toFixed(2)}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-gray-500">Categories</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {Object.values(categorySpending).filter(amount => amount > 0).length}
              </Text>
            </View>
          </View>
        </View>
      </GlassCard>

      <AddExpenseModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <EditExpenseModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
      />
    </>
  );
}