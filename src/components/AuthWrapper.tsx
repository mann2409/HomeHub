import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../state/authStore';
import useSettingsStore from '../state/settingsStore';
import Modal from './Modal';
import TutorialScreen from '../screens/TutorialScreen';
import { guideBus } from '../utils/guideBus';
import GradientBackground from './GradientBackground';
import SignInScreen from '../screens/Auth/SignInScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import AppNavigator from '../navigation/AppNavigator';
import OnboardingModal from './OnboardingModal';
import { syncUserData, clearAllUserData } from '../utils/userSync';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, isLoading, setUser, setLoading } = useAuthStore();
  const { showTutorialOnStart, setShowTutorialOnStart } = useSettingsStore();
  const [showFirstRunTutorial, setShowFirstRunTutorial] = useState(false);
  const lastUserId = useRef<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Sync user ID to all stores when authentication state changes
  useEffect(() => {
    if (user?.uid) {
      console.log('Syncing user ID to all stores:', user.uid);
      syncUserData(user.uid);
    } else {
      console.log('No user - clearing all data');
      clearAllUserData();
    }
  }, [user?.uid]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Show interactive guide on every sign-in when enabled in Settings
  useEffect(() => {
    const currentId = user?.uid ?? null;
    if (currentId && lastUserId.current !== currentId) {
      // On every new sign-in, show onboarding if enabled
      setShowOnboarding(!!showTutorialOnStart);
      // Optionally also trigger interactive guide
      if (showTutorialOnStart) {
        setTimeout(() => guideBus.emit({ type: 'guide:startTask' }), 500);
      }
    }
    lastUserId.current = currentId;
  }, [user?.uid, showTutorialOnStart]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <GradientBackground>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text className="text-white/80 mt-4 text-lg">
            Loading...
          </Text>
        </View>
      </GradientBackground>
    );
  }

  // Show sign in screen if not authenticated
  if (!user) {
    if (showSignUp) {
      return <SignUpScreen onSwitchToSignIn={() => setShowSignUp(false)} />;
    }
    return <SignInScreen onSwitchToSignUp={() => setShowSignUp(true)} />;
  }

  // Show main app if authenticated
  return <>
    {children}
    {/* Onboarding shown on every sign in when enabled */}
    <OnboardingModal
      visible={showOnboarding}
      onClose={() => setShowOnboarding(false)}
      images={{
        // dashboard image replaced by video below
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
    {showFirstRunTutorial && (
      <Modal visible onClose={() => setShowFirstRunTutorial(false)} title="Quick Tutorial" navigationMode size="full">
        <TutorialScreen onClose={() => setShowFirstRunTutorial(false)} />
      </Modal>
    )}
  </>;
}
