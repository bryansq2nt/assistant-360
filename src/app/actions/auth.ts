"use server"

import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

/**
 * Gets the app URL for redirects.
 * Prioritizes NEXT_PUBLIC_APP_URL, then VERCEL_URL, then falls back to localhost.
 */
function getAppUrl(): string {
  // Use explicit app URL if set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // Use Vercel URL if available (includes protocol)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Fallback to localhost for development
  return "http://localhost:3000"
}

/**
 * Sends a magic link to the provided email address.
 */
export async function sendMagicLink(formData: FormData) {
  const email = formData.get("email") as string

  if (!email || typeof email !== "string") {
    return { error: "Email is required" }
  }

  const supabase = await createServerClient()
  const appUrl = getAppUrl()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Signs out the current user.
 */
export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
