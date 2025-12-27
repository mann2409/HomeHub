import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Share,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Heart,
  ShareNetwork,
  YoutubeLogo,
  MapPin,
  Tag,
  ListChecks,
  Article,
  CalendarPlus,
  ShoppingCart,
} from 'phosphor-react-native';
import { Recipe } from '../types/recipe';
import useRecipeStore from '../state/recipeStore';
import useMealStore from '../state/mealStore';
import useShoppingStore from '../state/shoppingStore';
import { cleanIngredientName } from '../utils/ingredientName';

interface RecipeDetailScreenProps {
  recipeId?: string;
  recipe?: Recipe;
  onClose?: () => void;
  onOpenRecipeSource?: (url: string, retailer: 'woolworths' | 'coles') => void;
}

export default function RecipeDetailScreen({
  recipeId,
  recipe: initialRecipe,
  onClose,
  onOpenRecipeSource,
}: RecipeDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const [recipe] = useState<Recipe | null>(initialRecipe || null);
  const [isLoading] = useState(false);
  const { isRecipeSaved, saveRecipe, unsaveRecipe } = useRecipeStore();
  const { addMeal } = useMealStore();
  const { addItem: addShoppingItem, autoCategorizeName } = useShoppingStore();

  const isSaved = recipe ? isRecipeSaved(recipe.id) : false;

  const handleSaveToggle = () => {
    if (!recipe) return;

    if (isSaved) {
      unsaveRecipe(recipe.id);
    } else {
      saveRecipe(recipe);
    }
  };

  const handleShare = async () => {
    if (!recipe) return;

    try {
      await Share.share({
        message: `Check out this recipe: ${recipe.name}\n\n${recipe.instructions.slice(0, 200)}...`,
        title: recipe.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleYouTube = () => {
    if (recipe?.youtubeUrl) {
      Linking.openURL(recipe.youtubeUrl);
    }
  };

  const handleAddToMealPlan = () => {
    if (!recipe) return;

    // Show options for meal type and date
    Alert.alert(
      'Add to Meal Plan',
      'Choose when to add this recipe:',
      [
        {
          text: 'Today - Breakfast',
          onPress: () => addRecipeToMealPlan('breakfast', new Date()),
        },
        {
          text: 'Today - Lunch',
          onPress: () => addRecipeToMealPlan('lunch', new Date()),
        },
        {
          text: 'Today - Dinner',
          onPress: () => addRecipeToMealPlan('dinner', new Date()),
        },
        {
          text: 'Tomorrow - Dinner',
          onPress: () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            addRecipeToMealPlan('dinner', tomorrow);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const addRecipeToMealPlan = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', date: Date) => {
    if (!recipe) return;

    try {
      // Extract ingredients as strings
      const ingredients = recipe.ingredients.map(
        (ing) => `${ing.measure} ${ing.name}`.trim()
      );

      // Add meal to store
      addMeal({
        name: recipe.name,
        mealType,
        date,
        category: 'homemade',
        ingredients,
        description: recipe.category || undefined,
        recipeId: recipe.id,
        recipeImageUrl: recipe.thumbnail,
        recipeInstructions: recipe.instructions,
      });

      Alert.alert(
        'Success!',
        `${recipe.name} has been added to your ${mealType} plan for ${date.toLocaleDateString()}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error adding recipe to meal plan:', error);
      Alert.alert('Error', 'Failed to add recipe to meal plan');
    }
  };

  const handleAddAllToShoppingList = () => {
    if (!recipe) return;

    try {
      let addedCount = 0;

      recipe.ingredients.forEach((ingredient) => {
        const rawName = ingredient.name.trim();
        const itemName = cleanIngredientName(rawName);
        if (itemName) {
          const category = autoCategorizeName(itemName);
          
          // Parse measure to extract quantity if possible
          let quantity = 1;
          const measureStr = ingredient.measure?.trim() || '';
          const numberMatch = measureStr.match(/^(\d+\.?\d*)/);
          if (numberMatch) {
            quantity = parseFloat(numberMatch[1]);
          }

          addShoppingItem({
            name: itemName,
            quantity: quantity,
            unit: measureStr.replace(/^(\d+\.?\d*)\s*/, '').trim() || undefined,
            category,
            completed: false,
            priority: 'medium',
          });
          addedCount++;
        }
      });

      Alert.alert(
        '🛒 Added to Shopping List!',
        `${addedCount} ingredient${addedCount !== 1 ? 's' : ''} from "${recipe.name}" ${addedCount !== 1 ? 'have' : 'has'} been added to your shopping list.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error adding ingredients to shopping list:', error);
      Alert.alert('Error', 'Failed to add ingredients to shopping list');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Recipe not found</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with Close Button */}
      {onClose && (
        <TouchableOpacity style={styles.closeButtonTop} onPress={onClose}>
          <X size={24} color="#333" weight="bold" />
        </TouchableOpacity>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Image
          source={
            recipe.thumbnail
              ? { uri: recipe.thumbnail }
              : {
                  uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
                }
          }
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Actions */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{recipe.name}</Text>
            
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleAddToMealPlan}
              >
                <CalendarPlus size={28} color="#4CAF50" weight="fill" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSaveToggle}
              >
                <Heart
                  size={28}
                  color={isSaved ? '#FF6B6B' : '#666'}
                  weight={isSaved ? 'fill' : 'regular'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
              >
                <ShareNetwork size={28} color="#666" />
              </TouchableOpacity>

              {recipe.youtubeUrl && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleYouTube}
                >
                  <YoutubeLogo size={28} color="#FF0000" weight="fill" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Meta Information */}
          <View style={styles.metaContainer}>
            {recipe.retailer && (
              <View style={styles.metaBadge}>
                <ShoppingCart size={16} color="#4CAF50" />
                <Text style={styles.metaText}>
                  {recipe.retailer === 'coles' ? 'Coles' : 'Woolworths'}
                </Text>
              </View>
            )}
            {recipe.category && (
              <View style={styles.metaBadge}>
                <Tag size={16} color="#4CAF50" />
                <Text style={styles.metaText}>{recipe.category}</Text>
              </View>
            )}
            
            {recipe.area && (
              <View style={styles.metaBadge}>
                <MapPin size={16} color="#2196F3" />
                <Text style={styles.metaText}>{recipe.area}</Text>
              </View>
            )}
          </View>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {recipe.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Ingredients Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <ListChecks size={24} color="#4CAF50" weight="bold" />
                <Text style={styles.sectionTitle}>Ingredients</Text>
              </View>
              <TouchableOpacity
                style={styles.addAllButton}
                onPress={handleAddAllToShoppingList}
              >
                <ShoppingCart size={20} color="#fff" weight="bold" />
                <Text style={styles.addAllButtonText}>Add All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.ingredientsContainer}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.bullet} />
                  <View style={styles.ingredientContent}>
                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                    {ingredient.measure && (
                      <Text style={styles.ingredientMeasure}>
                        {ingredient.measure}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Article size={24} color="#FF9800" weight="bold" />
                <Text style={styles.sectionTitle}>Instructions</Text>
              </View>
            </View>
            
            <Text style={styles.instructions}>{recipe.instructions}</Text>
          </View>

          {/* Source Link */}
          {recipe.sourceUrl && (
            <TouchableOpacity
              style={styles.sourceButton}
              onPress={() => {
                if (onOpenRecipeSource) {
                  onOpenRecipeSource(recipe.sourceUrl!, recipe.retailer ?? 'woolworths');
                } else {
                  Linking.openURL(recipe.sourceUrl!);
                }
              }}
            >
              <Text style={styles.sourceButtonText}>View Original Recipe</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  closeButtonTop: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  addAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  ingredientsContainer: {
    gap: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginTop: 6,
    marginRight: 12,
  },
  ingredientContent: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  ingredientMeasure: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  instructions: {
    fontSize: 16,
    lineHeight: 26,
    color: '#555',
  },
  sourceButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  sourceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

