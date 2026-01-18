import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { z } from "zod"

const createOfferingSchema = z.object({
    business_id: z.string().uuid("Invalid business ID"),
    type: z.enum(["service", "product"], {
        errorMap: () => ({ message: "Type must be 'service' or 'product'" }),
    }),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    price_from: z.number().optional(),
})

/**
 * POST /api/offerings
 * Creates a new offering (service or product) for a business.
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
        const validationResult = createOfferingSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validationResult.error.errors },
                { status: 400 }
            )
        }

        const data = validationResult.data

        // Verify the business exists and belongs to the user
        const { data: business, error: businessError } = await supabase
            .from("business_profiles")
            .select("id")
            .eq("id", data.business_id)
            .eq("owner_id", user.id)
            .single()

        if (businessError || !business) {
            return NextResponse.json(
                { error: "Business not found or access denied" },
                { status: 404 }
            )
        }

        // Create offering
        const { data: offering, error: offeringError } = await supabase
            .from("business_offerings")
            .insert({
                business_id: data.business_id,
                type: data.type,
                name: data.name,
                description: data.description || null,
                price_from: data.price_from || null,
                is_active: true,
            })
            .select()
            .single()

        if (offeringError) {
            console.error("[API Offerings] Error creating offering:", offeringError)
            return NextResponse.json({ error: offeringError.message }, { status: 500 })
        }

        return NextResponse.json(
            {
                success: true,
                offering,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("[API Offerings] Unexpected error:", error)
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        )
    }
}
