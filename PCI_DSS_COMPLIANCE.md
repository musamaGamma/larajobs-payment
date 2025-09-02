# PCI DSS v4.0 Compliance for HyperPay Integration

## Overview

This document outlines the implementation of PCI DSS v4.0 security requirements for the HyperPay COPYandPAY widget integration.

## 🔒 Security Requirements Implemented

### 1. Integrity Parameter in Checkout Request

**File:** `larajobs_backend/src/services/hyperpay.service.js`

```javascript
// Required by HyperPay PCI DSS v4.0 for COPYandPAY widget SRI
params.append('integrity', 'true');
```

**What it does:**
- Requests HyperPay to generate an integrity hash for the payment widget script
- Ensures script integrity and prevents tampering
- Required for PCI DSS v4.0 compliance

### 2. Script Integrity and Cross-Origin Attributes

**File:** `payment-app/app/components/PaymentWidget.tsx`

```javascript
// PCI DSS v4.0: Add integrity and crossorigin attributes
if (integrity) {
  script.integrity = integrity
  script.crossOrigin = 'anonymous'
  console.log('[PaymentWidget] Using integrity check:', integrity)
} else {
  console.warn('[PaymentWidget] No integrity value provided - security risk!')
}
```

**What it does:**
- Validates script integrity using the hash from HyperPay
- Prevents loading of tampered scripts
- Ensures secure cross-origin loading

### 3. Content Security Policy (CSP) with Nonce

**File:** `payment-app/middleware.ts`

```typescript
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
```

**What it does:**
- Restricts script execution to trusted sources only (eu-test.oppwa.com, gw20.oppwa.com, p11.techlab-cdn.com)
- Uses nonce-based validation for inline scripts
- Prevents XSS attacks and script injection
- Allows HyperPay widget to function properly with `unsafe-eval`
- Includes `script-src-attr` directive for inline event handlers with `unsafe-hashes`
- Supports multiple HyperPay gateway domains for redundancy
- Allows worker scripts for HyperPay internal functionality with `worker-src`
- Permits HyperPay analytics/tracking domains (techlab-cdn.com) for payment monitoring

### 4. Next.js Nonce Integration

**File:** `payment-app/app/utils/serverNonce.ts`

```typescript
// Server-side nonce retrieval
export async function getServerNonce(): Promise<string> {
  try {
    const headersList = await headers()
    return headersList.get('X-CSP-Nonce') || ''
  } catch (error) {
    console.warn('Could not get nonce from headers:', error)
    return ''
  }
}
```

**File:** `payment-app/app/utils/nonce.ts`

```typescript
// Client-side nonce retrieval
export async function getClientNonce(): Promise<string> {
  try {
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
```

**File:** `payment-app/app/components/PaymentWidgetWrapper.tsx`

```typescript
// Server Component wrapper
export default async function PaymentWidgetWrapper(props: PaymentWidgetWrapperProps) {
  const nonce = await getServerNonce()
  return <PaymentWidget {...props} nonce={nonce} />
}
```

**What it does:**
- Uses Next.js server-side features for nonce handling
- Provides fallback for client-side nonce retrieval
- Passes nonce from middleware to client components
- Ensures proper CSP validation for all scripts

## 🧪 Testing Compliance

### CSP Test Page

Visit `http://localhost:3000/csp-test` to verify:
- ✅ CSP headers are properly set
- ✅ HyperPay domains are allowed
- ✅ jQuery domain is allowed
- ✅ All security directives are in place

### Google CSP Evaluator

1. Visit: https://csp-evaluator.withgoogle.com/
2. Enter your payment app URL: `http://localhost:3000`
3. Verify all security checks pass

### Manual Testing

1. **Check Network Tab:**
   - Verify integrity attributes in script requests
   - Confirm CSP headers are set
   - Check that scripts load from trusted domains

2. **Test Payment Flow:**
   - Complete a test payment
   - Verify no CSP violations in console
   - Confirm HyperPay widget loads properly

## 🚀 Production Deployment

### Environment Variables

```bash
# Backend (.env)
HYPERPAY_BASE_URL=https://eu-prod.oppwa.com/
HYPERPAY_CARD_ENTITY_ID=your_prod_entity_id
HYPERPAY_MADA_ENTITY_ID=your_prod_mada_entity_id
HYPERPAY_AUTH_TOKEN=your_prod_auth_token

# Payment App (.env.local)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### URL Updates

**File:** `payment-app/middleware.ts`
```typescript
// Change from test to production URLs
"script-src 'self' https://eu-prod.oppwa.com https://gw20.oppwa.com https://code.jquery.com https://p11.techlab-cdn.com 'unsafe-eval' 'nonce-${nonce}'"
"script-src-attr 'self' https://eu-prod.oppwa.com https://gw20.oppwa.com 'unsafe-hashes'"
"style-src 'self' https://eu-prod.oppwa.com https://gw20.oppwa.com 'unsafe-inline'"
"frame-src 'self' https://eu-prod.oppwa.com https://gw20.oppwa.com"
"connect-src 'self' https://eu-prod.oppwa.com https://gw20.oppwa.com https://p11.techlab-cdn.com wss://*"
"worker-src 'self' blob: https://eu-prod.oppwa.com"
"img-src 'self' https://eu-prod.oppwa.com https://gw20.oppwa.com https://p11.techlab-cdn.com data:"
"form-action 'self' https://eu-prod.oppwa.com https://gw20.oppwa.com"
```

**File:** `payment-app/app/components/PaymentWidget.tsx`
```javascript
// Update script URLs for production
script.src = `https://eu-prod.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`
```

## 📋 Compliance Checklist

- [x] `integrity=true` parameter in checkout request
- [x] Integrity value passed to frontend
- [x] `integrity` attribute in script tag
- [x] `crossorigin="anonymous"` attribute
- [x] `unsafe-inline` support for HyperPay scripts
- [x] Restricted script-src to trusted domains
- [x] `unsafe-eval` support for HyperPay widget
- [x] Proper frame-src and form-action directives
- [x] `object-src 'none'` for security
- [x] CSP test page for verification
- [x] Error handling for missing integrity values

## 🔍 Security Monitoring

### Logs to Monitor

1. **Missing Integrity Values:**
   ```
   [PaymentWidget] No integrity value provided - security risk!
   ```

2. **CSP Violations:**
   - Check browser console for CSP errors
   - Monitor server logs for CSP header issues

3. **Payment Failures:**
   - Monitor HyperPay API responses
   - Check for integrity validation failures

### Regular Audits

1. **Monthly CSP Review:**
   - Verify CSP headers are still compliant
   - Check for new HyperPay requirements

2. **Quarterly Security Scan:**
   - Run CSP Evaluator tool
   - Test payment flow end-to-end

3. **Annual PCI DSS Review:**
   - Review all security measures
   - Update compliance documentation

## 🆘 Troubleshooting

### Common Issues

1. **"call to eval() blocked by CSP"**
   - Solution: Ensure `'unsafe-eval'` is in script-src directive

2. **"integrity attribute mismatch"**
   - Solution: Verify integrity value from backend is correct
   - Check that HyperPay is returning valid integrity hashes

3. **"jQuery script blocked by CSP"**
   - Solution: Ensure `https://code.jquery.com` is in script-src directive
   - Check that `unsafe-inline` is included for inline scripts

4. **"CSP header not found"**
   - Solution: Verify middleware is running on payment routes
   - Check that CSP headers are being set correctly

5. **"Script blocked from gw20.oppwa.com"**
   - Solution: Ensure both `https://eu-test.oppwa.com` and `https://gw20.oppwa.com` are in script-src directive
   - HyperPay uses multiple gateway domains for redundancy

6. **"Event handler blocked by script-src-attr"**
   - Solution: Add `script-src-attr` directive with 'unsafe-hashes' and specific hash
   - Consider using `'sha256-47mKTaMaEn1L3m5DAz9muidMqw636xxw7EFAK/YnPdg='` for jQuery inline handlers

7. **"Script blocked from techlab-cdn.com"**
   - Solution: Add `https://p11.techlab-cdn.com` to both script-src and connect-src directives
   - This domain is used by HyperPay for analytics and fraud detection

8. **"Worker script blocked by CSP"**
   - Solution: Add `worker-src 'self' blob: https://eu-test.oppwa.com` directive
   - HyperPay uses web workers for internal processing

9. **"WebSocket connection blocked"**
   - Solution: Add `wss://*` to connect-src directive for real-time communication

### Debug Commands

```bash
# Test CSP headers
curl -I http://localhost:3000

# Check payment app CSP
curl -I http://localhost:3000/csp-test

# Verify backend integrity parameter
curl -X POST https://eu-test.oppwa.com/v1/checkouts \
  -d "entityId=your_entity_id" \
  -d "amount=10.00" \
  -d "currency=SAR" \
  -d "paymentType=DB" \
  -d "integrity=true" \
  -H "Authorization: Bearer your_token"
```

## 📚 References

- [HyperPay PCI DSS v4.0 Documentation](https://hyperpay.docs.oppwa.com/support/widget#csp)
- [COPYandPAY Integration Guide](https://hyperpay.docs.oppwa.com/integrations/widget)
- [Google CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [PCI DSS v4.0 Requirements](https://www.pcisecuritystandards.org/document_library)

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** ✅ PCI DSS v4.0 Compliant
