"use server"

import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

/**
 * Sends a magic link to the provided email address.
 */
export async function sendMagicLink(formData: FormData) {
  const email = formData.get("email") as string

  if (!email || typeof email !== "string") {
    return { error: "Email is required" }
  }

  const supabase = await createServerClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

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
