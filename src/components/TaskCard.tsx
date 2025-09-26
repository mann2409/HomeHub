import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { Task } from "../types";
import { cn } from "../utils/cn";
import useSettingsStore from "../state/settingsStore";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onPress?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

export default function TaskCard({ task, onToggle, onPress, onDelete }: TaskCardProps) {
  const { categoryColors } = useSettingsStore();
  const categoryColor = categoryColors.taskCategories[task.category];

  const priorityIcons = {
    low: "flag-outline",
    medium: "flag",
    high: "flag",
  } as const;

  const priorityColors = {
    low: "#6B7280",
    medium: "#F59E0B",
    high: "#EF4444",
  };

  return (
    <Pressable
      onPress={() => onPress?.(task)}
      className={cn(
        "bg-white rounded-lg p-3 mb-2 border-l-4 shadow-sm",
        task.completed && "opacity-60"
      )}
      style={{ borderLeftColor: categoryColor }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-1">
            <Text
              className={cn(
                "text-base font-medium flex-1",
                task.completed ? "text-gray-500 line-through" : "text-gray-900"
              )}
            >
              {task.title}
            </Text>
            <Ionicons
              name={priorityIcons[task.priority]}
              size={16}
              color={priorityColors[task.priority]}
            />
          </View>
          
          {task.description && (
            <Text
              className={cn(
                "text-sm mb-2",
                task.completed ? "text-gray-400" : "text-gray-600"
              )}
            >
              {task.description}
            </Text>
          )}
          
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: categoryColor }}
              />
              <Text className="text-xs text-gray-500 capitalize">
                {task.category}
              </Text>
            </View>
            
            {task.dueDate && (
              <Text className="text-xs text-gray-500">
                {format(new Date(task.dueDate), "h:mm a")}
              </Text>
            )}
          </View>
        </View>
        
        <View className="flex-row items-center">
          <Pressable
            onPress={() => onToggle(task.id)}
            className={cn(
              "w-6 h-6 rounded-full border-2 items-center justify-center mr-2",
              task.completed
                ? "bg-primary border-primary"
                : "border-gray-300 bg-white"
            )}
          >
            {task.completed && (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            )}
          </Pressable>
          {onDelete && (
            <Pressable
              onPress={() => onDelete(task.id)}
              className="w-6 h-6 items-center justify-center"
              accessibilityLabel="Delete task"
            >
              <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}