import { Recipe } from '../types/recipe';
import { getOpenAIClient } from './openai';

type WoolworthsIngredient = {
  productName: string;
  quantityText?: string | null;
  quantity?: number | null;
  unit?: string | null;
  notes?: string | null;
  productUrl?: string | null;
};

type WoolworthsRecipe = {
  id?: string;
  title: string;
  description?: string | null;
  tags?: string[];
  recipeUrl?: string | null;
  imageUrl?: string | null;
  instructions: string[];
  serves?: number | null;
  ingredients: WoolworthsIngredient[];
};

type WoolworthsRecipeResponse = {
  recipes: WoolworthsRecipe[];
};

export type RetailerKey = 'woolworths' | 'coles';

const RETAILER_CONFIG: Record<RetailerKey, {
  hosts: string[];
  recipePathMatch: string;
  systemPrompts: string[];
  example?: { query: string; response: string };
  userInstruction: (query: string) => string;
}> = {
  woolworths: {
    hosts: ['woolworths.com.au', 'www.woolworths.com.au'],
    recipePathMatch: '/shop/recipes/',
    systemPrompts: [
      'You are an assistant that locates official Woolworths (Australia) recipes and copies their ingredient lists verbatim. Preserve the exact order and wording shown on the recipe page, including brand names, descriptors, and optional notes. Never substitute with generic items.',
      'Return measurements exactly as published (e.g. "1 sachet", "375g", "150ml"). Use quantity fields only when you are certain; otherwise keep them null. If an ingredient is written without the word "Woolworths", do not add it.',
      'Always respond with valid JSON that matches the schema. Do not include markdown code fences or commentary.'
    ],
    userInstruction: (query: string) =>
      `Find up to three Woolworths Australia recipes that best match "${query}". Prefer official recipes from https://www.woolworths.com.au/shop/recipes. For each recipe, include step-by-step instructions and list every ingredient using the exact wording from the recipe page, keeping brand names and descriptors unchanged. Provide the direct recipe URL if available.`,
  },
  coles: {
    hosts: ['coles.com.au', 'www.coles.com.au'],
    recipePathMatch: '/recipes',
    systemPrompts: [
      'You are an assistant that locates official Coles (Australia) recipes and copies their ingredient lists exactly as shown on the page. Preserve brand names, descriptors, and optional notes. Do not replace ingredients with generic alternatives.',
      'Keep measurements exactly as published (e.g. "500g", "1 jar", "2 tablespoons"). Use quantity fields only when you are certain; otherwise keep them null. Maintain the same ordering as on the recipe page.',
      'Always respond with valid JSON that matches the schema. Do not include markdown code fences or commentary.'
    ],
    userInstruction: (query: string) =>
      `Find up to three Coles Australia recipes that best match "${query}". Prefer official recipes from https://www.coles.com.au/recipes and https://www.coles.com.au/recipes-inspiration. For each recipe, include accurate step-by-step instructions and copy every ingredient exactly as written on the recipe page. Provide the direct recipe URL if available.`,
  },
};

const RESPONSE_SCHEMA = {
  name: 'woolworths_recipe_search',
  schema: {
    type: 'object',
    properties: {
      recipes: {
        type: 'array',
        minItems: 0,
        maxItems: 3,
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: ['string', 'null'] },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
            recipeUrl: { type: ['string', 'null'] },
            imageUrl: { type: ['string', 'null'] },
            instructions: {
              type: 'array',
              minItems: 1,
              items: { type: 'string' },
            },
            serves: { type: ['number', 'null'] },
            ingredients: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                properties: {
                  productName: { type: 'string' },
                  quantityText: { type: ['string', 'null'] },
                  quantity: { type: ['number', 'null'] },
                  unit: { type: ['string', 'null'] },
                  notes: { type: ['string', 'null'] },
                  productUrl: { type: ['string', 'null'] },
                },
                required: ['productName'],
                additionalProperties: false,
              },
            },
          },
          required: ['title', 'instructions', 'ingredients'],
          additionalProperties: false,
        },
      },
    },
    required: ['recipes'],
    additionalProperties: false,
  },
};

const FEW_SHOT_EXAMPLE_QUERY = 'butter chicken';

const FEW_SHOT_EXAMPLE_RESPONSE =
  '{\n' +
  '  "recipes": [\n' +
  '    {\n' +
  '      "id": "example-butter-chicken",\n' +
  '      "title": "Butter Chicken",\n' +
  '      "description": "A quick butter chicken using Hart & Soul Butter Chicken Recipe Base.",\n' +
  '      "tags": ["Chicken", "Dinner"],\n' +
  '      "recipeUrl": "https://www.woolworths.com.au/shop/recipes/butter-chicken",\n' +
  '      "imageUrl": null,\n' +
  '      "instructions": [\n' +
  '        "Place a large frying pan over medium heat. Add 1 sachet Hart & Soul Butter Chicken Recipe Base and 50ml water, stirring until combined.",\n' +
  '        "Add 375g chicken breast, diced, and cook for 5-6 minutes until sealed.",\n' +
  '        "Stir in 70g tomato paste and 150ml pouring cream, simmering for 8 minutes or until sauce thickens and chicken is cooked through.",\n' +
  '        "Serve topped with fresh coriander to taste."\n' +
  '      ],\n' +
  '      "serves": 4,\n' +
  '      "ingredients": [\n' +
  '        {\n' +
  '          "productName": "Hart & Soul Butter Chicken Recipe Base",\n' +
  '          "quantityText": "1 sachet",\n' +
  '          "quantity": 1,\n' +
  '          "unit": null,\n' +
  '          "notes": null,\n' +
  '          "productUrl": null\n' +
  '        },\n' +
  '        {\n' +
  '          "productName": "Chicken Breast",\n' +
  '          "quantityText": "375g",\n' +
  '          "quantity": 375,\n' +
  '          "unit": "g",\n' +
  '          "notes": "diced",\n' +
  '          "productUrl": null\n' +
  '        },\n' +
  '        {\n' +
  '          "productName": "Pouring Cream",\n' +
  '          "quantityText": "150ml",\n' +
  '          "quantity": 150,\n' +
  '          "unit": "ml",\n' +
  '          "notes": null,\n' +
  '          "productUrl": null\n' +
  '        },\n' +
  '        {\n' +
  '          "productName": "Tomato Paste",\n' +
  '          "quantityText": "70g",\n' +
  '          "quantity": 70,\n' +
  '          "unit": "g",\n' +
  '          "notes": null,\n' +
  '          "productUrl": null\n' +
  '        },\n' +
  '        {\n' +
  '          "productName": "Brown Onion",\n' +
  '          "quantityText": "1 small",\n' +
  '          "quantity": 1,\n' +
  '          "unit": null,\n' +
  '          "notes": "diced",\n' +
  '          "productUrl": null\n' +
  '        },\n' +
  '        {\n' +
  '          "productName": "Water",\n' +
  '          "quantityText": "50ml",\n' +
  '          "quantity": 50,\n' +
  '          "unit": "ml",\n' +
  '          "notes": null,\n' +
  '          "productUrl": null\n' +
  '        },\n' +
  '        {\n' +
  '          "productName": "Fresh Coriander",\n' +
  '          "quantityText": "1 fresh bunch (to serve, optional)",\n' +
  '          "quantity": 1,\n' +
  '          "unit": null,\n' +
  '          "notes": "to serve, optional",\n' +
  '          "productUrl": null\n' +
  '        }\n' +
  '      ]\n' +
  '    }\n' +
  '  ]\n' +
  '}';

RETAILER_CONFIG.woolworths.example = {
  query: FEW_SHOT_EXAMPLE_QUERY,
  response: FEW_SHOT_EXAMPLE_RESPONSE,
};

const buildMeasure = (ingredient: WoolworthsIngredient): string => {
  if (ingredient.quantityText) {
    return ingredient.quantityText.trim();
  }

  const parts: string[] = [];

  if (typeof ingredient.quantity === 'number' && !Number.isNaN(ingredient.quantity)) {
    const value = ingredient.quantity % 1 === 0 ? ingredient.quantity.toString() : ingredient.quantity.toFixed(2);
    parts.push(value.replace(/\.00$/, ''));
  }

  if (ingredient.unit) {
    parts.push(ingredient.unit.trim());
  }

  return parts.join(' ').trim();
};

const toRecipe = (data: WoolworthsRecipe, index: number, retailer: RetailerKey): Recipe => {
  const instructionsText = Array.isArray(data.instructions) && data.instructions.length > 0
    ? data.instructions.join('\n\n')
    : '';

  return {
    id: data.id || `${retailer}-${Date.now()}-${index}`,
    name: data.title,
    description: data.description ?? null,
    category: data.tags && data.tags.length ? data.tags[0] : `${retailer === 'woolworths' ? 'Woolworths' : 'Coles'} Recipe`,
    area: null,
    instructions: instructionsText,
    thumbnail: data.imageUrl ?? null,
    tags: data.tags ?? [],
    sourceUrl: data.recipeUrl ?? null,
    youtubeUrl: null,
    ingredients: (data.ingredients ?? []).map((ingredient) => ({
      name: ingredient.productName,
      measure: buildMeasure(ingredient),
      productUrl: ingredient.productUrl ?? null,
      notes: ingredient.notes ?? null,
    })),
    retailer,
  };
};

const parseRecipesFromContent = (content: string | null | undefined, retailer: RetailerKey): Recipe[] => {
  if (!content) {
    console.warn(`⚠️ OpenAI returned no content for ${retailer} recipe search`);
    return [];
  }

  let parsed: WoolworthsRecipeResponse | null = null;
  try {
    parsed = JSON.parse(content) as WoolworthsRecipeResponse;
  } catch (error) {
    console.warn(`Failed to parse ${retailer} recipe search response`, error);
    return [];
  }

  if (!parsed?.recipes || !Array.isArray(parsed.recipes)) {
    console.warn(`Parsed ${retailer} response missing recipes array`);
    return [];
  }

  return parsed.recipes.map((recipe, index) => toRecipe(recipe, index, retailer));
};

const callRetailerRecipeSearch = async (query: string, retailer: RetailerKey): Promise<Recipe[]> => {
  const apiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn(`⚠️ OpenAI API key not available. Unable to perform ${retailer} recipe search.`);
    return [];
  }

  const client = getOpenAIClient();
  const config = RETAILER_CONFIG[retailer];

  console.log(`🔍 Starting ${retailer} recipe search for query: "${query}"`);

  const attempts: Array<{
    description: string;
    options: {
      response_format:
        | {
            type: 'json_schema';
            json_schema: typeof RESPONSE_SCHEMA;
          }
        | {
            type: 'json_object';
          };
      max_tokens: number;
    };
  }> = [
    {
      description: 'primary (json_schema)',
      options: {
        response_format: {
          type: 'json_schema',
          json_schema: RESPONSE_SCHEMA,
        },
        max_tokens: 2000,
      },
    },
    {
      description: 'fallback (json_object)',
      options: {
        response_format: { type: 'json_object' },
        max_tokens: 2000,
      },
    },
  ];

  for (const attempt of attempts) {
    try {
      console.log(`➡️ Calling OpenAI (${retailer}) using ${attempt.description}`);
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: attempt.options.max_tokens,
        response_format: attempt.options.response_format,
        messages: [
          ...config.systemPrompts.map((prompt) => ({
            role: 'system' as const,
            content: prompt,
          })),
          ...(config.example
            ? ([
                {
                  role: 'user' as const,
                  content: `EXAMPLE QUERY: "${config.example.query}"`,
                },
                {
                  role: 'assistant' as const,
                  content: config.example.response,
                },
              ] as const)
            : []),
          {
            role: 'user',
            content: config.userInstruction(query),
          },
        ],
      });

      const choice = response.choices?.[0];
      if (!choice) {
        console.warn(`⚠️ No choices returned from OpenAI for ${retailer} recipe search (${attempt.description})`);
        continue;
      }

      console.log(
        `✅ OpenAI responded for ${retailer} (${attempt.description}) with finish_reason="${choice.finish_reason}" and message length ${choice.message?.content?.length ?? 0}`,
      );

      if (choice.finish_reason !== 'stop') {
        console.warn(
          `⚠️ OpenAI finish_reason "${choice.finish_reason}" for ${retailer} recipe search (${attempt.description}). Retrying if possible.`,
        );

        if (attempt.description === attempts[attempts.length - 1].description) {
          return parseRecipesFromContent(choice.message?.content, retailer);
        }

        continue;
      }

      const recipes = parseRecipesFromContent(choice.message?.content, retailer);
      if (recipes.length > 0) {
        console.log(`🍽️ Parsed ${recipes.length} ${retailer} recipes for query "${query}"`);
        return recipes;
      }
      console.warn(`⚠️ Parsed 0 recipes from ${retailer} response (${attempt.description}).`);
    } catch (error) {
      console.warn(`Error calling ${retailer} recipe search (${attempt.description}):`, error);
    }
  }

  console.warn(`❌ All attempts failed for ${retailer} recipe search with query "${query}"`);
  return [];
};

const MealDBAPI = {
  searchByName: async (query: string, retailer: RetailerKey = 'woolworths'): Promise<Recipe[]> =>
    callRetailerRecipeSearch(query, retailer),
};

export default MealDBAPI;

