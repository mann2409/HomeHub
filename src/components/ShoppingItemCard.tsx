import React from "react";
import { View, Text, Pressable, Animated, PanResponder } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ShoppingItem } from "../types";
import { cn } from "../utils/cn";
import useSettingsStore from "../state/settingsStore";

interface ShoppingItemCardProps {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onPress?: (item: ShoppingItem) => void;
}

export default function ShoppingItemCard({ item, onToggle, onPress }: ShoppingItemCardProps) {
  const { categoryColors } = useSettingsStore();
  const categoryColor = categoryColors.shoppingCategories[item.category];

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

  const totalPrice = (item.estimatedPrice || 0) * item.quantity;

  const translateX = new Animated.Value(0);
  const opacity = translateX.interpolate({ inputRange: [-120, 0, 120], outputRange: [0.2, 1, 0.2], extrapolate: "clamp" });
  const responder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6,
    onPanResponderMove: Animated.event([null, { dx: translateX }], { useNativeDriver: false }),
    onPanResponderRelease: (_, g) => {
      if (g.dx > 80) onToggle(item.id);
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true, friction: 7, tension: 120 }).start();
    },
  });

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      className={cn(
        "bg-white rounded-lg p-3 mb-2 border-l-4 shadow-sm flex-row items-center",
        item.completed && "opacity-60"
      )}
      style={{ borderLeftColor: categoryColor }}
      {...responder.panHandlers}
    >
      {/* Checkbox */}
      <Pressable
        onPress={() => onToggle(item.id)}
        className={cn(
          "w-6 h-6 rounded-full border-2 items-center justify-center mr-3",
          item.completed
            ? "bg-primary border-primary"
            : "border-gray-300 bg-white"
        )}
      >
        {item.completed && (
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        )}
      </Pressable>

      {/* Item Details */}
      <Animated.View className="flex-1" style={{ transform: [{ translateX }], opacity }}>
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className={cn(
              "text-base font-medium",
              item.completed ? "text-gray-500 line-through" : "text-gray-900"
            )}
          >
            {item.name}
          </Text>
          <View className="flex-row items-center">
            <Ionicons
              name={priorityIcons[item.priority]}
              size={14}
              color={priorityColors[item.priority]}
            />
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: categoryColor }}
            />
            <Text className="text-xs text-gray-500 capitalize">
              {item.category.replace("_", " ")}
            </Text>
            <Text className="text-xs text-gray-500 mx-2">•</Text>
            <Text className="text-xs text-gray-500">
              {item.quantity} {item.unit || "pcs"}
            </Text>
          </View>

          {item.estimatedPrice && (
            <Text
              className={cn(
                "text-sm font-semibold",
                item.completed ? "text-gray-400" : "text-gray-900"
              )}
            >
              ${totalPrice.toFixed(2)}
            </Text>
          )}
        </View>

        {item.notes && (
          <Text
            className={cn(
              "text-xs mt-1",
              item.completed ? "text-gray-400" : "text-gray-600"
            )}
          >
            {item.notes}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}