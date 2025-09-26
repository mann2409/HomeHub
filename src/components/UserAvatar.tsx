import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface UserAvatarProps {
  onPress?: () => void;
  size?: number;
}

export default function UserAvatar({ onPress, size = 32 }: UserAvatarProps) {
  return (
    <Pressable
      onPress={onPress}
      className="w-8 h-8 bg-primary rounded-full items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Ionicons 
        name="person" 
        size={size * 0.6} 
        color="#FFFFFF" 
      />
    </Pressable>
  );
}