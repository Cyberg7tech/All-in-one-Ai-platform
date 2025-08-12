'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold mb-4'>Privacy Policy</h1>
            <p className='text-muted-foreground text-lg'>Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                We collect information you provide directly to us, such as when you create an account, use our
                AI services, or contact us for support.
              </p>
              <div>
                <h4 className='font-semibold mb-2'>Personal Information:</h4>
                <ul className='list-disc ml-6 space-y-1'>
                  <li>Name and email address</li>
                  <li>Account credentials</li>
                  <li>Payment information (processed securely through our payment providers)</li>
                  <li>Communication preferences</li>
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-2'>Usage Information:</h4>
                <ul className='list-disc ml-6 space-y-1'>
                  <li>AI prompts and generated content</li>
                  <li>Platform usage patterns and preferences</li>
                  <li>Device information and technical data</li>
                  <li>Log files and analytics data</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>We use the information we collect to:</p>
              <ul className='list-disc ml-6 space-y-2'>
                <li>Provide, maintain, and improve our AI services</li>
                <li>Process transactions and manage your account</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and provide customer service</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Train and improve our AI models (in anonymized form)</li>
                <li>Comply with legal obligations and protect our rights</li>
              </ul>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>3. AI Content and Data Processing</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                When you use our AI services, we process your inputs to generate responses. Here's how we
                handle this data:
              </p>
              <ul className='list-disc ml-6 space-y-2'>
                <li>Your prompts and generated content may be stored to provide the service</li>
                <li>We may use anonymized and aggregated data to improve our AI models</li>
                <li>We do not share your personal AI conversations with third parties</li>
                <li>You retain ownership of content you create using our platform</li>
                <li>We implement security measures to protect your data during processing</li>
              </ul>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>4. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                We do not sell or rent your personal information. We may share your information in limited
                circumstances:
              </p>
              <ul className='list-disc ml-6 space-y-2'>
                <li>
                  <strong>Service Providers:</strong> We work with third-party providers for payment
                  processing, analytics, and infrastructure
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights and
                  safety
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of
                  assets
                </li>
                <li>
                  <strong>Consent:</strong> When you explicitly consent to sharing
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>5. Data Security</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                We implement appropriate technical and organizational measures to protect your personal
                information:
              </p>
              <ul className='list-disc ml-6 space-y-2'>
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure payment processing through certified providers</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                We retain your information for as long as necessary to provide our services and fulfill legal
                obligations:
              </p>
              <ul className='list-disc ml-6 space-y-2'>
                <li>Account information: Until you delete your account</li>
                <li>AI conversation history: According to your settings and subscription plan</li>
                <li>Payment records: As required by law and for dispute resolution</li>
                <li>Analytics data: In anonymized form for service improvement</li>
              </ul>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>7. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>You have several rights regarding your personal information:</p>
              <ul className='list-disc ml-6 space-y-2'>
                <li>
                  <strong>Access:</strong> Request access to your personal information
                </li>
                <li>
                  <strong>Correction:</strong> Update or correct inaccurate information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal information
                </li>
                <li>
                  <strong>Portability:</strong> Request a copy of your data in a portable format
                </li>
                <li>
                  <strong>Opt-out:</strong> Unsubscribe from marketing communications
                </li>
                <li>
                  <strong>Account Settings:</strong> Control privacy settings in your account
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>8. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>We use cookies and similar technologies to enhance your experience:</p>
              <ul className='list-disc ml-6 space-y-2'>
                <li>Essential cookies for platform functionality</li>
                <li>Analytics cookies to understand usage patterns</li>
                <li>Preference cookies to remember your settings</li>
                <li>Authentication cookies to keep you logged in</li>
              </ul>
              <p>You can manage cookie preferences through your browser settings.</p>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>9. Third-Party AI Services</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Our platform integrates with various AI service providers (OpenAI, Anthropic, Google, etc.).
                When you use these services through our platform:
              </p>
              <ul className='list-disc ml-6 space-y-2'>
                <li>Your requests may be processed by these third-party providers</li>
                <li>Each provider has their own privacy policies and data practices</li>
                <li>We select providers with strong privacy and security commitments</li>
                <li>We limit data sharing to what's necessary for service provision</li>
              </ul>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>10. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Our platform is not intended for children under 13 years of age. We do not knowingly collect
                personal information from children under 13. If you are a parent or guardian and believe your
                child has provided us with personal information, please contact us.
              </p>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>11. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by
                posting the new privacy policy on this page and updating the "Last updated" date.
              </p>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>12. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us
                through our support channels or email us at your designated privacy contact.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
