
import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import User from '@/models/User';
import WeeklyMealPlan from '@/models/WeeklyMealPlan';
import { searchImage } from '@/lib/unsplash';
import dbConnect from '@/lib/db';


// Allow streaming responses up to 60 seconds (or more if configured)
export const maxDuration = 60;

import { WeeklyPlanSchema } from '@/lib/schemas';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { days: numDays, profileUpdates } = await req.json();

    // Fetch user
    const user = await User.findById(session.user.id);
    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    // Apply updates (logic copied from server action)
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
      return new Response('Meal plan already exists', { status: 409 });
    }

    const now = new Date();
    const todayISO = now.toISOString().split('T')[0];
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = daysOfWeek[now.getDay()];

    const prompt = `
      Generate a meal plan for exactly ${numDays || 7} days for a user with the following profile:
      Name: ${user.name}
      Dietary Restrictions: ${user.dietaryRestrictions?.join(", ") || "None"}
      Allergens: ${user.allergens?.join(", ") || "None"}
      Dislikes: ${user.dislikes?.join(", ") || "None"}
      Favorite Cuisines: ${user.favorites?.join(", ") || "None"}
      Spice Level: ${user.spiceLevel || "Medium"}
      Household Size: ${user.householdSize || 1}

      The plan MUST start from today (${todayName}, ${todayISO}).
      The 'weekStartDate' in the response MUST be "${todayISO}".
      The 'days' array MUST contain exactly ${numDays || 7} items.
      For each day in the 'days' array, provide the correct day name (e.g. ${todayName} for the first day, then the next day, etc.).
      Provide colorful, appetizing color codes for 'imageColor' (hex).
      Ensure nutritional balance.
      KEEP descriptions and instructions concise to ensure the entire ${numDays || 7}-day plan fits within the response limit.
    `;

    const result = streamObject({
      model: google('gemini-flash-lite-latest'),
      schema: WeeklyPlanSchema,
      prompt,
      onFinish: async ({ object }) => {
        if (!object) return;
        
        // Background work: Fetch images and save
        (async () => {
          try {
            await dbConnect(); // Re-ensure connection in background context
            
            const planData = object;
            
            // 1. Fetch Images
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
            
            // 2. Save to DB
            const newPlan = await WeeklyMealPlan.create({
                userId: session.user.id,
                weekStartDate: planData.weekStartDate || now.toISOString().split('T')[0],
                userProfile: planData.userProfile,
                days: planData.days,
                shoppingList: planData.shoppingList || []
            });

            // 3. Update User
            await User.findByIdAndUpdate(session.user.id, {
                mealPlanGenerated: true,
                currentMealPlanId: newPlan._id,
                generatedMenu: newPlan._id
            });
            
            console.log("Background meal plan generation completed and saved.");
            
          } catch (error) {
            console.error("Error in background meal plan processing:", error);
          }
        })();
      },
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error("Error in generate route:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}
