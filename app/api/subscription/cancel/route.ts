import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json();

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

    // Get user subscription info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_id, subscription_provider')
      .eq('id', user.id)
      .single();

    if (userError || !userData.subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    if (provider === 'stripe' && userData.subscription_provider === 'stripe') {
      // Cancel Stripe subscription
      try {
        await stripe.subscriptions.update(userData.subscription_id, {
          cancel_at_period_end: true,
        });

        // Update user subscription status
        await supabase
          .from('users')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        // Log cancellation activity
        await supabase.from('activities').insert({
          user_id: user.id,
          type: 'subscription',
          name: 'Subscription Cancelled',
          description: 'Subscription cancelled successfully',
          icon: 'x-circle',
          metadata: {
            provider: 'stripe',
            subscription_id: userData.subscription_id,
          },
        });

        return NextResponse.json({ success: true });
      } catch (stripeError) {
        console.error('Stripe cancellation error:', stripeError);
        return NextResponse.json({ error: 'Failed to cancel Stripe subscription' }, { status: 500 });
      }
    } else if (provider === 'lemonsqueezy' && userData.subscription_provider === 'lemonsqueezy') {
      // Cancel LemonSqueezy subscription
      try {
        const response = await fetch(
          `${process.env.LEMON_SQUEEZY_BASE_URL}/api/v1/subscriptions/${userData.subscription_id}`,
          {
            method: 'DELETE',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to cancel LemonSqueezy subscription');
        }

        // Update user subscription status
        await supabase
          .from('users')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        // Log cancellation activity
        await supabase.from('activities').insert({
          user_id: user.id,
          type: 'subscription',
          name: 'Subscription Cancelled',
          description: 'Subscription cancelled successfully',
          icon: 'x-circle',
          metadata: {
            provider: 'lemonsqueezy',
            subscription_id: userData.subscription_id,
          },
        });

        return NextResponse.json({ success: true });
      } catch (lemonsqueezyError) {
        console.error('LemonSqueezy cancellation error:', lemonsqueezyError);
        return NextResponse.json({ error: 'Failed to cancel LemonSqueezy subscription' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid provider or subscription type mismatch' }, { status: 400 });
    }
  } catch (error) {
    console.error('Cancel subscription API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
