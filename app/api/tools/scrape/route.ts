import { NextRequest, NextResponse } from 'next/server';
import { AIAPIService } from '@/lib/ai/api-integration';

const apiService = AIAPIService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, formats = ['markdown'], onlyMainContent = true } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const result = await apiService.scrapeWebsite(url, {
      formats,
      onlyMainContent,
      excludeTags: ['script', 'style', 'nav', 'footer', 'aside']
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      url,
      metadata: {
        formats,
        onlyMainContent,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Web scraping error:', error);
    return NextResponse.json(
      { 
        error: 'Web scraping failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 