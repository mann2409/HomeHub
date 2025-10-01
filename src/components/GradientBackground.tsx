import React from "react";
import { View, ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface GradientBackgroundProps extends ViewProps {
  children: React.ReactNode;
}

export default function GradientBackground({ children, style, ...props }: GradientBackgroundProps) {
  return (
    <View style={[{ flex: 1 }, style]} {...props}>
      <LinearGradient
        colors={["#1A1B2E", "#2D1B69", "#4A148C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {children}
    </View>
  );
}


