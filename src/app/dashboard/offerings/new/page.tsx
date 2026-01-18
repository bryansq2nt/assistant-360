"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"

interface Business {
    id: string
    business_name: string
    business_type: string
}

export default function NewOfferingPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const typeParam = searchParams.get("type") || ""
    const offeringType = typeParam === "service" || typeParam === "product" ? typeParam : null

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [businesses, setBusinesses] = useState<Business[]>([])

    // Form state
    const [businessId, setBusinessId] = useState("")
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [priceFrom, setPriceFrom] = useState("")

    // Load businesses on mount
    useEffect(() => {
        async function loadBusinesses() {
            try {
                const response = await fetch("/api/business")
                if (response.ok) {
                    const data = await response.json()
                    setBusinesses(data.businesses || [])
                }
            } catch (err) {
                console.error("Error loading businesses:", err)
            }
        }
        loadBusinesses()
    }, [])

    // Redirect if type is invalid
    useEffect(() => {
        if (!offeringType) {
            router.push("/dashboard")
        }
    }, [offeringType, router])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        // Validation
        if (!businessId) {
            setError("Por favor selecciona un negocio")
            setIsLoading(false)
            return
        }

        if (!name.trim()) {
            setError("Por favor ingresa el nombre")
            setIsLoading(false)
            return
        }

        if (!offeringType) {
            setError("Tipo de oferta inválido")
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch("/api/offerings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    business_id: businessId,
                    type: offeringType,
                    name: name.trim(),
                    description: description.trim() || undefined,
                    price_from: priceFrom ? parseFloat(priceFrom) : undefined,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || "Error al guardar")
                setIsLoading(false)
                return
            }

            // Success - redirect to business detail page
            router.push(`/dashboard/business/${businessId}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ocurrió un error")
            setIsLoading(false)
        }
    }

    if (!offeringType) {
        return null // Will redirect
    }

    const pageTitle = offeringType === "service" ? "Agregar servicio" : "Agregar producto"
    const namePlaceholder =
        offeringType === "service"
            ? "Instalación eléctrica residencial"
            : "Tres leches tradicional"

    return (
        <main className="min-h-screen bg-background p-8">
            <div className="container mx-auto max-w-2xl pt-20">
                <div className="mb-6">
                    <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
                        ← Volver al Dashboard
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{pageTitle}</CardTitle>
                        <CardDescription>Agrega un nuevo {offeringType} a tu negocio</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Negocio *</label>
                                    <Select
                                        value={businessId}
                                        onChange={(e) => setBusinessId(e.target.value)}
                                        required
                                        disabled={isLoading || businesses.length === 0}
                                    >
                                        <option value="">Selecciona un negocio...</option>
                                        {businesses.map((business) => (
                                            <option key={business.id} value={business.id}>
                                                {business.business_name} (Tipo: {business.business_type})
                                            </option>
                                        ))}
                                    </Select>
                                    {businesses.length === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            No tienes negocios creados.{" "}
                                            <Link href="/dashboard/business/new" className="underline">
                                                Crea uno primero
                                            </Link>
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nombre *</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={namePlaceholder}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Descripción</label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe lo que incluye..."
                                        rows={4}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Precio desde</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={priceFrom}
                                        onChange={(e) => setPriceFrom(e.target.value)}
                                        placeholder="Ej: 25"
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
                                <Button type="submit" disabled={isLoading || businesses.length === 0}>
                                    {isLoading ? "Guardando..." : "Guardar"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
