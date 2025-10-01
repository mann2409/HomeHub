import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';

interface UserAvatarProps {
  onPress?: () => void;
  size?: number;
  showIcon?: boolean;
}

export default function UserAvatar({ onPress, size = 40, showIcon = true }: UserAvatarProps) {
  const { userName } = useAuthStore();

  // Generate initials from user name
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return words
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  };

  const initials = getInitials(userName);

  return (
    <Pressable
      onPress={onPress}
      className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
      style={{ width: size, height: size }}
    >
      {userName ? (
        <Text 
          className="text-white font-semibold"
          style={{ fontSize: size * 0.4 }}
        >
          {initials}
        </Text>
      ) : (
        showIcon && (
          <Ionicons 
            name="person" 
            size={size * 0.5} 
            color="#FFFFFF" 
          />
        )
      )}
    </Pressable>
  );
}