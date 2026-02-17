"use server";

import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User, { IUser } from "@/models/User";
import WeeklyMealPlan from "@/models/WeeklyMealPlan";
import { headers } from "next/headers";
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { searchImage } from "@/lib/unsplash";

/**
 * Checks if the current user has a generated meal plan.
 * @param userOrId Optional user object or ID to bypass session/DB lookup
 */
export async function checkMealPlanStatus(userOrId?: string | any) {
    await dbConnect();
    
    let user = typeof userOrId === 'object' ? userOrId : null;
    let userId = typeof userOrId === 'string' ? userOrId : (user ? user._id || user.id : null);
    
    if (!userId && !user) {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session || !session.user) {
            return { hasPlan: false, planId: null };
        }
        userId = session.user.id;
    }

    // If we don't have the user object with the required fields, fetch it
    if (!user || user.mealPlanGenerated === undefined) {
        user = await User.findById(userId).select('mealPlanGenerated currentMealPlanId').lean();
    }

    if (!user) return { hasPlan: false, planId: null };
    
    return {
        hasPlan: !!user.mealPlanGenerated,
        planId: user.currentMealPlanId ? user.currentMealPlanId.toString() : null
    };
}

/**
 * Retrieves the active meal plan for the current user.
 * @param userId Optional user ID to bypass session lookup
 */
export async function getActiveMealPlan(userId?: string) {
    await dbConnect();
    
    let currentUserId = userId;
    
    if (!currentUserId) {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session || !session.user) {
            throw new Error("Unauthorized");
        }
        currentUserId = session.user.id;
    }

    const plan = await WeeklyMealPlan.findOne({ userId: currentUserId })
        .sort({ createdAt: -1 }) // Get the latest one
        .lean();

    if (!plan) return null;

    // Convert _id and dates to strings for serialization
    return JSON.parse(JSON.stringify(plan));
}

/**
 * Generates a meal plan for the user using Google GenAI.
 */
export async function generateInitialMealPlan(days: number = 7, profileUpdates?: Partial<IUser>) {
    await dbConnect();
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    // Fetch full user profile for preferences
    const user = await User.findById(session.user.id);
    if (!user) {
        throw new Error(`User not found: ${session.user.id}`);
    }

    // Apply profile updates if provided
    if (profileUpdates) {
        if (profileUpdates.dietaryRestrictions) user.dietaryRestrictions = profileUpdates.dietaryRestrictions;
        if (profileUpdates.allergens) user.allergens = profileUpdates.allergens;
        if (profileUpdates.dislikes) user.dislikes = profileUpdates.dislikes;
        if (profileUpdates.favorites) user.favorites = profileUpdates.favorites;
        if (profileUpdates.spiceLevel) user.spiceLevel = profileUpdates.spiceLevel;
        if (profileUpdates.householdSize) user.householdSize = profileUpdates.householdSize;
        await user.save();
    }

    if (user.mealPlanGenerated && !user.hasUnlimitedRegens) {
        throw new Error("Meal plan already exists.");
    }

    // Initialize GenAI
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });

    // Define Schema
    // Based on .genai.ts structure
    const IngredientSchema: Schema = {
        type: Type.OBJECT,
        required: ["name", "quantity", "unit"],
        properties: {
            name: { type: Type.STRING },
            quantity: { type: Type.NUMBER },
            unit: { type: Type.STRING },
            notes: { type: Type.STRING },
            category: { type: Type.STRING },
        },
    };

    const InstructionSchema: Schema = {
        type: Type.OBJECT,
        required: ["stepNumber", "instruction"],
        properties: {
            stepNumber: { type: Type.INTEGER },
            instruction: { type: Type.STRING },
            timerSeconds: { type: Type.INTEGER },
        },
    };

    const RecipeSchema: Schema = {
        type: Type.OBJECT,
        required: ["id", "name", "description", "prepTimeMinutes", "cookTimeMinutes", "totalTimeMinutes", "difficulty", "tags", "servings", "nutrition", "ingredients", "instructions"],
        properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            image: { type: Type.STRING },
            imageColor: { type: Type.STRING }, // For UI placeholder hex codes
            prepTimeMinutes: { type: Type.INTEGER },
            cookTimeMinutes: { type: Type.INTEGER },
            totalTimeMinutes: { type: Type.INTEGER },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
            cuisine: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            rating: { type: Type.NUMBER },
            servings: { type: Type.INTEGER },
            nutrition: {
                type: Type.OBJECT,
                required: ["calories", "protein", "carbs", "fats"],
                properties: {
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                    fats: { type: Type.NUMBER },
                },
            },
            ingredients: { type: Type.ARRAY, items: IngredientSchema },
            instructions: { type: Type.ARRAY, items: InstructionSchema },
        },
    };

    // Get current date info
    const now = new Date();
    const todayISO = now.toISOString().split('T')[0];
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = daysOfWeek[now.getDay()];

    const DayPlanSchema: Schema = {
        type: Type.OBJECT,
        required: ["day", "summary", "meals"],
        properties: {
            day: { type: Type.STRING }, // Removed enum to let AI specify the day name
            summary: { type: Type.STRING },
            meals: {
                type: Type.OBJECT,
                required: ["breakfast", "lunch", "dinner"],
                properties: {
                    breakfast: RecipeSchema,
                    lunch: RecipeSchema,
                    dinner: RecipeSchema,
                    snack: RecipeSchema,
                },
            },
        },
    };

    const WeeklyPlanResponseSchema: Schema = {
        type: Type.OBJECT,
        required: ["weekStartDate", "userProfile", "days"],
        properties: {
            weekStartDate: { type: Type.STRING, format: "date" },
            userProfile: {
                type: Type.OBJECT,
                required: ["name", "dietaryRestrictions", "allergens", "dislikes", "favorites", "spiceLevel", "householdSize"],
                properties: {
                    name: { type: Type.STRING },
                    dietaryRestrictions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    allergens: { type: Type.ARRAY, items: { type: Type.STRING } },
                    dislikes: { type: Type.ARRAY, items: { type: Type.STRING } },
                    favorites: { type: Type.ARRAY, items: { type: Type.STRING } },
                    spiceLevel: { type: Type.STRING },
                    householdSize: { type: Type.INTEGER },
                },
            },
            days: { type: Type.ARRAY, items: DayPlanSchema },
            shoppingList: { type: Type.ARRAY, items: IngredientSchema },
        },
    };

    // Construct Prompt
        const prompt = `
        Generate a meal plan for exactly ${days} days for a user with the following profile:
        Name: ${user.name}
        Dietary Restrictions: ${user.dietaryRestrictions?.join(", ") || "None"}
        Allergens: ${user.allergens?.join(", ") || "None"}
        Dislikes: ${user.dislikes?.join(", ") || "None"}
        Favorite Cuisines: ${user.favorites?.join(", ") || "None"}
        Spice Level: ${user.spiceLevel || "Medium"}
        Household Size: ${user.householdSize || 1}

        The plan MUST start from today (${todayName}, ${todayISO}).
        The 'weekStartDate' in the response MUST be "${todayISO}".
        The 'days' array MUST contain exactly ${days} items.
        For each day in the 'days' array, provide the correct day name (e.g. ${todayName} for the first day, then the next day, etc.).
        Provide colorful, appetizing color codes for 'imageColor' (hex).
        Ensure nutritional balance.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            config: {
                responseMimeType: 'application/json',
                responseSchema: WeeklyPlanResponseSchema,
            },
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                }
            ]
        });

        let generatedText = response.text;
        if (!generatedText) {
            throw new Error("No response from AI");
        }

        // Robust JSON extraction: Find the first { and last }
        const startIdx = generatedText.indexOf('{');
        const endIdx = generatedText.lastIndexOf('}');

        if (startIdx === -1 || endIdx === -1) {
            throw new Error("AI response did not contain a valid JSON object");
        }

        const jsonString = generatedText.substring(startIdx, endIdx + 1);

        let planData;
        try {
            planData = JSON.parse(jsonString);
        } catch (parseError: any) {
            console.error("JSON Parse Error. Content was:", jsonString.substring(0, 500) + "...");
            console.error("Error position:", parseError.message);
            throw new Error(`Invalid JSON generated by AI: ${parseError.message}`);
        }

        // --- ENRICH WITH UNSPLASH IMAGES (Parallelized) ---
        const allMeals: any[] = [];
        planData.days.forEach((day: any) => {
            if (day.meals) {
                Object.values(day.meals).forEach((meal: any) => {
                    if (meal && meal.name) allMeals.push(meal);
                });
            }
        });

        // Run all searches in parallel
        await Promise.all(allMeals.map(async (meal) => {
            try {
                const imageResult = await searchImage(meal.name);
                if (imageResult) {
                    meal.imageUrl = imageResult.imageUrl;
                    meal.imageBlurHash = imageResult.imageBlurHash;
                    meal.imageUserName = imageResult.imageUserName;
                    meal.imageUserLink = imageResult.imageUserLink;
                }
            } catch (err) {
                console.error(`[Unsplash] Error fetching image for ${meal.name}:`, err);
            }
        }));
        // -----------------------------------


        // Save to DB
        // Force userId since schema doesn't have it
        const newPlan = await WeeklyMealPlan.create({
            userId: session.user.id,
            weekStartDate: planData.weekStartDate || new Date().toISOString().split('T')[0],
            userProfile: planData.userProfile,
            days: planData.days, // Use the modified days array
            shoppingList: planData.shoppingList || []
        });

        // Update User
        await User.findByIdAndUpdate(session.user.id, {
            mealPlanGenerated: true,
            currentMealPlanId: newPlan._id,
            generatedMenu: newPlan._id // Optional legacy field
        });

        return JSON.parse(JSON.stringify(newPlan));

    } catch (error: any) {
        console.error("Error generating meal plan:", error);
        throw new Error(`Failed to generate meal plan: ${error.message || error}`);
    }
}

/**
 * Retrieves the user's dietary profile.
 * @param userOrId Optional user object or ID to bypass session/DB lookup
 */
export async function getUserProfile(userOrId?: string | any) {
    await dbConnect();
    
    let user = typeof userOrId === 'object' ? userOrId : null;
    let userId = typeof userOrId === 'string' ? userOrId : (user ? user._id || user.id : null);
    
    if (!userId && !user) {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session || !session.user) {
            throw new Error("Unauthorized");
        }
        userId = session.user.id;
    }

    // If we don't have the user object with the required fields, fetch it
    if (!user || user.dietaryRestrictions === undefined) {
        user = await User.findById(userId).select('dietaryRestrictions allergens dislikes favorites spiceLevel householdSize planDuration hasUnlimitedRegens').lean();
    }

    if (!user) return null;

    // Return as plain object
    return JSON.parse(JSON.stringify(user));
}
/**
 * Archives the current meal plan by clearing the user's active plan flags.
 */
export async function archiveCurrentMealPlan() {
    await dbConnect();
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    await User.findByIdAndUpdate(session.user.id, {
        mealPlanGenerated: false,
        currentMealPlanId: null
    });

    return { success: true };
}
