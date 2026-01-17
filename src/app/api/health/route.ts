import { NextResponse } from "next/server"
import { getSupabaseEnv } from "@/lib/supabase/env"

/**
 * Health check endpoint that validates Supabase environment variables.
 * Returns { ok: true } if env vars are present, otherwise { ok: false, error: "..." }
 */
export async function GET() {
  try {
    getSupabaseEnv()
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
