import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text, from, replyTo, attachments } = await request.json();

    // Get user from Supabase for authentication
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: from || 'All-in-One AI Platform <noreply@yourdomain.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo: replyTo,
      attachments,
    });

    if (error) {
      console.error('Resend email error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Log email activity
    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'email',
      name: 'Email Sent',
      description: `Email sent to ${Array.isArray(to) ? to.join(', ') : to}`,
      icon: 'mail',
      metadata: {
        email_id: data?.id,
        subject,
        recipients: to,
        status: 'sent',
      },
    });

    return NextResponse.json({
      success: true,
      emailId: data?.id,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailId = searchParams.get('email_id');

    if (!emailId) {
      return NextResponse.json({ error: 'Email ID required' }, { status: 400 });
    }

    // Get email status from Resend
    const { data, error } = await resend.emails.get(emailId);

    if (error) {
      console.error('Resend email retrieval error:', error);
      return NextResponse.json({ error: 'Failed to retrieve email' }, { status: 500 });
    }

    return NextResponse.json({ email: data });
  } catch (error) {
    console.error('Email retrieval error:', error);
    return NextResponse.json({ error: 'Failed to retrieve email' }, { status: 500 });
  }
}
