import React from "react";
import { Pressable, PressableProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../utils/cn";

interface FloatingActionButtonProps extends PressableProps {
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export default function FloatingActionButton({
  icon = "add",
  size = 24,
  color = "#FFFFFF",
  backgroundColor = "#3B82F6",
  className,
  ...props
}: FloatingActionButtonProps) {
  return (
    <Pressable
      className={cn(
        "absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg",
        className
      )}
      style={{ backgroundColor }}
      {...props}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}