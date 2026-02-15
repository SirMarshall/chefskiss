import ImageCache from "@/models/ImageCache";
import dbConnect from "./db";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = "https://api.unsplash.com";

// Simple in-memory flag to stop hammering the API if we hit a limit in the current process
let isRateLimited = false;

interface UnsplashImageResult {
    imageUrl: string;
    imageBlurHash: string;
    imageUserName: string;
    imageUserLink: string;
}

export async function searchImage(query: string): Promise<UnsplashImageResult | null> {
    if (!query) return null;

    try {
        await dbConnect();

        const normalizedQuery = query.toLowerCase().trim();

        // 1. Check Cache for Exact Match
        let cached = await ImageCache.findOne({ query: normalizedQuery });

        // 2. "Fuzzy" Cache Fallback: If no exact match, try the last word (usually the noun)
        if (!cached) {
            const words = normalizedQuery.split(" ");
            if (words.length > 1) {
                const keyword = words[words.length - 1]; // e.g. "Salmon" from "Honey Garlic Salmon"
                cached = await ImageCache.findOne({ query: new RegExp(keyword, "i") });
                if (cached) {
                    console.log(`[Unsplash] Fuzzy cache hit for "${query}" using keyword "${keyword}"`);
                }
            }
        }

        if (cached) {
            return {
                imageUrl: cached.imageUrl,
                imageBlurHash: cached.imageBlurHash,
                imageUserName: cached.imageUserName,
                imageUserLink: cached.imageUserLink
            };
        }

        // 3. Early exit if we know we are rate limited or have no key
        if (isRateLimited || !UNSPLASH_ACCESS_KEY) {
            return null;
        }

        // 4. Fetch from Unsplash
        console.log(`[Unsplash] Fetching for "${query}"`);
        const response = await fetch(`${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
            headers: {
                "Authorization": `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });

        if (response.status === 403 || response.status === 429) {
            console.warn("[Unsplash] Rate limit hit. Disabling further requests for this session.");
            isRateLimited = true;
            return null;
        }

        if (!response.ok) {
            console.error(`[Unsplash] Error fetching image: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const photo = data.results[0];
            const result: UnsplashImageResult = {
                imageUrl: photo.urls.regular,
                imageBlurHash: photo.blur_hash,
                imageUserName: photo.user.name,
                imageUserLink: photo.user.links.html
            };

            // 5. Save to Cache
            await ImageCache.create({
                query: normalizedQuery,
                ...result,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            return result;
        }

        return null;

    } catch (error) {
        console.error("[Unsplash] Unexpected error:", error);
        return null;
    }
}

