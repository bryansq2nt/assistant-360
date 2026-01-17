"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { createBusinessSchema, type CreateBusinessInput, type OfferingInput } from "@/lib/validations/business"
import type { BusinessType, OfferKind, BookingMethod, BrandTone } from "@/lib/validations/business"

export default function NewBusinessPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Business form state
  const [businessName, setBusinessName] = useState("")
  const [businessType, setBusinessType] = useState<BusinessType>("SERVICE")
  const [offerType, setOfferType] = useState<BusinessType>("SERVICE")
  const [hours, setHours] = useState("")
  const [serviceArea, setServiceArea] = useState("")
  const [tagline, setTagline] = useState("")
  const [about, setAbout] = useState("")
  const [bookingMethod, setBookingMethod] = useState<BookingMethod | "">("")
  const [primaryLanguage, setPrimaryLanguage] = useState("es")
  const [brandTone, setBrandTone] = useState<BrandTone>("FRIENDLY")

  // Offerings state
  const [offerings, setOfferings] = useState<OfferingInput[]>([
    { kind: "SERVICE", name: "", category: "", starting_price: "", short_description: "" },
  ])

  const addOffering = () => {
    setOfferings([
      ...offerings,
      { kind: "SERVICE" as OfferKind, name: "", category: "", starting_price: "", short_description: "" },
    ])
  }

  const removeOffering = (index: number) => {
    if (offerings.length > 1) {
      setOfferings(offerings.filter((_, i) => i !== index))
    }
  }

  const updateOffering = (index: number, field: keyof OfferingInput, value: string) => {
    const updated = [...offerings]
    updated[index] = { ...updated[index], [field]: value }
    setOfferings(updated)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Client-side validation
    const formData: CreateBusinessInput = {
      business_name: businessName,
      business_type: businessType,
      offer_type: offerType,
      hours: hours || "Varía, confirmar por mensaje",
      service_area: serviceArea || undefined,
      tagline: tagline || undefined,
      about: about || undefined,
      booking_method: bookingMethod || undefined,
      primary_language: primaryLanguage,
      brand_tone: brandTone,
      offerings: offerings.map((o) => ({
        kind: o.kind,
        name: o.name,
        category: o.category || undefined,
        starting_price: o.starting_price || undefined,
        short_description: o.short_description || undefined,
      })),
    }

    const validation = createBusinessSchema.safeParse(formData)
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || "Validation failed")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Failed to create business")
        setIsLoading(false)
        return
      }

      // Success - redirect to business detail page
      router.push(`/dashboard/business/${result.business.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl pt-20">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Business</CardTitle>
            <CardDescription>Fill in the key information about your business</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Information</h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name *</label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="My Awesome Business"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Business Type *</label>
                    <Select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                      required
                      disabled={isLoading}
                    >
                      <option value="SERVICE">Service</option>
                      <option value="PRODUCT">Product</option>
                      <option value="BOTH">Both</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Offer Type *</label>
                    <Select
                      value={offerType}
                      onChange={(e) => setOfferType(e.target.value as BusinessType)}
                      required
                      disabled={isLoading}
                    >
                      <option value="SERVICE">Service</option>
                      <option value="PRODUCT">Product</option>
                      <option value="BOTH">Both</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Hours *</label>
                  <Input
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="Varía, confirmar por mensaje"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Area</label>
                  <Input
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    placeholder="e.g., Miami, FL"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tagline</label>
                  <Input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Short description of your business"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">About</label>
                  <Textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Tell customers about your business..."
                    rows={4}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Booking Method</label>
                    <Select
                      value={bookingMethod}
                      onChange={(e) => setBookingMethod(e.target.value as BookingMethod | "")}
                      disabled={isLoading}
                    >
                      <option value="">Select...</option>
                      <option value="WALK_IN">Walk In</option>
                      <option value="APPOINTMENT">Appointment</option>
                      <option value="ONLINE">Online</option>
                      <option value="PHONE">Phone</option>
                      <option value="MESSAGE">Message</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary Language</label>
                    <Select
                      value={primaryLanguage}
                      onChange={(e) => setPrimaryLanguage(e.target.value)}
                      disabled={isLoading}
                    >
                      <option value="es">Spanish (es)</option>
                      <option value="en">English (en)</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Brand Tone</label>
                  <Select
                    value={brandTone}
                    onChange={(e) => setBrandTone(e.target.value as BrandTone)}
                    disabled={isLoading}
                  >
                    <option value="FRIENDLY">Friendly</option>
                    <option value="PROFESSIONAL">Professional</option>
                    <option value="CASUAL">Casual</option>
                    <option value="FORMAL">Formal</option>
                  </Select>
                </div>
              </div>

              {/* Offerings */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Offerings *</h3>
                  <Button type="button" variant="outline" onClick={addOffering} disabled={isLoading}>
                    Add Offering
                  </Button>
                </div>

                {offerings.map((offering, index) => (
                  <div key={index} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Offering {index + 1}</span>
                      {offerings.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOffering(index)}
                          disabled={isLoading}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Kind</label>
                        <Select
                          value={offering.kind}
                          onChange={(e) =>
                            updateOffering(index, "kind", e.target.value as OfferKind)
                          }
                          disabled={isLoading}
                        >
                          {offerType !== "PRODUCT" && <option value="SERVICE">Service</option>}
                          {offerType !== "SERVICE" && <option value="PRODUCT">Product</option>}
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Name *</label>
                        <Input
                          value={offering.name}
                          onChange={(e) => updateOffering(index, "name", e.target.value)}
                          placeholder="e.g., Haircut"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Category</label>
                        <Input
                          value={offering.category || ""}
                          onChange={(e) => updateOffering(index, "category", e.target.value)}
                          placeholder="e.g., Beauty"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Starting Price</label>
                        <Input
                          value={offering.starting_price || ""}
                          onChange={(e) => updateOffering(index, "starting_price", e.target.value)}
                          placeholder="e.g., $25"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Description</label>
                      <Textarea
                        value={offering.short_description || ""}
                        onChange={(e) => updateOffering(index, "short_description", e.target.value)}
                        placeholder="Brief description..."
                        rows={2}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Link href="/dashboard">
                  <Button type="button" variant="outline" disabled={isLoading}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Business"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
