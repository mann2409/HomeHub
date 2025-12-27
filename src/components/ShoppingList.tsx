import React, { useState } from "react";
import { View, Text, Pressable, SectionList, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ShoppingCart } from "phosphor-react-native";
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
    clearCompleted,
    deleteMultipleItems,
    deleteAllItems
  } = useShoppingStore();
  const { categoryColors } = useSettingsStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [openRetailer, setOpenRetailer] = useState<null | 'woolworths' | 'coles'>(null);

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
    if (selectionMode) {
      toggleItemSelection(item.id);
    } else {
      setSelectedItem(item);
      setShowEditModal(true);
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const allItemIds = sections.flatMap(section => section.data.map(item => item.id));
    setSelectedItems(new Set(allItemIds));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) return;
    
    deleteMultipleItems(Array.from(selectedItems));
    setSelectedItems(new Set());
    setSelectionMode(false);
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedItems(new Set());
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Items',
      'Are you sure you want to delete ALL items from your shopping list? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            deleteAllItems();
            console.log('✅ All shopping items deleted');
          },
        },
      ]
    );
  };

  return (
    <>
      <Card className="mb-4">
        <View className="flex-row items-center justify-between mb-4">
          {selectionMode ? (
            <>
              <Pressable
                onPress={handleCancelSelection}
                className="flex-row items-center"
              >
                <Ionicons name="close" size={20} color="rgba(255, 255, 255, 0.8)" />
                <Text className="text-white/80 ml-2">Cancel</Text>
              </Pressable>
              <Text className="text-white font-semibold">
                {selectedItems.size} selected
              </Text>
            </>
          ) : (
            <>
              <Pressable
                onPress={() => setSelectionMode(true)}
                className="flex-row items-center"
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="rgba(255, 255, 255, 0.8)" />
                <Text className="text-white/80 ml-2">Select</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowAddModal(true)}
                className="w-8 h-8 bg-primary rounded-full items-center justify-center"
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </Pressable>
            </>
          )}
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
                <ShoppingCart size={24} color="rgba(255, 255, 255, 0.8)" weight="bold" />
              </View>
            </View>
          </View>
        </View>

        {/* Controls */}
        {!selectionMode ? (
          <>
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

            {/* Retailer integrations have been removed intentionally */}
            
            {/* Delete All Button */}
            {sections.length > 0 && (
              <Pressable
                onPress={handleDeleteAll}
                className="bg-red-500/20 border border-red-500/30 rounded-lg py-3 mb-4 flex-row items-center justify-center active:opacity-70"
              >
                <Ionicons name="trash" size={18} color="#EF4444" />
                <Text className="text-red-400 font-semibold ml-2">
                  Delete All Items ({pendingCount + completedCount})
                </Text>
              </Pressable>
            )}
          </>
        ) : (
          <View className="flex-row items-center justify-between mb-4 gap-2">
            <Pressable
              onPress={selectedItems.size === sections.flatMap(s => s.data).length ? deselectAll : selectAll}
              className="flex-1 bg-white/10 rounded-lg py-3 items-center"
            >
              <Text className="text-white font-semibold">
                {selectedItems.size === sections.flatMap(s => s.data).length ? "Deselect All" : "Select All"}
              </Text>
            </Pressable>
            
            <Pressable
              onPress={handleDeleteSelected}
              disabled={selectedItems.size === 0}
              className={`flex-1 rounded-lg py-3 items-center ${
                selectedItems.size === 0 ? 'bg-red-500/30' : 'bg-red-500'
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons name="trash" size={18} color="#FFFFFF" />
                <Text className="text-white font-semibold ml-2">
                  Delete ({selectedItems.size})
                </Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Shopping List */}
        {sections.length === 0 ? (
          <View className="items-center justify-center py-8">
            <ShoppingCart size={48} color="rgba(255, 255, 255, 0.6)" weight="regular" />
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
                selectionMode={selectionMode}
                isSelected={selectedItems.has(item.id)}
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
            scrollEnabled={false}
            nestedScrollEnabled={true}
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

      {/* Retailer integrations removed */}
    </>
  );
}