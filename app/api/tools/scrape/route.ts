import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      url, 
      formats = ['text'], 
      onlyMainContent = true
    } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log('Web Scraping API: Request received', {
      url,
      formats,
      onlyMainContent
    });

    // Web scraping is not available in the simplified setup
    // Return a demo response with information about alternatives
    return NextResponse.json({
      success: true,
      data: {
        url,
        title: `Content from ${new URL(url).hostname}`,
        content: `Web scraping is not available in the simplified OpenAI + Together AI setup.

**Alternative Solutions:**

**1. Browser Extensions:**
- **Mercury Reader**: Clean text extraction
- **SingleFile**: Save complete web pages
- **Web Scraper**: Chrome extension for data extraction

**2. Online Tools:**
- **Archive.today**: Save and extract web content
- **Wayback Machine**: Archive.org historical content
- **ReadabilityAPI**: Extract clean text from URLs

**3. Developer Tools:**
- **Puppeteer**: Node.js library for web scraping
- **Playwright**: Cross-browser automation
- **Beautiful Soup**: Python library for parsing HTML
- **Scrapy**: Python framework for web scraping

**4. API Services:**
- **ScrapingBee**: Professional scraping API
- **ScrapeOwl**: Web scraping as a service
- **Apify**: Web scraping and automation platform

**Requested URL**: ${url}
**Formats**: ${formats.join(', ')}
**Main content only**: ${onlyMainContent ? 'Yes' : 'No'}

*To implement real web scraping, consider using one of the alternatives above or integrate a dedicated scraping service.*`,
        metadata: {
          timestamp: new Date().toISOString(),
          formats_requested: formats,
          main_content_only: onlyMainContent,
          simplified_setup: true
        }
      },
      note: 'Web scraping is not available in the simplified setup. See content for alternatives.'
    });

  } catch (error) {
    console.error('Web scraping error:', error);
    return NextResponse.json(
      { 
        error: 'Web scraping request failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        note: 'Web scraping is not available in the simplified OpenAI + Together AI setup.'
      },
      { status: 500 }
    );
  }
} 