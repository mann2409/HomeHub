import { MealDBResponse, Recipe, convertMealDBToRecipe, RecipeIngredient } from '../types/recipe';
import { getOpenAITextResponse } from './chat-service';

// TheMealDB API Base URL
// Free tier: https://www.themealdb.com/api/json/v1/1/
// Premium tier (when ready): https://www.themealdb.com/api/json/v2/{API_KEY}/
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// For future premium upgrade
// const API_KEY = 'YOUR_PREMIUM_API_KEY'; // Add this when you upgrade
// const BASE_URL = `https://www.themealdb.com/api/json/v2/${API_KEY}`;

export const MealDBAPI = {
  // Search meals by name
  searchByName: async (query: string): Promise<Recipe[]> => {
    try {
      const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
      const data: MealDBResponse = await response.json();
      
      if (!data.meals) {
        return [];
      }
      
      return data.meals.map(convertMealDBToRecipe);
    } catch (error) {
      console.error('Error searching recipes by name:', error);
      throw error;
    }
  },

  // Get meal details by ID
  getMealById: async (id: string): Promise<Recipe | null> => {
    try {
      const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
      const data: MealDBResponse = await response.json();
      
      if (!data.meals || data.meals.length === 0) {
        return null;
      }
      
      return convertMealDBToRecipe(data.meals[0]);
    } catch (error) {
      console.error('Error fetching meal by ID:', error);
      throw error;
    }
  },

  // Search by first letter
  searchByFirstLetter: async (letter: string): Promise<Recipe[]> => {
    try {
      const response = await fetch(`${BASE_URL}/search.php?f=${letter}`);
      const data: MealDBResponse = await response.json();
      
      if (!data.meals) {
        return [];
      }
      
      return data.meals.map(convertMealDBToRecipe);
    } catch (error) {
      console.error('Error searching by first letter:', error);
      throw error;
    }
  },

  // Get random meal
  getRandomMeal: async (): Promise<Recipe | null> => {
    try {
      const response = await fetch(`${BASE_URL}/random.php`);
      const data: MealDBResponse = await response.json();
      
      if (!data.meals || data.meals.length === 0) {
        return null;
      }
      
      return convertMealDBToRecipe(data.meals[0]);
    } catch (error) {
      console.error('Error fetching random meal:', error);
      throw error;
    }
  },

  // Filter by category
  filterByCategory: async (category: string): Promise<Recipe[]> => {
    try {
      const response = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
      const data = await response.json();
      
      if (!data.meals) {
        return [];
      }
      
      // Note: filter endpoint returns limited data, need to fetch full details
      // For better performance, we'll return partial data
      return data.meals.map((meal: any) => ({
        id: meal.idMeal,
        name: meal.strMeal,
        thumbnail: meal.strMealThumb,
        category: category,
        area: '',
        instructions: '',
        tags: [],
        youtubeUrl: null,
        ingredients: [],
        sourceUrl: null,
      }));
    } catch (error) {
      console.error('Error filtering by category:', error);
      throw error;
    }
  },

  // Filter by area/cuisine
  filterByArea: async (area: string): Promise<Recipe[]> => {
    try {
      const response = await fetch(`${BASE_URL}/filter.php?a=${encodeURIComponent(area)}`);
      const data = await response.json();
      
      if (!data.meals) {
        return [];
      }
      
      return data.meals.map((meal: any) => ({
        id: meal.idMeal,
        name: meal.strMeal,
        thumbnail: meal.strMealThumb,
        category: '',
        area: area,
        instructions: '',
        tags: [],
        youtubeUrl: null,
        ingredients: [],
        sourceUrl: null,
      }));
    } catch (error) {
      console.error('Error filtering by area:', error);
      throw error;
    }
  },

  // Filter by main ingredient
  filterByIngredient: async (ingredient: string): Promise<Recipe[]> => {
    try {
      const response = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
      const data = await response.json();
      
      if (!data.meals) {
        return [];
      }
      
      return data.meals.map((meal: any) => ({
        id: meal.idMeal,
        name: meal.strMeal,
        thumbnail: meal.strMealThumb,
        category: '',
        area: '',
        instructions: '',
        tags: [],
        youtubeUrl: null,
        ingredients: [],
        sourceUrl: null,
      }));
    } catch (error) {
      console.error('Error filtering by ingredient:', error);
      throw error;
    }
  },

  // List all categories
  listCategories: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${BASE_URL}/list.php?c=list`);
      const data = await response.json();
      
      if (!data.meals) {
        return [];
      }
      
      return data.meals.map((item: any) => item.strCategory);
    } catch (error) {
      console.error('Error listing categories:', error);
      throw error;
    }
  },

  // List all areas/cuisines
  listAreas: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${BASE_URL}/list.php?a=list`);
      const data = await response.json();
      
      if (!data.meals) {
        return [];
      }
      
      return data.meals.map((item: any) => item.strArea);
    } catch (error) {
      console.error('Error listing areas:', error);
      throw error;
    }
  },

  /**
   * Search recipes using OpenAI as fallback when TheMealDB returns no results
   * 
   * To enable this feature, add your OpenAI API key to your environment variables:
   * 
   * 1. Create a `.env` file in the root of your project (if it doesn't exist)
   * 2. Add: EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY=sk-your-key-here
   * 3. Restart your development server
   * 
   * Get your API key from: https://platform.openai.com/api-keys
   * 
   * Note: This feature is optional. If no API key is provided, the fallback
   * will be skipped and users will see the standard "No Results" message.
   */
  searchWithOpenAIFallback: async (query: string): Promise<Recipe[]> => {
    console.log('🔍 searchWithOpenAIFallback called for:', query);
    try {
      // Check if OpenAI API key is available
      const apiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;
      console.log('🔑 Checking OpenAI API key...', apiKey ? 'Found' : 'Not found');
      
      if (!apiKey) {
        console.log('⚠️ OpenAI API key not found. Skipping AI recipe generation.');
        console.log('💡 To enable AI recipe generation, add EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY to your .env file');
        // Return empty array instead of throwing to avoid errors
        return [];
      }

      console.log('✅ OpenAI API key found, generating recipe for:', query);
      
      const prompt = `Generate a recipe for "${query}". Return ONLY a valid JSON object matching this exact structure:
{
  "name": "Recipe name",
  "category": "Category (e.g., Chicken, Beef, Vegetarian, Dessert, etc.)",
  "area": "Cuisine/Area (e.g., American, Italian, Asian, etc.)",
  "instructions": "Step-by-step cooking instructions. Number each step clearly.",
  "ingredients": [
    {"name": "Ingredient name", "measure": "Amount (e.g., 1 cup, 2 tbsp, 500g)"},
    {"name": "Ingredient name", "measure": "Amount"}
  ],
  "tags": ["tag1", "tag2"],
  "youtubeUrl": "https://www.youtube.com/watch?v=..."
}

IMPORTANT REQUIREMENTS:
1. YouTube URL: Provide a real YouTube video URL (full https://www.youtube.com/watch?v=... format) that shows how to cook this recipe. If no suitable video exists, use null.

2. Ingredient Names: Use EXACT ingredient names as they would appear in Woolworths (Australian supermarket) product inventory. Examples:
   - Use "Woolworths Chicken Breast Fillets" not just "chicken breast"
   - Use "Woolworths Full Cream Milk" not just "milk"
   - Use "Woolworths Free Range Large Eggs" not just "eggs"
   - Use "Woolworths Extra Virgin Olive Oil" not just "olive oil"
   - Use "Woolworths Brown Onion" not just "onion"
   - Use brand names when common (e.g., "MasterFoods Garlic Powder", "Dolmio Tomato Paste")
   - For fresh produce, use standard Woolworths naming (e.g., "Red Capsicum", "Continental Parsley", "Baby Spinach")
   - Keep ingredient names precise and match how they would appear when searching on woolworths.com.au

3. Make the recipe realistic, detailed, and match the search query "${query}". Include at least 5 ingredients.

Return ONLY the JSON, no markdown formatting, no code blocks, no explanations.`;

      console.log('📤 Sending request to OpenAI API...');
      console.log('📝 Prompt:', prompt);
      console.log('⚙️ Model: gpt-4o, Temperature: 0.7, MaxTokens: 2500');
      
      const response = await getOpenAITextResponse(
        [{ role: 'user', content: prompt }],
        {
          model: 'gpt-4o',
          temperature: 0.7,
          maxTokens: 2500, // Increased for detailed ingredient names and YouTube URLs
        }
      );
      
      console.log('📥 Received response from OpenAI API');
      console.log('📊 Response length:', response.content.length, 'characters');
      console.log('💾 Token usage:', response.usage);

      // Parse the JSON response
      let recipeData: any;
      try {
        // Try to extract JSON from markdown code blocks if present
        const content = response.content.trim();
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recipeData = JSON.parse(jsonMatch[0]);
        } else {
          recipeData = JSON.parse(content);
        }
      } catch (parseError) {
        console.error('Error parsing OpenAI recipe response:', parseError);
        console.log('Raw response:', response.content);
        throw new Error('Failed to parse recipe from OpenAI response');
      }

      // Convert to Recipe format
      const recipe: Recipe = {
        id: `openai-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: recipeData.name || query,
        category: recipeData.category || 'Miscellaneous',
        area: recipeData.area || '',
        instructions: recipeData.instructions || 'No instructions provided.',
        thumbnail: '', // OpenAI doesn't provide images
        tags: Array.isArray(recipeData.tags) ? recipeData.tags : [],
        youtubeUrl: recipeData.youtubeUrl && recipeData.youtubeUrl !== 'null' ? recipeData.youtubeUrl : null,
        ingredients: Array.isArray(recipeData.ingredients)
          ? recipeData.ingredients.map((ing: any) => ({
              name: ing.name || '',
              measure: ing.measure || '',
            }))
          : [],
        sourceUrl: null,
      };

      console.log('✅ OpenAI recipe generated successfully');
      return [recipe];
    } catch (error: any) {
      console.error('❌ Error in searchWithOpenAIFallback:');
      console.error('   Error type:', error?.constructor?.name);
      console.error('   Error message:', error?.message);
      console.error('   Error status:', error?.status || error?.response?.status || error?.statusCode || error?.originalStatus);
      
      // Check if it's an authentication/API key error (401 or 403)
      const errorMessage = error?.message || String(error);
      const statusCode = error?.status || error?.response?.status || error?.statusCode || error?.originalStatus;
      
      // Handle invalid API key errors gracefully (don't expose API key in error message)
      if (
        statusCode === 401 || 
        statusCode === 403 ||
        errorMessage.includes('401') ||
        errorMessage.includes('403') ||
        errorMessage.includes('Incorrect API key') ||
        errorMessage.includes('Invalid API key') ||
        errorMessage.includes('API key not configured') ||
        errorMessage.includes('invalid_api_key') ||
        errorMessage.includes('authentication')
      ) {
        console.log('⚠️ OpenAI API key is invalid or not configured. Skipping AI recipe generation.');
        // Return empty array instead of throwing - this prevents error overlays
        return [];
      }
      
      // For other errors, log details and return empty array (don't throw to avoid error overlays)
      console.log('⚠️ OpenAI recipe generation failed. Error details logged above.');
      return [];
    }
  },
};

export default MealDBAPI;

