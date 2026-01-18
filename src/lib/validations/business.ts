import { z } from "zod"

// Business type is now a string that can be formatted as "Category: Subcategory" or "Otro: custom text"
export const businessTypeSchema = z.string().min(1, "Business type is required")
export type BusinessType = string

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
  hours: z.string().min(1, "Hours are required"),
  service_area: z.string().optional(),
  business_address: z.string().optional(),
  delivery_area: z.string().optional(),
  tagline: z.string().optional(),
  about: z.string().optional(),
})

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>
export type OfferingInput = z.infer<typeof offeringSchema>
