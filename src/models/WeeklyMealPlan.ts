import mongoose, { Schema, model, models } from "mongoose";

// Ingredient Schema (subdocument)
const IngredientSchema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    notes: { type: String },
    category: { type: String }
}, { _id: false });

// Instruction Step Schema (subdocument)
const InstructionStepSchema = new Schema({
    stepNumber: { type: Number, required: true },
    instruction: { type: String, required: true },
    timerSeconds: { type: Number }
}, { _id: false });

// Nutrition Schema (subdocument)
const NutritionSchema = new Schema({
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true }
}, { _id: false });

// Recipe Schema (subdocument)
const RecipeSchema = new Schema({
    id: { type: String, required: true }, // Internal ID from generation or standard ID
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String }, // Keep for legacy/manual overrides
    imageUrl: { type: String }, // Unsplash URL
    imageBlurHash: { type: String }, // Unsplash BlurHash
    imageUserName: { type: String }, // Unsplash Photographer
    imageUserLink: { type: String }, // Unsplash Link
    imageColor: { type: String },
    prepTimeMinutes: { type: Number },
    cookTimeMinutes: { type: Number },
    totalTimeMinutes: { type: Number },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
    cuisine: { type: String },
    tags: [String],
    rating: { type: Number },
    servings: { type: Number },
    nutrition: { type: NutritionSchema },
    ingredients: [IngredientSchema],
    instructions: [InstructionStepSchema]
}, { _id: false }); // We might want _id if we reference recipes, but for now embedded is fine

// Daily Plan Schema (subdocument)
const DailyPlanSchema = new Schema({
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
    summary: { type: String },
    meals: {
        breakfast: { type: RecipeSchema, required: true },
        lunch: { type: RecipeSchema, required: true },
        dinner: { type: RecipeSchema, required: true },
        snack: { type: RecipeSchema }
    }
}, { _id: false });

// User Profile Snapshot Schema (to remember what preferences generated this plan)
const UserProfileSnapshotSchema = new Schema({
    name: { type: String },
    dietaryRestrictions: [String],
    allergens: [String],
    dislikes: [String],
    favorites: [String],
    spiceLevel: { type: String },
    householdSize: { type: Number }
}, { _id: false });

// Main Weekly Meal Plan Schema
const WeeklyMealPlanSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    weekStartDate: { type: String, required: true }, // ISO Date String YYYY-MM-DD
    userProfile: { type: UserProfileSnapshotSchema },
    days: [DailyPlanSchema],
    shoppingList: [IngredientSchema], // Optional aggregated list
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    collection: 'mealPlans'
});

const WeeklyMealPlan = models.WeeklyMealPlan || model("WeeklyMealPlan", WeeklyMealPlanSchema);

export default WeeklyMealPlan;
