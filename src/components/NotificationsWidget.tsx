import React from "react";
import { View, Text, Pressable } from "react-native";
import { Bell, AlertCircle, Clock, CreditCard } from "phosphor-react-native";
import Card from "./Card";
import useTaskStore from "../state/taskStore";
import useFinanceStore from "../state/financeStore";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";

export default function NotificationsWidget() {
  const { getOverdueTasks, getTodaysTasks } = useTaskStore();
  const { getWeeklySpending } = useFinanceStore();
  const navigation = useNavigation<NavigationProp<any>>();
  
  const overdueTasks = getOverdueTasks();
  const todaysTasks = getTodaysTasks();
  const weeklySpending = getWeeklySpending();
  
  const getNotifications = () => {
    const notifications = [];
    
    // Overdue tasks
    if (overdueTasks.length > 0) {
      notifications.push({
        id: "overdue",
        type: "urgent",
        icon: <AlertCircle size={16} weight="fill" color="#EF4444" />,
        title: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
        message: "These need immediate attention",
        action: "View Tasks",
        onPress: () => navigation.navigate("Calendar")
      });
    }
    
    // High priority tasks due today
    const urgentToday = todaysTasks.filter(task => !task.completed && task.priority === "high");
    if (urgentToday.length > 0) {
      notifications.push({
        id: "urgent_today",
        type: "warning",
        icon: <Clock size={16} weight="fill" color="#F59E0B" />,
        title: `${urgentToday.length} urgent task${urgentToday.length > 1 ? 's' : ''} today`,
        message: "High priority items due",
        action: "View Tasks",
        onPress: () => navigation.navigate("Calendar")
      });
    }
    
    // Budget warnings
    if (weeklySpending > 150) {
      notifications.push({
        id: "budget_warning",
        type: "info",
        icon: <CreditCard size={16} weight="regular" color="#3B82F6" />,
        title: "Budget alert",
        message: `You've spent $${weeklySpending.toFixed(2)} this week`,
        action: "View Finance",
        onPress: () => navigation.navigate("Finance")
      });
    }
    
    return notifications;
  };

  const notifications = getNotifications();

  if (notifications.length === 0) {
    return (
      <Card className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full items-center justify-center mr-3">
            <Bell size={16} weight="regular" color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-green-800 dark:text-green-300">
              All caught up!
            </Text>
            <Text className="text-xs text-green-600 dark:text-green-400">
              No urgent notifications
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <View className="space-y-3">
      {notifications.map((notification) => (
        <Pressable
          key={notification.id}
          onPress={notification.onPress}
          className={`p-3 rounded-lg border ${
            notification.type === "urgent" 
              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
              : notification.type === "warning"
              ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700"
              : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
          }`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="mr-3">
                {notification.icon}
              </View>
              <View className="flex-1">
                <Text className={`text-sm font-medium ${
                  notification.type === "urgent" 
                    ? "text-red-800 dark:text-red-300"
                    : notification.type === "warning"
                    ? "text-yellow-800 dark:text-yellow-300"
                    : "text-blue-800 dark:text-blue-300"
                }`}>
                  {notification.title}
                </Text>
                <Text className={`text-xs ${
                  notification.type === "urgent" 
                    ? "text-red-600 dark:text-red-400"
                    : notification.type === "warning"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-blue-600 dark:text-blue-400"
                }`}>
                  {notification.message}
                </Text>
              </View>
            </View>
            <Text className={`text-xs font-medium ${
              notification.type === "urgent" 
                ? "text-red-700 dark:text-red-300"
                : notification.type === "warning"
                ? "text-yellow-700 dark:text-yellow-300"
                : "text-blue-700 dark:text-blue-300"
            }`}>
              {notification.action}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
