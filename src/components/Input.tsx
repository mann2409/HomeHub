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
  labelClassName?: string;
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
  labelClassName,
  value,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const baseClasses = "border rounded-xl text-white font-medium";
  
  const variantClasses = {
    default: "bg-white/5",
    outlined: "bg-white/5",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-4 text-lg",
  };

  const getBorderColor = () => {
    if (error) return "border-red-500";
    if (isFocused) return "border-primary";
    return "border-white/20";
  };

  const getBackgroundColor = () => {
    if (error) return "bg-red-500/10";
    if (isFocused) return "bg-white/10";
    return "bg-white/5";
  };

  const characterCount = value ? value.toString().length : 0;

  return (
    <View className="mb-6">
      {label && (
        <View className="flex-row items-center mb-3">
          <Text className={cn("text-sm font-semibold text-white", labelClassName)}>
            {label}
          </Text>
          {required && (
            <Text className="text-red-400 ml-1">*</Text>
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
        placeholderTextColor="rgba(255, 255, 255, 0.4)"
        value={value}
        maxLength={maxLength}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      
      <View className="flex-row justify-between items-center mt-2">
        <View className="flex-1">
          {error && (
            <Text className="text-sm text-red-400">
              {error}
            </Text>
          )}
          
          {helperText && !error && (
            <Text className="text-sm text-white/60">
              {helperText}
            </Text>
          )}
        </View>
        
        {showCharacterCount && maxLength && (
          <Text className={cn(
            "text-xs",
            characterCount > maxLength * 0.9 ? "text-orange-400" : "text-white/50"
          )}>
            {characterCount}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}