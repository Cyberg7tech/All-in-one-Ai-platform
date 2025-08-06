import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY!;
const LEMON_SQUEEZY_BASE_URL = process.env.LEMON_SQUEEZY_BASE_URL!;
const LEMON_SQUEEZY_STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID!;

export async function POST(request: NextRequest) {
  try {
    const { variantId, successUrl } = await request.json();

    // Get user from Supabase
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

    // Create LemonSqueezy checkout session
    const response = await fetch(`${LEMON_SQUEEZY_BASE_URL}/api/v1/checkouts`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LEMON_SQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            store_id: parseInt(LEMON_SQUEEZY_STORE_ID),
            variant_id: parseInt(variantId),
            custom_price: null,
            product_options: {
              enabled: true,
              redirect_url: successUrl || `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
              receipt_button_text: 'Go to Dashboard',
              receipt_link_url: `${process.env.NEXTAUTH_URL}/dashboard`,
            },
            checkout_options: {
              embed: false,
              media: false,
              logo: false,
            },
            checkout_data: {
              email: user.email,
              name: user.user_metadata?.name || user.email,
              custom: {
                user_id: user.id,
              },
            },
            expires_at: null,
            test_mode: process.env.NODE_ENV === 'development' ? 1 : 0,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LemonSqueezy API error:', errorData);
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    const checkoutData = await response.json();
    const checkout = checkoutData.data;

    return NextResponse.json({
      checkoutId: checkout.id,
      url: checkout.attributes.url,
    });
  } catch (error) {
    console.error('LemonSqueezy checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutId = searchParams.get('checkout_id');

    if (!checkoutId) {
      return NextResponse.json({ error: 'Checkout ID required' }, { status: 400 });
    }

    const response = await fetch(`${LEMON_SQUEEZY_BASE_URL}/api/v1/checkouts/${checkoutId}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${LEMON_SQUEEZY_API_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to retrieve checkout' }, { status: 500 });
    }

    const checkoutData = await response.json();
    return NextResponse.json({ checkout: checkoutData.data });
  } catch (error) {
    console.error('LemonSqueezy checkout retrieval error:', error);
    return NextResponse.json({ error: 'Failed to retrieve checkout' }, { status: 500 });
  }
}
