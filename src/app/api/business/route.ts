import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { createBusinessSchema, type CreateBusinessInput } from "@/lib/validations/business"
import { generateUniqueSlug } from "@/lib/utils/business"

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
    const { data: business, error: businessError } = await supabase
      .from("business_profiles")
      .insert({
        owner_id: user.id,
        business_name: data.business_name,
        business_type: data.business_type,
        offer_type: data.offer_type,
        hours: data.hours,
        service_area: data.service_area || null,
        tagline: data.tagline || null,
        about: data.about || null,
        booking_method: data.booking_method || null,
        primary_language: data.primary_language || "es",
        brand_tone: data.brand_tone || "FRIENDLY",
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

    // Create offerings
    const offerings = data.offerings.map((offering) => ({
      business_id: business.id,
      kind: offering.kind,
      name: offering.name,
      category: offering.category || null,
      starting_price: offering.starting_price || null,
      short_description: offering.short_description || null,
    }))

    const { error: offeringsError } = await supabase
      .from("business_offerings")
      .insert(offerings)

    if (offeringsError) {
      console.error("[API Business] Error creating offerings:", offeringsError)
      // Rollback: delete business if offerings fail
      await supabase.from("business_profiles").delete().eq("id", business.id)
      return NextResponse.json({ error: offeringsError.message }, { status: 500 })
    }

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
