'use client'

import PaymentWidgetWrapper from './PaymentWidgetWrapper'

interface PaymentPageClientProps {
  checkoutId: string
  brand?: string | null
  integrity?: string | null
  nonce: string
}

export default function PaymentPageClient({ checkoutId, brand, integrity, nonce }: PaymentPageClientProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Complete Your Payment</h2>
          <p className="mt-1 text-sm text-gray-500">
            Please complete your payment to activate your subscription
          </p>
        </div>
        <div className="p-6">
          <PaymentWidgetWrapper 
            checkoutId={checkoutId}
            brand={brand}
            integrity={integrity}
            nonce={nonce}
          />
        </div>
      </div>
    </div>
  )
}
