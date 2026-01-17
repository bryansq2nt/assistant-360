"use server"

import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

/**
 * Signs in a user with email and password.
 */
export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || typeof email !== "string") {
    return { error: "Email is required" }
  }

  if (!password || typeof password !== "string") {
    return { error: "Password is required" }
  }

  const supabase = await createServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/dashboard")
}

/**
 * Signs up a new user with email and password.
 */
export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string

  if (!email || typeof email !== "string") {
    return { error: "Email is required" }
  }

  if (!password || typeof password !== "string") {
    return { error: "Password is required" }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || "",
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Check if email confirmation is required
  // If user has a session, they're already logged in (email confirmation disabled)
  // If no session, email confirmation is required
  if (data.session) {
    // User is automatically logged in (email confirmation disabled in Supabase)
    redirect("/dashboard")
  } else {
    // Email confirmation is required - redirect to login with success message
    redirect("/auth/login?message=check_email")
  }
}

/**
 * Signs out the current user.
 */
export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
