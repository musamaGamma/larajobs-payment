import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const checkoutId = searchParams.get('checkoutId')
    
    if (!checkoutId) {
      return NextResponse.json(
        { error: 'Checkout ID is required' },
        { status: 400 }
      )
    }

    // Call the backend API directly at the correct endpoint
    const backendUrl = 'http://localhost:4000'
    const endpoint = `/payment/hyperpay/status?checkoutId=${checkoutId}`
    
    console.log(`[API] Calling backend at: ${backendUrl}${endpoint}`)
    
    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[API] Backend error ${response.status}:`, errorText)
      throw new Error(`Backend API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log(`[API] Backend response:`, data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API] Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Failed to check payment status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
