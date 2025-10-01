import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TaskCategory } from "../types";
import { cn } from "../utils/cn";

interface CategorySelectorProps {
  value: TaskCategory;
  onChange: (category: TaskCategory) => void;
  className?: string;
}

const categoryConfig = {
  personal: {
    label: "Personal",
    icon: "person" as const,
    color: "#8B5CF6",
    bgColor: "#F3F4F6",
  },
  work: {
    label: "Work",
    icon: "briefcase" as const,
    color: "#3B82F6",
    bgColor: "#F3F4F6",
  },
  health: {
    label: "Health",
    icon: "fitness" as const,
    color: "#10B981",
    bgColor: "#F3F4F6",
  },
  home: {
    label: "Home",
    icon: "home" as const,
    color: "#F59E0B",
    bgColor: "#F3F4F6",
  },
  shopping: {
    label: "Shopping",
    icon: "basket" as const,
    color: "#EC4899",
    bgColor: "#F3F4F6",
  },
  finance: {
    label: "Finance",
    icon: "card" as const,
    color: "#EF4444",
    bgColor: "#F3F4F6",
  },
  other: {
    label: "Other",
    icon: "ellipsis-horizontal" as const,
    color: "#6B7280",
    bgColor: "#F3F4F6",
  },
};

export default function CategorySelector({ value, onChange, className }: CategorySelectorProps) {
  return (
    <View className={cn("mb-4", className)}>
      <Text className="text-sm font-semibold text-white mb-3">
        Category
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 2 }}
      >
        <View className="flex-row space-x-3">
          {(Object.keys(categoryConfig) as TaskCategory[]).map((category) => {
            const config = categoryConfig[category];
            const isSelected = value === category;
            
            return (
              <Pressable
                key={category}
                onPress={() => onChange(category)}
                className={cn(
                  "items-center justify-center py-3 px-4 rounded-xl border min-w-20",
                  isSelected ? "border-opacity-100" : "border-white/20"
                )}
                style={{
                  backgroundColor: isSelected ? `${config.color}20` : "rgba(255, 255, 255, 0.05)",
                  borderColor: isSelected ? config.color : "rgba(255, 255, 255, 0.2)",
                }}
                accessibilityLabel={`Select ${config.label} category`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center mb-2"
                  style={{ 
                    backgroundColor: isSelected ? config.color : "rgba(255, 255, 255, 0.1)" 
                  }}
                >
                  <Ionicons 
                    name={config.icon} 
                    size={16} 
                    color={isSelected ? "#FFFFFF" : config.color} 
                  />
                </View>
                <Text 
                  className={cn(
                    "text-xs font-medium text-center",
                    isSelected ? "text-white" : "text-white/60"
                  )}
                  numberOfLines={1}
                >
                  {config.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}