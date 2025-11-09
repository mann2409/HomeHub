import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "react-native";
import useSettingsStore from "./src/state/settingsStore";
// import { useFonts, Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";

import AppNavigator from "./src/navigation/AppNavigator";
import AuthWrapper from "./src/components/AuthWrapper";
import GuideOverlay from "./src/components/GuideOverlay";
import { useFamilySync } from "./src/hooks/useFamilySync";
import { initializeAdMob } from "./src/services/adMobService";
import useSubscriptionStore from "./src/state/subscriptionStore";
// import useAuthStore from "./src/state/authStore";

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project. 
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

export default function App() {
  const systemScheme = useColorScheme();
  const { theme } = useSettingsStore();
  const isDark = theme === "dark" || (theme === "system" && systemScheme === "dark");
  // const { user } = useAuthStore();
  const { isPremium } = useSubscriptionStore();
  // const [fontsLoaded] = useFonts({ Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  // Initialize family sync for real-time data
  useFamilySync();

  // Initialize monetization features
  useEffect(() => {
    // Initialize AdMob (it will use test IDs in development mode)
    if (!isPremium) {
      initializeAdMob();
    }
    
    // Initialize subscriptions when user is logged in
    // Uncomment when you have RevenueCat keys set up
    // if (user?.uid) {
    //   initializePurchases(user.uid);
    // }
  }, [isPremium]);

  // if (!fontsLoaded) {
  //   return null;
  // }

  return (
    <GestureHandlerRootView className={isDark ? "flex-1 dark bg-neutral-900" : "flex-1 bg-neutral-50"}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AuthWrapper>
            <AppNavigator />
          </AuthWrapper>
          <StatusBar style={isDark ? "light" : "dark"} />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
