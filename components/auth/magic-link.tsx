'use client';

import { useState } from 'react';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useSupabaseClient } from '@/components/providers/supabase-provider';

interface MagicLinkProps {
  onBack?: () => void;
  title?: string;
  description?: string;
  redirectTo?: string;
}

export function MagicLink({
  onBack,
  title = 'Sign in with Magic Link',
  description = "Enter your email and we'll send you a secure link to sign in.",
  redirectTo,
}: MagicLinkProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const supabase = useSupabaseClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo || `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className='max-w-md mx-auto'>
        <CardContent className='text-center py-8'>
          <CheckCircle className='size-16 text-green-500 mx-auto mb-4' />
          <h3 className='text-xl font-semibold mb-2'>Check your email</h3>
          <p className='text-muted-foreground mb-4'>
            We've sent a magic link to <strong>{email}</strong>
          </p>
          <p className='text-sm text-muted-foreground mb-6'>
            Click the link in your email to sign in. The link will expire in 24 hours.
          </p>

          <div className='space-y-3'>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => {
                setIsSuccess(false);
                setEmail('');
              }}>
              Send another link
            </Button>

            {onBack && (
              <Button variant='ghost' onClick={onBack} className='w-full'>
                <ArrowLeft className='size-4 mr-2' />
                Back to login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='max-w-md mx-auto'>
      <CardHeader className='text-center'>
        <CardTitle className='text-2xl'>{title}</CardTitle>
        <CardDescription className='text-base'>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email address</Label>
            <div className='relative'>
              <Mail className='absolute left-3 top-3 size-4 text-muted-foreground' />
              <Input
                id='email'
                type='email'
                placeholder='Enter your email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='pl-10'
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className='text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-200'>{error}</div>
          )}

          <Button type='submit' className='w-full' disabled={isLoading || !email}>
            {isLoading ? (
              <div className='flex items-center'>
                <div className='size-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                Sending magic link...
              </div>
            ) : (
              <span>Send magic link</span>
            )}
          </Button>

          {onBack && (
            <Button type='button' variant='ghost' onClick={onBack} className='w-full'>
              <ArrowLeft className='size-4 mr-2' />
              Back to login
            </Button>
          )}
        </form>

        <div className='mt-6 text-center text-xs text-muted-foreground'>
          <p>
            Magic links are secure, passwordless login links sent to your email.
            <br />
            They expire after 24 hours for security.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Standalone Magic Link Page Component
export function MagicLinkPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <MagicLink redirectTo={`${window.location.origin}/dashboard`} />
      </div>
    </div>
  );
}
