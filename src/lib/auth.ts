// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { clientPromise } from "./db";

export const auth = betterAuth({
    database: mongodbAdapter(
        (await clientPromise).db(process.env.MONGODB_DB_NAME || "chefskiss")
    ),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            username: {
                type: "string",
                required: true,
                defaultValue: "",
            }
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }
    }
});