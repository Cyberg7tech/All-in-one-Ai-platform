'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeData {
  id: string;
  type: string;
  content: string;
  qrCodeUrl: string;
  createdAt: Date;
}

export default function QRGeneratorPage() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [selectedType, setSelectedType] = useState('url');
  const [formData, setFormData] = useState({
    url: '',
    text: '',
    wifi_ssid: '',
    wifi_password: '',
    wifi_security: 'WPA',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    contact_organization: '',
    sms_number: '',
    sms_message: '',
    email_address: '',
    email_subject: '',
    email_body: '',
  });
  const { toast } = useToast();

  const qrTypes = [
    { id: 'url', name: 'Website URL', icon: QrCode, description: 'Link to websites or web pages' },
    { id: 'text', name: 'Plain Text', icon: QrCode, description: 'Any text content' },
    { id: 'wifi', name: 'WiFi Network', icon: QrCode, description: 'WiFi connection details' },
    { id: 'contact', name: 'Contact Card', icon: QrCode, description: 'Personal or business contact' },
    { id: 'sms', name: 'SMS Message', icon: QrCode, description: 'Pre-filled text message' },
    { id: 'email', name: 'Email', icon: QrCode, description: 'Email with subject and body' },
    { id: 'location', name: 'Location', icon: QrCode, description: 'GPS coordinates or address' },
  ];

  const generateQRCode = () => {
    let content = '';
    let isValid = false;

    switch (selectedType) {
      case 'url':
        if (formData.url.trim()) {
          content = formData.url.trim();
          isValid = true;
        }
        break;
      case 'text':
        if (formData.text.trim()) {
          content = formData.text.trim();
          isValid = true;
        }
        break;
      case 'wifi':
        if (formData.wifi_ssid.trim()) {
          content = `WIFI:T:${formData.wifi_security};S:${formData.wifi_ssid};P:${formData.wifi_password};;`;
          isValid = true;
        }
        break;
      case 'contact':
        if (formData.contact_name.trim()) {
          content = `BEGIN:VCARD\nVERSION:3.0\nFN:${formData.contact_name}\nORG:${formData.contact_organization}\nTEL:${formData.contact_phone}\nEMAIL:${formData.contact_email}\nEND:VCARD`;
          isValid = true;
        }
        break;
      case 'sms':
        if (formData.sms_number.trim()) {
          content = `sms:${formData.sms_number}?body=${encodeURIComponent(formData.sms_message)}`;
          isValid = true;
        }
        break;
      case 'email':
        if (formData.email_address.trim()) {
          content = `mailto:${formData.email_address}?subject=${encodeURIComponent(formData.email_subject)}&body=${encodeURIComponent(formData.email_body)}`;
          isValid = true;
        }
        break;
    }

    if (!isValid) {
      toast({
        title: 'Please fill in required fields',
        description: 'Make sure all required information is provided.',
        variant: 'destructive',
      });
      return;
    }

    // Generate QR code (in real implementation, this would use a QR code library)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(content)}`;

    const newQRCode: QRCodeData = {
      id: Date.now().toString(),
      type: selectedType,
      content: content,
      qrCodeUrl: qrCodeUrl,
      createdAt: new Date(),
    };

    setQrCodes((prev) => [newQRCode, ...prev]);

    toast({
      title: 'QR Code generated!',
      description: 'Your QR code is ready for download.',
    });

    // Clear form
    setFormData({
      url: '',
      text: '',
      wifi_ssid: '',
      wifi_password: '',
      wifi_security: 'WPA',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      contact_organization: '',
      sms_number: '',
      sms_message: '',
      email_address: '',
      email_subject: '',
      email_body: '',
    });
  };

  const downloadQRCode = (qrCodeUrl: string, type: string) => {
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `qr-code-${type}-${Date.now()}.png`;
    a.click();

    toast({
      title: 'Download started',
      description: 'Your QR code is being downloaded.',
    });
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied to clipboard',
      description: 'QR code content has been copied.',
    });
  };

  const deleteQRCode = (qrCodeId: string) => {
    setQrCodes((prev) => prev.filter((qr) => qr.id !== qrCodeId));
    toast({
      title: 'QR Code deleted',
      description: 'The QR code has been removed.',
    });
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderFormFields = () => {
    switch (selectedType) {
      case 'url':
        return (
          <div className='space-y-3'>
            <Label htmlFor='url'>Website URL *</Label>
            <input
              id='url'
              placeholder='https://example.com'
              value={formData.url}
              onChange={(e) => updateFormData('url', e.target.value)}
            />
          </div>
        );

      case 'text':
        return (
          <div className='space-y-3'>
            <Label htmlFor='text'>Text Content *</Label>
            <Textarea
              id='text'
              placeholder='Enter any text content...'
              value={formData.text}
              onChange={(e) => updateFormData('text', e.target.value)}
              rows={4}
            />
          </div>
        );

      case 'wifi':
        return (
          <div className='space-y-4'>
            <div className='space-y-3'>
              <Label htmlFor='wifi_ssid'>Network Name (SSID) *</Label>
              <input
                id='wifi_ssid'
                placeholder='My WiFi Network'
                value={formData.wifi_ssid}
                onChange={(e) => updateFormData('wifi_ssid', e.target.value)}
              />
            </div>
            <div className='space-y-3'>
              <Label htmlFor='wifi_password'>Password</Label>
              <input
                id='wifi_password'
                type='password'
                placeholder='Network password'
                value={formData.wifi_password}
                onChange={(e) => updateFormData('wifi_password', e.target.value)}
              />
            </div>
            <div className='space-y-3'>
              <Label htmlFor='wifi_security'>Security Type</Label>
              <select
                id='wifi_security'
                value={formData.wifi_security}
                onChange={(e) => updateFormData('wifi_security', e.target.value)}
                className='w-full p-2 border border-input rounded-md bg-background'>
                <option value='WPA'>WPA/WPA2</option>
                <option value='WEP'>WEP</option>
                <option value='nopass'>No Password</option>
              </select>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className='space-y-4'>
            <div className='space-y-3'>
              <Label htmlFor='contact_name'>Full Name *</Label>
              <input
                id='contact_name'
                placeholder='John Doe'
                value={formData.contact_name}
                onChange={(e) => updateFormData('contact_name', e.target.value)}
              />
            </div>
            <div className='space-y-3'>
              <Label htmlFor='contact_phone'>Phone Number</Label>
              <input
                id='contact_phone'
                placeholder='+1234567890'
                value={formData.contact_phone}
                onChange={(e) => updateFormData('contact_phone', e.target.value)}
              />
            </div>
            <div className='space-y-3'>
              <Label htmlFor='contact_email'>Email Address</Label>
              <input
                id='contact_email'
                type='email'
                placeholder='john@example.com'
                value={formData.contact_email}
                onChange={(e) => updateFormData('contact_email', e.target.value)}
              />
            </div>
            <div className='space-y-3'>
              <Label htmlFor='contact_organization'>Organization</Label>
              <input
                id='contact_organization'
                placeholder='Company Name'
                value={formData.contact_organization}
                onChange={(e) => updateFormData('contact_organization', e.target.value)}
              />
            </div>
          </div>
        );

      case 'sms':
        return (
          <div className='space-y-4'>
            <div className='space-y-3'>
              <Label htmlFor='sms_number'>Phone Number *</Label>
              <input
                id='sms_number'
                placeholder='+1234567890'
                value={formData.sms_number}
                onChange={(e) => updateFormData('sms_number', e.target.value)}
              />
            </div>
            <div className='space-y-3'>
              <Label htmlFor='sms_message'>Message</Label>
              <Textarea
                id='sms_message'
                placeholder='Pre-filled message text...'
                value={formData.sms_message}
                onChange={(e) => updateFormData('sms_message', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 'email':
        return (
          <div className='space-y-4'>
            <div className='space-y-3'>
              <Label htmlFor='email_address'>Email Address *</Label>
              <input
                id='email_address'
                type='email'
                placeholder='contact@example.com'
                value={formData.email_address}
                onChange={(e) => updateFormData('email_address', e.target.value)}
              />
            </div>
            <div className='space-y-3'>
              <Label htmlFor='email_subject'>Subject</Label>
              <input
                id='email_subject'
                placeholder='Email subject'
                value={formData.email_subject}
                onChange={(e) => updateFormData('email_subject', e.target.value)}
              />
            </div>
            <div className='space-y-3'>
              <Label htmlFor='email_body'>Message Body</Label>
              <Textarea
                id='email_body'
                placeholder='Email message content...'
                value={formData.email_body}
                onChange={(e) => updateFormData('email_body', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-3 mb-4'>
            <div className='p-2 bg-gray-100 rounded-lg'>
              <QrCode className='size-6 text-gray-600' />
            </div>
            <div>
              <h1 className='text-3xl font-bold'>QR Generator</h1>
              <p className='text-muted-foreground'>Create QR codes for websites, contact info, and more</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Generator Panel */}
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader>
                <CardTitle>QR Code Generator</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Type Selection */}
                <div className='space-y-3'>
                  <Label>QR Code Type</Label>
                  <div className='grid grid-cols-1 gap-2'>
                    {qrTypes.map((type) => (
                      <Button
                        key={type.id}
                        variant={selectedType === type.id ? 'default' : 'outline'}
                        onClick={() => setSelectedType(type.id)}
                        className='justify-start h-auto p-3'>
                        <type.icon className='size-4 mr-3' />
                        <div className='text-left'>
                          <div className='font-medium'>{type.name}</div>
                          <div className='text-xs text-muted-foreground'>{type.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Form Fields */}
                <div className='space-y-4'>{renderFormFields()}</div>

                {/* Generate Button */}
                <Button onClick={generateQRCode} className='w-full'>
                  <QrCode className='size-4 mr-2' />
                  Generate QR Code
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Generated QR Codes */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle>Generated QR Codes ({qrCodes.length})</CardTitle>
                  {qrCodes.length > 0 && (
                    <Button variant='outline' size='sm' onClick={() => setQrCodes([])}>
                      <Trash2 className='size-4 mr-2' />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {qrCodes.length === 0 ? (
                  <div className='text-center py-12'>
                    <QrCode className='size-16 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-semibold mb-2'>No QR codes generated yet</h3>
                    <p className='text-muted-foreground mb-4'>
                      Select a type and fill in the details to create your first QR code
                    </p>
                    <div className='grid grid-cols-2 gap-2 max-w-xs mx-auto'>
                      {qrTypes.slice(0, 4).map((type) => (
                        <Button
                          key={type.id}
                          variant='outline'
                          size='sm'
                          onClick={() => setSelectedType(type.id)}
                          className='flex items-center space-x-1'>
                          <type.icon className='size-3' />
                          <span className='text-xs'>{type.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {qrCodes.map((qrCode) => (
                      <div key={qrCode.id} className='border rounded-lg p-4'>
                        <div className='flex items-center justify-between mb-4'>
                          <div className='flex items-center space-x-2'>
                            <Badge variant='secondary'>
                              {qrTypes.find((t) => t.id === qrCode.type)?.name}
                            </Badge>
                          </div>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => deleteQRCode(qrCode.id)}
                            className='text-red-500 hover:text-red-700'>
                            <Trash2 className='size-4' />
                          </Button>
                        </div>

                        <div className='text-center mb-4'>
                          <img src={qrCode.qrCodeUrl} alt='QR Code' className='mx-auto border rounded-lg' />
                        </div>

                        <div className='space-y-3'>
                          <div className='text-sm'>
                            <div className='font-medium mb-1'>Content:</div>
                            <div className='p-2 bg-muted rounded text-xs break-all'>
                              {qrCode.content.length > 100
                                ? `${qrCode.content.substring(0, 100)}...`
                                : qrCode.content}
                            </div>
                          </div>

                          <div className='flex space-x-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => downloadQRCode(qrCode.qrCodeUrl, qrCode.type)}
                              className='flex-1'>
                              <Download className='size-4 mr-2' />
                              Download
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => copyContent(qrCode.content)}
                              className='flex-1'>
                              <Copy className='size-4 mr-2' />
                              Copy
                            </Button>
                          </div>

                          <p className='text-xs text-muted-foreground text-center'>
                            Created: {qrCode.createdAt.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Usage Tips */}
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>QR Code Usage Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Best Practices</h4>
                <p className='text-sm text-muted-foreground'>
                  Test your QR codes before printing. Ensure they work on different devices and QR code
                  readers.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Print Quality</h4>
                <p className='text-sm text-muted-foreground'>
                  Use high-resolution images for printing. Maintain adequate contrast and size for easy
                  scanning.
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-semibold'>Content Length</h4>
                <p className='text-sm text-muted-foreground'>
                  Keep content concise. Longer content creates more complex QR codes that may be harder to
                  scan.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
