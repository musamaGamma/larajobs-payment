import { Suspense } from 'react'
import SuccessPageClient from '../components/SuccessPageClient'

interface SuccessPageProps {
  searchParams: Promise<{
    transactionId?: string
    amount?: string
  }>
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { transactionId, amount } = await searchParams

  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-green-50 px-6 py-4 border-b border-green-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-medium text-green-800">Payment Successful!</h2>
                <p className="text-sm text-green-600">Your subscription has been activated</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <SuccessPageClient 
        transactionId={transactionId}
        amount={amount}
      />
    </Suspense>
  )
}
