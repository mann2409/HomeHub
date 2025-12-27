import React, { useEffect, useState } from 'react';
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
import { MagnifyingGlass, X, Clock, BookmarkSimple } from 'phosphor-react-native';
import RecipeCard from '../components/RecipeCard';
import useRecipeStore from '../state/recipeStore';
import MealDBAPI, { RetailerKey } from '../api/mealdb';
import { Recipe } from '../types/recipe';

interface RecipeSearchScreenProps {
  onRecipeSelect?: (recipe: Recipe) => void;
}

export default function RecipeSearchScreen({ onRecipeSelect }: RecipeSearchScreenProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
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

  const [selectedRetailer, setSelectedRetailer] = useState<RetailerKey>('woolworths');

  useEffect(() => {
    setSearchResults([]);
  }, [selectedRetailer, setSearchResults]);

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
    
    try {
      const results = await MealDBAPI.searchByName(searchTerm, selectedRetailer);
      console.log('✅ Recipe search results received:', results.length, 'results for', selectedRetailer);

      // If still no results, show message
      if (results.length === 0) {
        console.log(`❌ No ${selectedRetailer} recipes returned`);
        Alert.alert(
          'No Results',
          `We couldn’t find a ${selectedRetailer === 'woolworths' ? 'Woolworths' : 'Coles'} recipe for "${searchTerm}". Try a different search term.`
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
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Recipe Search</Text>
          <Text style={styles.headerSubtitle}>
            Powered by Woolworths & Coles Recipes
          </Text>
        </View>

        <View style={styles.retailerToggle}>
          {(['woolworths', 'coles'] as RetailerKey[]).map((retailer) => {
            const isActive = selectedRetailer === retailer;
            return (
              <TouchableOpacity
                key={retailer}
                style={[
                  styles.retailerButton,
                  isActive && styles.retailerButtonActive,
                ]}
                onPress={() => setSelectedRetailer(retailer)}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.retailerButtonText,
                    isActive && styles.retailerButtonTextActive,
                  ]}
                >
                  {retailer === 'woolworths' ? 'Woolworths' : 'Coles'}
                </Text>
              </TouchableOpacity>
            );
          })}
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
                    Search for Woolworths recipes by name and we’ll pull the exact ingredient products for you.
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
  retailerToggle: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  retailerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  retailerButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  retailerButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  retailerButtonTextActive: {
    color: '#1A1B2E',
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
  chipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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

