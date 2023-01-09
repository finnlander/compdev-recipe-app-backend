import { Ingredient } from "./ingredient.model";
import { RecipeUnit } from "./recipe-unit.model";

export interface RecipeItem {
  ordinal: number;
  ingredient: Ingredient;
  amount: number;
  unit: RecipeUnit;
}
