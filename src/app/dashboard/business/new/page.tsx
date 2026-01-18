"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { ChipsInput } from "@/components/ui/chips-input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createBusinessSchema, type CreateBusinessInput } from "@/lib/validations/business"

// Generate time options from 6:00 AM to 10:00 PM in 30-minute increments
function generateTimeOptions(): string[] {
  const options: string[] = []
  for (let hour = 6; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 22 && minute > 0) break // Stop at 10:00 PM
      const period = hour >= 12 ? "PM" : "AM"
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      const displayMinute = minute === 0 ? "00" : minute.toString().padStart(2, "0")
      options.push(`${displayHour}:${displayMinute} ${period}`)
    }
  }
  return options
}

const TIME_OPTIONS = generateTimeOptions()

// Category options
const CATEGORIES = [
  "Construcción",
  "Comida",
  "Belleza",
  "Servicios profesionales",
  "Hogar y mantenimiento",
  "Salud",
  "Automotriz",
  "Retail / Tienda",
  "Tecnología / Digital",
  "Otro",
] as const

type Category = (typeof CATEGORIES)[number]

// Subcategory mapping
const SUBCATEGORIES: Record<Category, string[]> = {
  Construcción: [
    "Remodelación",
    "Electricidad",
    "Plomería",
    "Pintura",
    "Drywall",
    "Roofing / Techos",
    "HVAC",
    "Pisos",
    "Otro",
  ],
  Comida: [
    "Panadería / Repostería",
    "Restaurante",
    "Comedor / Cocina",
    "Food truck",
    "Taquería",
    "Catering",
    "Cafetería",
    "Otro",
  ],
  Belleza: [
    "Salón de belleza",
    "Barbería",
    "Estilista independiente",
    "Uñas acrílicas",
    "Maquillaje",
    "Spa / Facial",
    "Otro",
  ],
  "Servicios profesionales": [
    "Consultor",
    "Taxes / Contabilidad",
    "Abogado",
    "Seguros",
    "Realtor / Bienes raíces",
    "Notario",
    "Otro",
  ],
  "Hogar y mantenimiento": [
    "Limpieza",
    "Jardinería",
    "Handyman",
    "Pest control",
    "Mudanzas",
    "Otro",
  ],
  Salud: [
    "Clínica dental",
    "Clínica médica",
    "Terapia / Fisioterapia",
    "Veterinaria",
    "Otro",
  ],
  Automotriz: [
    "Taller mecánico",
    "Car wash",
    "Detailing",
    "Grua / Towing",
    "Otro",
  ],
  "Retail / Tienda": [
    "Tienda general",
    "Boutique",
    "Ferretería",
    "Conveniencia",
    "Otro",
  ],
  "Tecnología / Digital": [
    "Agencia digital",
    "Diseño gráfico",
    "Desarrollo web",
    "Marketing",
    "IT support",
    "Otro",
  ],
  Otro: [],
}

// Mode types
type Mode = "FIXED_LOCATION" | "FIELD_SERVICE" | "FOOD" | "DIGITAL_REMOTE"

// Helper function to determine mode from category
function getMode(
  category: Category | "",
  otroModeSelection: string,
  bellezaMobileToggle: string
): Mode | null {
  if (!category) return null

  // Special case: Otro
  if (category === "Otro") {
    if (otroModeSelection === "fixed") return "FIXED_LOCATION"
    if (otroModeSelection === "mobile") return "FIELD_SERVICE"
    if (otroModeSelection === "digital") return "DIGITAL_REMOTE"
    return null
  }

  // Special case: Belleza
  if (category === "Belleza") {
    return bellezaMobileToggle === "yes" ? "FIELD_SERVICE" : "FIXED_LOCATION"
  }

  // MODE_A_FIXED_LOCATION
  if (["Salud", "Automotriz", "Retail / Tienda"].includes(category)) {
    return "FIXED_LOCATION"
  }

  // MODE_B_FIELD_SERVICE
  if (["Construcción", "Hogar y mantenimiento"].includes(category)) {
    return "FIELD_SERVICE"
  }

  // MODE_C_FOOD
  if (category === "Comida") {
    return "FOOD"
  }

  // MODE_D_DIGITAL_REMOTE
  if (["Servicios profesionales", "Tecnología / Digital"].includes(category)) {
    return "DIGITAL_REMOTE"
  }

  return null
}

export default function NewBusinessPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Business form state
  const [businessName, setBusinessName] = useState("")
  const [tagline, setTagline] = useState("")
  const [category, setCategory] = useState<Category | "">("")
  const [subcategory, setSubcategory] = useState<string>("")
  const [customBusinessType, setCustomBusinessType] = useState("")
  const [openTime, setOpenTime] = useState("8:00 AM")
  const [closeTime, setCloseTime] = useState("5:00 PM")
  const [about, setAbout] = useState("")

  // Location and coverage state
  const [businessAddress, setBusinessAddress] = useState("")
  const [serviceAreas, setServiceAreas] = useState<string[]>([])
  const [deliveryAreas, setDeliveryAreas] = useState<string[]>([])
  const [offersDelivery, setOffersDelivery] = useState<string>("")
  const [hasOffice, setHasOffice] = useState<string>("") // For FIELD_SERVICE and DIGITAL_REMOTE
  const [bellezaMobileToggle, setBellezaMobileToggle] = useState<string>("") // For Belleza special case
  const [otroModeSelection, setOtroModeSelection] = useState<string>("") // For Otro category

  // Get available subcategories based on selected category
  const availableSubcategories = useMemo(() => {
    if (!category || category === "Otro") return []
    return SUBCATEGORIES[category as Category] || []
  }, [category])

  // Check if custom input should be shown
  const showCustomInput = category === "Otro" || subcategory === "Otro"

  // Determine current mode
  const currentMode = useMemo(() => {
    return getMode(category, otroModeSelection, bellezaMobileToggle)
  }, [category, otroModeSelection, bellezaMobileToggle])

  // Handle category change - reset all location/coverage fields
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory as Category)
    setSubcategory("")
    setCustomBusinessType("")
    // Reset all location/coverage state
    setBusinessAddress("")
    setServiceAreas([])
    setDeliveryAreas([])
    setOffersDelivery("")
    setHasOffice("")
    setBellezaMobileToggle("")
    setOtroModeSelection("")
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate category and subcategory
    if (!category) {
      setError("Por favor selecciona una rama / industria")
      setIsLoading(false)
      return
    }

    if (category !== "Otro" && !subcategory) {
      setError("Por favor selecciona un negocio específico")
      setIsLoading(false)
      return
    }

    if (showCustomInput && !customBusinessType.trim()) {
      setError("Por favor escribe tu tipo de negocio")
      setIsLoading(false)
      return
    }

    // Validate Otro mode selection
    if (category === "Otro" && !otroModeSelection) {
      setError("Por favor selecciona un modo de atención")
      setIsLoading(false)
      return
    }

    // Validate Belleza mobile toggle
    if (category === "Belleza" && !bellezaMobileToggle) {
      setError("Por favor indica si atiende a domicilio")
      setIsLoading(false)
      return
    }

    // Validate based on mode
    if (!currentMode) {
      setError("Error: no se pudo determinar el modo de atención")
      setIsLoading(false)
      return
    }

    // MODE_A_FIXED_LOCATION: address required
    if (currentMode === "FIXED_LOCATION") {
      if (!businessAddress.trim()) {
        setError("Por favor ingresa la dirección del negocio")
        setIsLoading(false)
        return
      }
    }

    // MODE_B_FIELD_SERVICE: service areas required
    if (currentMode === "FIELD_SERVICE") {
      if (serviceAreas.length === 0) {
        setError("Por favor agrega al menos un área de servicio")
        setIsLoading(false)
        return
      }
    }

    // MODE_C_FOOD: address required, delivery optional
    if (currentMode === "FOOD") {
      if (!businessAddress.trim()) {
        setError("Por favor ingresa la dirección del negocio")
        setIsLoading(false)
        return
      }
      if (offersDelivery === "yes" && deliveryAreas.length === 0) {
        setError("Por favor agrega al menos un área de delivery")
        setIsLoading(false)
        return
      }
    }

    // Format business_type string
    let businessType: string
    if (category === "Otro") {
      businessType = `Otro: ${customBusinessType.trim()}`
    } else if (subcategory === "Otro") {
      businessType = `Otro: ${customBusinessType.trim()}`
    } else {
      businessType = `${category}: ${subcategory}`
    }

    // Format hours as "8:00 AM - 5:00 PM"
    const hours = `${openTime} - ${closeTime}`

    // Format service areas (only for FIELD_SERVICE mode)
    const serviceArea =
      currentMode === "FIELD_SERVICE" && serviceAreas.length > 0
        ? serviceAreas.join(", ")
        : undefined

    // Format delivery areas (only for FOOD mode with delivery enabled)
    const deliveryArea =
      currentMode === "FOOD" &&
        offersDelivery === "yes" &&
        deliveryAreas.length > 0
        ? deliveryAreas.join(", ")
        : undefined

    // Format address based on mode
    let finalAddress: string | undefined
    if (currentMode === "FIXED_LOCATION" || currentMode === "FOOD") {
      finalAddress = businessAddress.trim() || undefined
    } else if (
      currentMode === "FIELD_SERVICE" ||
      currentMode === "DIGITAL_REMOTE"
    ) {
      // Address is optional, only if hasOffice is yes
      finalAddress =
        hasOffice === "yes" && businessAddress.trim()
          ? businessAddress.trim()
          : undefined
    }

    // Client-side validation
    const formData: CreateBusinessInput = {
      business_name: businessName,
      business_type: businessType,
      hours,
      service_area: serviceArea,
      business_address: finalAddress,
      delivery_area: deliveryArea,
      tagline: tagline || undefined,
      about: about || undefined,
    }

    const validation = createBusinessSchema.safeParse(formData)
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || "Error de validación")
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
        setError(result.error || "Error al crear el negocio")
        setIsLoading(false)
        return
      }

      // Success - redirect to business detail page
      router.push(`/dashboard/business/${result.business.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error")
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl pt-20">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
            ← Volver al Dashboard
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registrar negocio</CardTitle>
            <CardDescription>Completa la información básica de tu negocio</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información del negocio</h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre del negocio *</label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Mi Negocio"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Eslogan (opcional)</label>
                  <Input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Breve descripción de tu negocio"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rama / industria *</label>
                  <Select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    required
                    disabled={isLoading}
                  >
                    <option value="">Selecciona...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </div>

                {category && category !== "Otro" && availableSubcategories.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Negocio específico *</label>
                    <Select
                      value={subcategory}
                      onChange={(e) => {
                        setSubcategory(e.target.value)
                        setCustomBusinessType("")
                      }}
                      required
                      disabled={isLoading}
                    >
                      <option value="">Selecciona...</option>
                      {availableSubcategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                {showCustomInput && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      ¿Cuál es tu tipo de negocio? *
                    </label>
                    <Input
                      value={customBusinessType}
                      onChange={(e) => setCustomBusinessType(e.target.value)}
                      placeholder="Ej: Panadería artesanal, Compañía eléctrica comercial, etc."
                      required
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Apertura *</label>
                    <Select
                      value={openTime}
                      onChange={(e) => setOpenTime(e.target.value)}
                      required
                      disabled={isLoading}
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cierre *</label>
                    <Select
                      value={closeTime}
                      onChange={(e) => setCloseTime(e.target.value)}
                      required
                      disabled={isLoading}
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              {/* Location and Coverage - Dynamic based on mode */}
              {category && currentMode && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold">Ubicación y cobertura</h3>

                  {/* Otro: Mode selector */}
                  {category === "Otro" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Modo de atención *</label>
                      <RadioGroup
                        value={otroModeSelection}
                        onValueChange={(value) => {
                          setOtroModeSelection(value)
                          // Reset incompatible fields when mode changes
                          if (value === "fixed") {
                            setServiceAreas([])
                            setDeliveryAreas([])
                            setOffersDelivery("")
                          } else if (value === "mobile") {
                            setDeliveryAreas([])
                            setOffersDelivery("")
                            setBusinessAddress("")
                          } else if (value === "digital") {
                            setServiceAreas([])
                            setDeliveryAreas([])
                            setOffersDelivery("")
                          }
                        }}
                        disabled={isLoading}
                      >
                        <RadioGroupItem value="fixed" label="Local fijo" />
                        <RadioGroupItem value="mobile" label="A domicilio / móvil" />
                        <RadioGroupItem value="digital" label="Digital / remoto" />
                      </RadioGroup>
                    </div>
                  )}

                  {/* Belleza: Mobile toggle */}
                  {category === "Belleza" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">¿Atiende a domicilio? *</label>
                      <RadioGroup
                        value={bellezaMobileToggle}
                        onValueChange={(value) => {
                          setBellezaMobileToggle(value)
                          if (value === "no") {
                            setServiceAreas([])
                          } else {
                            setBusinessAddress("")
                          }
                        }}
                        disabled={isLoading}
                      >
                        <RadioGroupItem value="yes" label="Sí" />
                        <RadioGroupItem value="no" label="No" />
                      </RadioGroup>
                    </div>
                  )}

                  {/* MODE_A_FIXED_LOCATION: Address required */}
                  {currentMode === "FIXED_LOCATION" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Dirección del negocio *</label>
                      <Input
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="Ej: 123 Main St, Sanford NC"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  )}

                  {/* MODE_B_FIELD_SERVICE: Service areas required, office optional */}
                  {currentMode === "FIELD_SERVICE" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Áreas de servicio *</label>
                        <ChipsInput
                          values={serviceAreas}
                          onChange={setServiceAreas}
                          placeholder="Escribe un área y presiona Enter (ej: Sanford)"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">¿Tiene oficina/local?</label>
                        <RadioGroup
                          value={hasOffice}
                          onValueChange={(value) => {
                            setHasOffice(value)
                            if (value === "no") {
                              setBusinessAddress("")
                            }
                          }}
                          disabled={isLoading}
                        >
                          <RadioGroupItem value="yes" label="Sí" />
                          <RadioGroupItem value="no" label="No" />
                        </RadioGroup>
                      </div>
                      {hasOffice === "yes" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Dirección del negocio</label>
                          <Input
                            value={businessAddress}
                            onChange={(e) => setBusinessAddress(e.target.value)}
                            placeholder="Ej: 123 Main St, Sanford NC"
                            disabled={isLoading}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* MODE_C_FOOD: Address required, delivery optional */}
                  {currentMode === "FOOD" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Dirección del negocio *</label>
                        <Input
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
                          placeholder="Ej: 123 Main St, Sanford NC"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">¿Ofrece delivery?</label>
                        <RadioGroup
                          value={offersDelivery}
                          onValueChange={(value) => {
                            setOffersDelivery(value)
                            if (value === "no") {
                              setDeliveryAreas([])
                            }
                          }}
                          disabled={isLoading}
                        >
                          <RadioGroupItem value="yes" label="Sí" />
                          <RadioGroupItem value="no" label="No" />
                        </RadioGroup>
                      </div>
                      {offersDelivery === "yes" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Áreas de delivery *</label>
                          <ChipsInput
                            values={deliveryAreas}
                            onChange={setDeliveryAreas}
                            placeholder="Escribe un área y presiona Enter (ej: Sanford)"
                            disabled={isLoading}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* MODE_D_DIGITAL_REMOTE: Office optional */}
                  {currentMode === "DIGITAL_REMOTE" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">¿Tiene oficina/local?</label>
                        <RadioGroup
                          value={hasOffice}
                          onValueChange={(value) => {
                            setHasOffice(value)
                            if (value === "no") {
                              setBusinessAddress("")
                            }
                          }}
                          disabled={isLoading}
                        >
                          <RadioGroupItem value="yes" label="Sí" />
                          <RadioGroupItem value="no" label="No" />
                        </RadioGroup>
                      </div>
                      {hasOffice === "yes" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Dirección del negocio</label>
                          <Input
                            value={businessAddress}
                            onChange={(e) => setBusinessAddress(e.target.value)}
                            placeholder="Ej: 123 Main St, Sanford NC"
                            disabled={isLoading}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-4 border-t pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descripción (opcional)</label>
                  <Textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Cuéntale a los clientes sobre tu negocio..."
                    rows={4}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Link href="/dashboard">
                  <Button type="button" variant="outline" disabled={isLoading}>
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creando..." : "Crear negocio"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
