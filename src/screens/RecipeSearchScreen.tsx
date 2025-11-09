import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MagnifyingGlass, X, Sparkle, Clock, BookmarkSimple } from 'phosphor-react-native';
import RecipeCard from '../components/RecipeCard';
import useRecipeStore from '../state/recipeStore';
import MealDBAPI from '../api/mealdb';
import { Recipe } from '../types/recipe';

interface RecipeSearchScreenProps {
  onRecipeSelect?: (recipe: Recipe) => void;
}

export default function RecipeSearchScreen({ onRecipeSelect }: RecipeSearchScreenProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const {
    searchResults,
    recentSearches,
    savedRecipes,
    isLoading,
    setSearchResults,
    setLoading,
    addRecentSearch,
    clearRecentSearches,
  } = useRecipeStore();

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await MealDBAPI.listCategories();
      setCategories(cats.slice(0, 10)); // Show top 10 categories
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSearch = async (query?: string) => {
    console.log('handleSearch called, query:', query, 'searchQuery:', searchQuery);
    const searchTerm = query || searchQuery;
    console.log('searchTerm:', searchTerm);
    
    if (!searchTerm.trim()) {
      console.log('No search term provided, showing alert');
      Alert.alert('Search Required', 'Please enter a recipe name to search.');
      return;
    }

    console.log('Starting search with term:', searchTerm);
    setLoading(true);
    
    let results: Recipe[] = [];
    
    try {
      // First, try TheMealDB API
      try {
        results = await MealDBAPI.searchByName(searchTerm);
        console.log('✅ TheMealDB search results received:', results.length, 'results');
      } catch (mealDbError) {
        console.log('⚠️ TheMealDB search failed, will try OpenAI fallback:', mealDbError);
        // Continue to try OpenAI fallback even if TheMealDB fails
        results = [];
      }
      
      // If no results, try OpenAI as fallback
      if (results.length === 0) {
        console.log('🔍 No results from TheMealDB, trying OpenAI fallback...');
        try {
          const aiResults = await MealDBAPI.searchWithOpenAIFallback(searchTerm);
          console.log('✅ OpenAI fallback results received:', aiResults.length, 'results');
          
          if (aiResults.length > 0) {
            results = aiResults;
            // Show a subtle notification that we used AI
            Alert.alert(
              'AI-Generated Recipe',
              `We couldn't find "${searchTerm}" in our recipe database, but we've generated a recipe for you using AI!`,
              [{ text: 'OK' }]
            );
          } else {
            console.log('⚠️ OpenAI fallback also returned no results');
          }
        } catch (openAIError) {
          console.log('⚠️ OpenAI fallback failed:', openAIError);
          // OpenAI fallback already handles errors internally and returns empty array
          // So this catch is just for logging
        }
      }
      
      // If still no results, show message
      if (results.length === 0) {
        console.log('❌ No results from either TheMealDB or OpenAI');
        Alert.alert(
          'No Results',
          `No recipes found for "${searchTerm}". Try a different search term.`
        );
      }
      
      setSearchResults(results);
      addRecentSearch(searchTerm);
    } catch (error) {
      console.error('❌ Unexpected search error:', error);
      Alert.alert('Error', 'Failed to search recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    setLoading(true);
    
    try {
      const results = await MealDBAPI.filterByCategory(category);
      
      // Fetch full details for each recipe
      const detailedResults = await Promise.all(
        results.slice(0, 20).map(async (recipe) => {
          try {
            const detail = await MealDBAPI.getMealById(recipe.id);
            return detail || recipe;
          } catch {
            return recipe;
          }
        })
      );
      
      setSearchResults(detailedResults.filter(r => r !== null) as Recipe[]);
    } catch (error) {
      console.error('Category filter error:', error);
      Alert.alert('Error', 'Failed to load recipes for this category.');
    } finally {
      setLoading(false);
    }
  };

  const handleRandomRecipe = async () => {
    setLoading(true);
    try {
      const recipe = await MealDBAPI.getRandomMeal();
      if (recipe) {
        setSearchResults([recipe]);
      }
    } catch (error) {
      console.error('Random recipe error:', error);
      Alert.alert('Error', 'Failed to get random recipe.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecipePress = (recipe: Recipe) => {
    console.log('handleRecipePress called with recipe:', recipe.name);
    if (onRecipeSelect) {
      console.log('Calling onRecipeSelect...');
      onRecipeSelect(recipe);
    } else {
      console.log('No onRecipeSelect provided');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCategory(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Recipe Search</Text>
          <Text style={styles.headerSubtitle}>
            Powered by TheMealDB
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={() => handleSearch()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MagnifyingGlass size={20} color="#888" />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={(text) => {
              console.log('Text input changed to:', text);
              setSearchQuery(text);
            }}
            onSubmitEditing={() => {
              console.log('Enter key pressed in search input');
              handleSearch();
            }}
            returnKeyType="search"
          />
          {searchQuery && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              console.log('Search button pressed, isLoading:', isLoading);
              handleSearch();
            }}
            onPressIn={() => console.log('Search button pressed IN')}
            onPressOut={() => console.log('Search button pressed OUT')}
            activeOpacity={0.8}
            disabled={isLoading}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MagnifyingGlass size={20} color="#fff" weight="bold" />
            <Text style={styles.actionButtonText}>Search</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => {
              console.log('Random button pressed');
              handleRandomRecipe();
            }}
            disabled={isLoading}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Sparkle size={20} color="#fff" weight="fill" />
            <Text style={styles.actionButtonText}>Random</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Searching recipes...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>
                Search Results ({searchResults.length})
              </Text>
              {searchResults.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onPress={() => handleRecipePress(recipe)}
                />
              ))}
            </>
          ) : (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                      <Clock size={20} color="#fff" />
                      <Text style={styles.sectionTitle}>Recent Searches</Text>
                    </View>
                    <TouchableOpacity onPress={clearRecentSearches}>
                      <Text style={styles.clearText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.chipsContainer}>
                    {recentSearches.map((search, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.chip}
                        onPress={() => {
                          setSearchQuery(search);
                          handleSearch(search);
                        }}
                      >
                        <Text style={styles.chipText}>{search}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Categories */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Browse by Category</Text>
                <View style={styles.chipsContainer}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.chip,
                        styles.categoryChip,
                        selectedCategory === category && styles.selectedChip,
                      ]}
                      onPress={() => handleCategorySelect(category)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedCategory === category && styles.selectedChipText,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Saved Recipes */}
              {savedRecipes.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionTitleContainer}>
                    <BookmarkSimple size={20} color="#fff" weight="fill" />
                    <Text style={styles.sectionTitle}>Saved Recipes</Text>
                  </View>
                  {savedRecipes.slice(0, 5).map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onPress={() => handleRecipePress(recipe)}
                    />
                  ))}
                </View>
              )}

              {/* Getting Started */}
              {recentSearches.length === 0 && savedRecipes.length === 0 && (
                <View style={styles.emptyState}>
                  <MagnifyingGlass size={64} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.emptyTitle}>Find Your Next Meal</Text>
                  <Text style={styles.emptyText}>
                    Search for recipes by name, browse by category, or get a random recipe!
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#1A1B2E',
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  clearText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  selectedChip: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  chipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedChipText: {
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
});

