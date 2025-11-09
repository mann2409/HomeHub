import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '../types/recipe';

interface RecipeState {
  // Saved/favorite recipes
  savedRecipes: Recipe[];
  
  // Recent searches
  recentSearches: string[];
  
  // Search results cache
  searchResults: Recipe[];
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  saveRecipe: (recipe: Recipe) => void;
  unsaveRecipe: (recipeId: string) => void;
  isRecipeSaved: (recipeId: string) => boolean;
  
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  
  setSearchResults: (results: Recipe[]) => void;
  clearSearchResults: () => void;
  
  setLoading: (loading: boolean) => void;
}

const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      savedRecipes: [],
      recentSearches: [],
      searchResults: [],
      isLoading: false,

      saveRecipe: (recipe) => {
        const { savedRecipes } = get();
        
        // Don't add if already saved
        if (savedRecipes.some(r => r.id === recipe.id)) {
          return;
        }
        
        set({
          savedRecipes: [recipe, ...savedRecipes],
        });
      },

      unsaveRecipe: (recipeId) => {
        set((state) => ({
          savedRecipes: state.savedRecipes.filter(r => r.id !== recipeId),
        }));
      },

      isRecipeSaved: (recipeId) => {
        const { savedRecipes } = get();
        return savedRecipes.some(r => r.id === recipeId);
      },

      addRecentSearch: (query) => {
        const trimmedQuery = query.trim().toLowerCase();
        if (!trimmedQuery) return;
        
        set((state) => {
          // Remove if already exists
          const filtered = state.recentSearches.filter(s => s !== trimmedQuery);
          
          // Add to beginning and keep only last 10
          return {
            recentSearches: [trimmedQuery, ...filtered].slice(0, 10),
          };
        });
      },

      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },

      setSearchResults: (results) => {
        set({ searchResults: results });
      },

      clearSearchResults: () => {
        set({ searchResults: [] });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'recipe-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        savedRecipes: state.savedRecipes,
        recentSearches: state.recentSearches,
      }),
    }
  )
);

export default useRecipeStore;

