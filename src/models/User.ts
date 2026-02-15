import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
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

    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
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
    },
    {
        timestamps: true,
    }
);

// This check prevents Mongoose from recompiling the model during hot reloads
const User = models.User || model<IUser>("User", UserSchema);

export default User;