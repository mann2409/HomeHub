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
import RecipeWebViewScreen from "./RecipeWebViewScreen";
import { RetailerKey } from "../api/mealdb";

export default function MealsScreen() {
  const insets = useSafeAreaInsets();
  const [showRecipeSearch, setShowRecipeSearch] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeSource, setRecipeSource] = useState<{ url: string; retailer: RetailerKey; name: string } | null>(null);

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleCloseRecipeDetail = () => {
    setSelectedRecipe(null);
  };

  const handleCloseRecipeSearch = () => {
    setShowRecipeSearch(false);
    setSelectedRecipe(null);
    setRecipeSource(null);
  };

  const handleOpenRecipeSource = (url: string, retailer: RetailerKey) => {
    const recipeName = selectedRecipe?.name || 'Recipe';
    setRecipeSource({ url, retailer, name: recipeName });
  };

  const handleCloseRecipeSource = () => {
    setRecipeSource(null);
  };

  const isViewingRecipeSource = !!recipeSource;

  const modalTitle = isViewingRecipeSource
    ? `${recipeSource?.retailer === 'coles' ? 'Coles' : 'Woolworths'} Recipe`
    : "Find Recipes";

  const modalRightButton = isViewingRecipeSource
    ? {
        title: "Done",
        onPress: handleCloseRecipeSource,
      }
    : {
        title: "Done",
        onPress: handleCloseRecipeSearch,
      };

  const modalLeftButton = isViewingRecipeSource
    ? {
        title: "Back",
        onPress: handleCloseRecipeSource,
      }
    : undefined;

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
        title={modalTitle}
        size="full"
        navigationMode
        leftButton={modalLeftButton}
        rightButton={modalRightButton}
      >
        {isViewingRecipeSource ? (
          <RecipeWebViewScreen
            url={recipeSource!.url}
            retailer={recipeSource!.retailer}
            recipeName={recipeSource!.name}
            onClose={handleCloseRecipeSource}
          />
        ) : selectedRecipe ? (
          <RecipeDetailScreen
            recipe={selectedRecipe}
            onClose={handleCloseRecipeDetail}
            onOpenRecipeSource={handleOpenRecipeSource}
          />
        ) : (
          <RecipeSearchScreen onRecipeSelect={handleRecipeSelect} />
        )}
      </Modal>
    </GradientBackground>
  );
}