import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

/**
 * Home page - redirects authenticated users to /dashboard,
 * unauthenticated users to /auth/login.
 */
export default async function Home() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect("/dashboard")
    }

    redirect("/auth/login")
  } catch (error) {
    // If Supabase isn't configured, redirect to login anyway
    // The login page will show errors if needed
    redirect("/auth/login")
  }
}
