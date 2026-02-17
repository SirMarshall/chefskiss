
import { z } from 'zod';

export const IngredientSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  notes: z.string().optional(),
  category: z.string().optional(),
});

export const InstructionSchema = z.object({
  stepNumber: z.number(),
  instruction: z.string(),
  timerSeconds: z.number().optional(),
});

export const NutritionSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fats: z.number(),
});

export const RecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  imageColor: z.string().optional(),
  prepTimeMinutes: z.number().optional(),
  cookTimeMinutes: z.number().optional(),
  totalTimeMinutes: z.number().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  cuisine: z.string().optional(),
  tags: z.array(z.string()).optional(),
  rating: z.number().optional(),
  servings: z.number().optional(),
  nutrition: NutritionSchema.optional(),
  ingredients: z.array(IngredientSchema),
  instructions: z.array(InstructionSchema),
});

export const DayPlanSchema = z.object({
  day: z.string(),
  summary: z.string().optional(),
  meals: z.object({
    breakfast: RecipeSchema,
    lunch: RecipeSchema,
    dinner: RecipeSchema,
    snack: RecipeSchema.optional(),
  }),
});

export const WeeklyPlanSchema = z.object({
  weekStartDate: z.string(),
  userProfile: z.object({
    name: z.string().optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    allergens: z.array(z.string()).optional(),
    dislikes: z.array(z.string()).optional(),
    favorites: z.array(z.string()).optional(),
    spiceLevel: z.string().optional(),
    householdSize: z.number().optional()
  }),
  days: z.array(DayPlanSchema),
  shoppingList: z.array(IngredientSchema).optional(),
});
