import { createServerClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Handles the Supabase auth callback after the user clicks the magic link.
 * Exchanges the auth code for a session and redirects to /dashboard.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/dashboard"

  if (code) {
    try {
      const supabase = await createServerClient()

      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        return NextResponse.redirect(new URL(next, request.url))
      }
    } catch (error) {
      // If Supabase isn't configured or there's an error, redirect to login
      console.error("Auth callback error:", error)
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(new URL("/auth/login", request.url))
}
