import { createServerClient } from "@/lib/supabase"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Handles the Supabase auth callback after the user clicks the magic link.
 * Exchanges the auth code for a session and redirects to /dashboard.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/dashboard"

  if (!code) {
    console.error("[Auth Callback] No code provided in URL")
    return NextResponse.redirect(new URL("/auth/login?error=no_code", request.url))
  }

  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[Auth Callback] Error exchanging code:", error.message)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }

    if (data.session) {
      console.log("[Auth Callback] Session created successfully, redirecting to:", next)
      // Construct redirect URL using the same origin as the request
      const redirectUrl = new URL(next, request.url)
      return NextResponse.redirect(redirectUrl)
    } else {
      console.error("[Auth Callback] No session after code exchange")
      return NextResponse.redirect(new URL("/auth/login?error=no_session", request.url))
    }
  } catch (error) {
    // If Supabase isn't configured or there's an error, redirect to login
    console.error("[Auth Callback] Unexpected error:", error)
    const errorMessage = error instanceof Error ? error.message : "unknown_error"
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorMessage)}`, request.url)
    )
  }
}
