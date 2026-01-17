"use server"

import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

/**
 * Gets the app URL for redirects.
 * Prioritizes NEXT_PUBLIC_APP_URL, then VERCEL_URL, then falls back to localhost.
 */
function getAppUrl(): string {
  // Use explicit app URL if set
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl && appUrl.trim() !== "") {
    // Ensure no trailing slash
    return appUrl.trim().replace(/\/$/, "")
  }

  // Use Vercel URL if available (Vercel automatically provides this in production)
  // VERCEL_URL format: "assistant-360.vercel.app" (without protocol)
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    return `https://${vercelUrl}`
  }

  // Fallback to localhost for development
  console.warn(
    "[Auth] NEXT_PUBLIC_APP_URL not set and VERCEL_URL not available, using localhost fallback"
  )
  console.warn(
    "[Auth] To fix: Set NEXT_PUBLIC_APP_URL=https://assistant-360.vercel.app in Vercel environment variables"
  )
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

  // Log the redirect URL for debugging
  console.log("[Auth] NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL || "(not set)")
  console.log("[Auth] VERCEL_URL:", process.env.VERCEL_URL || "(not set)")
  console.log("[Auth] Sending magic link with redirect URL:", `${appUrl}/auth/callback`)

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
