import ImageCache from "@/models/ImageCache";
import dbConnect from "./db";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = "https://api.unsplash.com";

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

        // 1. Check Cache
        const cached = await ImageCache.findOne({ query: query.toLowerCase() });
        if (cached) {
            console.log(`[Unsplash] Cache hit for "${query}"`);
            return {
                imageUrl: cached.imageUrl,
                imageBlurHash: cached.imageBlurHash,
                imageUserName: cached.imageUserName,
                imageUserLink: cached.imageUserLink
            };
        }

        // 2. Fetch from Unsplash
        if (!UNSPLASH_ACCESS_KEY) {
            console.warn("[Unsplash] No access key provided. Skipping image fetch.");
            return null;
        }

        console.log(`[Unsplash] Fetching for "${query}"`);
        const response = await fetch(`${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
            headers: {
                "Authorization": `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });

        if (!response.ok) {
            console.error(`[Unsplash] Error fetching image: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const photo = data.results[0];
            const result: UnsplashImageResult = {
                imageUrl: photo.urls.regular, // or 'small' depending on needs
                imageBlurHash: photo.blur_hash,
                imageUserName: photo.user.name,
                imageUserLink: photo.user.links.html
            };

            // 3. Save to Cache (expires in 7 days)
            await ImageCache.create({
                query: query.toLowerCase(),
                ...result,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            return result;
        } else {
            console.log(`[Unsplash] No results found for "${query}"`);
            // Optionally cache the "no result" to match existing behavior or avoid re-querying
            return null;
        }

    } catch (error) {
        console.error("[Unsplash] Unexpected error:", error);
        return null;
    }
}
