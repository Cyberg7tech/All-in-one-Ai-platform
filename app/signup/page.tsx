'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AIIcon } from '@/components/ui/ai-icon';

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('free');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSuccess(false);
    try {
      await signup(email, password, name, plan);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4'>
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader className='text-center'>
          <div className='size-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-4'>
            <AIIcon size={28} className='text-primary-foreground' />
          </div>
          <CardTitle className='text-2xl'>Create Your Account</CardTitle>
          <CardDescription>Sign up to start using One Ai</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md mb-2'>
              {error}
            </div>
          )}
          {success && (
            <div className='p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md mb-2'>
              Account created! Redirecting...
            </div>
          )}
          <form className='space-y-4' onSubmit={handleSubmit}>
            <div>
              <label htmlFor='name' className='text-sm font-medium'>
                Name
              </label>
              <input
                id='name'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
                placeholder='Your name'
                required
              />
            </div>
            <div>
              <label htmlFor='email' className='text-sm font-medium'>
                Email
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
                placeholder='you@email.com'
                required
              />
            </div>
            <div>
              <label htmlFor='password' className='text-sm font-medium'>
                Password
              </label>
              <input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
                placeholder='Create a password'
                required
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor='plan' className='text-sm font-medium'>
                Plan
              </label>
              <select
                id='plan'
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'>
                {PLANS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
          <div className='mt-4 text-center text-sm'>
            Already have an account?{' '}
            <a href='/login' className='text-primary underline'>
              Sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
