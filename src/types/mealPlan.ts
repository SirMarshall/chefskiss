/**
 * Core User Profile & Preferences
 * Derived from Onboarding steps.
 */
export interface UserProfile {
    name: string;
    dietaryRestrictions: string[]; // e.g., "Keto", "Vegan", "Gluten-Free"
    allergens: string[];           // e.g., "Peanuts", "Shellfish"
    dislikes: string[];            // e.g., "Cilantro", "Olives"
    favorites: string[];           // e.g., "Avocado", "Salmon"
    spiceLevel: 'None' | 'Mild' | 'Medium' | 'Hot';
    householdSize: number;         // Default: 1
}

/**
 * Ingredient Detail
 * Used in shopping lists and recipe views.
 */
export interface Ingredient {
    name: string;
    quantity: number;
    unit: string;       // e.g., "g", "ml", "cup", "tbsp", "whole"
    notes?: string;     // e.g., "chopped", "diced", "room temperature"
    category?: string;  // e.g., "Produce", "Dairy", "Pantry" (for shopping list organization)
}

/**
 * Cooking Instruction Step
 */
export interface InstructionStep {
    stepNumber: number;
    instruction: string;
    timerSeconds?: number; // Optional timer for this step
}

/**
 * Nutritional Information (Per Serving)
 */
export interface NutritionParams {
    calories: number;
    protein: number; // grams
    carbs: number;   // grams
    fats: number;    // grams
}

/**
 * Full Recipe Detail
 */
export interface Recipe {
    id: string;
    name: string;
    description: string;
    image?: string;         // URL to generated or stock image
    imageColor?: string;    // Aesthetic color tag, e.g., "bg-orange-100" (matches UI)

    // Timing & Difficulty
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    totalTimeMinutes: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';

    // Metadata
    cuisine?: string;
    tags: string[];         // e.g., "High Protein", "30-Min Meal"
    rating?: number;        // 1-5 scale (initialized to null or predicted)

    // Core Content
    servings: number;
    nutrition: NutritionParams;
    ingredients: Ingredient[];
    instructions: InstructionStep[];
}

/**
 * Daily Meal Structure
 */
export interface DailyPlan {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    meals: {
        breakfast: Recipe;
        lunch: Recipe;
        dinner: Recipe;
        snack?: Recipe; // Optional
    };
    summary?: string; // Daily theme or tip, e.g., "Meatless Monday"
}

/**
 * The Weekly Meal Plan Root Object
 */
export interface WeeklyMealPlan {
    id: string;
    weekStartDate: string; // ISO Date String (YYYY-MM-DD)
    userProfile: UserProfile; // Snapshot of preferences used to generate this plan
    days: DailyPlan[];
    shoppingList?: Ingredient[]; // Aggregated shopping list (optional helper)
}
