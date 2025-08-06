'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { StripeCheckout } from '@/components/payments/stripe-checkout';
import { LemonSqueezyCheckout } from '@/components/payments/lemonsqueezy-checkout';
import { useAuth } from '@/contexts/auth-context';
import {
  Check,
  Shield,
  Zap,
  Users,
  Database,
  Crown,
  Bot,
  Image,
  Video,
  Music,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  CreditCard,
  Star,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const features = {
  starter: [
    '5 AI Tools Access',
    '1,000 API Calls/month',
    'Basic Support',
    'Community Access',
    'Standard Models',
    'Basic Analytics',
    'Email Support',
  ],
  pro: [
    'All 18+ AI Tools',
    '25,000 API Calls/month',
    'Priority Support',
    'Custom AI Agents',
    'Advanced Analytics',
    'API Access',
    'Premium Models',
    'Priority Support',
    'Custom Prompts',
    'Team Collaboration',
    'Advanced Security',
    'White-label Options',
  ],
  enterprise: [
    'Unlimited AI Tools',
    'Unlimited API Calls',
    '24/7 Dedicated Support',
    'White-label Solution',
    'Custom Integrations',
    'SLA Guarantee',
    'All Models + Custom',
    'Dedicated Account Manager',
    'Custom Development',
    'On-premise Deployment',
    'Advanced Security',
    'Compliance & Audit',
  ],
};

const aiTools = [
  { name: 'Content Writer', icon: FileText, category: 'writing' },
  { name: 'MultiLLM ChatGPT', icon: MessageSquare, category: 'chat' },
  { name: 'Chat with PDF', icon: FileText, category: 'document' },
  { name: 'Voice Transcription', icon: Music, category: 'audio' },
  { name: 'Headshot Generator', icon: Image, category: 'image' },
  { name: 'Image Generator', icon: Image, category: 'image' },
  { name: 'QR Generator', icon: Image, category: 'utility' },
  { name: 'Interior Design Generator', icon: Image, category: 'design' },
  { name: 'YouTube Content Generator', icon: Video, category: 'video' },
  { name: 'Image Upscaler', icon: Image, category: 'image' },
  { name: 'Chat with YouTube', icon: Video, category: 'video' },
  { name: 'Text to Speech', icon: Music, category: 'audio' },
  { name: 'Llama3 Chat', icon: MessageSquare, category: 'chat' },
  { name: 'Music Generator', icon: Music, category: 'audio' },
  { name: 'DeepSeek Chat', icon: MessageSquare, category: 'chat' },
  { name: 'Gemini Chat', icon: MessageSquare, category: 'chat' },
  { name: 'Ghibli Image Generator', icon: Image, category: 'image' },
  { name: 'Quiz & Flashcard Generator', icon: FileText, category: 'education' },
];

export default function PricingPage() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'lemonsqueezy'>('stripe');

  const getPricing = () => {
    if (billingCycle === 'yearly') {
      return {
        starter: { price: 0, originalPrice: 0 },
        pro: { price: 290, originalPrice: 348 }, // 2 months free
        enterprise: { price: 990, originalPrice: 1188 }, // 2 months free
      };
    }
    return {
      starter: { price: 0, originalPrice: 0 },
      pro: { price: 29, originalPrice: 29 },
      enterprise: { price: 99, originalPrice: 99 },
    };
  };

  const pricing = getPricing();

  const handleCheckout = (plan: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login?redirect=/pricing';
      return;
    }
    // Checkout logic will be handled by the payment components
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-background to-muted/20'>
      {/* Header */}
      <div className='container mx-auto px-4 py-16'>
        <div className='text-center max-w-4xl mx-auto'>
          <Badge variant='secondary' className='mb-4'>
            <Sparkles className='mr-2 size-3' />
            BuilderKit Pro Features
          </Badge>
          <h1 className='text-4xl md:text-6xl font-bold tracking-tight mb-6'>
            Choose Your
            <span className='block bg-gradient-to-r from-primary via-purple-600 to-cyan-600 bg-clip-text text-transparent'>
              AI Platform
            </span>
            Plan
          </h1>
          <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
            Start free, scale as you grow. All plans include our core BuilderKit Pro features with
            enterprise-grade security and support.
          </p>

          {/* Billing Toggle */}
          <div className='flex items-center justify-center space-x-4 mb-8'>
            <Label htmlFor='billing-toggle'>Monthly</Label>
            <Switch
              id='billing-toggle'
              checked={billingCycle === 'yearly'}
              onCheckedChange={(checked: boolean) => setBillingCycle(checked ? 'yearly' : 'monthly')}
            />
            <Label htmlFor='billing-toggle'>Yearly</Label>
            {billingCycle === 'yearly' && (
              <Badge variant='secondary' className='ml-2'>
                Save 17%
              </Badge>
            )}
          </div>

          {/* Payment Provider Toggle */}
          <div className='flex items-center justify-center space-x-4 mb-12'>
            <Button
              variant={paymentProvider === 'stripe' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setPaymentProvider('stripe')}>
              <CreditCard className='mr-2 size-4' />
              Stripe
            </Button>
            <Button
              variant={paymentProvider === 'lemonsqueezy' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setPaymentProvider('lemonsqueezy')}>
              <Star className='mr-2 size-4' />
              LemonSqueezy
            </Button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16'>
          {/* Starter Plan */}
          <Card className='relative border-2 hover:shadow-lg transition-shadow'>
            <CardHeader className='text-center pb-8'>
              <CardTitle className='text-2xl'>Starter</CardTitle>
              <div className='mt-4'>
                <span className='text-4xl font-bold'>$0</span>
                <span className='text-muted-foreground'>/month</span>
              </div>
              <p className='text-muted-foreground mt-2'>Perfect for getting started</p>
            </CardHeader>
            <CardContent className='space-y-4'>
              <ul className='space-y-3'>
                {features.starter.map((feature, index) => (
                  <li key={index} className='flex items-center'>
                    <Check className='size-4 text-green-500 mr-3' />
                    <span className='text-sm'>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className='w-full mt-6' variant='outline' asChild>
                <a href='/login'>Get Started Free</a>
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className='relative border-2 border-primary shadow-lg scale-105'>
            <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
              <Badge className='bg-primary text-primary-foreground px-3 py-1'>Most Popular</Badge>
            </div>
            <CardHeader className='text-center pb-8'>
              <CardTitle className='text-2xl'>Professional</CardTitle>
              <div className='mt-4'>
                <span className='text-4xl font-bold'>${pricing.pro.price}</span>
                <span className='text-muted-foreground'>/month</span>
                {billingCycle === 'yearly' && (
                  <div className='text-sm text-muted-foreground line-through'>
                    ${pricing.pro.originalPrice}/month
                  </div>
                )}
              </div>
              <p className='text-muted-foreground mt-2'>For growing businesses</p>
            </CardHeader>
            <CardContent className='space-y-4'>
              <ul className='space-y-3'>
                {features.pro.map((feature, index) => (
                  <li key={index} className='flex items-center'>
                    <Check className='size-4 text-green-500 mr-3' />
                    <span className='text-sm'>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className='w-full mt-6' onClick={() => handleCheckout('pro')}>
                Start Pro Trial
                <ArrowRight className='ml-2 size-4' />
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className='relative border-2 hover:shadow-lg transition-shadow'>
            <CardHeader className='text-center pb-8'>
              <CardTitle className='text-2xl'>Enterprise</CardTitle>
              <div className='mt-4'>
                <span className='text-4xl font-bold'>${pricing.enterprise.price}</span>
                <span className='text-muted-foreground'>/month</span>
                {billingCycle === 'yearly' && (
                  <div className='text-sm text-muted-foreground line-through'>
                    ${pricing.enterprise.originalPrice}/month
                  </div>
                )}
              </div>
              <p className='text-muted-foreground mt-2'>For large organizations</p>
            </CardHeader>
            <CardContent className='space-y-4'>
              <ul className='space-y-3'>
                {features.enterprise.map((feature, index) => (
                  <li key={index} className='flex items-center'>
                    <Check className='size-4 text-green-500 mr-3' />
                    <span className='text-sm'>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className='w-full mt-6' variant='outline' asChild>
                <a href='/contact'>Contact Sales</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Tools Showcase */}
        <div className='max-w-6xl mx-auto mb-16'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold mb-4'>18+ AI Tools Included</h2>
            <p className='text-muted-foreground'>
              Access to all the latest AI models and tools for content creation, analysis, and automation.
            </p>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
            {aiTools.map((tool, index) => (
              <Card key={index} className='text-center p-4 hover:shadow-md transition-shadow'>
                <div className='flex flex-col items-center space-y-2'>
                  <div className='p-2 rounded-lg bg-primary/10'>
                    <tool.icon className='size-6 text-primary' />
                  </div>
                  <span className='text-sm font-medium'>{tool.name}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Feature Comparison */}
        <div className='max-w-6xl mx-auto mb-16'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold mb-4'>Feature Comparison</h2>
            <p className='text-muted-foreground'>Compare what's included in each plan</p>
          </div>

          <Card>
            <CardContent className='p-6'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b'>
                      <th className='text-left py-4 font-medium'>Feature</th>
                      <th className='text-center py-4 font-medium'>Starter</th>
                      <th className='text-center py-4 font-medium'>Professional</th>
                      <th className='text-center py-4 font-medium'>Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className='border-b'>
                      <td className='py-4 font-medium'>AI Tools</td>
                      <td className='text-center py-4'>5</td>
                      <td className='text-center py-4'>18+</td>
                      <td className='text-center py-4'>Unlimited</td>
                    </tr>
                    <tr className='border-b'>
                      <td className='py-4 font-medium'>API Calls</td>
                      <td className='text-center py-4'>1,000/month</td>
                      <td className='text-center py-4'>25,000/month</td>
                      <td className='text-center py-4'>Unlimited</td>
                    </tr>
                    <tr className='border-b'>
                      <td className='py-4 font-medium'>Support</td>
                      <td className='text-center py-4'>Community</td>
                      <td className='text-center py-4'>Priority</td>
                      <td className='text-center py-4'>24/7 Dedicated</td>
                    </tr>
                    <tr className='border-b'>
                      <td className='py-4 font-medium'>Custom AI Agents</td>
                      <td className='text-center py-4'>-</td>
                      <td className='text-center py-4'>✓</td>
                      <td className='text-center py-4'>✓</td>
                    </tr>
                    <tr className='border-b'>
                      <td className='py-4 font-medium'>Advanced Analytics</td>
                      <td className='text-center py-4'>Basic</td>
                      <td className='text-center py-4'>Advanced</td>
                      <td className='text-center py-4'>Enterprise</td>
                    </tr>
                    <tr className='border-b'>
                      <td className='py-4 font-medium'>API Access</td>
                      <td className='text-center py-4'>-</td>
                      <td className='text-center py-4'>✓</td>
                      <td className='text-center py-4'>✓</td>
                    </tr>
                    <tr className='border-b'>
                      <td className='py-4 font-medium'>White-label</td>
                      <td className='text-center py-4'>-</td>
                      <td className='text-center py-4'>Options</td>
                      <td className='text-center py-4'>Full Solution</td>
                    </tr>
                    <tr>
                      <td className='py-4 font-medium'>SLA Guarantee</td>
                      <td className='text-center py-4'>-</td>
                      <td className='text-center py-4'>-</td>
                      <td className='text-center py-4'>✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Integration */}
        {paymentProvider === 'stripe' ? (
          <StripeCheckout userId={user?.id} userEmail={user?.email} className='mb-16' />
        ) : (
          <LemonSqueezyCheckout userId={user?.id} userEmail={user?.email} className='mb-16' />
        )}

        {/* FAQ Section */}
        <div className='max-w-4xl mx-auto mb-16'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold mb-4'>Frequently Asked Questions</h2>
            <p className='text-muted-foreground'>
              Everything you need to know about our pricing and features
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  Yes, all paid plans come with a 14-day free trial. No credit card required to start.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>What's included in support?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  Starter includes community support, Pro includes priority email support, and Enterprise
                  includes 24/7 dedicated support.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className='text-center'>
          <Card className='max-w-2xl mx-auto'>
            <CardContent className='p-8'>
              <h3 className='text-2xl font-bold mb-4'>Ready to get started?</h3>
              <p className='text-muted-foreground mb-6'>
                Join thousands of developers and businesses using our AI platform
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button size='lg' asChild>
                  <a href='/login'>
                    Start Free Trial
                    <ArrowRight className='ml-2 size-4' />
                  </a>
                </Button>
                <Button size='lg' variant='outline' asChild>
                  <a href='/contact'>Contact Sales</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
