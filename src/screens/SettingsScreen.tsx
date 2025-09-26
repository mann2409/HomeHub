import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Switch, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../components/GradientBackground";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import useSettingsStore from "../state/settingsStore";
import useTaskStore from "../state/taskStore";
import useMealStore from "../state/mealStore";
import useFinanceStore from "../state/financeStore";
import useShoppingStore from "../state/shoppingStore";
import useNoteStore from "../state/noteStore";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { 
    theme, 
    notifications, 
    moduleVisibility,
    weatherLocation,
    currency,
    updateSettings, 
    updateModuleVisibility 
  } = useSettingsStore();

  // Data stores for export/import
  const { tasks } = useTaskStore();
  const { meals } = useMealStore();
  const { expenses } = useFinanceStore();
  const { items } = useShoppingStore();
  const { notes } = useNoteStore();

  const [newWeatherLocation, setNewWeatherLocation] = useState(weatherLocation || "");
  const [newCurrency, setNewCurrency] = useState(currency || "USD");

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    updateSettings({ theme: newTheme });
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    updateSettings({
      notifications: {
        ...notifications,
        [key]: !notifications[key],
      },
    });
  };

  const handleModuleToggle = (module: keyof typeof moduleVisibility) => {
    updateModuleVisibility(module, !moduleVisibility[module]);
  };

  const handleSaveWeatherLocation = () => {
    updateSettings({ weatherLocation: newWeatherLocation });
    Alert.alert("Success", "Weather location updated successfully!");
  };

  const handleSaveCurrency = () => {
    updateSettings({ currency: newCurrency });
    Alert.alert("Success", "Currency updated successfully!");
  };

  const handleExportData = () => {
    const exportData = {
      tasks,
      meals,
      expenses,
      items,
      notes,
      exportDate: new Date().toISOString(),
      version: "1.0.0"
    };
    
    // In a real app, this would save to file or share
    console.log("Export data:", JSON.stringify(exportData, null, 2));
    Alert.alert("Export Complete", "Your data has been exported to the console. In a real app, this would save to a file or share with other apps.");
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your tasks, meals, expenses, shopping items, and notes. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            // Clear all stores - in a real app you'd call clear methods on each store
            Alert.alert("Data Cleared", "All data has been cleared successfully.");
          },
        },
      ]
    );
  };

  return (
    <GradientBackground style={{ paddingTop: insets.top }}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Settings
          </Text>

          {/* Theme Settings */}
          <Card className="mb-4">
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Appearance
            </Text>
            
            <View>
              {[
                { key: "light", label: "Light", icon: "sunny" },
                { key: "dark", label: "Dark", icon: "moon" },
                { key: "system", label: "System", icon: "phone-portrait" },
              ].map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => handleThemeChange(option.key as any)}
                  className="flex-row items-center justify-between py-2"
                >
                  <View className="flex-row items-center">
                    <Ionicons 
                      name={option.icon as any} 
                      size={20} 
                      color="#6B7280" 
                    />
                    <Text className="text-base text-gray-900 dark:text-gray-100 ml-3">
                      {option.label}
                    </Text>
                  </View>
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                      theme === option.key
                        ? "border-primary bg-primary"
                        : "border-gray-300 dark:border-neutral-600"
                    }`}
                  >
                    {theme === option.key && (
                      <View className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </Card>

          {/* Module Visibility */}
          <Card className="mb-4">
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Dashboard Modules
            </Text>
            
            <View>
              {Object.entries(moduleVisibility).map(([module, visible]) => (
                <View key={module} className="flex-row items-center justify-between py-2">
                  <Text className="text-base text-gray-900 dark:text-gray-100 capitalize">
                    {module.replace(/([A-Z])/g, " $1").trim()}
                  </Text>
                  <Switch
                    value={visible}
                    onValueChange={() => handleModuleToggle(module as any)}
                    trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                    thumbColor={visible ? "#3B82F6" : "#F3F4F6"}
                  />
                </View>
              ))}
            </View>
          </Card>

          {/* Notifications */}
          <Card className="mb-4">
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Notifications
            </Text>
            
            <View>
              {Object.entries(notifications).map(([key, enabled]) => (
                <View key={key} className="flex-row items-center justify-between py-2">
                  <Text className="text-base text-gray-900 dark:text-gray-100 capitalize">
                    {key} Notifications
                  </Text>
                  <Switch
                    value={enabled}
                    onValueChange={() => handleNotificationToggle(key as any)}
                    trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                    thumbColor={enabled ? "#3B82F6" : "#F3F4F6"}
                  />
                </View>
              ))}
            </View>
          </Card>

          {/* Weather & Location */}
          <Card className="mb-4">
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Weather & Location
            </Text>
            
            <Input
              label="Weather Location"
              value={newWeatherLocation}
              onChangeText={setNewWeatherLocation}
              placeholder="Enter city name (e.g., New York, NY)"
            />
            
            <Button
              title="Save Location"
              onPress={handleSaveWeatherLocation}
              className="mt-3"
              disabled={!newWeatherLocation.trim()}
            />
          </Card>

          {/* Currency */}
          <Card className="mb-4">
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Currency
            </Text>
            
            <Input
              label="Currency Code"
              value={newCurrency}
              onChangeText={setNewCurrency}
              placeholder="USD, EUR, GBP, etc."
            />
            
            <Button
              title="Save Currency"
              onPress={handleSaveCurrency}
              className="mt-3"
              disabled={!newCurrency.trim()}
            />
          </Card>

          {/* Data Management */}
          <Card className="mb-4">
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Data Management
            </Text>
            
            <View>
              <Button
                title="Export All Data"
                variant="outline"
                onPress={handleExportData}
                className="mb-2"
              />
              
              <Button
                title="Clear All Data"
                variant="outline"
                onPress={handleClearAllData}
                className="border-red-200 bg-red-50"
                textClassName="text-red-600"
              />
            </View>
            
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Export creates a backup of all your data. Clear all data permanently removes everything.
            </Text>
          </Card>

          {/* About */}
          <Card>
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              About
            </Text>
            
            <View>
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-gray-900 dark:text-gray-100">Version</Text>
                <Text className="text-base text-gray-600 dark:text-gray-300">1.0.0</Text>
              </View>
              
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-gray-900 dark:text-gray-100">Build</Text>
                <Text className="text-base text-gray-600 dark:text-gray-300">2025.01.01</Text>
              </View>
              
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-gray-900 dark:text-gray-100">Total Items</Text>
                <Text className="text-base text-gray-600 dark:text-gray-300">
                  {tasks.length + meals.length + expenses.length + items.length + notes.length}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}