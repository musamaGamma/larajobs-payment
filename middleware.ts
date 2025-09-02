import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only apply CSP to payment-related routes
  const isPaymentRoute = request.nextUrl.pathname.startsWith('/') || 
                        request.nextUrl.pathname.startsWith('/success') ||
                        request.nextUrl.pathname.startsWith('/failure')

  if (isPaymentRoute) {
    const response = NextResponse.next()
    
    // PCI DSS v4.0 CSP for HyperPay COPYandPAY compliance with nonce
    const nonce = crypto.randomUUID().replace(/-/g, '')
    
    // Store nonce in response headers for client access
    response.headers.set('X-CSP-Nonce', nonce)
    
    const cspDirectives = [
      "default-src 'self'",
      `script-src 'self' https://eu-test.oppwa.com https://gw20.oppwa.com https://code.jquery.com https://p11.techlab-cdn.com 'unsafe-eval' 'nonce-${nonce}'`,
      `script-src-attr 'self' https://eu-test.oppwa.com https://gw20.oppwa.com 'unsafe-hashes' 'sha256-47mKTaMaEn1L3m5DAz9muidMqw636xxw7EFAK/YnPdg='`,
      "style-src 'self' https://eu-test.oppwa.com https://gw20.oppwa.com 'unsafe-inline'",
      "frame-src 'self' https://eu-test.oppwa.com https://gw20.oppwa.com",
      "connect-src 'self' https://eu-test.oppwa.com https://gw20.oppwa.com https://p11.techlab-cdn.com wss://*",
      "worker-src 'self' blob: https://eu-test.oppwa.com",
      "img-src 'self' https://eu-test.oppwa.com https://gw20.oppwa.com https://p11.techlab-cdn.com data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://eu-test.oppwa.com https://gw20.oppwa.com",
      "frame-ancestors 'self'"
    ].join('; ')

    response.headers.set('Content-Security-Policy', cspDirectives)
    
    // Additional security headers for payment routes
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    return response
  }

  // For non-payment routes, no CSP restrictions
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
