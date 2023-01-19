import { Ingredient } from "./ingredient.model";

export interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  phases: RecipePhase[];
}

/**
 * A single preparation phase on recipe.
 */
export interface RecipePhase {
  name: string;
  items: RecipeItem[];
}

/**
 * Single item of a recipe.
 */
export interface RecipeItem {
  ordinal: number;
  ingredient: Ingredient;
  amount: number;
  unit: RecipeUnit;
}

export enum RecipeUnit {
  PCS = "pcs",
  KG = "kg",
  GRAMS = "g",
  CUP = "cup(s)",
  TEA_SPOON = "tsp",
}
