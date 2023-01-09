import { LowdbSync } from "lowdb";
import { DB } from "./models/db.model";
import { Ingredient } from "./models/ingredient.model";

interface IngredientService {
  getOrAdd: (ingredientName: string) => Ingredient;
}

class IngredientServiceImpl implements IngredientService {
  constructor(private db: LowdbSync<DB>) {}

  getOrAdd = (ingredientName: string): Ingredient => {
    const ingredients = this.db.get("ingredients");
    const existingIngredient = ingredients
      .find((it) => it.name === ingredientName)
      .value();
    if (existingIngredient) {
      return existingIngredient;
    }

    const id =
      ingredients
        .map((it) => it.id)
        .max()
        .value() + 1;
    const newIngredient: Ingredient = {
      id,
      name: ingredientName,
    };

    ingredients.value().push(newIngredient);
    this.db.write();
    return newIngredient;
  };
}

export function createIngredientService(db: LowdbSync<DB>): IngredientService {
  return new IngredientServiceImpl(db);
}
