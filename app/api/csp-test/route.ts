import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { message: 'CSP test endpoint' },
    { 
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
}
