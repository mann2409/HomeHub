import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Meal, MealType, DietaryBadge } from "../types";
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

  const getMealTypeColor = (type: MealType): [string, string] => {
    const colors = {
      breakfast: ["#FCE38A", "#F38181"] as [string, string], // Gold to coral
      lunch: ["#36D1C4", "#96E6A1"] as [string, string], // Teal to green
      dinner: ["#9B5DE5", "#661AE6"] as [string, string], // Purple gradient
      snack: ["#FFB347", "#FFCC5C"] as [string, string], // Orange gradient
    };
    return colors[type];
  };

  const getMealTypeIcon = (type: MealType) => {
    const icons = {
      breakfast: "sunny",
      lunch: "restaurant",
      dinner: "moon",
      snack: "cafe",
    };
    return icons[type];
  };

  const getDietaryBadgeIcon = (badge: DietaryBadge) => {
    const icons: Record<DietaryBadge, string> = {
      "vegetarian": "leaf",
      "vegan": "leaf-outline",
      "gluten-free": "nutrition",
      "dairy-free": "water",
      "nut-free": "close-circle",
      "keto": "flame",
      "paleo": "fitness",
      "halal": "moon",
      "kosher": "star",
      "kids-friendly": "happy",
    };
    return icons[badge];
  };

  const gradientColors = getMealTypeColor(mealType);
  
  return (
    <Pressable 
      onPress={onPress} 
      className="min-h-[100px]"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
      }}
    >
      {meal ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-4 min-h-[100px] justify-between"
          style={{ 
            borderRadius: 24,
            overflow: 'hidden' 
          }}
        >
          {/* Header with meal type and note indicator */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Ionicons 
                name={getMealTypeIcon(mealType) as any} 
                size={16} 
                color="#FFFFFF" 
              />
              <Text className="text-xs font-medium text-white/90 uppercase tracking-wide ml-2">
                {mealTypeLabels[mealType]}
              </Text>
            </View>
            {meal.notes && (
              <Ionicons name="document-text" size={14} color="#FFFFFF" opacity={0.8} />
            )}
          </View>
          
          {/* Meal name */}
          <Text className="text-base font-bold text-white mb-1" numberOfLines={2}>
            {meal.name}
          </Text>
          
          {/* Description */}
          {meal.description && (
            <Text className="text-xs text-white/80 line-clamp-2 mb-2">
              {meal.description}
            </Text>
          )}
          
          {/* Dietary badges */}
          {meal.dietaryBadges && meal.dietaryBadges.length > 0 && (
            <View className="flex-row flex-wrap gap-1 mb-2">
              {meal.dietaryBadges.slice(0, 3).map((badge, index) => (
                <View 
                  key={index} 
                  className="bg-white/30 rounded-full px-2 py-0.5 flex-row items-center"
                >
                  <Ionicons 
                    name={getDietaryBadgeIcon(badge) as any} 
                    size={10} 
                    color="#FFFFFF" 
                  />
                  <Text className="text-[10px] text-white ml-1 capitalize">
                    {badge.replace('-', ' ')}
                  </Text>
                </View>
              ))}
              {meal.dietaryBadges.length > 3 && (
                <View className="bg-white/30 rounded-full px-2 py-0.5">
                  <Text className="text-[10px] text-white">
                    +{meal.dietaryBadges.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}
          
          {/* Footer with prep time and servings */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-3">
              {meal.prepTime && (
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={14} color="#FFFFFF" />
                  <Text className="text-xs text-white/90 ml-1 font-medium">
                    {meal.prepTime}m
                  </Text>
                </View>
              )}
              
              {meal.servings && (
                <View className="flex-row items-center">
                  <Ionicons name="people-outline" size={14} color="#FFFFFF" />
                  <Text className="text-xs text-white/90 ml-1 font-medium">
                    {meal.servings}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Tap to edit indicator */}
            <Ionicons name="chevron-forward" size={14} color="#FFFFFF" opacity={0.6} />
          </View>
        </LinearGradient>
      ) : (
        <View 
          className="bg-white/10 border-2 border-dashed border-white/30 rounded-3xl p-4 min-h-[100px] justify-center items-center"
          style={{
            shadowColor: "transparent",
          }}
        >
          <Ionicons
            name={getMealTypeIcon(mealType) as any}
            size={32}
            color="#FFFFFF"
            style={{ opacity: 0.5 }}
          />
          <Text className="text-sm text-white/80 mt-2 text-center font-medium">
            Add {mealTypeLabels[mealType]}
          </Text>
          <Text className="text-xs text-white/60 mt-1 text-center">
            Tap to plan
          </Text>
        </View>
      )}
    </Pressable>
  );
}