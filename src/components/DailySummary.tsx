import React from "react";
import { View, Text, Pressable } from "react-native";
import { format } from "date-fns";
import { Calendar, CheckCircle, AlertCircle } from "phosphor-react-native";
import Card from "./Card";
import useTaskStore from "../state/taskStore";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";

export default function DailySummary() {
  const { getTodaysTasks, getOverdueTasks } = useTaskStore();
  const navigation = useNavigation<NavigationProp<any>>();
  
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

  const getTodayFocus = () => {
    // Priority: Overdue > Urgent today > Next task > All done
    if (overdueTasks.length > 0) {
      const firstOverdue = overdueTasks[0];
      return {
        type: "overdue",
        task: firstOverdue,
        message: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
        color: "red"
      };
    }
    
    if (urgentTask) {
      return {
        type: "urgent",
        task: urgentTask,
        message: "Urgent task today",
        color: "orange"
      };
    }
    
    if (nextTask) {
      return {
        type: "next",
        task: nextTask,
        message: "Next task",
        color: "blue"
      };
    }
    
    return {
      type: "done",
      message: "All caught up! 🎉",
      color: "green"
    };
  };

  return (
    <Card className="mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {getGreeting()}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {format(new Date(), "EEEE, MMMM d")}
          </Text>
        </View>
        <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full items-center justify-center">
          <Calendar size={20} weight="regular" color="#3B82F6" />
        </View>
      </View>

      {/* Today's Focus - Single Task/Event */}
      {(() => {
        const focus = getTodayFocus();
        
        if (focus.type === "done") {
          return (
            <View className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <View className="flex-row items-center">
                <CheckCircle size={16} weight="fill" color="#10B981" />
                <Text className="text-sm font-medium text-green-800 dark:text-green-300 ml-2">
                  {focus.message}
                </Text>
              </View>
            </View>
          );
        }
        
        const getColorClasses = (color: string) => {
          switch (color) {
            case "red":
              return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700";
            case "orange":
              return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700";
            case "blue":
              return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700";
            default:
              return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700";
          }
        };
        
        const getTextColor = (color: string) => {
          switch (color) {
            case "red":
              return "text-red-800 dark:text-red-300";
            case "orange":
              return "text-orange-800 dark:text-orange-300";
            case "blue":
              return "text-blue-800 dark:text-blue-300";
            default:
              return "text-gray-800 dark:text-gray-300";
          }
        };
        
        const getIcon = (type: string) => {
          switch (type) {
            case "overdue":
              return <AlertCircle size={16} weight="fill" color="#EF4444" />;
            case "urgent":
              return <AlertCircle size={16} weight="fill" color="#F59E0B" />;
            case "next":
              return <CheckCircle size={16} weight="regular" color="#3B82F6" />;
            default:
              return <CheckCircle size={16} weight="regular" color="#6B7280" />;
          }
        };
        
        return (
          <Pressable
            onPress={() => navigation.navigate("Calendar")}
            className={`mb-4 p-3 rounded-lg border ${getColorClasses(focus.color)}`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                {getIcon(focus.type)}
                <View className="ml-2 flex-1">
                  <Text className={`text-sm font-medium ${getTextColor(focus.color)}`}>
                    {focus.message}
                  </Text>
                  {focus.task && (
                    <Text className={`text-xs ${getTextColor(focus.color)} opacity-80`}>
                      {focus.task.title}
                    </Text>
                  )}
                </View>
              </View>
              <Text className={`text-xs font-medium ${getTextColor(focus.color)}`}>
                View Tasks
              </Text>
            </View>
          </Pressable>
        );
      })()}

      {/* Quick Stats */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center space-x-6">
          <View className="items-center">
            <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {completedToday}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">Done</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-gray-600 dark:text-gray-400">
              {pendingToday}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">Pending</Text>
          </View>
          {overdueTasks.length > 0 && (
            <View className="items-center">
              <Text className="text-lg font-bold text-red-600 dark:text-red-400">
                {overdueTasks.length}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">Overdue</Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}
