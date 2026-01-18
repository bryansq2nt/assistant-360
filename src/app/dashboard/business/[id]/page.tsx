import { createServerClient } from "@/lib/supabase"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WhatsAppShare } from "@/components/business/WhatsAppShare"

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Business detail page - shows business profile and offerings.
 * Only accessible to the business owner.
 */
export default async function BusinessDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch business profile
  const { data: business, error: businessError } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single()

  if (businessError || !business) {
    notFound()
  }

  // Fetch offerings
  const { data: offerings, error: offeringsError } = await supabase
    .from("business_offerings")
    .select("*")
    .eq("business_id", id)
    .order("created_at", { ascending: true })

  // Parse category from business_type (format: "Category: Subcategory" or "Otro: customText")
  const parseCategory = (businessType: string | null): string | null => {
    if (!businessType) return null
    if (businessType.startsWith("Otro:")) return "Otro"
    const parts = businessType.split(":")
    return parts[0] || null
  }

  const category = parseCategory(business.business_type)
  const isComidaCategory = category === "Comida"

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl pt-20">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Business Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{business.business_name}</h1>
              <Badge variant={business.status === "DRAFT" ? "secondary" : "default"}>
                {business.status}
              </Badge>
            </div>
            {business.tagline && (
              <p className="mt-2 text-lg text-muted-foreground">{business.tagline}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información del negocio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de negocio</p>
                  <p className="mt-1">{business.business_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Horario</p>
                  <p className="mt-1">{business.hours}</p>
                </div>
                {business.booking_method && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Método de reserva</p>
                    <p className="mt-1">{business.booking_method}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Idioma principal</p>
                  <p className="mt-1">{business.primary_language}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tono de marca</p>
                  <p className="mt-1">{business.brand_tone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plan</p>
                  <p className="mt-1">{business.plan}</p>
                </div>
              </div>

              {business.about && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                  <p className="mt-1 whitespace-pre-wrap">{business.about}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground">Public Slug</p>
                <p className="mt-1 font-mono text-sm">{business.public_slug}</p>
              </div>
            </CardContent>
          </Card>

          {/* Location and Coverage */}
          {(business.business_address || business.service_area || (isComidaCategory && business.delivery_area)) && (
            <Card>
              <CardHeader>
                <CardTitle>Ubicación y cobertura</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {business.business_address && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dirección del negocio</p>
                    <p className="mt-1">{business.business_address}</p>
                  </div>
                )}
                {business.service_area && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Áreas de servicio</p>
                    <p className="mt-1">{business.service_area}</p>
                  </div>
                )}
                {isComidaCategory && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Delivery</p>
                      <p className="mt-1">{business.delivery_area ? "Sí" : "No"}</p>
                    </div>
                    {business.delivery_area && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Áreas de delivery</p>
                        <p className="mt-1">{business.delivery_area}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Offerings */}
          <Card>
            <CardHeader>
              <CardTitle>Offerings</CardTitle>
              <CardDescription>
                {offerings && offerings.length > 0
                  ? `${offerings.length} offering(s)`
                  : "No offerings yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {offeringsError ? (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  Error loading offerings: {offeringsError.message}
                </div>
              ) : !offerings || offerings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No offerings added yet.</p>
              ) : (
                <div className="space-y-4">
                  {offerings.map((offering) => (
                    <div key={offering.id} className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{offering.name}</h3>
                        <Badge variant="outline">{offering.kind}</Badge>
                      </div>
                      {offering.category && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Category: {offering.category}
                        </p>
                      )}
                      {offering.starting_price && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Starting at: {offering.starting_price}
                        </p>
                      )}
                      {offering.short_description && (
                        <p className="mt-2 text-sm">{offering.short_description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* WhatsApp Share */}
          <WhatsAppShare
            businessName={business.business_name}
            publicSlug={business.public_slug}
          />
        </div>
      </div>
    </main>
  )
}
