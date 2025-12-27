export interface Recipe {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  area?: string | null;
  instructions: string;
  thumbnail: string | null;
  tags: string[];
  ingredients: RecipeIngredient[];
  sourceUrl: string | null;
  youtubeUrl?: string | null;
  retailer?: 'woolworths' | 'coles';
}

export interface RecipeIngredient {
  name: string;
  measure: string;
  productUrl?: string | null;
  notes?: string | null;
}
