import { NextRequest, NextResponse } from 'next/server';
import { AIAPIService } from '@/lib/ai/api-integration';

const apiService = AIAPIService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, content, from } = body;

    if (!to || !subject || !content) {
      return NextResponse.json(
        { error: 'to, subject, and content are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const result = await apiService.sendEmail(to, subject, content, from);

    return NextResponse.json({
      success: true,
      emailId: result.id,
      message: 'Email sent successfully',
      metadata: {
        to,
        subject,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { 
        error: 'Email sending failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 