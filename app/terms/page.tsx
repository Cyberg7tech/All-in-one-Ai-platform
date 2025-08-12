'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold mb-4'>Terms of Service</h1>
            <p className='text-muted-foreground text-lg'>Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                By accessing and using this AI platform, you accept and agree to be bound by the terms and
                provision of this agreement.
              </p>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>2. Use License</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Permission is granted to temporarily access and use this platform for personal, non-commercial
                transitory viewing only.
              </p>
              <p>
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className='list-disc ml-6 space-y-2'>
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the platform</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>3. AI-Generated Content</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                The AI platform generates content based on user inputs. While we strive for accuracy and
                quality:
              </p>
              <ul className='list-disc ml-6 space-y-2'>
                <li>Generated content may not always be accurate or appropriate</li>
                <li>Users are responsible for reviewing and verifying AI-generated content before use</li>
                <li>We do not guarantee the accuracy, completeness, or reliability of AI outputs</li>
                <li>Users retain rights to content they create using our platform</li>
              </ul>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>4. User Data and Privacy</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use
                of the platform, to understand our practices.
              </p>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>5. Prohibited Uses</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>You may not use our platform:</p>
              <ul className='list-disc ml-6 space-y-2'>
                <li>For any unlawful purpose or to solicit others to unlawful acts</li>
                <li>
                  To violate any international, federal, provincial, or state regulations, rules, laws, or
                  local ordinances
                </li>
                <li>
                  To infringe upon or violate our intellectual property rights or the intellectual property
                  rights of others
                </li>
                <li>
                  To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate
                </li>
                <li>To submit false or misleading information</li>
                <li>To generate harmful, illegal, or inappropriate content</li>
              </ul>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>6. Subscription and Billing</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Some features of our platform may require a paid subscription. By subscribing, you agree to
                pay all fees associated with your chosen plan.
              </p>
              <ul className='list-disc ml-6 space-y-2'>
                <li>Subscription fees are billed in advance on a recurring basis</li>
                <li>You may cancel your subscription at any time</li>
                <li>Refunds are provided according to our refund policy</li>
                <li>We reserve the right to change pricing with notice</li>
              </ul>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>7. Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                The information on this platform is provided on an 'as is' basis. To the fullest extent
                permitted by law, we exclude all representations, warranties, and conditions relating to our
                platform and the use of this platform.
              </p>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>8. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                If you have any questions about these Terms of Service, please contact us through our support
                channels.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
