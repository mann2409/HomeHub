import React, { useState } from "react";
import { View, Modal, Text } from "react-native";
import DateTimeDisplay from "./DateTimeDisplay";
import UserAvatar from "./UserAvatar";
import SettingsScreen from "../screens/SettingsScreen";
import { useAuthStore } from "../state/authStore";

export default function HeaderSection() {
  const [showSettings, setShowSettings] = useState(false);
  

  const handleAvatarPress = () => {
    setShowSettings(true);
  };

  return (
    <>
      <View 
        className="mb-6 overflow-hidden rounded-2xl"
        style={{ 
          backgroundColor: "#2A2D3A", // Solid color instead of gradient
          padding: 16 
        }}
      >
          <View className="flex-row items-start justify-between">
            {/* Left side - Date and Time */}
            <DateTimeDisplay />
            {/* Right side - Avatar */}
            <View className="flex-row items-start">
              <UserAvatar onPress={handleAvatarPress} />
            </View>
          </View>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SettingsScreen />
        <View className="absolute top-12 right-4 z-10">
          <UserAvatar 
            onPress={() => setShowSettings(false)} 
            size={32}
          />
          
        </View>
      </Modal>
    </>
  );
}