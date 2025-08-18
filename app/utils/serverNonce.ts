import { headers } from 'next/headers'

/**
 * Get the CSP nonce from response headers (Server Component only)
 * This works in Server Components and can be passed to Client Components
 */
export async function getServerNonce(): Promise<string> {
  try {
    const headersList = await headers()
    return headersList.get('X-CSP-Nonce') || ''
  } catch (error) {
    console.warn('Could not get nonce from headers:', error)
    return ''
  }
}
