import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onHide: () => void;
}

export default function Toast({ 
  visible, 
  message, 
  type = "success", 
  duration = 3000, 
  onHide 
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;

  const typeConfig = {
    success: {
      backgroundColor: "#10B981",
      icon: "checkmark-circle" as const,
    },
    error: {
      backgroundColor: "#EF4444",
      icon: "close-circle" as const,
    },
    info: {
      backgroundColor: "#3B82F6",
      icon: "information-circle" as const,
    },
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, translateY, duration, onHide]);

  if (!visible) return null;

  const config = typeConfig[type];

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: insets.top + 10,
        left: 16,
        right: 16,
        zIndex: 1000,
        opacity: fadeAnim,
        transform: [{ translateY }],
      }}
    >
      <View
        className="flex-row items-center px-4 py-3 rounded-xl shadow-lg"
        style={{ backgroundColor: config.backgroundColor }}
      >
        <Ionicons name={config.icon} size={20} color="#FFFFFF" />
        <Text className="text-white font-medium ml-3 flex-1">
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}