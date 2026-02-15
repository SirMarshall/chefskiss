"use server";

import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import WeeklyMealPlan from "@/models/WeeklyMealPlan";
import { headers } from "next/headers";

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
 * Generates a dummy meal plan for the user (for testing/MVP).
 * In the future, this will call the AI service.
 */
export async function generateInitialMealPlan() {
    await dbConnect();
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    // Check if one already exists to avoid duplicates for now?
    // Or just always create new.

    // Load sample data
    // We import the JSON directly or read it. 
    // Since we are in server context, we can just use the sample data import if available or copy it.
    // For now, I'll hardcode a simplified structure or try to read the file.
    // Actually, let's just create a basic one.

    // Better: Import the sample JSON content here.
    // Since I can't restart the server easily to add imports, I will read the file content I saw earlier.
    // I previously read `src/data/sampleMealPlan.json`. Use that data.

    const samplePlan = await import("@/data/sampleMealPlan.json");

    // Create the plan in DB
    const newPlan = await WeeklyMealPlan.create({
        userId: session.user.id,
        weekStartDate: new Date().toISOString().split('T')[0], // Today
        userProfile: {
            name: session.user.name,
            // In a real app, copy these from User model
            dietaryRestrictions: [],
            allergens: [],
            dislikes: [],
            favorites: [],
            spiceLevel: "Medium",
            householdSize: 1
        },
        days: samplePlan.days, // Use sample days
        shoppingList: [] // Empty for now
    });

    // Update User
    await User.findByIdAndUpdate(session.user.id, {
        mealPlanGenerated: true,
        currentMealPlanId: newPlan._id
    });

    // Revalidate?
    return JSON.parse(JSON.stringify(newPlan));
}
