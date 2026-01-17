import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseEnv } from "./env"

/**
 * Creates a Supabase client for use in browser/client components.
 * This client is safe to use in React Client Components.
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv()

  return createBrowserClient(url, anonKey)
}
