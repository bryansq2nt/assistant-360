"use client"

import { useState } from "react"
import { sendMagicLink } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    const formData = new FormData()
    formData.append("email", email)

    const result = await sendMagicLink(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setIsSuccess(true)
      setEmail("")
    }

    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-md pt-20">
        <Card>
          <CardHeader>
            <CardTitle>Sign in to Assistant 360</CardTitle>
            <CardDescription>
              Enter your email to receive a magic link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4 text-sm">
                  <p className="font-medium">Check your email</p>
                  <p className="mt-1 text-muted-foreground">
                    We sent a magic link to your email address. Click the link to sign in.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSuccess(false)
                    setError(null)
                  }}
                >
                  Send another link
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send magic link"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
