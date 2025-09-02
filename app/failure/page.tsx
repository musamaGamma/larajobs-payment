import { Suspense } from 'react'
import FailurePageClient from '@/app/components/FailurePageClient'

interface FailurePageProps {
  searchParams: Promise<{
    errorCode?: string
    errorMessage?: string
    checkoutId?: string
  }>
}

export default async function FailurePage({ searchParams }: FailurePageProps) {
  const { errorCode, errorMessage, checkoutId } = await searchParams

  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-medium text-red-800">Payment Failed</h2>
                <p className="text-sm text-red-600">Your payment could not be processed</p>
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
      <FailurePageClient 
        errorCode={errorCode}
        errorMessage={errorMessage}
        checkoutId={checkoutId}
      />
    </Suspense>
  )
}
