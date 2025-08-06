'use client';
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Shield, Zap, Users, Database, Crown } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  stripePriceId: string;
  description: string;
}

const plans: PricingPlan[] = [
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
    stripePriceId: '',
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
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
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
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || '',
  },
];

interface StripeCheckoutProps {
  userId?: string;
  userEmail?: string;
  onSuccess?: (subscriptionId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function StripeCheckout({
  userId,
  userEmail,
  onSuccess,
  onError,
  className = '',
}: StripeCheckoutProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (plan: PricingPlan) => {
    if (!plan.stripePriceId) {
      setError('This plan is not available for checkout');
      return;
    }

    setLoading(plan.id);
    setError(null);

    try {
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId,
          userEmail,
          planId: plan.id,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      const { sessionId, error: checkoutError } = await response.json();

      if (checkoutError) {
        throw new Error(checkoutError);
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
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
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`relative border-2 transition-all hover:shadow-lg ${
            plan.popular
              ? 'border-primary shadow-lg scale-105'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}>
          {plan.popular && (
            <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
              <Badge className='bg-primary text-primary-foreground px-3 py-1'>Most Popular</Badge>
            </div>
          )}

          <CardHeader className='text-center pb-8'>
            <CardTitle className='text-2xl'>{plan.name}</CardTitle>
            <div className='mt-4'>
              <span className='text-4xl font-bold'>${plan.price}</span>
              <span className='text-muted-foreground'>/{plan.interval}</span>
            </div>
            <p className='text-muted-foreground mt-2'>{plan.description}</p>
          </CardHeader>

          <CardContent className='space-y-4'>
            <ul className='space-y-3'>
              {plan.features.map((feature, index) => (
                <li key={index} className='flex items-center'>
                  <div className='text-green-500 mr-3'>{getFeatureIcon(feature)}</div>
                  <span className='text-sm'>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className='w-full mt-6'
              variant={plan.popular ? 'default' : 'outline'}
              onClick={() => handleCheckout(plan)}
              disabled={loading === plan.id || !plan.stripePriceId}>
              {loading === plan.id ? (
                <div className='flex items-center'>
                  <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2' />
                  Processing...
                </div>
              ) : plan.price === 0 ? (
                'Get Started Free'
              ) : (
                <div className='flex items-center'>
                  <CreditCard className='mr-2 size-4' />
                  Subscribe Now
                </div>
              )}
            </Button>

            {plan.price === 0 && (
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

// Customer Portal component for managing subscriptions
export function StripeCustomerPortal({ customerId }: { customerId: string }) {
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/create-portal-session', {
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
          <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2' />
          Loading...
        </div>
      ) : (
        <div className='flex items-center'>
          <CreditCard className='mr-2 size-4' />
          Manage Subscription
        </div>
      )}
    </Button>
  );
}
