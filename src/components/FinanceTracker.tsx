import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, subDays } from "date-fns";
import Card from "./Card";
import CircularChart from "./CircularChart";
import BarChart from "./BarChart";
import LineChart from "./LineChart";
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
    getMonthlySpending,
    getCategorySpending,
    getRecentExpenses
  } = useFinanceStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const weeklyTotal = getWeeklySpending();
  const dailySpending = getDailySpending(7);
  const recentExpenses = getRecentExpenses(5);
  
  // Get current month data
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
  const monthlySpending = getMonthlySpending(currentYear, currentMonth);
  
  // Get category spending for the current week
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  const categorySpending = getCategorySpending(weekStart, weekEnd);

  // Format daily spending data for chart (last 7 days)
  const dailyChartData: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dateKey = date.toISOString().split("T")[0];
    dailyChartData[format(date, "MMM d")] = dailySpending[dateKey] || 0;
  }
  
  // Format monthly spending data for line chart (weekly totals)
  const monthlyChartData: Record<string, number> = {};
  Object.entries(monthlySpending).forEach(([weekLabel, amount]) => {
    monthlyChartData[weekLabel] = amount;
  });
  
  console.log("FinanceTracker dailySpending:", dailySpending);
  console.log("FinanceTracker dailyChartData:", dailyChartData);
  console.log("FinanceTracker monthlySpending:", monthlySpending);
  console.log("FinanceTracker monthlyChartData:", monthlyChartData);

  const handleExpensePress = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowEditModal(true);
  };

  return (
    <>
      <Card className="mb-4">
        <View className="flex-row items-center justify-end mb-4">
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
              <Ionicons name="download" size={18} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={() => setShowAddModal(true)}
              className="w-8 h-8 bg-primary rounded-full items-center justify-center"
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Weekly Total */}
        <View className="bg-white/20 rounded-xl p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-white/80 font-medium">
                This Week
              </Text>
              <Text className="text-2xl font-bold text-white">
                ${weeklyTotal.toFixed(2)}
              </Text>
            </View>
            <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
              <Ionicons name="wallet" size={24} color="rgba(255, 255, 255, 0.8)" />
            </View>
          </View>
        </View>

        {/* Charts Section */}
        <View>
          {/* Category Spending - Pie Chart */}
          <View className="mb-6">
            <Text className="text-base font-medium text-white mb-3">
              Spending by Category
            </Text>
            <CircularChart 
              data={categorySpending} 
              totalAmount={weeklyTotal}
            />
          </View>

          {/* Monthly Spending - Line Chart */}
          <View className="mb-6">
            <Text className="text-base font-medium text-white mb-3">
              Weekly Spending Trend ({format(today, "MMM yyyy")})
            </Text>
            <LineChart 
              data={monthlyChartData}
              color="#10B981"
            />
          </View>

          {/* Daily Spending - Bar Chart */}
          <View>
            <Text className="text-base font-medium text-white mb-3">
              Daily Spending (Last 7 Days)
            </Text>
            <BarChart 
              data={dailyChartData}
            />
          </View>
        </View>

        {/* Recent Expenses */}
        {showRecent && (
          <View className="mt-6 pt-4 border-t border-white/20">
            <Text className="text-base font-medium text-white mb-3">
              Recent Expenses
            </Text>
            {recentExpenses.length === 0 ? (
              <Text className="text-white/60 text-center py-4">
                No expenses yet
              </Text>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {recentExpenses.map((expense) => (
                  <Pressable
                    key={expense.id}
                    onPress={() => handleExpensePress(expense)}
                    className="flex-row items-center justify-between py-3 border-b border-white/20"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-white">
                        {expense.description}
                      </Text>
                      <Text className="text-xs text-white/60 capitalize">
                        {expense.category} • {format(new Date(expense.date), "MMM d")}
                      </Text>
                    </View>
                    <Text className="text-sm font-semibold text-white">
                      ${expense.amount.toFixed(2)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Quick Stats */}
        <View className="mt-6 pt-4 border-t border-white/20">
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-xs text-white/60">Daily Avg</Text>
              <Text className="text-sm font-semibold text-white">
                ${(weeklyTotal / 7).toFixed(2)}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-white/60">Highest Day</Text>
              <Text className="text-sm font-semibold text-white">
                ${Math.max(...Object.values(dailyChartData)).toFixed(2)}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-white/60">Categories</Text>
              <Text className="text-sm font-semibold text-white">
                {Object.values(categorySpending).filter(amount => amount > 0).length}
              </Text>
            </View>
          </View>
        </View>
      </Card>

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