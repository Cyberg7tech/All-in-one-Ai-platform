'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Star, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: Record<string, any>;
}

interface UserSubscription {
  status: string;
  plan: string;
  provider: string;
  start_date: string;
  end_date: string;
}

export default function PaymentManager() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'lemonsqueezy'>('stripe');

  useEffect(() => {
    fetchPlans();
    fetchUserSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/user');
      if (response.ok) {
        const data = await response.json();
        setUserSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }

    setProcessing(true);
    try {
      const plan = plans.find((p) => p.id === planId);
      if (!plan) {
        toast.error('Plan not found');
        return;
      }

      const priceId = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;

      const endpoint = paymentProvider === 'stripe' ? '/api/payments/stripe' : '/api/payments/lemonsqueezy';

      const payload = paymentProvider === 'stripe' ? { priceId } : { variantId: priceId };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to process subscription');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!userSubscription) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: userSubscription.provider }),
      });

      if (response.ok) {
        toast.success('Subscription cancelled successfully');
        fetchUserSubscription();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className='bg-green-100 text-green-800'>
            <CheckCircle className='size-3 mr-1' />
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant='secondary'>
            <AlertCircle className='size-3 mr-1' />
            Inactive
          </Badge>
        );
      case 'canceled':
        return (
          <Badge variant='destructive'>
            <AlertCircle className='size-3 mr-1' />
            Canceled
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='size-6 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Current Subscription */}
      {userSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='size-5' />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <p className='text-sm font-medium text-gray-500'>Status</p>
                <div className='mt-1'>{getStatusBadge(userSubscription.status)}</div>
              </div>
              <div>
                <p className='text-sm font-medium text-gray-500'>Plan</p>
                <p className='mt-1 font-semibold'>{userSubscription.plan}</p>
              </div>
              <div>
                <p className='text-sm font-medium text-gray-500'>Provider</p>
                <p className='mt-1 font-semibold capitalize'>{userSubscription.provider}</p>
              </div>
            </div>
            {userSubscription.status === 'active' && (
              <div className='mt-4 pt-4 border-t'>
                <Button variant='outline' onClick={handleCancelSubscription} disabled={processing}>
                  {processing ? <Loader2 className='size-4 mr-2 animate-spin' /> : null}
                  Cancel Subscription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Provider</CardTitle>
          <CardDescription>Choose your preferred payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={paymentProvider}
            onValueChange={(value) => setPaymentProvider(value as 'stripe' | 'lemonsqueezy')}>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='stripe' className='flex items-center gap-2'>
                <CreditCard className='size-4' />
                Stripe
              </TabsTrigger>
              <TabsTrigger value='lemonsqueezy' className='flex items-center gap-2'>
                <Star className='size-4' />
                LemonSqueezy
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {plans.map((plan) => (
          <Card key={plan.id} className='relative'>
            {plan.name === 'Pro' && (
              <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                <Badge className='bg-gradient-to-r from-purple-500 to-pink-500 text-white'>
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className='text-center'>{plan.name}</CardTitle>
              <CardDescription className='text-center'>{plan.description}</CardDescription>
              <div className='text-center'>
                <div className='flex items-center justify-center gap-2'>
                  <DollarSign className='size-4' />
                  <span className='text-3xl font-bold'>
                    ${billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly}
                  </span>
                  <span className='text-sm text-gray-500'>
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {billingCycle === 'yearly' && plan.price_yearly < plan.price_monthly * 12 && (
                  <p className='text-sm text-green-600 mt-1'>
                    Save ${(plan.price_monthly * 12 - plan.price_yearly).toFixed(0)}/year
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className='space-y-2 mb-6'>
                {plan.features.map((feature, index) => (
                  <li key={index} className='flex items-center gap-2'>
                    <CheckCircle className='size-4 text-green-500' />
                    <span className='text-sm'>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className='w-full'
                onClick={() => handleSubscribe(plan.id)}
                disabled={
                  processing ||
                  (userSubscription?.status === 'active' && userSubscription?.plan === plan.name)
                }>
                {processing ? (
                  <Loader2 className='size-4 mr-2 animate-spin' />
                ) : userSubscription?.status === 'active' && userSubscription?.plan === plan.name ? (
                  'Current Plan'
                ) : (
                  'Subscribe'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Billing Cycle Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Cycle</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={billingCycle}
            onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='monthly'>Monthly</TabsTrigger>
              <TabsTrigger value='yearly'>Yearly (Save 20%)</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert>
        <AlertCircle className='size-4' />
        <AlertDescription>
          All payments are processed securely through{' '}
          {paymentProvider === 'stripe' ? 'Stripe' : 'LemonSqueezy'}. Your payment information is never stored
          on our servers.
        </AlertDescription>
      </Alert>
    </div>
  );
}
