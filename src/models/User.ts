import { Schema, model, models } from "mongoose";

//User constructor for TS
export interface IUser {
    name: string;
    username: string; // Added
    email: string;
    password?: string; // Added (optional for now if using OAuth later, but required for credentials)
    // Flattened preferences
    dietaryRestrictions: string[];
    allergens: string[];
    favorites: string[];
    spiceLevel: string;
    createdAt: Date;
    updatedAt: Date;
}

//User schema for MongoDB
const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false // Made false for now to avoid validation errors if we don't implement full auth encryption yet
    },
    dietaryRestrictions: {
        type: [String],
        default: []
    },
    allergens: {
        type: [String],
        default: []
    },
    favorites: {
        type: [String],
        default: []
    },
    spiceLevel: {
        type: String,
        default: "none"
    }
}, {
    timestamps: true
});

const User = models.User || model<IUser>("User", UserSchema);

export default User;