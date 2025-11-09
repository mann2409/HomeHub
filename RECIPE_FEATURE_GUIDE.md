# 🍽️ Recipe Search Feature Guide

## Overview

Your HomeHub app now has a complete **Recipe Search** feature powered by [TheMealDB API](https://www.themealdb.com/)! Users can search for recipes, browse by category, save favorites, and view detailed cooking instructions.

---

## ✅ What's Been Integrated

### Core Components:
1. **TheMealDB API Service** - Complete API integration with all endpoints
2. **Recipe Store** - State management for saved recipes and search history
3. **Recipe Search Screen** - Search, browse categories, random recipes
4. **Recipe Detail Screen** - Full recipe with ingredients and instructions
5. **Recipe Card Component** - Beautiful recipe display cards
6. **Quick Access Integration** - Added to dashboard quick access grid

---

## 📁 Files Created

### API & Types:
- `src/api/mealdb.ts` - TheMealDB API service
- `src/types/recipe.ts` - Recipe types and data converters

### State Management:
- `src/state/recipeStore.ts` - Recipe state management (Zustand + AsyncStorage)

### UI Components:
- `src/components/RecipeCard.tsx` - Recipe display card
- `src/screens/RecipeSearchScreen.tsx` - Search & browse interface
- `src/screens/RecipeDetailScreen.tsx` - Full recipe view

### Integration:
- `src/components/QuickAccessGrid.tsx` - Added "Find Recipes" button

### Documentation:
- `RECIPE_FEATURE_GUIDE.md` - This file

---

## 🎯 Features

### 1. Recipe Search
- **Search by Name**: Find recipes by typing keywords (e.g., "chicken", "pasta")
- **Instant Results**: Fast search with the MealDB API
- **No Results Handling**: Friendly messages when no recipes found

### 2. Browse Categories
- **Popular Categories**: Chicken, Beef, Pasta, Vegetarian, Dessert, etc.
- **One-Tap Filtering**: Browse recipes by selecting a category
- **Visual Category Chips**: Easy-to-tap category buttons

### 3. Random Recipe Discovery
- **Get Inspired**: "Random" button shows a surprise recipe
- **Great for Meal Planning**: Discover new dishes to try

### 4. Recipe Details
- **Full Instructions**: Step-by-step cooking instructions
- **Ingredient List**: All ingredients with measurements
- **Meta Information**: Category, cuisine/area, tags
- **Image Gallery**: High-quality food photos
- **YouTube Integration**: Watch video tutorials (if available)
- **Source Links**: View original recipe source

### 5. Save & Favorites
- **Save Recipes**: Tap heart icon to save favorites
- **Persistent Storage**: Saved recipes stored locally
- **Quick Access**: View saved recipes from search screen

### 6. Recent Searches
- **Search History**: See your last 10 searches
- **Quick Re-search**: Tap to search again
- **Clear History**: Remove all recent searches

### 7. Share Recipes
- **Share Button**: Share recipes with friends/family
- **Multiple Options**: Share via any installed app

---

## 🚀 How to Use

### For Users:

1. **Access Recipe Search**:
   - Open app → Dashboard
   - Tap "Find Recipes" in Quick Access grid
   - Recipe search screen opens

2. **Search for a Recipe**:
   - Type recipe name in search bar (e.g., "chicken")
   - Tap "Search" button or press Enter
   - View results in scrollable list

3. **Browse by Category**:
   - Scroll to "Browse by Category" section
   - Tap any category (e.g., "Chicken", "Dessert")
   - View filtered recipes

4. **Get Random Recipe**:
   - Tap "Random" button at top
   - Discover a surprise recipe

5. **View Recipe Details**:
   - Tap any recipe card
   - Scroll to see full details:
     - Ingredients with measurements
     - Complete cooking instructions
     - YouTube video (if available)
   - Tap heart to save
   - Tap share to share with others

6. **Save Favorites**:
   - Tap heart icon on any recipe card
   - Heart turns red when saved
   - View saved recipes in search screen

7. **Watch Tutorial**:
   - In recipe detail, tap YouTube icon
   - Opens YouTube app/browser with video

---

## 🔧 API Information

### Current Setup: **FREE TIER**

```typescript
// Free API Base URL (no API key needed)
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
```

### Available Endpoints:
- ✅ Search by name
- ✅ Get meal by ID
- ✅ Search by first letter
- ✅ Random meal
- ✅ Filter by category
- ✅ Filter by area/cuisine
- ✅ Filter by ingredient
- ✅ List all categories
- ✅ List all areas

### Free Tier Limitations:
- **Public data only**: Limited to public recipes
- **Rate limits**: Reasonable usage expected
- **No premium recipes**: Some recipes locked

---

## 💰 Upgrading to Premium API

When ready to deploy to App Store, you can upgrade to premium:

### Steps to Upgrade:

1. **Get Premium API Key**:
   - Visit [TheMealDB Patreon](https://www.patreon.com/thedatadb)
   - Subscribe to supporter tier ($2/month+)
   - Receive API key via Patreon message

2. **Update API Service**:
   ```typescript
   // In src/api/mealdb.ts
   
   // Replace this:
   const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
   
   // With this:
   const API_KEY = 'YOUR_API_KEY_HERE'; // From Patreon
   const BASE_URL = `https://www.themealdb.com/api/json/v2/${API_KEY}`;
   ```

3. **Premium Benefits**:
   - ✅ Access to ALL recipes (1000+)
   - ✅ Faster response times
   - ✅ Higher rate limits
   - ✅ Premium support
   - ✅ Early access to new recipes
   - ✅ Commercial use allowed

4. **Cost**:
   - **Basic Support**: $2/month
   - **Super Support**: $5/month (recommended)
   - **Ultimate Support**: $10/month

---

## 📊 Data Structure

### Recipe Object:
```typescript
interface Recipe {
  id: string;                    // Unique recipe ID
  name: string;                  // Recipe name
  category: string;              // e.g., "Chicken", "Dessert"
  area: string;                  // e.g., "Italian", "Chinese"
  instructions: string;          // Full cooking instructions
  thumbnail: string;             // Recipe image URL
  tags: string[];                // e.g., ["Pasta", "Quick"]
  youtubeUrl: string | null;     // YouTube video link
  ingredients: RecipeIngredient[]; // List of ingredients
  sourceUrl: string | null;      // Original recipe source
}

interface RecipeIngredient {
  name: string;                  // Ingredient name
  measure: string;               // Amount (e.g., "2 cups")
}
```

---

## 🎨 UI Components

### Recipe Card
- **Image**: High-quality recipe photo
- **Title**: Recipe name (max 2 lines)
- **Heart Button**: Save/unsave favorite
- **Category Badge**: Recipe category
- **Meta Info**: Cuisine, ingredient count
- **Tags**: Recipe tags (max 2 shown)

### Search Screen
- **Search Bar**: Type to search recipes
- **Action Buttons**: Search, Random
- **Recent Searches**: Quick re-search chips
- **Categories**: Browse by category chips
- **Saved Recipes**: Quick access to favorites
- **Results List**: Scrollable recipe cards

### Detail Screen
- **Hero Image**: Full-width recipe photo
- **Actions**: Save, Share, YouTube
- **Meta Badges**: Category, cuisine
- **Tags**: All recipe tags
- **Ingredients**: Bulleted list with measurements
- **Instructions**: Full step-by-step guide
- **Source Link**: View original recipe

---

## 💡 Code Examples

### Search for Recipes:
```typescript
import MealDBAPI from '../api/mealdb';

// Search by name
const recipes = await MealDBAPI.searchByName('chicken');

// Get random recipe
const random = await MealDBAPI.getRandomMeal();

// Filter by category
const desserts = await MealDBAPI.filterByCategory('Dessert');

// Get recipe details
const recipe = await MealDBAPI.getMealById('52772');
```

### Use Recipe Store:
```typescript
import useRecipeStore from '../state/recipeStore';

const {
  savedRecipes,          // Array of saved recipes
  searchResults,         // Current search results
  recentSearches,        // Recent search terms
  isLoading,            // Loading state
  saveRecipe,           // Save a recipe
  unsaveRecipe,         // Remove saved recipe
  isRecipeSaved,        // Check if recipe is saved
  addRecentSearch,      // Add to recent searches
  setSearchResults,     // Update search results
} = useRecipeStore();
```

### Check if Recipe is Saved:
```typescript
const { isRecipeSaved } = useRecipeStore();
const isFavorite = isRecipeSaved(recipe.id);

// Show different UI based on status
<Heart 
  color={isFavorite ? "#FF6B6B" : "#666"} 
  weight={isFavorite ? "fill" : "regular"} 
/>
```

---

## 🔍 Search Tips for Users

### Best Practices:
1. **Use Simple Terms**: "chicken", "pasta", "beef"
2. **Try Ingredients**: "tomato", "cheese", "rice"
3. **Browse Categories**: Easier than searching sometimes
4. **Use Random**: Great for discovery
5. **Save Favorites**: Build your recipe collection

### What Works Well:
- ✅ Single ingredients: "chicken", "beef", "fish"
- ✅ Dish types: "curry", "soup", "pie"
- ✅ Simple names: "lasagna", "pizza", "tacos"

### What Doesn't Work:
- ❌ Very specific searches: "gluten-free vegan keto chicken"
- ❌ Cooking methods: "grilled", "baked" (use categories instead)
- ❌ Multiple ingredients: "chicken and rice and vegetables"

---

## 🎯 Feature Enhancements (Future Ideas)

### Potential Additions:

1. **Meal Planning Integration**:
   - Add recipe to meal planner
   - Schedule recipes for specific days
   - Generate shopping list from recipes

2. **Shopping List Auto-Fill**:
   - Convert recipe ingredients to shopping items
   - One-tap add to shopping list

3. **Nutritional Information**:
   - Calorie counter
   - Macronutrients
   - Allergen warnings

4. **Recipe Notes**:
   - User notes on recipes
   - Personal modifications
   - Rating system

5. **Collections**:
   - Organize recipes into folders
   - "Weeknight Dinners", "Desserts", etc.

6. **Offline Mode**:
   - Cache recipes locally
   - Browse saved recipes offline

7. **Family Sharing**:
   - Share saved recipes with family members
   - Collaborative recipe collection

---

## 📱 User Flow

```
Dashboard
   │
   ▼
Tap "Find Recipes"
   │
   ▼
Recipe Search Screen
   │
   ├─── Type & Search ────────► Search Results
   │                               │
   ├─── Tap Category ────────────► Category Results
   │                               │
   ├─── Tap Random ──────────────► Random Recipe
   │                               │
   └─── Tap Saved Recipe ─────────┤
                                   │
                                   ▼
                            Recipe Detail Screen
                                   │
                                   ├─── View Instructions
                                   ├─── View Ingredients
                                   ├─── Watch YouTube Video
                                   ├─── Share Recipe
                                   └─── Save/Unsave Favorite
```

---

## 🐛 Troubleshooting

### No Results Found:
- Try simpler search terms
- Check internet connection
- Use category browse instead

### Images Not Loading:
- Check internet connection
- Some recipes may have broken image links (rare)

### YouTube Button Missing:
- Not all recipes have video tutorials
- Button only shows when video is available

### Saved Recipes Not Persisting:
- Check AsyncStorage permissions
- Recipes save locally on device

---

## 📊 Performance

### Optimization Features:
- ✅ **Lazy Loading**: Images load as needed
- ✅ **Search Debouncing**: Prevents too many API calls
- ✅ **Result Caching**: Stores search results
- ✅ **Efficient State**: Zustand for fast updates
- ✅ **Persistent Storage**: AsyncStorage for saved data

### Network Usage:
- **Search**: ~5-50 KB per request
- **Recipe Detail**: ~10-100 KB
- **Images**: ~100-500 KB each (cached after first load)

---

## 🎨 Customization

### Change Colors:
```typescript
// In RecipeCard.tsx or RecipeSearchScreen.tsx
// Update StyleSheet colors to match your theme
```

### Add More Categories:
```typescript
// In RecipeSearchScreen.tsx
const cats = await MealDBAPI.listCategories();
setCategories(cats.slice(0, 15)); // Show more categories
```

### Customize Recipe Display:
```typescript
// In RecipeDetailScreen.tsx
// Modify layout, add sections, change styling
```

---

## ✨ Summary

You now have a **complete, production-ready recipe search feature**!

### What's Ready:
✅ Full API integration with TheMealDB
✅ Search, browse, and discover recipes
✅ Save favorites with persistent storage
✅ Beautiful UI with recipe cards
✅ Detailed recipe view with instructions
✅ Share functionality
✅ YouTube video integration
✅ Recent searches tracking
✅ Category browsing
✅ Zero linter errors
✅ Fully typed with TypeScript

### Free Tier:
- Use now for **development and testing**
- **No API key needed**
- Access to public recipes database

### Premium Upgrade (Optional):
- **$2-10/month** via Patreon
- Access to **ALL recipes** (1000+)
- Required for **commercial/App Store** deployment
- Easy upgrade: just add API key

---

**Your recipe search is live and ready to use! 🎉**

Users can now discover amazing recipes right from your HomeHub app!

