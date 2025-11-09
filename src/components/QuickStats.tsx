import React from "react";
import { View, Text, Pressable } from "react-native";
import { CurrencyDollar, ShoppingBag, ForkKnife } from "phosphor-react-native";
import Card from "./Card";
import useFinanceStore from "../state/financeStore";
import useShoppingStore from "../state/shoppingStore";
import useMealStore from "../state/mealStore";
import useSettingsStore from "../state/settingsStore";

export default function QuickStats() {
  const { getWeeklySpending } = useFinanceStore();
  const { getPendingItems } = useShoppingStore();
  const { getMealsByDate } = useMealStore();
  const { weeklyExpenseTarget, currency } = useSettingsStore();

  const weeklySpending = getWeeklySpending();
  const pendingItems = getPendingItems();
  const todaysMeals = getMealsByDate(new Date());
  const estimatedCost = pendingItems.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);

  const getBudgetStatus = () => {
    const target = weeklyExpenseTarget || 500;
    const percentage = (weeklySpending / target) * 100;
    
    if (percentage >= 100) return { color: "red", message: "Over budget" };
    if (percentage >= 90) return { color: "red", message: "Budget almost used" };
    if (percentage >= 75) return { color: "yellow", message: "Budget 75% used" };
    return { color: "green", message: "On track" };
  };

  const budgetStatus = getBudgetStatus();

  return (
    <View className="space-y-3 mb-4">
      {/* This Week's Spend */}
      <Card variant="aqua" className="p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <CurrencyDollar size={20} weight="regular" color="#FFFFFF" />
            <View className="ml-3">
              <Text className="text-sm font-medium text-white">
                This week's spend
              </Text>
              <Text className="text-lg font-bold text-white">
                ${weeklySpending.toFixed(2)} / ${(weeklyExpenseTarget || 500).toFixed(2)}
              </Text>
            </View>
          </View>
          <View className={`px-2 py-1 rounded-full ${
            budgetStatus.color === "red" ? "bg-[#F86D70]" :
            budgetStatus.color === "yellow" ? "bg-[#F59E0B]" :
            "bg-[#83F7C6]"
          }`}>
            <Text className={`text-xs font-medium ${
              budgetStatus.color === "red" ? "text-white" :
              budgetStatus.color === "yellow" ? "text-white" :
              "text-[#21284F]"
            }`}>
              {budgetStatus.message}
            </Text>
          </View>
        </View>
      </Card>

      {/* Next Grocery Run */}
      <Card variant="mint" className="p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <ShoppingBag size={20} weight="regular" color="#FFFFFF" />
            <View className="ml-3">
              <Text className="text-sm font-medium text-white">
                Next grocery run
              </Text>
              <Text className="text-lg font-bold text-white">
                {pendingItems.length} items
              </Text>
              {estimatedCost > 0 && (
                <Text className="text-xs text-white/80">
                  est. ${estimatedCost.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
          {pendingItems.length > 0 && (
            <View className="w-2 h-2 bg-white rounded-full" />
          )}
        </View>
      </Card>

      {/* Today's Meals */}
      <Card variant="default" className="p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <ForkKnife size={20} weight="regular" color="#FFFFFF" />
            <View className="ml-3">
              <Text className="text-sm font-medium text-white">
                Today's meals
              </Text>
              <Text className="text-lg font-bold text-white">
                {todaysMeals.length}/3 logged
              </Text>
              <Text className="text-xs text-white/80">
                {todaysMeals.length === 0 ? "No meals logged" : 
                 todaysMeals.length === 3 ? "All meals logged" : 
                 "Keep logging meals"}
              </Text>
            </View>
          </View>
          <View className={`w-2 h-2 rounded-full ${
            todaysMeals.length === 3 ? "bg-[#83F7C6]" :
            todaysMeals.length > 0 ? "bg-[#F59E0B]" : "bg-white/40"
          }`} />
        </View>
      </Card>
    </View>
  );
}
