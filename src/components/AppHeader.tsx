import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../state/authStore';
import UserAvatar from './UserAvatar';
import SettingsScreen from '../screens/SettingsScreen';

interface AppHeaderProps {
  title: string;
  showUserIcon?: boolean;
}

export default function AppHeader({ title, showUserIcon = true }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const [showSettings, setShowSettings] = useState(false);

  const handleUserPress = () => {
    setShowSettings(true);
  };

  return (
    <>
      <View 
        className="overflow-hidden"
        style={{ 
          paddingTop: insets.top,
          backgroundColor: "#2A2D3A", // Solid background color instead of gradient
          padding: 16
        }}
      >
        <View className="flex-row items-center justify-between">
          {/* Title */}
          <Text className="text-2xl font-bold text-white">
            {title}
          </Text>
          
          {/* User Avatar */}
          {showUserIcon && (
            <UserAvatar 
              onPress={handleUserPress}
              size={40}
            />
          )}
        </View>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettings(false)}
      >
        <SettingsScreen onClose={() => setShowSettings(false)} />
      </Modal>
    </>
  );
}
