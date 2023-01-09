import { RecipeItem } from "./recipe-item.model";

export interface RecipePhase {
  name: string;
  items: RecipeItem[];
}
