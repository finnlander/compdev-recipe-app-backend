import { RecipeItem } from "./recipe-item.model";
import { RecipePhase } from "./recipe-phase.model";

export interface Recipe {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  phases: RecipePhase[];
  items: RecipeItem[];
}
