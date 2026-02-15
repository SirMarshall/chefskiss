import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
    const pathName = request.nextUrl.pathname;

    // Define routes
    const authRoutes = ["/sign-in", "/sign-up"];
    const publicRoutes = ["/"];
    const isAuthRoute = authRoutes.includes(pathName);
    const isPublicRoute = publicRoutes.includes(pathName);

    // If it's a static asset or API route (though matcher should handle this), skip
    if (pathName.startsWith("/_next") || pathName.includes(".") || pathName.startsWith("/api/")) {
        return NextResponse.next();
    }

    try {
        // Fetch session from internal API
        // We use the full URL because we are server-side
        const sessionUrl = new URL("/api/auth/get-session", request.nextUrl.origin);

        // Use standard fetch
        const response = await fetch(sessionUrl, {
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
            cache: 'no-store' // Ensure we always get fresh session data
        });

        if (!response.ok) {
            // If API fails, we can't verify session. 
            // Better to fail safe (allow public, block protected)?
            // Or just allow and let client-side handle it?
            // Let's assume no session if API fails or returns 401/etc
            if (isAuthRoute || isPublicRoute) {
                return NextResponse.next();
            }
            // Redirect to sign-in
            return NextResponse.redirect(new URL("/", request.url));
        }

        const sessionData = await response.json();
        const session = sessionData; // adjust based on actual return structure { session: ..., user: ... } usually

        if (!session || !session.user) {
            // Not authenticated
            if (isAuthRoute || isPublicRoute) {
                return NextResponse.next();
            }
            return NextResponse.redirect(new URL("/", request.url));
        }

        const user = session.user;

        // Authenticated
        if (isAuthRoute) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        // 1. Terms Check
        // If terms NOT accepted
        if (!user.termsAccepted) {
            if (!pathName.startsWith("/terms")) {
                console.log("Middleware: Redirecting to /terms (Terms not accepted)");
                return NextResponse.redirect(new URL("/terms", request.url));
            }
            // If on /terms, allow
            return NextResponse.next();
        }

        // If terms ARE accepted
        if (user.termsAccepted && pathName.startsWith("/terms")) {
            console.log("Middleware: Redirecting from /terms to /onboarding (Terms already accepted)");
            return NextResponse.redirect(new URL("/onboarding", request.url));
        }

        // 2. Onboarding Check
        // If terms accepted but onboarding NOT complete
        if (!user.onboardingComplete) {
            if (!pathName.startsWith("/onboarding")) {
                console.log("Middleware: Redirecting via Onboarding check (incomplete)");
                return NextResponse.redirect(new URL("/onboarding", request.url));
            }
            // If on /onboarding, allow
            return NextResponse.next();
        }

        // If onboarding IS complete
        if (user.onboardingComplete && pathName.startsWith("/onboarding")) {
            console.log("Middleware: Redirecting from /onboarding to /dashboard (Onboarding already complete)");
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        // 3. Allow access to Dashboard or other protected routes
        return NextResponse.next();

    } catch (error) {
        console.error("Middleware error:", error);
        if (isAuthRoute || isPublicRoute) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/", request.url));
    }
}

export const config = {
    matcher: [
        // Match all routes that are likely pages
        "/((?!api/|_next/static|_next/image|favicon.ico).*)",
    ],
};
