'use client'

import { useState, useEffect } from 'react'

interface PendingPageClientProps {
  errorCode?: string | null
  errorMessage?: string | null
  checkoutId?: string | null
}

export default function PendingPageClient({ errorCode, errorMessage, checkoutId }: PendingPageClientProps) {
  console.log('PendingPageClient: Rendering with props:', { errorCode, errorMessage, checkoutId })
  
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [statusResult, setStatusResult] = useState<any>(null)
  const [autoCheckCount, setAutoCheckCount] = useState(0)
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null)

  // Auto-check status every 30 seconds for the first 5 minutes
  useEffect(() => {
    if (!checkoutId || autoCheckCount >= 10) return // Stop after 10 checks (5 minutes)

    const interval = setInterval(() => {
      handleCheckStatus()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [checkoutId, autoCheckCount])

  // Function to check payment status
  const handleCheckStatus = async () => {
    if (!checkoutId) return
    
    setIsCheckingStatus(true)
    try {
      // Call the backend API to check HyperPay status
      const response = await fetch(`http://localhost:4000/payment/check-status?checkoutId=${checkoutId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const result = await response.json()
        setStatusResult(result)
        setLastCheckTime(new Date())
        
        // If payment is successful, stop auto-checking
        if (result.subscription) {
          setAutoCheckCount(10) // Stop auto-checking
        } else {
          setAutoCheckCount(prev => prev + 1)
        }
      } else {
        console.error('Failed to check status:', response.statusText)
        setAutoCheckCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error checking status:', error)
      setAutoCheckCount(prev => prev + 1)
    } finally {
      setIsCheckingStatus(false)
    }
  }

  // External function to handle close
  const handleClose = () => {
    console.log('Close button clicked, closing payment window');
    // Close the payment window directly
    window.close();
  }

  // If we have a status result and it's successful, show success message
  if (statusResult?.subscription) {
    return (
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
                onClick={handleClose}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
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
            
            {lastCheckTime && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Check</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {lastCheckTime.toLocaleTimeString()}
                </dd>
              </div>
            )}
            
            {autoCheckCount > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Auto-checks</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {autoCheckCount}/10 (every 30 seconds)
                </dd>
              </div>
            )}
          </div>
          
          <div className="mt-6 space-y-3">
            <button 
              onClick={handleCheckStatus}
              disabled={isCheckingStatus}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isCheckingStatus ? 'Checking...' : 'Check Payment Status Now'}
            </button>
            
            <button 
              onClick={handleClose}
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
  )
}
