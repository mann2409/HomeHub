import React, { useRef } from "react";
import { Pressable, Text, View, Animated } from "react-native";
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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(1)).current;
  const plusRotateAnim = useRef(new Animated.Value(0)).current;
  const sizeClasses = {
    small: "w-24 h-24",
    medium: "w-32 h-32",
    large: "w-32 h-36",
  };

  const iconSizes = {
    small: 28,
    medium: 40,
    large: 44,
  };

  const textSizes = {
    small: "text-xs",
    medium: "text-xs",
    large: "text-lg",
  };

  const getTintedBackground = (color: string) => {
    switch (color) {
      case "#3B82F6": // Blue for Add Task
        return "#3B82F6"; // Blue
      case "#8B5CF6": // Purple for Add Expense
        return "#8B5CF6"; // Purple
      case "#EC4899": // Pink for Shopping
        return "#EC4899"; // Pink
      case "#F59E0B": // Orange for Quick Note
        return "#F86D70"; // Coral
      default:
        return "#3B82F6";
    }
  };

  const getSubtleIconColor = (color: string) => {
    switch (color) {
      case "#3B82F6": // Blue
        return "#FFFFFF"; // White
      case "#8B5CF6": // Purple
        return "#FFFFFF"; // White
      case "#EC4899": // Pink
        return "#FFFFFF"; // White
      case "#F59E0B": // Orange
        return "#FFFFFF"; // White
      default:
        return "#FFFFFF";
    }
  };

  const isAddAction = title.toLowerCase().includes('add');

  const handlePressIn = () => {
    console.log('QuickAccessWidget pressed:', title);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(liftAnim, {
        toValue: -4,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(iconScaleAnim, {
        toValue: 1.15,
        useNativeDriver: true,
        tension: 400,
        friction: 8,
      }),
      ...(isAddAction ? [
        Animated.timing(plusRotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ] : []),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(liftAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(iconScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 400,
        friction: 8,
      }),
      ...(isAddAction ? [
        Animated.timing(plusRotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ] : []),
    ]).start();
  };

  return (
    <Animated.View
      style={{
        transform: [
          { scale: scaleAnim },
          { translateY: liftAnim }
        ],
        shadowColor: color,
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 16,
        elevation: 4,
      }}
    >
      <Pressable
        onPress={() => {
          console.log('QuickAccessWidget onPress called:', title);
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hitSlop={10}
        className={cn(
          "rounded-3xl items-center justify-center p-5",
          sizeClasses[size]
        )}
        style={{
          backgroundColor: getTintedBackground(color),
          borderWidth: 1,
          borderColor: `${color}20`,
        }}
        android_ripple={{ color: `${color}20`, borderless: false }}
      >
        <Animated.View
          className="w-16 h-16 rounded-full items-center justify-center mb-3"
          style={{ 
            backgroundColor: `${getSubtleIconColor(color)}30`,
            transform: [{ scale: iconScaleAnim }]
          }}
        >
          {iconNode ? (
            <Animated.View 
              style={{ 
                transform: [
                  { scale: 1.2 },
                  { 
                    rotate: isAddAction ? plusRotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '45deg'],
                    }) : '0deg'
                  }
                ]
              }}
            >
              {iconNode}
            </Animated.View>
          ) : (
            <Animated.View
              style={{
                transform: [
                  { 
                    rotate: isAddAction ? plusRotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '45deg'],
                    }) : '0deg'
                  }
                ]
              }}
            >
              <Ionicons name={icon as any} size={iconSizes[size]} color={getSubtleIconColor(color)} />
            </Animated.View>
          )}
        </Animated.View>
        
        <Text 
          className={cn(
            "font-semibold text-white text-center leading-tight",
            textSizes[size]
          )}
          numberOfLines={1}
          accessibilityRole="button"
          accessibilityLabel={title}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}