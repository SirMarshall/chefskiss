import { Schema, model, models } from "mongoose";

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

//User schema for MongoDB
const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
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
    }
}, {
    timestamps: true
});

const User = models.User || model<IUser>("User", UserSchema);

export default User;