import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Check if the Apple Pay domain association file exists
    const filePath = path.join(process.cwd(), 'public', '.well-known', 'apple-developer-merchantid-domain-association.txt');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { 
          error: 'Apple Pay domain association file not found',
          path: filePath 
        },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    return NextResponse.json({
      success: true,
      message: 'Apple Pay domain association file is properly configured',
      filePath: '/.well-known/apple-developer-merchantid-domain-association.txt',
      contentLength: fileContent.length,
      content: fileContent,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to read Apple Pay domain association file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
