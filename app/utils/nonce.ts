/**
 * Get the CSP nonce from response headers (Client Component)
 * This works in Client Components by making a request
 */
export async function getClientNonce(): Promise<string> {
  try {
    // Use fetch to get the current page and extract nonce from headers
    const response = await fetch(window.location.href, { 
      method: 'HEAD',
      cache: 'no-store'
    })
    return response.headers.get('X-CSP-Nonce') || ''
  } catch (error) {
    console.warn('Could not get nonce from headers:', error)
    return ''
  }
}

/**
 * Generate a nonce for CSP compliance
 * Used as fallback when headers are not available
 */
export function generateNonce(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

/**
 * Create a script element with proper nonce
 */
export function createScriptWithNonce(nonce: string): HTMLScriptElement {
  const script = document.createElement('script')
  script.nonce = nonce
  return script
}

/**
 * Add nonce to existing script element
 */
export function addNonceToScript(script: HTMLScriptElement, nonce: string): void {
  script.nonce = nonce
}
