import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Create the user in the database
        const user = await User.create({
            name: body.name,
            email: body.email,
            preferences: {
                dietaryRestrictions: body.dietaryRestrictions,
                allergies: body.allergies,
                favorites: body.favorites,
                spiceLevel: body.spiceLevel
            },
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return NextResponse.json({ success: true, data: user }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}