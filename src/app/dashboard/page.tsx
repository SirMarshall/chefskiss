import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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

    const start = performance.now();

    // 2. Fetch all data in parallel
    const [status, activePlan, profile] = await Promise.all([
        checkMealPlanStatus(session.user.id),
        getActiveMealPlan(session.user.id),
        getUserProfile(session.user.id)
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
