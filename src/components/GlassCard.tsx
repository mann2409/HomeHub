import React from "react";
import { View, ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { cn } from "../utils/cn";

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
}

export default function GlassCard({ children, className, style, ...props }: GlassCardProps) {
  return (
    <View className={cn("overflow-hidden rounded-2xl border border-white/15", className)} style={style} {...props}>
      <BlurView intensity={20} tint="systemChromeMaterialDark" style={{ padding: 16 }}>
        {children}
      </BlurView>
    </View>
  );
}
