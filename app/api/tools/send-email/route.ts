import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, content, from } = body;

    if (!to || !subject || !content) {
      return NextResponse.json(
        { error: 'To, subject, and content are required' },
        { status: 400 }
      );
    }

    // Validate email format (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    console.log('Email Tool API: Request received', {
      to,
      subject,
      contentLength: content.length,
      from: from || 'default'
    });

    // Email sending is not available in the simplified setup
    // Return a demo response with information about alternatives
    return NextResponse.json({
      success: true,
      id: `email_demo_${Date.now()}`,
      message: 'Email composition completed - sending not available in simplified setup',
      data: {
        to,
        subject,
        content,
        from: from || 'noreply@yourdomain.com',
        composed_at: new Date().toISOString()
      },
      note: `Email sending is not available in the simplified OpenAI + Together AI setup.

**Alternative Email Solutions:**

**1. Email Services:**
- **Resend**: Modern email API service (resend.com)
- **SendGrid**: Twilio SendGrid email delivery platform
- **Mailgun**: Email service for developers
- **Amazon SES**: Simple Email Service from AWS
- **Postmark**: Transactional email service

**2. Node.js Libraries:**
- **Nodemailer**: Most popular Node.js email library
- **@sendgrid/mail**: Official SendGrid Node.js library
- **node-ses**: Amazon SES client for Node.js

**3. Email Template Engines:**
- **MJML**: Responsive email framework
- **React Email**: Build emails with React components
- **Email Templates**: Pre-built responsive templates

**Email Composed:**
**To**: ${to}
**Subject**: ${subject}
**Content**: ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}
${from ? `**From**: ${from}` : ''}

*To send real emails, integrate one of the email services above.*`,
      metadata: {
        simplified_setup: true,
        available_providers: ['OpenAI', 'Together AI'],
        email_sending_available: false,
        recipient: to,
        subject_length: subject.length,
        content_length: content.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Email tool error:', error);
    return NextResponse.json(
      { 
        error: 'Email request failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        note: 'Email sending is not available in the simplified OpenAI + Together AI setup.'
      },
      { status: 500 }
    );
  }
} 