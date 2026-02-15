import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
    _id: string;
    name: string;
    email: string;
    image?: string;
    emailVerified?: Date;

    // The Chef Profile (All optional because they don't exist at login)
    username?: string;
    dietaryRestrictions?: string[];
    allergens?: string[];
    favorites?: string[];
    spiceLevel?: string;

    // Onboarding & Terms
    onboardingComplete?: boolean;
    termsAccepted?: boolean;
    termsAcceptedAt?: Date;
    generatedMenu?: any; // Store the initial menu generated during onboarding

    // Meal Plan Integration
    currentMealPlanId?: string; // Reference to the active WeeklyMealPlan
    mealPlanGenerated?: boolean; // Fast flag for UI

    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        _id: { type: String }, // better-auth uses String IDs by default
        name: { type: String },
        email: { type: String, unique: true, required: true },
        image: { type: String },
        emailVerified: { type: Date },

        // Make these OPTIONAL. 
        // They will be filled when the user completes the "Chef's Table" form.
        username: { type: String, unique: true, sparse: true }, // 'sparse' allows multiple null values
        dietaryRestrictions: { type: [String], default: [] },
        allergens: { type: [String], default: [] },
        favorites: { type: [String], default: [] },
        spiceLevel: { type: String, default: "medium" },

        onboardingComplete: { type: Boolean, default: false },
        termsAccepted: { type: Boolean, default: false },
        termsAcceptedAt: { type: Date },
        generatedMenu: { type: Schema.Types.Mixed },

        // Meal Plan Integration
        currentMealPlanId: { type: Schema.Types.ObjectId, ref: 'WeeklyMealPlan' },
        mealPlanGenerated: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        collection: 'user', // Match better-auth default collection name
    }
);

// This check prevents Mongoose from recompiling the model during hot reloads
const User = models.User || model<IUser>("User", UserSchema);

export default User;