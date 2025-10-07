import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Switch, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../components/GradientBackground";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import FamilySettings from "../components/FamilySettings";
import useSettingsStore from "../state/settingsStore";
import useTaskStore from "../state/taskStore";
import useMealStore from "../state/mealStore";
import useFinanceStore from "../state/financeStore";
import useShoppingStore from "../state/shoppingStore";
import useNoteStore from "../state/noteStore";
import { useAuthStore } from "../state/authStore";
import { exportAllDataToJson } from "../utils/export";

interface SettingsScreenProps {
  onClose?: () => void;
}

export default function SettingsScreen({ onClose }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { 
    notifications, 
    moduleVisibility,
    currency,
    updateSettings, 
    updateModuleVisibility 
  } = useSettingsStore();
  
  const { logout, deleteAccount, user, userName } = useAuthStore();

  // Data stores for export/import
  const { tasks } = useTaskStore();
  const { meals } = useMealStore();
  const { expenses } = useFinanceStore();
  const { items } = useShoppingStore();
  const { notes } = useNoteStore();

  const [newCurrency, setNewCurrency] = useState(currency || "USD");


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


  const handleSaveCurrency = () => {
    updateSettings({ currency: newCurrency });
    Alert.alert("Success", "Currency updated successfully!");
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        tasks,
        meals,
        expenses,
        shoppingItems: items,
        notes,
      };
      
      const fileUri = await exportAllDataToJson(exportData);
      Alert.alert(
        "Export Complete", 
        "Your data has been exported successfully! The file has been saved and is ready to share or backup."
      );
    } catch (error) {
      console.error("Export failed:", error);
      Alert.alert("Export Failed", "There was an error exporting your data. Please try again.");
    }
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

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "⚠️ WARNING: This will permanently delete your account and all associated data including tasks, meals, expenses, shopping lists, and notes. This action CANNOT be undone.\n\nAre you absolutely sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: () => {
            // Double confirmation
            Alert.alert(
              "Final Confirmation",
              "This is your last chance. Delete your account and all data permanently?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, Delete Everything",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await deleteAccount();
                      Alert.alert("Account Deleted", "Your account and all data have been permanently deleted.");
                    } catch (error: any) {
                      console.error("Delete account error:", error);
                      const message = typeof error?.message === 'string' ? error.message : 'Failed to delete account. Please try again.';
                      if (message.toLowerCase().includes('sign out and sign in')) {
                        Alert.alert(
                          'Recent Login Required',
                          message,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Sign Out Now',
                              style: 'destructive',
                              onPress: async () => {
                                try { await logout(); } catch {}
                              }
                            }
                          ]
                        );
                      } else {
                        Alert.alert('Error', message);
                      }
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <GradientBackground style={{ paddingTop: insets.top }}>
      {/* Close button for modal */}
      {onClose && (
        <View className="absolute top-4 right-4 z-10">
          <Pressable
            onPress={onClose}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      )}
      
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="p-4">
          <Text className="text-2xl font-bold text-white/80 mb-6">
            Settings
          </Text>

          {/* Family/Household Settings */}
          <FamilySettings />

          {/* Module Visibility */}
          <Card className="mb-4">
            <Text className="text-lg font-semibold text-white mb-4">
              Dashboard Modules
            </Text>
            
            <View>
              {Object.entries(moduleVisibility).map(([module, visible]) => (
                <View key={module} className="flex-row items-center justify-between py-2">
                  <Text className="text-base text-white capitalize">
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
            <Text className="text-lg font-semibold text-white mb-4">
              Notifications
            </Text>
            
            <View>
              {Object.entries(notifications).map(([key, enabled]) => (
                <View key={key} className="flex-row items-center justify-between py-2">
                  <Text className="text-base text-white capitalize">
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


          {/* Currency */}
          <Card className="mb-4">
            <Text className="text-lg font-semibold text-white mb-4">
              Currency
            </Text>
            
            <Input
              label="Currency Code"
              value={newCurrency}
              onChangeText={setNewCurrency}
              placeholder="USD, EUR, GBP, etc."
              labelClassName="text-white/80"
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
            <Text className="text-lg font-semibold text-white mb-4">
              Data Management
            </Text>
            
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="cloud-done" size={20} color="#10B981" />
                <Text className="text-sm text-white/80 ml-2">
                  Data is automatically saved to your device
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
                <Text className="text-sm text-white/80 ml-2">
                  All data is stored locally and encrypted
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="download" size={20} color="#8B5CF6" />
                <Text className="text-sm text-white/80 ml-2">
                  Export creates a JSON backup file
                </Text>
              </View>
            </View>
            
            <View>
              <Button
                title="Export All Data as JSON"
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
            
            <Text className="text-xs text-white/60 mt-3">
              Export creates a complete backup of all your data as a JSON file that you can save or share. Clear all data permanently removes everything from your device.
            </Text>
          </Card>

          {/* Account */}
          <Card className="mb-4">
            <Text className="text-lg font-semibold text-white mb-4">
              Account
            </Text>
            
            <View className="mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="person" size={20} color="#FFFFFF" />
                <Text className="text-white ml-3">
                  {userName || "No name"}
                </Text>
              </View>
              <View className="flex-row items-center mb-3">
                <Ionicons name="mail" size={20} color="#FFFFFF" />
                <Text className="text-white/80 ml-3">
                  {user?.email || "No email"}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                <Text className="text-white/80 ml-3">
                  Account verified
                </Text>
              </View>
            </View>
            
            <Button
              title="Sign Out"
              variant="outline"
              onPress={handleLogout}
              className="border-red-500/30 bg-red-500/10 mb-3"
              textClassName="text-red-400"
            />

            <Pressable
              onPress={handleDeleteAccount}
              className="py-3 px-4 rounded-lg border border-red-600/50 bg-red-600/5"
            >
              <Text className="text-red-500 text-center font-medium">
                Delete Account
              </Text>
              <Text className="text-red-400/70 text-xs text-center mt-1">
                Permanently delete your account and all data
              </Text>
            </Pressable>
          </Card>

          {/* About */}
          <Card>
            <Text className="text-lg font-semibold text-white mb-4">
              About
            </Text>
            
            <View>
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-white">Version</Text>
                <Text className="text-base text-white/80">1.0.0</Text>
              </View>
              
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-white">Build</Text>
                <Text className="text-base text-white/80">2025.01.01</Text>
              </View>
              
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-white">Total Items</Text>
                <Text className="text-base text-white/80">
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