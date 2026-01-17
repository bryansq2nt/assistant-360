import { z } from "zod"

export const businessTypeSchema = z.enum(["SERVICE", "PRODUCT", "BOTH"])
export type BusinessType = z.infer<typeof businessTypeSchema>

export const offerKindSchema = z.enum(["SERVICE", "PRODUCT"])
export type OfferKind = z.infer<typeof offerKindSchema>

export const bookingMethodSchema = z.enum([
  "WALK_IN",
  "APPOINTMENT",
  "ONLINE",
  "PHONE",
  "MESSAGE",
])
export type BookingMethod = z.infer<typeof bookingMethodSchema>

export const brandToneSchema = z.enum(["FRIENDLY", "PROFESSIONAL", "CASUAL", "FORMAL"])
export type BrandTone = z.infer<typeof brandToneSchema>

export const offeringSchema = z.object({
  kind: offerKindSchema,
  name: z.string().min(1, "Name is required"),
  category: z.string().optional(),
  starting_price: z.string().optional(),
  short_description: z.string().optional(),
})

export const createBusinessSchema = z.object({
  business_name: z.string().min(1, "Business name is required"),
  business_type: businessTypeSchema,
  offer_type: businessTypeSchema,
  hours: z.string().min(1, "Hours are required"),
  service_area: z.string().optional(),
  tagline: z.string().optional(),
  about: z.string().optional(),
  booking_method: bookingMethodSchema.optional(),
  primary_language: z.string().default("es"),
  brand_tone: brandToneSchema.default("FRIENDLY"),
  offerings: z.array(offeringSchema).min(1, "At least one offering is required"),
})

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>
export type OfferingInput = z.infer<typeof offeringSchema>
