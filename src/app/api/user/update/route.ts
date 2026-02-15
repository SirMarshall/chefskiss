import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // We'll need to make sure this imports the server-side auth helper
import User from "@/models/User";
import dbConnect, { clientPromise } from "@/lib/db"; // Ensure DB connection

export async function POST(req: NextRequest) {
    try {
        await dbConnect(); // Ensure mongoose is connected

        const session = await auth.api.getSession({
            headers: await req.headers
        });

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { onboardingComplete, termsAccepted, preferences } = body;

        // Connect to DB if not already (Mongoose mainly)
        // Ensure mongoose is connected
        // Note: better-auth uses direct mongo client, but our Mongoose User model needs Mongoose connection.
        // We might need a separate db connect helper or rely on existing connection logic if present.
        // For now, assuming standard mongoose usage:

        // Update user
        const updateData: any = {};

        if (typeof onboardingComplete === 'boolean') {
            updateData.onboardingComplete = onboardingComplete;
        }

        if (typeof termsAccepted === 'boolean') {
            updateData.termsAccepted = termsAccepted;
            if (termsAccepted) {
                updateData.termsAcceptedAt = new Date();
            }
        }

        if (preferences) {
            // Flatten preferences into user model structure
            if (preferences.dietaryRestrictions) updateData.dietaryRestrictions = preferences.dietaryRestrictions;
            if (preferences.allergens) updateData.allergens = preferences.allergens;
            if (preferences.favorites) updateData.favorites = preferences.favorites;
            if (preferences.dislikes) updateData.dislikes = preferences.dislikes;
            if (preferences.spiceLevel) updateData.spiceLevel = preferences.spiceLevel;
            if (preferences.householdSize) updateData.householdSize = preferences.householdSize;
            if (preferences.planDuration) updateData.planDuration = preferences.planDuration;
            if (preferences.generatedMenu) updateData.generatedMenu = preferences.generatedMenu;
        }

        console.log("Updating user:", session.user.email, updateData);

        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        console.log("User updated:", updatedUser);

        return NextResponse.json({ success: true, user: updatedUser });

    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
