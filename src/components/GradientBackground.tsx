import React from "react";
import { View, ViewProps } from "react-native";

interface GradientBackgroundProps extends ViewProps {
  children: React.ReactNode;
}

export default function GradientBackground({ children, style, ...props }: GradientBackgroundProps) {
  return (
    <View 
      style={[
        { 
          flex: 1, 
          backgroundColor: "#1A1B2E" // Temporary solid color instead of gradient
        }, 
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}


