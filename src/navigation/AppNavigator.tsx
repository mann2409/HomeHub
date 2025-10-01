import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { House, Calendar as PhCalendar, ForkKnife, Coins, ShoppingBag } from "phosphor-react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DashboardScreen from "../screens/DashboardScreen";
import CalendarScreen from "../screens/CalendarScreen";
import MealsScreen from "../screens/MealsScreen";
import FinanceScreen from "../screens/FinanceScreen";
import ShoppingScreen from "../screens/ShoppingScreen";
import useSettingsStore from "../state/settingsStore";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  const { theme } = useSettingsStore();
  const isDark = theme === "dark";
  

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconProps = { color, size: size + 4, weight: focused ? "fill" as const : "regular" as const };
          const glowStyle = focused ? { textShadowColor: color, textShadowRadius: 8 } : undefined;
          switch (route.name) {
            case "Dashboard":
              return <House {...iconProps} style={glowStyle} />;
            case "Calendar":
              return <PhCalendar {...iconProps} style={glowStyle} />;
            case "Meals":
              return <ForkKnife {...iconProps} style={glowStyle} />;
            case "Finance":
              return <Coins {...iconProps} style={glowStyle} />;
            case "Shopping":
              return <ShoppingBag {...iconProps} style={glowStyle} />;
            default:
              return <House {...iconProps} style={glowStyle} />;
          }
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.6)",
        tabBarStyle: {
          backgroundColor: "#2A2D3A",
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.1)",
          paddingBottom: insets.bottom,
          height: 64 + insets.bottom,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
        animation: "shift",
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Meals" component={MealsScreen} />
      <Tab.Screen name="Finance" component={FinanceScreen} />
      <Tab.Screen name="Shopping" component={ShoppingScreen} />
    </Tab.Navigator>
  );
}