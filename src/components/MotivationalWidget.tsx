import React from "react";
import { View, Text } from "react-native";
import { Trophy, Target, CheckCircle, Star, Heart, Sparkle } from "phosphor-react-native";
import Card from "./Card";
import useTaskStore from "../state/taskStore";
import useFinanceStore from "../state/financeStore";
import useShoppingStore from "../state/shoppingStore";
import useMealStore from "../state/mealStore";

export default function MotivationalWidget() {
  const { getTodaysTasks, getOverdueTasks } = useTaskStore();
  const { getWeeklySpending } = useFinanceStore();
  const { getPendingItems } = useShoppingStore();
  const { getMealsByDate } = useMealStore();
  
  const todaysTasks = getTodaysTasks();
  const overdueTasks = getOverdueTasks();
  const completedToday = todaysTasks.filter(task => task.completed).length;
  const weeklySpending = getWeeklySpending();
  const pendingItems = getPendingItems();
  const todaysMeals = getMealsByDate(new Date());
  
  const getMotivationalMessage = () => {
    // Priority: Overdue tasks > Budget > Task completion > Shopping > Meals
    
    // Overdue tasks - urgent
    if (overdueTasks.length > 0) {
      return {
        icon: <Target size={24} weight="fill" color="#EF4444" />,
        title: "Let's catch up!",
        message: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} need attention`,
        color: "red"
      };
    }
    
    // Budget achievements
    if (weeklySpending < 50) {
      return {
        icon: <Star size={24} weight="fill" color="#8B5CF6" />,
        title: "Budget champion! 💰",
        message: "You're spending wisely this week",
        color: "purple"
      };
    }
    
    if (weeklySpending < 100) {
      return {
        icon: <CheckCircle size={24} weight="fill" color="#10B981" />,
        title: "You're on budget this week!",
        message: "Great job managing your finances",
        color: "green"
      };
    }
    
    if (weeklySpending > 150) {
      return {
        icon: <Target size={24} weight="regular" color="#F59E0B" />,
        title: "Budget alert",
        message: "Consider reviewing your spending",
        color: "yellow"
      };
    }
    
    // Task completion achievements
    if (completedToday === todaysTasks.length && todaysTasks.length > 0) {
      return {
        icon: <Trophy size={24} weight="fill" color="#F59E0B" />,
        title: "All tasks done! 🎉",
        message: "You've completed everything today",
        color: "yellow"
      };
    }
    
    if (completedToday > 0) {
      return {
        icon: <CheckCircle size={24} weight="fill" color="#10B981" />,
        title: "Great progress!",
        message: `${completedToday} task${completedToday > 1 ? 's' : ''} completed today`,
        color: "green"
      };
    }
    
    // Shopping achievements
    if (pendingItems.length === 0) {
      return {
        icon: <CheckCircle size={24} weight="fill" color="#10B981" />,
        title: "Shopping list complete!",
        message: "No items left to buy",
        color: "green"
      };
    }
    
    // Meal logging achievements
    if (todaysMeals.length === 3) {
      return {
        icon: <Heart size={24} weight="fill" color="#EF4444" />,
        title: "All meals logged!",
        message: "Great job tracking your nutrition",
        color: "red"
      };
    }
    
    if (todaysMeals.length > 0) {
      return {
        icon: <Sparkle size={24} weight="regular" color="#8B5CF6" />,
        title: "Keep logging meals!",
        message: `${todaysMeals.length}/3 meals logged today`,
        color: "purple"
      };
    }
    
    // Default motivational message
    return {
      icon: <Star size={24} weight="regular" color="#3B82F6" />,
      title: "You're doing great!",
      message: "Keep up the excellent work managing your home",
      color: "blue"
    };
  };

  const message = getMotivationalMessage();

  const getColorClasses = (color: string) => {
    switch (color) {
      case "red":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700";
      case "yellow":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700";
      case "green":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700";
      case "blue":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700";
      case "purple":
        return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700";
      default:
        return "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <Card className={`p-4 border ${getColorClasses(message.color)} mb-4`}>
      <View className="flex-row items-center">
        <View className="mr-3">
          {message.icon}
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {message.title}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {message.message}
          </Text>
        </View>
      </View>
    </Card>
  );
}
