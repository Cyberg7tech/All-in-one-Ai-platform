import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const LEMON_SQUEEZY_WEBHOOK_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature')!;

    // Verify webhook signature
    const hmac = crypto.createHmac('sha256', LEMON_SQUEEZY_WEBHOOK_SECRET);
    hmac.update(body);
    const digest = hmac.digest('hex');

    if (signature !== digest) {
      console.error('LemonSqueezy webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const { meta, data } = event;

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

    switch (meta.event_name) {
      case 'order_created': {
        const order = data;
        const userId = order.attributes.custom?.user_id;

        if (userId) {
          // Update user subscription status
          await supabase
            .from('users')
            .update({
              subscription_status: 'active',
              subscription_id: order.id.toString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          // Log successful order
          await supabase.from('activities').insert({
            user_id: userId,
            type: 'payment',
            name: 'Order Created',
            description: `Order #${order.attributes.identifier} created successfully`,
            icon: 'check-circle',
            metadata: {
              order_id: order.id,
              order_identifier: order.attributes.identifier,
              total: order.attributes.total,
              currency: order.attributes.currency,
            },
          });
        }
        break;
      }

      case 'subscription_created': {
        const subscription = data;
        const userId = subscription.attributes.custom?.user_id;

        if (userId) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'active',
              subscription_id: subscription.id.toString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }
        break;
      }

      case 'subscription_updated': {
        const subscription = data;
        const userId = subscription.attributes.custom?.user_id;

        if (userId) {
          const status = subscription.attributes.status === 'active' ? 'active' : 'inactive';
          await supabase
            .from('users')
            .update({
              subscription_status: status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }
        break;
      }

      case 'subscription_cancelled': {
        const subscription = data;
        const userId = subscription.attributes.custom?.user_id;

        if (userId) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }
        break;
      }

      case 'invoice_paid': {
        const invoice = data;
        const userId = invoice.attributes.custom?.user_id;

        if (userId) {
          // Log successful payment
          await supabase.from('activities').insert({
            user_id: userId,
            type: 'payment',
            name: 'Payment Successful',
            description: `Payment of $${(invoice.attributes.total / 100).toFixed(2)} processed successfully`,
            icon: 'check-circle',
            metadata: {
              invoice_id: invoice.id,
              total: invoice.attributes.total,
              currency: invoice.attributes.currency,
            },
          });
        }
        break;
      }

      case 'invoice_payment_failed': {
        const invoice = data;
        const userId = invoice.attributes.custom?.user_id;

        if (userId) {
          // Log failed payment
          await supabase.from('activities').insert({
            user_id: userId,
            type: 'payment',
            name: 'Payment Failed',
            description: `Payment of $${(invoice.attributes.total / 100).toFixed(2)} failed`,
            icon: 'alert-circle',
            metadata: {
              invoice_id: invoice.id,
              total: invoice.attributes.total,
              currency: invoice.attributes.currency,
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('LemonSqueezy webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
