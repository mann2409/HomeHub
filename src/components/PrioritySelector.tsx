import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Priority } from "../types";
import { cn } from "../utils/cn";

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  className?: string;
}

const priorityConfig = {
  low: {
    label: "Low",
    color: "#10B981",
    bgColor: "#ECFDF5",
    borderColor: "#10B981",
    icon: "chevron-down" as const,
  },
  medium: {
    label: "Medium",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    borderColor: "#F59E0B",
    icon: "remove" as const,
  },
  high: {
    label: "High",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    borderColor: "#EF4444",
    icon: "chevron-up" as const,
  },
};

export default function PrioritySelector({ value, onChange, className }: PrioritySelectorProps) {
  return (
    <View className={cn("mb-4", className)}>
      <Text className="text-sm font-semibold text-gray-900 mb-3">
        Priority
      </Text>
      <View className="flex-row space-x-3">
        {(Object.keys(priorityConfig) as Priority[]).map((priority) => {
          const config = priorityConfig[priority];
          const isSelected = value === priority;
          
          return (
            <Pressable
              key={priority}
              onPress={() => onChange(priority)}
              className={cn(
                "flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl border-2",
                isSelected ? "border-opacity-100" : "border-gray-200"
              )}
              style={{
                backgroundColor: isSelected ? config.bgColor : "#F9FAFB",
                borderColor: isSelected ? config.borderColor : "#E5E7EB",
              }}
              accessibilityLabel={`Set priority to ${config.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Ionicons 
                name={config.icon} 
                size={16} 
                color={isSelected ? config.color : "#6B7280"} 
                style={{ marginRight: 6 }}
              />
              <Text 
                className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-gray-900" : "text-gray-600"
                )}
              >
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}