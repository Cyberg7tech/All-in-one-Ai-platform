'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Shield, Zap, Users, Database, Crown, Star } from 'lucide-react';

interface LemonSqueezyProduct {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  lemonSqueezyVariantId: string;
  description: string;
}

const products: LemonSqueezyProduct[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    interval: 'month',
    description: 'Perfect for getting started',
    features: [
      '5 AI Tools Access',
      '1,000 API Calls/month',
      'Basic Support',
      'Community Access',
      'Standard Models',
    ],
    lemonSqueezyVariantId: '',
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 29,
    interval: 'month',
    description: 'For growing businesses',
    popular: true,
    features: [
      'All 18+ AI Tools',
      '25,000 API Calls/month',
      'Priority Support',
      'Custom AI Agents',
      'Advanced Analytics',
      'API Access',
      'Premium Models',
    ],
    lemonSqueezyVariantId: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRO_VARIANT_ID || '',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    description: 'For large organizations',
    features: [
      'Unlimited AI Tools',
      'Unlimited API Calls',
      '24/7 Dedicated Support',
      'White-label Solution',
      'Custom Integrations',
      'SLA Guarantee',
      'All Models + Custom',
    ],
    lemonSqueezyVariantId: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_ENTERPRISE_VARIANT_ID || '',
  },
];

interface LemonSqueezyCheckoutProps {
  userId?: string;
  userEmail?: string;
  onError?: (error: string) => void;
  className?: string;
}

export function LemonSqueezyCheckout({
  userId,
  userEmail,
  onError,
  className = '',
}: LemonSqueezyCheckoutProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (product: LemonSqueezyProduct) => {
    if (!product.lemonSqueezyVariantId) {
      setError('This plan is not available for checkout');
      return;
    }

    setLoading(product.id);
    setError(null);

    try {
      const response = await fetch('/api/payments/lemonsqueezy/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId: product.lemonSqueezyVariantId,
          userId,
          userEmail,
          productId: product.id,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      const { checkoutUrl, error: checkoutError } = await response.json();

      if (checkoutError) {
        throw new Error(checkoutError);
      }

      // Redirect to LemonSqueezy checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Checkout failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('Support')) return <Shield className='size-4' />;
    if (feature.includes('API')) return <Database className='size-4' />;
    if (feature.includes('Analytics')) return <Zap className='size-4' />;
    if (feature.includes('Agents')) return <Users className='size-4' />;
    if (feature.includes('Models')) return <Crown className='size-4' />;
    return <Check className='size-4' />;
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto ${className}`}>
      {products.map((product) => (
        <Card
          key={product.id}
          className={`relative border-2 transition-all hover:shadow-lg ${
            product.popular
              ? 'border-primary shadow-lg scale-105'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}>
          {product.popular && (
            <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
              <Badge className='bg-primary text-primary-foreground px-3 py-1'>Most Popular</Badge>
            </div>
          )}

          <CardHeader className='text-center pb-8'>
            <CardTitle className='text-2xl'>{product.name}</CardTitle>
            <div className='mt-4'>
              <span className='text-4xl font-bold'>${product.price}</span>
              <span className='text-muted-foreground'>/{product.interval}</span>
            </div>
            <p className='text-muted-foreground mt-2'>{product.description}</p>
          </CardHeader>

          <CardContent className='space-y-4'>
            <ul className='space-y-3'>
              {product.features.map((feature, index) => (
                <li key={index} className='flex items-center'>
                  <div className='text-green-500 mr-3'>{getFeatureIcon(feature)}</div>
                  <span className='text-sm'>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className='w-full mt-6'
              variant={product.popular ? 'default' : 'outline'}
              onClick={() => handleCheckout(product)}
              disabled={loading === product.id || !product.lemonSqueezyVariantId}>
              {loading === product.id ? (
                <div className='flex items-center'>
                  <div className='size-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2' />
                  Processing...
                </div>
              ) : product.price === 0 ? (
                'Get Started Free'
              ) : (
                <div className='flex items-center'>
                  <Star className='mr-2 size-4' />
                  Subscribe Now
                </div>
              )}
            </Button>

            {product.price === 0 && (
              <p className='text-xs text-center text-muted-foreground'>No credit card required</p>
            )}
          </CardContent>
        </Card>
      ))}

      {error && (
        <div className='col-span-full'>
          <div className='bg-red-50 border border-red-200 rounded-md p-4 text-red-700'>{error}</div>
        </div>
      )}
    </div>
  );
}

// LemonSqueezy customer portal component
export function LemonSqueezyCustomerPortal({ customerId }: { customerId: string }) {
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/lemonsqueezy/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: `${window.location.origin}/dashboard`,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      window.location.href = url;
    } catch (err) {
      console.error('Failed to open customer portal:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleManageSubscription} disabled={loading} variant='outline' className='w-full'>
      {loading ? (
        <div className='flex items-center'>
          <div className='size-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2' />
          Loading...
        </div>
      ) : (
        <div className='flex items-center'>
          <Star className='mr-2 size-4' />
          Manage Subscription
        </div>
      )}
    </Button>
  );
}

// Webhook handler for LemonSqueezy events
export function useLemonSqueezyWebhook() {
  const [webhookData, setWebhookData] = useState<any>(null);

  useEffect(() => {
    const handleWebhook = (event: MessageEvent) => {
      if (event.data && event.data.type === 'lemonsqueezy:checkout:completed') {
        setWebhookData(event.data);
        // Handle successful checkout
        console.log('LemonSqueezy checkout completed:', event.data);
      }
    };

    window.addEventListener('message', handleWebhook);
    return () => window.removeEventListener('message', handleWebhook);
  }, []);

  return webhookData;
}
