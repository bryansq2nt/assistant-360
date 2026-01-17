/**
 * Supabase client helpers
 * 
 * - createClient() from './client' - for browser/client components
 * - createClient() from './server' - for server components and route handlers
 * - getSupabaseEnv() from './env' - for environment variable validation
 */

export { createClient } from "./client"
export { createClient as createServerClient } from "./server"
export { getSupabaseEnv } from "./env"
