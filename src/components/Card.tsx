import React from "react";
import { View, ViewProps } from "react-native";
import { cn } from "../utils/cn";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({ 
  children, 
  variant = "default", 
  padding = "md", 
  className,
  ...props 
}: CardProps) {
  const baseClasses = "rounded-2xl bg-[#F8FAFE] dark:bg-neutral-800";
  
  const variantClasses = {
    default: "shadow-sm border border-[#E6ECF8] dark:border-neutral-700",
    elevated: "shadow-md",
    outlined: "border-2 border-[#E6ECF8] dark:border-neutral-700",
  };

  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <View
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}