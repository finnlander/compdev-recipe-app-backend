import { Ingredient } from "./ingredient.model";
import { Recipe } from "./recipe.model";
import { User } from "./user.model";

export interface DB {
  ingredients: Ingredient[];
  recipes: Recipe[];
  users: User[];
}
