// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { clientPromise } from "./db";

const getDatabaseName = () => {
    const authUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "";
    const isLocal = authUrl.includes("localhost");
    return isLocal ? "chefskiss_dev" : (process.env.MONGODB_DB_NAME || "chefskiss");
};

export const auth = betterAuth({
    database: mongodbAdapter(
        (await clientPromise).db(getDatabaseName())
    ),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            username: {
                type: "string",
                required: false,
                defaultValue: "",
            },
            onboardingComplete: {
                type: "boolean",
                required: false,
                defaultValue: false,
            },
            termsAccepted: {
                type: "boolean",
                required: false,
                defaultValue: false,
            },
            termsAcceptedAt: {
                type: "date",
                required: false,
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