import mongoose, { Schema, model, models } from "mongoose";

//User constructor for TS
export interface IUser {
    name: string;
    email: string;
    preferences: {
        dietaryRestrictions: string[];
        allergens: string[];
        favorites: string[];
        spiceLevel: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        //Might disable later
        unique: true
    },
    preferences: {
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
            default: "medium"
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

const User = models.User || model<IUser>("User", UserSchema);

export default User;