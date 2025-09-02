'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PendingPage() {
  const searchParams = useSearchParams()
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [statusResult, setStatusResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null)

  // Get URL parameters
  const errorCode = searchParams.get('errorCode')
  const errorMessage = searchParams.get('errorMessage')
  const checkoutId = searchParams.get('checkoutId')

  // Function to check payment status
  const handleCheckStatus = async () => {
    if (!checkoutId) {
      setError('No checkout ID available')
      return
    }
    
    setIsCheckingStatus(true)
    setError(null)
    
    try {
      console.log('🔍 [Frontend] Starting status check...')
      console.log('🔍 [Frontend] Checkout ID:', checkoutId)
      console.log('🔍 [Frontend] Calling API route: /api/payment/check-status')
      
      // Call the API to check HyperPay status
      const response = await fetch(`/api/payment/check-status?checkoutId=${checkoutId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('🔍 [Frontend] API response status:', response.status)
      console.log('🔍 [Frontend] API response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ [Frontend] Status check successful:', result)
        setStatusResult(result)
        setLastCheckTime(new Date())
        
        // If payment is successful, show success message
        if (result.subscription) {
          console.log('🎉 [Frontend] Payment successful!')
        }
      } else {
        const errorData = await response.json()
        console.error('❌ [Frontend] API error response:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('💥 [Frontend] Error checking status:', error)
      setError(error instanceof Error ? error.message : 'Failed to check payment status')
    } finally {
      setIsCheckingStatus(false)
    }
  }

  // Auto-check status every 30 seconds for the first 5 minutes
  useEffect(() => {
    if (!checkoutId) return

    const interval = setInterval(() => {
      handleCheckStatus()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [checkoutId])

  // If we have a status result and it's successful, show success message
  if (statusResult?.subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Plan</dt>
                  <dd className="mt-1 text-sm text-gray-900">{statusResult.subscription.plan?.name || 'Unknown Plan'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-green-600">✅ Active</dd>
                </div>
              </div>
              <div className="mt-6">
                <button 
                  onClick={() => window.close()}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-medium text-yellow-800">Payment Pending</h2>
                <p className="text-sm text-yellow-600">Your payment is being processed</p>
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
                  <dt className="text-sm font-medium text-gray-500">Status Message</dt>
                  <dd className="mt-1 text-sm text-gray-900">{errorMessage}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-yellow-600">⏳ Pending</dd>
              </div>
              {checkoutId && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Checkout ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{checkoutId}</dd>
                </div>
              )}
              
              {lastCheckTime && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Check</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {lastCheckTime.toLocaleTimeString()}
                  </dd>
                </div>
              )}
              
              {error && (
                <div>
                  <dt className="text-sm font-medium text-red-500">Error</dt>
                  <dd className="mt-1 text-sm text-red-600">{error}</dd>
                </div>
              )}
            </div>
            
            <div className="mt-6 space-y-3">
              <button 
                onClick={async () => {
                  console.log('🧪 [Frontend] Testing simple API...')
                  try {
                    const response = await fetch('/api/test')
                    const result = await response.json()
                    console.log('🧪 [Frontend] Test API result:', result)
                    alert(`Test API working: ${result.message}`)
                  } catch (error) {
                    console.error('🧪 [Frontend] Test API error:', error)
                    alert('Test API failed')
                  }
                }}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Test API Route
              </button>
              
              <button 
                onClick={handleCheckStatus}
                disabled={isCheckingStatus}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isCheckingStatus ? 'Checking...' : 'Check Payment Status Now'}
              </button>
              
              <button 
                onClick={() => window.close()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Close
              </button>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Your payment is being processed. We'll automatically check the status every 30 seconds, 
                  or you can check manually. This window will close automatically when payment is confirmed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
