import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../state/authStore';
import GradientBackground from './GradientBackground';
import SignInScreen from '../screens/Auth/SignInScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import AppNavigator from '../navigation/AppNavigator';
import { syncUserData, clearAllUserData } from '../utils/userSync';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [showSignUp, setShowSignUp] = useState(false);

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
  if (!isAuthenticated || !user) {
    if (showSignUp) {
      return <SignUpScreen onSwitchToSignIn={() => setShowSignUp(false)} />;
    }
    return <SignInScreen onSwitchToSignUp={() => setShowSignUp(true)} />;
  }

  // Show main app if authenticated
  return <>{children}</>;
}
