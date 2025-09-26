import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../utils/cn";

interface FABAction {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

interface ContextAwareFABProps {
  actions: FABAction[];
  currentScreen?: string;
  className?: string;
}

export default function ContextAwareFAB({ 
  actions, 
  currentScreen = "dashboard",
  className 
}: ContextAwareFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [showLabelsOnLeft, setShowLabelsOnLeft] = useState(false);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    
    // Calculate if labels should show on left based on FAB position
    // FAB is positioned 24px from right edge (right-6 = 1.5rem = 24px)
    // Label width is approximately 40% of screen width + button width 48px + margin 12px
    const fabRightEdge = 24 + 56; // FAB position + FAB width
    const labelSpace = (screenWidth * 0.4) + 48 + 12 + 16; // Label + button + margin + safety
    setShowLabelsOnLeft(fabRightEdge + labelSpace > screenWidth);

    return () => subscription?.remove();
  }, [screenWidth]);

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    
    setIsExpanded(!isExpanded);
  };

  const handleActionPress = (action: FABAction) => {
    action.onPress();
    toggleExpanded();
  };

  // Filter actions based on current screen context
  const contextualActions = actions.filter(action => {
    switch (currentScreen) {
      case "calendar":
        return ["add_task", "add_event"].includes(action.id);
      case "meals":
        return ["add_meal", "quick_note"].includes(action.id);
      case "finance":
        return ["add_expense", "quick_note"].includes(action.id);
      case "shopping":
        return ["add_shopping", "quick_note"].includes(action.id);
      default:
        return true; // Show all actions on dashboard
    }
  });

  return (
    <View 
      className={cn("absolute bottom-6", className)}
      style={{
        right: 24, // 6 * 4 = 24px (right-6)
        left: showLabelsOnLeft ? Math.max(16, screenWidth * 0.1) : undefined,
      }}
    >
      {/* Action Items */}
      {contextualActions.map((action, index) => {
        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(60 * (index + 1))],
        });

        const opacity = animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0, 1],
        });

        const scale = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        });

        return (
          <Animated.View
            key={action.id}
            style={{
              transform: [{ translateY }, { scale }],
              opacity,
            }}
            className="absolute bottom-0 mb-2"
            pointerEvents={isExpanded ? "auto" : "none"}
          >
            <View 
              className="flex-row items-center"
              style={{
                flexDirection: showLabelsOnLeft ? 'row-reverse' : 'row',
              }}
            >
              {/* Label */}
              <View 
                className="bg-gray-800 px-3 py-2 rounded-lg"
                style={{
                  marginRight: showLabelsOnLeft ? 0 : 12,
                  marginLeft: showLabelsOnLeft ? 12 : 0,
                  maxWidth: screenWidth * 0.4, // Limit label width to 40% of screen
                }}
              >
                <Text 
                  className="text-white text-sm font-medium"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {action.label}
                </Text>
              </View>
              
              {/* Action Button */}
              <Pressable
                onPress={() => handleActionPress(action)}
                className="w-12 h-12 rounded-full items-center justify-center shadow-lg"
                style={{ backgroundColor: action.color }}
              >
                <Ionicons name={action.icon} size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </Animated.View>
        );
      })}

      {/* Main FAB */}
      <Pressable
        onPress={toggleExpanded}
        className="w-14 h-14 rounded-full items-center justify-center shadow-lg overflow-hidden"
      >
        <LinearGradient
          colors={["#14B8A6", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 9999 }}
        />
        <Animated.View
          style={{
            transform: [{
              rotate: animation.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "45deg"],
              }),
            }],
          }}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Animated.View>
      </Pressable>

      {/* Backdrop */}
      {isExpanded && (
        <Pressable
          onPress={toggleExpanded}
          style={{
            position: 'absolute',
            top: -1000,
            left: -1000,
            right: -1000,
            bottom: -1000,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            zIndex: -1,
          }}
        />
      )}
    </View>
  );
}