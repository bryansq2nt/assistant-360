import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { signOut } from "@/app/actions/auth"

/**
 * Protected dashboard page - only accessible to authenticated users.
 * Shows list of user's businesses.
 */
export default async function DashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch businesses owned by the user
  const { data: businesses, error } = await supabase
    .from("business_profiles")
    .select("id, business_name, business_type, status, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl pt-20">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Welcome back, {user.email}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/business/new">
              <Button>Create Business</Button>
            </Link>
            <form action={signOut}>
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>
        </div>

        {/* Add Service/Product Buttons */}
        {businesses && businesses.length > 0 && (
          <div className="mb-6 flex gap-4">
            <Link href="/dashboard/offerings/new?type=service">
              <Button variant="default">
                ➕ Agregar servicio
              </Button>
            </Link>
            <Link href="/dashboard/offerings/new?type=product">
              <Button variant="default">
                ➕ Agregar producto
              </Button>
            </Link>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>My Businesses</CardTitle>
            <CardDescription>Manage your business profiles</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                Error loading businesses: {error.message}
              </div>
            ) : !businesses || businesses.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No businesses yet.</p>
                <Link href="/dashboard/business/new">
                  <Button className="mt-4">Create your first business</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {businesses.map((business) => (
                  <Link
                    key={business.id}
                    href={`/dashboard/business/${business.id}`}
                    className="block rounded-lg border p-4 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{business.business_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {business.business_type} • Created{" "}
                          {new Date(business.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={business.status === "DRAFT" ? "secondary" : "default"}>
                        {business.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
