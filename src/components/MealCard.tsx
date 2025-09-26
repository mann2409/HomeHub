import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Meal, MealType } from "../types";
import { cn } from "../utils/cn";
import useSettingsStore from "../state/settingsStore";

interface MealCardProps {
  meal: Meal | null;
  mealType: MealType;
  onPress: () => void;
}

export default function MealCard({ meal, mealType, onPress }: MealCardProps) {
  const { categoryColors } = useSettingsStore();

  const mealTypeLabels = {
    breakfast: "Breakfast",
    lunch: "Lunch", 
    dinner: "Dinner",
    snack: "Snack",
  };

  const mealTypeIcons = {
    breakfast: "sunny",
    lunch: "partly-sunny",
    dinner: "moon",
    snack: "cafe",
  } as const;

  const getMealTypeColor = (type: MealType) => {
    const colors = {
      breakfast: "#F59E0B",
      lunch: "#10B981",
      dinner: "#8B5CF6",
      snack: "#EC4899",
    };
    return colors[type];
  };

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "bg-white border border-gray-200 rounded-lg p-3 min-h-[80px] justify-center",
        !meal && "border-dashed border-gray-300"
      )}
    >
      {meal ? (
        <View>
          <View className="flex-row items-center mb-2">
            <View
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: categoryColors.mealCategories[meal.category] }}
            />
            <Text className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {mealTypeLabels[mealType]}
            </Text>
          </View>
          
          <Text className="text-sm font-semibold text-gray-900 mb-1">
            {meal.name}
          </Text>
          
          {meal.description && (
            <Text className="text-xs text-gray-600 line-clamp-2">
              {meal.description}
            </Text>
          )}
          
          <View className="flex-row items-center justify-between mt-2">
            {meal.prepTime && (
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={12} color="#6B7280" />
                <Text className="text-xs text-gray-500 ml-1">
                  {meal.prepTime}m
                </Text>
              </View>
            )}
            
            {meal.servings && (
              <View className="flex-row items-center">
                <Ionicons name="people-outline" size={12} color="#6B7280" />
                <Text className="text-xs text-gray-500 ml-1">
                  {meal.servings}
                </Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View className="items-center justify-center">
          <Ionicons
            name={mealTypeIcons[mealType]}
            size={24}
            color={getMealTypeColor(mealType)}
            style={{ opacity: 0.5 }}
          />
          <Text className="text-xs text-gray-500 mt-2 text-center">
            Add {mealTypeLabels[mealType]}
          </Text>
        </View>
      )}
    </Pressable>
  );
}