import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Global interface to prevent TS errors on the global object
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Declare global variable for caching
declare global {
    var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const dbName = process.env.NODE_ENV === "development" ? "chefskiss_dev" : (process.env.MONGODB_DB_NAME || "chefskiss");
        const opts = {
            bufferCommands: false,
            dbName: dbName,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

// Export a client promise for Better Auth
// We use the dbConnect function to ensure the connection is established
// and then return the native client.
export const clientPromise = dbConnect().then((mongoose) => mongoose.connection.getClient());

export default dbConnect;