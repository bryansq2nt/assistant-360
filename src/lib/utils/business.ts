/**
 * Generates a unique public slug for a business.
 * Format: slugify(business_name) + "-" + 4 random alphanumeric (lowercase)
 */
export function generatePublicSlug(businessName: string): string {
  // Slugify business name: lowercase, replace spaces/non-alphanumeric with hyphens
  const baseSlug = businessName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  // Generate 4 random alphanumeric characters
  const randomChars = Math.random().toString(36).substring(2, 6).toLowerCase()

  return `${baseSlug}-${randomChars}`
}

/**
 * Checks if a public slug is unique in the database.
 * Returns true if unique, false if collision.
 */
export async function isSlugUnique(
  supabase: any,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabase.from("business_profiles").select("id").eq("public_slug", slug).limit(1)

  if (excludeId) {
    query = query.neq("id", excludeId)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return !data || data.length === 0
}

/**
 * Generates a unique public slug with retry logic.
 */
export async function generateUniqueSlug(
  supabase: any,
  businessName: string,
  maxRetries: number = 5
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const slug = generatePublicSlug(businessName)

    const isUnique = await isSlugUnique(supabase, slug)

    if (isUnique) {
      return slug
    }
  }

  // If all retries failed, append timestamp
  const baseSlug = generatePublicSlug(businessName)
  const timestamp = Date.now().toString(36).toLowerCase()
  return `${baseSlug}-${timestamp}`
}
