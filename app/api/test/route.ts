import { NextResponse } from 'next/server'

export async function GET() {
  console.log('🧪 [Test API] Test endpoint called')
  return NextResponse.json({ 
    message: 'Test API is working!',
    timestamp: new Date().toISOString()
  })
}
