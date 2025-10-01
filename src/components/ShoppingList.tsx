import React, { useState } from "react";
import { View, Text, Pressable, SectionList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "./Card";
import ShoppingItemCard from "./ShoppingItemCard";
import AddShoppingItemModal from "./AddShoppingItemModal";
import EditShoppingItemModal from "./EditShoppingItemModal";
import useShoppingStore from "../state/shoppingStore";
import useSettingsStore from "../state/settingsStore";
import { ShoppingItem, ShoppingCategory } from "../types";

export default function ShoppingList() {
  const { 
    getCategorizedItems, 
    toggleItem, 
    getTotalEstimatedCost,
    getPendingItems,
    getCompletedItems,
    clearCompleted
  } = useShoppingStore();
  const { categoryColors } = useSettingsStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const categorizedItems = getCategorizedItems();
  const totalCost = getTotalEstimatedCost();
  const pendingCount = getPendingItems().length;
  const completedCount = getCompletedItems().length;

  // Prepare data for SectionList
  const sections = Object.entries(categorizedItems)
    .filter(([_, items]) => items.length > 0)
    .map(([category, items]) => {
      const filteredItems = showCompleted 
        ? items 
        : items.filter(item => !item.completed);
      
      if (filteredItems.length === 0) return null;
      
      return {
        title: category.replace("_", " ").toUpperCase(),
        data: filteredItems,
        category: category as ShoppingCategory,
      };
    })
    .filter(Boolean) as Array<{
      title: string;
      data: ShoppingItem[];
      category: ShoppingCategory;
    }>;

  const handleItemPress = (item: ShoppingItem) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  return (
    <>
      <Card className="mb-4">
        <View className="flex-row items-center justify-end mb-4">
          <Pressable
            onPress={() => setShowAddModal(true)}
            className="w-8 h-8 bg-primary rounded-full items-center justify-center"
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Summary Stats */}
        <View className="bg-white/20 rounded-lg p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-white/80 font-medium">
                Estimated Total
              </Text>
              <Text className="text-2xl font-bold text-white">
                ${totalCost.toFixed(2)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-white/80">
                {pendingCount} pending • {completedCount} completed
              </Text>
              <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mt-1">
                <Ionicons name="basket" size={24} color="rgba(255, 255, 255, 0.8)" />
              </View>
            </View>
          </View>
        </View>

        {/* Controls */}
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={() => setShowCompleted(!showCompleted)}
            className="flex-row items-center"
          >
            <Ionicons 
              name={showCompleted ? "eye-off" : "eye"} 
              size={16} 
              color="rgba(255, 255, 255, 0.8)" 
            />
            <Text className="text-sm text-white/80 ml-2">
              {showCompleted ? "Hide" : "Show"} completed
            </Text>
          </Pressable>

          {completedCount > 0 && (
            <Pressable
              onPress={clearCompleted}
              className="flex-row items-center"
            >
              <Ionicons name="trash-outline" size={16} color="#F86D70" />
              <Text className="text-sm text-[#F86D70] ml-1">
                Clear completed
              </Text>
            </Pressable>
          )}
        </View>

        {/* Shopping List */}
        {sections.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Ionicons name="basket-outline" size={48} color="rgba(255, 255, 255, 0.6)" />
            <Text className="text-white/80 text-center mt-2">
              Your shopping list is empty
            </Text>
            <Text className="text-white/60 text-center text-sm">
              Add items to get started
            </Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ShoppingItemCard
                item={item}
                onToggle={toggleItem}
                onPress={handleItemPress}
              />
            )}
            renderSectionHeader={({ section }) => (
              <View className="flex-row items-center py-2 mb-2">
                <View
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ 
                    backgroundColor: categoryColors.shoppingCategories[section.category] 
                  }}
                />
                <Text className="text-sm font-semibold text-white">
                  {section.title}
                </Text>
                <Text className="text-xs text-white/80 ml-2">
                  ({section.data.length})
                </Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
          />
        )}
      </Card>

      <AddShoppingItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <EditShoppingItemModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />
    </>
  );
}