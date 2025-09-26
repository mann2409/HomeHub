import React, { useState } from "react";
import { View, Modal, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimeDisplay from "./DateTimeDisplay";
import WeatherWidget from "./WeatherWidget";
import UserAvatar from "./UserAvatar";
import SettingsScreen from "../screens/SettingsScreen";
import useAuthStore from "../state/authStore";

export default function HeaderSection() {
  const [showSettings, setShowSettings] = useState(false);
  

  const handleAvatarPress = () => {
    setShowSettings(true);
  };

  return (
    <>
      <View className="mb-6 overflow-hidden rounded-2xl">
        <LinearGradient
          colors={["#0EA5E9", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ padding: 16 }}
        >
          <View className="flex-row items-start justify-between">
            {/* Left side - Date and Time */}
            <DateTimeDisplay />
            {/* Right side - Weather and Avatar */}
            <View className="flex-row items-start">
              <WeatherWidget />
              <View className="ml-4">
                <UserAvatar onPress={handleAvatarPress} />
              </View>
            </View>
          </View>
        </LinearGradient>
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