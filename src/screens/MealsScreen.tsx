import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import GradientBackground from "../components/GradientBackground";
import BannerAdComponent from "../components/BannerAd";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import WeeklyMealPlanner from "../components/WeeklyMealPlanner";
import Modal from "../components/Modal";
import RecipeSearchScreen from "./RecipeSearchScreen";
import RecipeDetailScreen from "./RecipeDetailScreen";
import { Recipe } from "../types/recipe";
import { MagnifyingGlass } from "phosphor-react-native";

export default function MealsScreen() {
  const insets = useSafeAreaInsets();
  const [showRecipeSearch, setShowRecipeSearch] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleCloseRecipeDetail = () => {
    setSelectedRecipe(null);
  };

  const handleCloseRecipeSearch = () => {
    setShowRecipeSearch(false);
    setSelectedRecipe(null);
  };

  return (
    <GradientBackground>
      <AppHeader title="Meal Planner" />
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="p-4">
          
          <WeeklyMealPlanner 
            onRecipeSearchPress={() => setShowRecipeSearch(true)}
          />
        </View>
      </ScrollView>
      {/* Banner Ad at bottom - automatically hidden for premium users and Android */}
      <BannerAdComponent />

      {/* Recipe Search Modal */}
      <Modal
        visible={showRecipeSearch}
        onClose={handleCloseRecipeSearch}
        title="Find Recipes"
        size="full"
        navigationMode
        rightButton={{
          title: "Done",
          onPress: handleCloseRecipeSearch
        }}
      >
        {selectedRecipe ? (
          <RecipeDetailScreen
            recipe={selectedRecipe}
            onClose={handleCloseRecipeDetail}
          />
        ) : (
          <RecipeSearchScreen onRecipeSelect={handleRecipeSelect} />
        )}
      </Modal>
    </GradientBackground>
  );
}