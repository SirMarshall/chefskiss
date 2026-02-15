"use server";

import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import WeeklyMealPlan from "@/models/WeeklyMealPlan";
import { headers } from "next/headers";
import { GoogleGenAI, Type, Schema } from '@google/genai';

/**
 * Checks if the current user has a generated meal plan.
 */
export async function checkMealPlanStatus() {
    await dbConnect();
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        return { hasPlan: false, planId: null };
    }

    // We can check the user record directly for speed
    const user = await User.findById(session.user.id).select('mealPlanGenerated currentMealPlanId');

    if (!user) return { hasPlan: false, planId: null };

    return {
        hasPlan: !!user.mealPlanGenerated,
        planId: user.currentMealPlanId ? user.currentMealPlanId.toString() : null
    };
}

/**
 * Retrieves the active meal plan for the current user.
 */
export async function getActiveMealPlan() {
    await dbConnect();
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    const plan = await WeeklyMealPlan.findOne({ userId: session.user.id })
        .sort({ createdAt: -1 }) // Get the latest one
        .lean();

    if (!plan) return null;

    // Convert _id and dates to strings for serialization
    return JSON.parse(JSON.stringify(plan));
}

/**
 * Generates a meal plan for the user using Google GenAI.
 */
export async function generateInitialMealPlan(days: number = 7) {
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

    if (user.mealPlanGenerated) {
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

    const DayPlanSchema: Schema = {
        type: Type.OBJECT,
        required: ["day", "meals"],
        properties: {
            day: { type: Type.STRING, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
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
        Generate a meal plan for ${days} days for a user with the following profile:
        Name: ${user.name}
        Dietary Restrictions: ${user.dietaryRestrictions?.join(", ") || "None"}
        Allergens: ${user.allergens?.join(", ") || "None"}
        Dislikes: ${user.dislikes?.join(", ") || "None"}
        Favorites: ${user.favorites?.join(", ") || "None"}
        Spice Level: ${user.spiceLevel || "Medium"}
        Household Size: ${1} (defaulting to 1 for now if undefined)

        The plan should cover the next ${days} days (e.g. starting Monday).
        Provide colorful, appetizing color codes for 'imageColor' (hex).
        Ensure nutritional balance.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', // Reverted to 1.5-flash as requested
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

        const generatedText = response.text;
        if (!generatedText) {
            throw new Error("No response from AI");
        }

        const planData = JSON.parse(generatedText);

        // Save to DB
        // Force userId since schema doesn't have it
        const newPlan = await WeeklyMealPlan.create({
            userId: session.user.id,
            weekStartDate: planData.weekStartDate || new Date().toISOString().split('T')[0],
            userProfile: planData.userProfile,
            days: planData.days,
            shoppingList: planData.shoppingList || []
        });

        // Update User
        await User.findByIdAndUpdate(session.user.id, {
            mealPlanGenerated: true,
            currentMealPlanId: newPlan._id,
            generatedMenu: newPlan._id // Optional legacy field
        });

        return JSON.parse(JSON.stringify(newPlan));

    } catch (error) {
        console.error("Error generating meal plan:", error);
        throw new Error("Failed to generate meal plan");
    }
}
