import React from "react";
import { View, Text, Pressable } from "react-native";
import { format } from "date-fns";
import { Calendar } from "phosphor-react-native";
import Card from "./Card";
import useTaskStore from "../state/taskStore";

export default function DailySummarySimple() {
  const { getTodaysTasks, getOverdueTasks } = useTaskStore();
  
  const todaysTasks = getTodaysTasks();
  const overdueTasks = getOverdueTasks();
  const completedToday = todaysTasks.filter(task => task.completed).length;
  const pendingToday = todaysTasks.filter(task => !task.completed).length;
  
  const urgentTask = todaysTasks.find(task => !task.completed && task.priority === "high");
  const nextTask = todaysTasks.find(task => !task.completed);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Card variant="lavender" className="mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-lg font-semibold text-white">
            {getGreeting()}
          </Text>
          <Text className="text-sm text-white/80">
            {format(new Date(), "EEEE, MMMM d")}
          </Text>
        </View>
        <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
          <Calendar size={20} weight="regular" color="#FFFFFF" />
        </View>
      </View>

      {/* Today's Focus */}
      {overdueTasks.length > 0 && (
        <View className="mb-4 p-3 bg-[#F86D70] rounded-xl">
          <Text className="text-sm font-medium text-white">
            {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {overdueTasks.length === 0 && urgentTask && (
        <View className="mb-4 p-3 bg-[#F86D70] rounded-xl">
          <Text className="text-sm font-medium text-white">
            Urgent: {urgentTask.title}
          </Text>
        </View>
      )}

      {overdueTasks.length === 0 && !urgentTask && nextTask && (
        <View className="mb-4 p-3 bg-white/20 rounded-xl">
          <Text className="text-sm font-medium text-white">
            Next: {nextTask.title}
          </Text>
        </View>
      )}

      {overdueTasks.length === 0 && !urgentTask && !nextTask && (
        <View className="mb-4 p-3 bg-[#83F7C6] rounded-xl">
          <Text className="text-sm font-medium text-[#21284F]">
            All caught up! 🎉
          </Text>
        </View>
      )}

      {/* Quick Stats */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center space-x-6">
          <View className="items-center">
            <Text className="text-lg font-bold text-white">
              {completedToday}
            </Text>
            <Text className="text-xs text-white/80">Done</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-white">
              {pendingToday}
            </Text>
            <Text className="text-xs text-white/80">Pending</Text>
          </View>
          {overdueTasks.length > 0 && (
            <View className="items-center">
              <Text className="text-lg font-bold text-white">
                {overdueTasks.length}
              </Text>
              <Text className="text-xs text-white/80">Overdue</Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}
