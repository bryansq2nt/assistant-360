import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { createBusinessSchema, type CreateBusinessInput } from "@/lib/validations/business"
import { generateUniqueSlug } from "@/lib/utils/business"

/**
 * GET /api/business
 * Returns all businesses owned by the authenticated user.
 */
export async function GET() {
  try {
    const supabase = await createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch businesses owned by the user
    const { data: businesses, error } = await supabase
      .from("business_profiles")
      .select("id, business_name, business_type")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[API Business] Error fetching businesses:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ businesses: businesses || [] })
  } catch (error) {
    console.error("[API Business] Unexpected error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/business
 * Creates a new business profile with offerings.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createBusinessSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const data: CreateBusinessInput = validationResult.data

    // Generate unique public slug
    const publicSlug = await generateUniqueSlug(supabase, data.business_name)

    // Calculate trial_ends_at (30 days from now)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 30)

    // Create business profile
    // Set defaults: offer_type = 'BOTH', primary_language = 'es', brand_tone = 'FRIENDLY', booking_method = null
    const { data: business, error: businessError } = await supabase
      .from("business_profiles")
      .insert({
        owner_id: user.id,
        business_name: data.business_name,
        business_type: data.business_type,
        offer_type: "BOTH", // Default to BOTH for flexibility
        hours: data.hours,
        service_area: data.service_area || null,
        business_address: data.business_address || null,
        delivery_area: data.delivery_area || null,
        tagline: data.tagline || null,
        about: data.about || null,
        booking_method: null, // Not set in this step
        primary_language: "es", // Default to Spanish
        brand_tone: "FRIENDLY", // Default brand tone
        status: "DRAFT",
        plan: "TRIAL",
        trial_ends_at: trialEndsAt.toISOString(),
        message_limit_per_month: 500,
        message_count_this_month: 0,
        public_slug: publicSlug,
      })
      .select()
      .single()

    if (businessError) {
      console.error("[API Business] Error creating business:", businessError)
      return NextResponse.json({ error: businessError.message }, { status: 500 })
    }

    // No offerings created in this step - they will be added later

    return NextResponse.json(
      {
        success: true,
        business: {
          ...business,
          public_slug: publicSlug,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[API Business] Unexpected error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}
