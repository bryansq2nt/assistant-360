"use client"

import { useState } from "react"
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { buildWhatsAppLink, getWhatsAppNumber, getWhatsAppGreeting } from "@/lib/whatsapp"

interface WhatsAppShareProps {
  businessName: string
  publicSlug: string
}

/**
 * WhatsApp share component with link, copy button, QR code, and download.
 */
export function WhatsAppShare({ businessName, publicSlug }: WhatsAppShareProps) {
  const [copied, setCopied] = useState(false)

  const whatsappLink = buildWhatsAppLink({
    number: getWhatsAppNumber(),
    greeting: getWhatsAppGreeting(),
    businessName
  })

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(whatsappLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  const handleOpenWhatsApp = () => {
    window.open(whatsappLink, "_blank", "noopener,noreferrer")
  }

  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code-svg")
    if (!svg) return

    try {
      // Convert SVG to image data URL
      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const url = URL.createObjectURL(svgBlob)

      // Create download link
      const downloadLink = document.createElement("a")
      downloadLink.href = url
      downloadLink.download = `whatsapp-qr-${publicSlug}.svg`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      // Clean up
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download QR code:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share WhatsApp Link</CardTitle>
        <CardDescription>
          Share this link so customers can message your business on WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* WhatsApp Link */}
        <div className="space-y-3">
          <label className="text-sm font-medium">WhatsApp Link</label>
          <div className="flex gap-2">
            <Input value={whatsappLink} readOnly className="font-mono text-sm" />
            <Button onClick={handleCopyLink} variant="outline" disabled={copied}>
              {copied ? "Copied!" : "Copy link"}
            </Button>
            <Button onClick={handleOpenWhatsApp} variant="default">
              Open WhatsApp
            </Button>
          </div>
        </div>

        {/* QR Code */}
        <div className="space-y-3 border-t pt-6">
          <label className="text-sm font-medium">QR Code</label>
          <div className="flex items-start gap-6">
            <div className="rounded-lg border bg-white p-4">
              <QRCode
                id="qr-code-svg"
                value={whatsappLink}
                size={200}
                level="M"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox="0 0 200 200"
              />
            </div>
            <div className="flex-1 pt-2">
              <p className="text-sm text-muted-foreground mb-3">
                Scan this QR code to open the WhatsApp chat directly
              </p>
              <Button onClick={handleDownloadQR} variant="outline" size="sm">
                Download QR
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
