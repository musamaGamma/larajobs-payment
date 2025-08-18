'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getClientNonce } from '../utils/nonce'

interface PaymentWidgetProps {
  checkoutId: string
  brand?: string | null
  integrity?: string | null
  nonce?: string
}

export default function PaymentWidget({ checkoutId, brand, integrity, nonce }: PaymentWidgetProps) {
  const router = useRouter()
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [scriptError, setScriptError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentNonce, setCurrentNonce] = useState<string>(nonce || '')
  const widgetContainerRef = useRef<HTMLFormElement>(null)

  // External function to handle reload
  const handleReload = () => {
    window.location.reload()
  }

  // External function to handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  // Get nonce if not provided
  useEffect(() => {
    if (!currentNonce) {
      getClientNonce().then(setCurrentNonce).catch(console.error)
    }
  }, [currentNonce])

  useEffect(() => {
    if (!checkoutId) {
      setScriptError('Missing checkout ID')
      return
    }

    setScriptLoaded(false)
    setScriptError(null)

    console.log('[PaymentWidget] Loading HyperPay scripts...')

    // Load jQuery first (required for MADA branding guidelines)
    const jqueryScript = document.createElement('script')
    jqueryScript.src = 'https://code.jquery.com/jquery.js'
    jqueryScript.type = 'text/javascript'
    if (currentNonce) {
      jqueryScript.nonce = currentNonce
    }
    jqueryScript.onload = () => {
      console.log('[PaymentWidget] jQuery loaded successfully')
      loadHyperPayScript()
    }
    jqueryScript.onerror = () => {
      setScriptError('Failed to load jQuery')
    }

    // Add MADA branding and configuration script
    const configScript = document.createElement('script')
    configScript.type = 'text/javascript'
    if (currentNonce) {
      configScript.nonce = currentNonce
    }
    configScript.innerHTML = `
      console.log("[HyperPay] Setting wpwlOptions for MADA branding compliance");
      
      // MADA branding compliance configuration
      var wpwlOptions = {
        locale: "${navigator.language?.startsWith('ar') ? 'ar' : 'en'}",
        paymentTarget: "_top",
        onReady: function() {
          console.log("[HyperPay] Widget ready - applying MADA branding");
          
          // Apply MADA-specific styling per guidelines
          if (wpwlOptions.locale === "ar") {
            $(".wpwl-group").css('direction', 'ltr');
            $(".wpwl-control-cardNumber").css({'direction': 'ltr', "text-align": "right"});
            $(".wpwl-brand-card").css('right', '200px');
          }
          
          // Ensure MADA logo displays properly when MADA card is detected
          $(".wpwl-brand-MADA").parent().prepend('<img src="/MADA.png" alt="mada debit card" style="height:30px; margin-right:10px;">');
        },
        onError: function(error) {
          console.error("[HyperPay] Widget error:", error);
        },
        onDetectBrand: function(brands) {
          console.log("[HyperPay] Brand detected:", brands);
          if (brands && brands.includes('MADA')) {
            console.log("[HyperPay] MADA card detected - ensuring proper logo display");
          }
        },
        onBeforeSubmit: function() {
          console.log("[HyperPay] Payment form submitted");
        },
        onResponse: function(response) {
          console.log("[HyperPay] Payment response:", response);
          if (response.result && response.result.code === '000.100.110') {
            // Payment successful - send message to parent
            if (window.parent !== window) {
              window.parent.postMessage({
                type: 'PAYMENT_SUCCESS',
                data: { resourcePath: response.resourcePath || '/success' }
              }, '*');
            }
          }
        }
      };
    `

    // Load HyperPay payment widget script with PCI DSS v4.0 compliance
    const loadHyperPayScript = () => {
      const script = document.createElement('script')
      script.src = `https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`
      script.async = true
      
      // PCI DSS v4.0: Add integrity and crossorigin attributes
      if (integrity) {
        script.integrity = integrity
        script.crossOrigin = 'anonymous'
        console.log('[PaymentWidget] Using integrity check:', integrity)
      } else {
        console.warn('[PaymentWidget] No integrity value provided - security risk!')
      }
      
      // Add nonce for CSP compliance
      if (currentNonce) {
        script.nonce = currentNonce
      }
      console.log("[PaymentWidget] Loading HyperPay script without integrity check (trusted domain)")

      script.onload = () => {
        console.log('[PaymentWidget] HyperPay script loaded successfully')
        setScriptLoaded(true)
      }

      script.onerror = () => {
        setScriptError('Failed to load HyperPay script')
      }

      document.head.appendChild(script)
    }

    // Load scripts in sequence - jQuery first, then config, then HyperPay
    document.head.appendChild(jqueryScript)
    
    // Wait a bit for jQuery to fully initialize before adding config
    setTimeout(() => {
      document.head.appendChild(configScript)
    }, 100)

    // Cleanup function
    return () => {
      // Remove scripts when component unmounts
      const scripts = document.querySelectorAll('script[src*="jquery"], script[src*="oppwa"]')
      scripts.forEach(script => script.remove())
    }
  }, [checkoutId, integrity, currentNonce])

  if (scriptError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{scriptError}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={handleReload}
                className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!scriptLoaded) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Loading Payment Widget</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Please wait while we initialize the secure payment gateway...</p>
              <p className="mt-1 text-xs text-blue-600">Checkout ID: {checkoutId}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={handleReload}
                className="bg-blue-100 text-blue-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-200"
              >
                Retry Loading
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
        <p className="mt-1 text-sm text-gray-500">
          Enter your payment information to complete your subscription
        </p>
      </div>

      {/* MADA Branding Notice - Only show when MADA is selected */}
      {brand === 'MADA' && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src="/MADA.png" 
              alt="MADA" 
              className="h-8 w-auto object-contain" 
              style={{ minHeight: '32px', maxHeight: '40px' }}
            />
            <span className="text-lg font-medium text-gray-800">MADA Debit Card</span>
          </div>
          <p className="text-sm text-gray-600">
            Saudi National Payment - الطريقة المفضلة للدفع في المملكة العربية السعودية
          </p>
        </div>
      )}

      {/* HyperPay Widget Container */}
      <form
        ref={widgetContainerRef}
        className="paymentWidgets"
        data-brands={brand || 'MADA'}
        onSubmit={handleSubmit}
      />

      {/* Global Payment Widget CSS for text visibility */}
      <style>{`
        /* Ensure all HyperPay elements have visible text */
        .wpwl-form-card,
        .wpwl-form-card *,
        .wpwl-control,
        .wpwl-label,
        .wpwl-group,
        .wpwl-group * {
          color: #333 !important;
        }
        
        /* Input fields */
        .wpwl-control {
          background-color: white !important;
          border: 1px solid #d1d5db !important;
          color: #333 !important;
        }
        
        /* Labels */
        .wpwl-label {
          color: #333 !important;
          font-weight: 500 !important;
        }
        
        /* Buttons */
        .wpwl-button {
          color: white !important;
          background-color: #059669 !important;
        }
      `}</style>

      {/* Payment Widget CSS - Only apply when needed */}
      {brand === 'MADA' && (
        <style>{`
          .wpwl-form-card { 
            min-height: 0px !important; 
          }
          .wpwl-brand-MADA { 
            min-width: 60px !important; 
            min-height: 30px !important; 
            max-height: 40px !important;
            object-fit: contain !important;
          }
          .wpwl-brand-card {
            display: block !important;
            visibility: visible !important;
          }
          
          /* Ensure text visibility */
          .wpwl-form-card * {
            color: #333 !important;
          }
          
          .wpwl-control {
            color: #333 !important;
            background-color: white !important;
          }
          
          .wpwl-label {
            color: #333 !important;
          }
          
          .wpwl-button {
            color: white !important;
            background-color: #059669 !important;
          }
        `}</style>
      )}

      {isProcessing && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Processing Payment</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your payment is being processed. Please wait...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Add global types for HyperPay
declare global {
  interface Window {
    wpwl: {
      appendTo: (selector: string) => void
      Options: {
        locale: string
        paymentTarget: string
        onReady: () => void
        onError: (error: unknown) => void
        onDetectBrand: (brands: string[]) => void
        onBeforeSubmit: () => void
        onResponse: (response: unknown) => void
      }
    }
  }
}
