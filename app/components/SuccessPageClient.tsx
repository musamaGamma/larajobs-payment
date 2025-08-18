'use client'

import { useEffect } from 'react'

interface SuccessPageClientProps {
  transactionId?: string | null
  amount?: string | null
}

export default function SuccessPageClient({ transactionId, amount }: SuccessPageClientProps) {
  // External function to handle close
  const handleClose = () => {
    console.log('Close button clicked, closing payment window');
    // Close the payment window directly
    window.close();
  }

  // Play success sound when component mounts
  useEffect(() => {
    playSuccessSound()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const playSuccessSound = () => {
    try {
      const audio = new Audio("/sounds/success.mp3")
      audio.volume = 0.5
      audio.play().catch((error) => {
        console.log("Could not play success sound:", error)
        // Fallback: Create a simple beep sound using Web Audio API
        createBeepSound()
      })
    } catch (error) {
      console.log("Error playing success sound:", error)
      // Fallback: Create a simple beep sound using Web Audio API
      createBeepSound()
    }
  }

  const createBeepSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log("Could not create beep sound:", error)
    }
  }

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
            {transactionId && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{transactionId}</dd>
              </div>
            )}
            {amount && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                <dd className="mt-1 text-sm text-gray-900">{amount}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-green-600">✅ Completed</dd>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <button 
              onClick={handleClose}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Close
            </button>
            <div className="text-center">
              <p className="text-xs text-gray-500">You will receive a confirmation email shortly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
