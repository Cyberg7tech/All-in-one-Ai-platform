'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, HelpCircle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Message sent successfully!',
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general',
      });
    } catch (error) {
      toast({
        title: 'Error sending message',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      value: 'support@ai-platform.com',
      action: 'mailto:support@ai-platform.com',
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: '24/7 chat support',
      value: 'Available now',
      action: '#',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Business hours only',
      value: '+1 (555) 123-4567',
      action: 'tel:+15551234567',
    },
    {
      icon: MapPin,
      title: 'Office Location',
      description: 'Visit our headquarters',
      value: 'San Francisco, CA',
      action: '#',
    },
  ];

  const supportCategories = [
    { id: 'general', name: 'General Inquiry', icon: HelpCircle },
    { id: 'technical', name: 'Technical Support', icon: Zap },
    { id: 'billing', name: 'Billing & Payments', icon: Mail },
    { id: 'feature', name: 'Feature Request', icon: MessageSquare },
  ];

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold mb-4'>Contact Us</h1>
            <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
              Have questions about our AI platform? We're here to help. Reach out to our team for support,
              sales inquiries, or partnership opportunities.
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Contact Form */}
            <div className='lg:col-span-2'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Send className='size-5' />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className='space-y-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='name'>Name *</Label>
                        <Input
                          id='name'
                          name='name'
                          type='text'
                          placeholder='Your full name'
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='email'>Email *</Label>
                        <Input
                          id='email'
                          name='email'
                          type='email'
                          placeholder='your.email@example.com'
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='category'>Category</Label>
                      <select
                        id='category'
                        name='category'
                        value={formData.category}
                        onChange={handleInputChange}
                        className='w-full p-2 border border-input rounded-md bg-background'>
                        {supportCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='subject'>Subject *</Label>
                      <Input
                        id='subject'
                        name='subject'
                        type='text'
                        placeholder='Brief description of your inquiry'
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='message'>Message *</Label>
                      <Textarea
                        id='message'
                        name='message'
                        placeholder='Please provide details about your inquiry...'
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <Button type='submit' disabled={isSubmitting} className='w-full'>
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className='space-y-6'>
              {/* Contact Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {contactInfo.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors'>
                      <div className='shrink-0'>
                        <item.icon className='size-5 text-primary' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-medium'>{item.title}</h4>
                        <p className='text-sm text-muted-foreground'>{item.description}</p>
                        <p className='text-sm font-medium'>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Clock className='size-5' />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span>Monday - Friday</span>
                      <span className='font-medium'>9:00 AM - 6:00 PM PST</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Saturday</span>
                      <span className='font-medium'>10:00 AM - 4:00 PM PST</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Sunday</span>
                      <span className='font-medium'>Closed</span>
                    </div>
                  </div>
                  <div className='mt-4 p-3 bg-muted rounded-lg'>
                    <p className='text-sm text-muted-foreground'>
                      <strong>Note:</strong> Email support is available 24/7. We typically respond within 2-4
                      hours during business hours.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Help</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='space-y-2'>
                    <h4 className='font-medium'>Need immediate help?</h4>
                    <div className='space-y-2'>
                      <Badge variant='outline' className='w-full justify-start'>
                        Check our FAQ section
                      </Badge>
                      <Badge variant='outline' className='w-full justify-start'>
                        Browse documentation
                      </Badge>
                      <Badge variant='outline' className='w-full justify-start'>
                        Join our community
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
