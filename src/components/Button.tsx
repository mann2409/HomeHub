import React from "react";
import { Pressable, Text, PressableProps, View } from "react-native";
import useSettingsStore from "../state/settingsStore";
import { cn } from "../utils/cn";

interface ButtonProps extends PressableProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  textClassName?: string;
}

export default function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  textClassName,
  style,
  ...props
}: ButtonProps) {
  const { theme } = useSettingsStore();
  const isDark = theme === "dark";
  const baseClasses = "rounded-xl items-center justify-center";
  
  const variantClasses = {
    primary: "bg-transparent overflow-hidden",
    secondary: "bg-gray-600 dark:bg-neutral-700",
    outline: "border-2 border-primary bg-transparent",
    ghost: "bg-transparent",
  };

  const sizeClasses = {
    sm: "px-4 py-2",
    md: "px-6 py-4",
    lg: "px-8 py-5",
  };

  const textVariantClasses = {
    primary: "text-white font-semibold",
    secondary: "text-white font-semibold",
    outline: "text-primary font-semibold dark:text-primary",
    ghost: "text-primary font-semibold dark:text-primary",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && "opacity-50",
        className
      )}
      style={style}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {variant === "primary" && (
        <View
          style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            backgroundColor: "#536DFE" // Solid color instead of gradient
          }}
        />
      )}
      <Text
        className={cn(
          textVariantClasses[variant],
          textSizeClasses[size],
          textClassName
        )}
      >
        {loading ? "Loading..." : title}
      </Text>
    </Pressable>
  );
}