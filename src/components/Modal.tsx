import React from "react";
import { View, Text, Modal as RNModal, Pressable, ModalProps as RNModalProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "../utils/cn";

interface ModalProps extends Omit<RNModalProps, "children"> {
  children: React.ReactNode;
  title?: string;
  visible: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "full";
  navigationMode?: boolean;
  leftButton?: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
  };
  rightButton?: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
}

export default function Modal({
  children,
  title,
  visible,
  onClose,
  size = "md",
  navigationMode = false,
  leftButton,
  rightButton,
  ...props
}: ModalProps) {
  const insets = useSafeAreaInsets();



  if (navigationMode) {
    return (
      <RNModal
        visible={visible}
        animationType="slide"
        presentationStyle="formSheet"
        {...props}
      >
        <View className="flex-1">
          <LinearGradient
            colors={["#1A1B2E", "#2D1B69", "#4A148C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
          >
            {/* iOS Navigation Bar */}
            <View 
              className="border-b border-white/10"
              style={{ 
                paddingTop: insets.top,
                height: 44 + insets.top 
              }}
            >
            <View className="flex-row items-center justify-between h-11 px-4">
              {/* Left Button */}
              <View className="flex-1">
                {leftButton && (
                  <Pressable
                    onPress={leftButton.onPress}
                    disabled={leftButton.disabled}
                    className="py-2"
                    accessibilityRole="button"
                    accessibilityLabel={leftButton.title}
                  >
                    <Text className={cn(
                      "text-base font-normal",
                      leftButton.disabled ? "text-white/40" : "text-primary"
                    )}>
                      {leftButton.title}
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Title */}
              <View className="flex-2 items-center">
                {title && (
                  <Text className="text-base font-semibold text-white" numberOfLines={1}>
                    {title}
                  </Text>
                )}
              </View>

              {/* Right Button */}
              <View className="flex-1 items-end">
                {rightButton && (
                  <Pressable
                    onPress={rightButton.onPress}
                    disabled={rightButton.disabled || rightButton.loading}
                    className="py-2"
                    accessibilityRole="button"
                    accessibilityLabel={rightButton.title}
                  >
                    <Text className={cn(
                      "text-base font-semibold",
                      rightButton.disabled || rightButton.loading ? "text-white/40" : "text-primary"
                    )}>
                      {rightButton.loading ? "Saving..." : rightButton.title}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          {/* Content */}
          <View className="flex-1" style={{ minHeight: 200 }}>
            {children}
          </View>
          </LinearGradient>
        </View>
      </RNModal>
    );
  }

  // Original bottom sheet modal for non-navigation modes
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      {...props}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <View
          className={cn(
            "w-full",
            size === "full" ? "flex-1" : "max-h-4/5",
            size !== "full" && "rounded-t-3xl overflow-hidden"
          )}
          style={{
            paddingTop: size === "full" ? insets.top : 20,
            paddingBottom: Math.max(insets.bottom, 20),
          }}
        >
          <LinearGradient
            colors={["#1A1B2E", "#2D1B69", "#4A148C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
          >
            {/* Handle bar for iOS-style sheet */}
            {size !== "full" && (
              <View className="items-center py-2">
                <View className="w-10 h-1 bg-white/30 rounded-full" />
              </View>
            )}
            
            {title && (
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/10">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-white text-center">
                    {title}
                  </Text>
                </View>
                <Pressable
                  onPress={onClose}
                  className="w-9 h-9 items-center justify-center rounded-full bg-white/20"
                  accessibilityLabel="Close modal"
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={22} color="#FFFFFF" />
                </Pressable>
              </View>
            )}
            
            <View className={cn("flex-1", title ? "px-6 py-4" : "p-6")} style={{ minHeight: 200 }}>
              {children}
            </View>
          </LinearGradient>
        </View>
      </View>
    </RNModal>
  );
}