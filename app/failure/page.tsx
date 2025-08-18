'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function FailurePage() {
  const searchParams = useSearchParams()
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const errorCodeParam = searchParams.get('errorCode')
    const errorMessageParam = searchParams.get('errorMessage')
    setErrorCode(errorCodeParam)
    setErrorMessage(errorMessageParam)
  }, [searchParams])

  return (
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
          <div className="space-y-4">
            {errorCode && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Error Code</dt>
                <dd className="mt-1 text-sm text-gray-900">{errorCode}</dd>
              </div>
            )}
            {errorMessage && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Error Message</dt>
                <dd className="mt-1 text-sm text-gray-900">{errorMessage}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-red-600">❌ Failed</dd>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <button 
              onClick={() => {
                console.log('Close button clicked, closing payment window');
                // Close the payment window directly
                window.close();
              }}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Close
            </button>
            <div className="text-center">
              <p className="text-xs text-gray-500">Please check your payment details and try again</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
