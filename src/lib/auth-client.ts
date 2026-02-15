import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL
})

// Export the specific functions we need for the UI
export const { signIn, signUp, signOut, useSession, updateUser } = authClient;