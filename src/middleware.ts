import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseEnv } from "@/lib/supabase/env"

/**
 * Middleware to protect /dashboard routes.
 * Redirects unauthenticated users to /auth/login.
 */
export async function middleware(request: NextRequest) {
  // Skip auth check if Supabase env vars aren't configured
  try {
    const { url, anonKey } = getSupabaseEnv()

    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    // Refresh session if expired
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protect /dashboard routes
    if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    return response
  } catch (error) {
    // If Supabase isn't configured, allow request through
    // The page itself will handle showing appropriate error
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/health (health check)
     * - auth/callback (auth callback)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/health|auth/callback).*)",
  ],
}
