import React from "react";
import { View, ViewProps } from "react-native";
import { cn } from "../utils/cn";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined" | "weather" | "lavender" | "aqua" | "mint" | "pink" | "coral";
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({ 
  children, 
  variant = "default", 
  padding = "md", 
  className,
  ...props 
}: CardProps) {
  const baseClasses = "rounded-3xl";
  
  const variantClasses = {
    default: "bg-[#2A2D3A] shadow-lg",
    elevated: "bg-[#2A2D3A] shadow-lg",
    outlined: "bg-[#2A2D3A] border-2 border-[#2A2D3A] shadow-lg",
    weather: "bg-[#2A2D3A] shadow-lg",
    lavender: "bg-[#2A2D3A] shadow-lg",
    aqua: "bg-[#2A2D3A] shadow-lg", 
    mint: "bg-[#2A2D3A] shadow-lg",
    pink: "bg-[#2A2D3A] shadow-lg",
    coral: "bg-[#2A2D3A] shadow-lg",
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