import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define the validation schema
const UserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    dietaryRestrictions: z.string().optional(),
    allergens: z.string().optional(),
    favorites: z.string().optional(),
    spiceLevel: z.enum(["none", "mild", "medium", "hot"]).optional().default("none"),
});

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Validate the request body
        const validationResult = UserSchema.safeParse(body);

        if (!validationResult.success) {
            const formattedErrors = validationResult.error.flatten().fieldErrors;
            return NextResponse.json({
                success: false,
                error: Object.values(formattedErrors).flat().join(", ")
            }, { status: 400 });
        }

        const data = validationResult.data;

        // Check for existing username or email
        const existingUser = await User.findOne({
            $or: [{ email: data.email }, { username: data.username }]
        });

        if (existingUser) {
            return NextResponse.json({
                success: false,
                error: existingUser.email === data.email ? "Email already exists" : "Username already taken"
            }, { status: 409 });
        }

        // Create the user in the database
        const user = await User.create({
            name: data.name,
            username: data.username,
            email: data.email,
            password: data.password, // In a real app, hash this!
            dietaryRestrictions: data.dietaryRestrictions ? data.dietaryRestrictions.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [],
            allergens: data.allergens ? data.allergens.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [],
            favorites: data.favorites ? data.favorites.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [],
            spiceLevel: data.spiceLevel
        });

        return NextResponse.json({ success: true, data: user }, { status: 201 });
    } catch (error: unknown) {
        console.error("API Error:", error);
        // Handle duplicate email error specifically if possible
        if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 11000) {
            return NextResponse.json({
                success: false,
                error: "Email already exists"
            }, { status: 409 });
        }
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to create user"
        }, { status: 400 });
    }
}