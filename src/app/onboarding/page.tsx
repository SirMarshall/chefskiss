
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/");
    }

    if ((session.user as any).onboardingComplete) {
        redirect("/dashboard");
    }

    return <OnboardingClient />;
}
