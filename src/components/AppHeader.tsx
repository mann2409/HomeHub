import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../state/authStore';
import UserAvatar from './UserAvatar';
import SettingsScreen from '../screens/SettingsScreen';
import OnboardingModal from './OnboardingModal';

interface AppHeaderProps {
  title: string;
  showUserIcon?: boolean;
}

export default function AppHeader({ title, showUserIcon = true }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
          {/* App name + section */}
          <View>
            <Text className="text-2xl font-bold text-white">FamOrganizer</Text>
            <Text className="text-white/70 text-xs mt-0.5">{title}</Text>
          </View>
          
          {/* User Avatar */}
          {showUserIcon && (
            <View className="flex-row items-center">
              <Pressable onPress={() => setShowOnboarding(true)} className="mr-3">
                <Text className="text-white/80">Help</Text>
              </Pressable>
              <UserAvatar 
                onPress={handleUserPress}
                size={40}
              />
            </View>
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

      {/* Onboarding modal */}
      <OnboardingModal
        visible={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        images={{
          recipeSearch: require('../../assets/onboarding/recipeSearch.png'),
        }}
        videos={{
          dashboard: require('../../assets/onboarding/Dashboard.mp4'),
          dashboard2: require('../../assets/onboarding/Dashboard_1.mp4'),
          meals: require('../../assets/onboarding/meals.mp4'),
          calendar: require('../../assets/onboarding/calendar.mp4'),
          recipeSearch: require('../../assets/onboarding/recipeSearch.mp4'),
          generateShopping: require('../../assets/onboarding/generateShopping.mp4'),
          finances: require('../../assets/onboarding/finances.mp4'),
          groceryList: require('../../assets/onboarding/groceryList.mp4'),
          settings: require('../../assets/onboarding/settings.mp4'),
        }}
      />
    </>
  );
}
