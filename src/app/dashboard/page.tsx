import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { 
    checkMealPlanStatus, 
    getActiveMealPlan, 
    getUserProfile 
} from "@/app/actions/mealPlan";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
    // 1. Authenticate on the Server
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        redirect("/");
    }

    await dbConnect();
    const start = performance.now();

    // 2. Fetch the base user once to avoid redundant lookups in actions
    const user = await User.findById(session.user.id).lean();

    if (!user) {
        redirect("/");
    }

    // 3. Fetch all other data in parallel
    const [status, activePlan, profile] = await Promise.all([
        checkMealPlanStatus(user),
        getActiveMealPlan(session.user.id),
        getUserProfile(user)
    ]);

    const end = performance.now();
    console.log(`[Dashboard] Data fetching took ${Math.round(end - start)}ms`);

    // 3. Render the client component with pre-fetched data
    return (
        <DashboardClient 
            user={session.user}
            initialMealPlan={activePlan}
            initialStatus={status}
            initialProfile={profile}
        />
    );
}
