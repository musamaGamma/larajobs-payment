import { Suspense } from 'react'
import PaymentPageClient from './components/PaymentPageClient'
import { getServerNonce } from './utils/serverNonce'

interface PaymentPageProps {
  searchParams: Promise<{
    checkoutId?: string
    brand?: string
    integrity?: string
  }>
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const { checkoutId, brand, integrity } = await searchParams

  console.log({ checkoutId, brand, integrity })
  // Get nonce from server-side headers
  const nonce = await getServerNonce()

  if (!checkoutId) {
    return (
      <div className="max-w-md mx-auto">
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
                <p>Missing checkout ID</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Loading Payment</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Initializing payment gateway...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <PaymentPageClient 
        checkoutId={checkoutId}
        brand={brand}
        integrity={integrity}
        nonce={nonce}
      />
    </Suspense>
  )
}