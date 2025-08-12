'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useSupabaseClient } from '@/components/providers/supabase-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AIIcon } from '@/components/ui/ai-icon';
import { MagicLink } from './magic-link';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);

  useEffect(() => {
    // Check if we should start in signup mode
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsSignUp(true);
    }
  }, [searchParams]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const supabase = useSupabaseClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signup(email, password, name, 'free');
      } else {
        await login(email, password);
      }

      // Don't redirect here - let the auth context handle it
      // The login page useEffect will handle the redirect when user state updates
      console.log('Login successful, waiting for auth context to handle redirect...');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      // Always reset form loading state, but let auth context manage its own loading
      setIsLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    if (!supabase) {
      setError('Auth is not ready yet. Please try again in a moment.');
      return;
    }
    const redirectTo =
      process.env.NODE_ENV === 'production'
        ? 'https://one-ai.sgbizsolution.com/auth/callback'
        : `${window.location.origin}/auth/callback`;

    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });
    } catch (err: any) {
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  // Show Magic Link component if requested
  if (showMagicLink) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-md'>
          <MagicLink
            onBack={() => setShowMagicLink(false)}
            redirectTo={
              process.env.NODE_ENV === 'production'
                ? 'https://one-ai.sgbizsolution.com/dashboard'
                : `${window.location.origin}/dashboard`
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-slate-950 dark:to-black flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        {/* Back to Home Button */}
        <div className='flex justify-start mb-6'>
          <Button variant='ghost' size='sm' asChild>
            <Link href='/' className='flex items-center text-muted-foreground hover:text-foreground'>
              <ArrowLeft className='mr-2 size-4' />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Logo and Welcome */}
        <div className='text-center'>
          <div className='mx-auto size-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg'>
            <AIIcon size={32} className='text-primary-foreground' />
          </div>
          <h2 className='mt-6 text-3xl font-bold tracking-tight text-foreground'>Welcome Back</h2>
          <p className='mt-2 text-sm text-muted-foreground'>Sign in to your One Ai account</p>
        </div>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <Card className='shadow-xl bg-card border border-border'>
          <CardHeader className='space-y-1 pb-4'>
            <div className='flex items-center justify-center space-x-2'>
              <Button
                variant={!isSignUp ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setIsSignUp(false)}
                className='flex-1'>
                Login
              </Button>
              <Button
                variant={isSignUp ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setIsSignUp(true)}
                className='flex-1'>
                Sign Up
              </Button>
            </div>
          </CardHeader>

          <CardContent className='space-y-4'>
            {/* Google OAuth Button */}
            <Button
              type='button'
              variant='outline'
              onClick={handleGoogleOAuth}
              disabled={isLoading}
              className='w-full h-11 bg-background hover:bg-muted/80 border-border'>
              <svg className='mr-2 size-4' viewBox='0 0 24 24'>
                <path
                  fill='currentColor'
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                />
                <path
                  fill='currentColor'
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                />
                <path
                  fill='currentColor'
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                />
                <path
                  fill='currentColor'
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                />
              </svg>
              Continue with Google
            </Button>

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background px-2 text-muted-foreground'>Or continue with</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className='space-y-4'>
              {isSignUp && (
                <div className='space-y-2'>
                  <Label htmlFor='name'>Full Name</Label>
                  <div className='relative'>
                    <User className='absolute left-3 top-3 size-4 text-muted-foreground' />
                    <Input
                      id='name'
                      placeholder='Enter your full name'
                      type='text'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isSignUp}
                      className='pl-10 h-11'
                      disabled={isLoading}
                      autoComplete='name'
                    />
                  </div>
                </div>
              )}

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-3 size-4 text-muted-foreground' />
                  <Input
                    id='email'
                    placeholder='Enter your email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className='pl-10 h-11'
                    disabled={isLoading}
                    autoFocus
                    autoComplete='email'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-3 size-4 text-muted-foreground' />
                  <Input
                    id='password'
                    placeholder='Enter your password'
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className='px-10 h-11'
                    disabled={isLoading}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute right-0 top-0 h-11 px-3 hover:bg-transparent'
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff className='size-4 text-muted-foreground' />
                    ) : (
                      <Eye className='size-4 text-muted-foreground' />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className='text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-200'>
                  {error}
                </div>
              )}

              <Button
                type='submit'
                className='w-full h-11 bg-primary hover:bg-primary/90'
                disabled={isLoading}>
                {isLoading ? (
                  <div className='flex items-center'>
                    <div className='size-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                    {isSignUp ? 'Creating account...' : 'Signing in...'}
                  </div>
                ) : (
                  <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                )}
              </Button>
            </form>

            {/* Magic Link Option */}
            <div className='text-center'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setShowMagicLink(true)}
                className='text-primary hover:text-primary/80'>
                <Sparkles className='size-4 mr-2' />
                Try Magic Link instead
              </Button>
            </div>

            <div className='text-center text-sm text-muted-foreground'>
              {isSignUp ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type='button'
                    onClick={() => setIsSignUp(false)}
                    className='text-primary hover:underline font-medium'>
                    Sign in
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account?{' '}
                  <button
                    type='button'
                    onClick={() => setIsSignUp(true)}
                    className='text-primary hover:underline font-medium'>
                    Sign up
                  </button>
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className='mt-6 text-center text-xs text-muted-foreground'>
          By continuing, you agree to our{' '}
          <Link href='/terms' className='hover:underline'>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href='/privacy' className='hover:underline'>
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
