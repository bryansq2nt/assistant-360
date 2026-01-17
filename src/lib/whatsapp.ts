/**
 * WhatsApp link utilities
 */

interface BuildWhatsAppLinkParams {
  number: string
  greeting: string
  businessName: string
  publicSlug: string
}

/**
 * Builds a WhatsApp link with the specified parameters.
 * Format: https://wa.me/<NUMBER>?text=<ENCODED_TEXT>
 * Text format: `${GREETING} ${businessName} [${publicSlug}]`
 */
export function buildWhatsAppLink({
  number,
  greeting,
  businessName,
  publicSlug,
}: BuildWhatsAppLinkParams): string {
  // Format: greeting + business name + [slug]
  const text = `${greeting} ${businessName} [${publicSlug}]`

  // URL encode the text
  const encodedText = encodeURIComponent(text)

  // Build the WhatsApp link
  return `https://wa.me/${number}?text=${encodedText}`
}

/**
 * Gets the WhatsApp number from environment variables.
 */
export function getWhatsAppNumber(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5713761694"
}

/**
 * Gets the default greeting from environment variables.
 */
export function getWhatsAppGreeting(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_GREETING || "hola"
}
