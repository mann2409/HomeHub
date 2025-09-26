import React, { useState } from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { cn } from "../utils/cn";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "outlined";
  size?: "sm" | "md" | "lg";
  required?: boolean;
  maxLength?: number;
  showCharacterCount?: boolean;
}

export default function Input({
  label,
  error,
  helperText,
  variant = "default",
  size = "md",
  className,
  style,
  required = false,
  maxLength,
  showCharacterCount = false,
  value,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const baseClasses = "border-2 rounded-xl text-gray-900 dark:text-gray-100 font-medium";
  
  const variantClasses = {
    default: "bg-gray-50 dark:bg-neutral-800",
    outlined: "bg-white dark:bg-neutral-800",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-4 text-lg",
  };

  const getBorderColor = () => {
    if (error) return "border-red-500";
    if (isFocused) return "border-primary";
    return "border-gray-200 dark:border-neutral-700";
  };

  const getBackgroundColor = () => {
    if (error) return "bg-red-50";
    if (isFocused) return "bg-white dark:bg-neutral-800";
    return variant === "outlined" ? "bg-white dark:bg-neutral-800" : "bg-gray-50 dark:bg-neutral-800";
  };

  const characterCount = value ? value.toString().length : 0;

  return (
    <View className="mb-6">
      {label && (
        <View className="flex-row items-center mb-3">
          <Text className="text-sm font-semibold text-gray-900">
            {label}
          </Text>
          {required && (
            <Text className="text-red-500 ml-1">*</Text>
          )}
        </View>
      )}
      
      <TextInput
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          getBorderColor(),
          getBackgroundColor(),
          className
        )}
        style={style}
        placeholderTextColor={isFocused ? "#9CA3AF" : "#9CA3AF"}
        value={value}
        maxLength={maxLength}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      
      <View className="flex-row justify-between items-center mt-2">
        <View className="flex-1">
          {error && (
            <Text className="text-sm text-red-600">
              {error}
            </Text>
          )}
          
          {helperText && !error && (
            <Text className="text-sm text-gray-500">
              {helperText}
            </Text>
          )}
        </View>
        
        {showCharacterCount && maxLength && (
          <Text className={cn(
            "text-xs",
            characterCount > maxLength * 0.9 ? "text-orange-600" : "text-gray-400"
          )}>
            {characterCount}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}