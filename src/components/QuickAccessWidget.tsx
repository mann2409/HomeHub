import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Pressable as RNPressable } from "react-native";
import { cn } from "../utils/cn";

interface QuickAccessWidgetProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconNode?: React.ReactNode;
  color: string;
  onPress: () => void;
  size?: "small" | "medium" | "large";
}

export default function QuickAccessWidget({ 
  title, 
  icon, 
  iconNode,
  color, 
  onPress, 
  size = "medium" 
}: QuickAccessWidgetProps) {
  const sizeClasses = {
    small: "w-24 h-24",
    medium: "w-28 h-32",
    large: "w-32 h-36",
  };

  const iconSizes = {
    small: 22,
    medium: 28,
    large: 32,
  };

  const textSizes = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      className={cn(
        "rounded-2xl items-center justify-center p-4",
        sizeClasses[size]
      )}
      style={{
        backgroundColor: "#F8FAFE",
        borderWidth: 1,
        borderColor: "#E6ECF8",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
      }}
      android_ripple={{ color: `${color}33`, borderless: false }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: `${color}20` }}
      >
        {iconNode ? (
          iconNode
        ) : (
          <Ionicons name={icon as any} size={iconSizes[size]} color={color} />
        )}
      </View>
      
      <Text 
        className={cn(
          "font-semibold text-gray-700 text-center leading-tight",
          textSizes[size]
        )}
        numberOfLines={2}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        {title}
      </Text>
    </Pressable>
  );
}