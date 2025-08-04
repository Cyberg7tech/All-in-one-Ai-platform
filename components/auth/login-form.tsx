"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Eye, EyeOff, User, LogIn } from 'lucide-react';
import { AIIcon } from '@/components/ui/ai-icon';
import { getSupabaseClient } from '@/lib/supabase/client';

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_993_122)">
      <path d="M19.805 10.2305C19.805 9.55078 19.7483 8.86719 19.625 8.19922H10.2V12.0508H15.6016C15.375 13.3008 14.6016 14.3672 13.5078 15.0508V17.3008H16.6016C18.4688 15.6016 19.805 13.1836 19.805 10.2305Z" fill="#4285F4"/>
      <path d="M10.2 20C12.6992 20 14.7891 19.1836 16.6016 17.3008L13.5078 15.0508C12.5391 15.6836 11.375 16.0508 10.2 16.0508C7.78906 16.0508 5.75781 14.3672 5.00781 12.1836H1.80469V14.5C3.63281 17.6836 6.75781 20 10.2 20Z" fill="#34A853"/>
      <path d="M5.00781 12.1836C4.80469 11.5508 4.6875 10.8828 4.6875 10.1992C4.6875 9.51562 4.80469 8.84766 5.00781 8.21484V5.89844H1.80469C1.16406 7.18359 0.800781 8.57422 0.800781 10.1992C0.800781 11.8242 1.16406 13.2148 1.80469 14.5L5.00781 12.1836Z" fill="#FBBC05"/>
      <path d="M10.2 4.34766C11.4688 4.34766 12.6016 4.78516 13.5078 5.63672L16.6719 2.47266C14.7891 0.785156 12.6992 0 10.2 0C6.75781 0 3.63281 2.31641 1.80469 5.5L5.00781 7.81641C5.75781 5.63281 7.78906 4.34766 10.2 4.34766Z" fill="#EA4335"/>
    </g>
    <defs>
      <clipPath id="clip0_993_122">
        <rect width="20" height="20" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

export default function LoginForm() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPlan, setSignupPlan] = useState('free');
  // Shared state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { login, signup } = useAuth();
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      // Navigate immediately - auth context will handle state
      router.push('/dashboard');
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  };

  // Signup handler
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSuccess(false);
    try {
      await signup(signupEmail, signupPassword, signupName, signupPlan);
      setSuccess(true);
      // Navigate immediately after successful signup
      router.push('/dashboard');
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      setIsLoading(false);
    }
  };

  // Google login handler
  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      // Supabase will redirect on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-purple-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="text-white hover:bg-white/10 p-2"
          >
            ←
            Back to Home
          </Button>
        </div>
        
        <Card className="bg-slate-800 border-slate-700 shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
              <AIIcon size={28} className="text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">{tab === 'login' ? 'Welcome Back' : 'Create Your Account'}</CardTitle>
            <CardDescription>
              {tab === 'login' ? 'Sign in to your One Ai account' : 'Sign up to start using One Ai'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tab Switcher */}
            <div className="flex justify-center mb-6">
              <button
                className={`px-4 py-2 rounded-l-md border ${tab === 'login' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                onClick={() => setTab('login')}
                disabled={tab === 'login'}
              >
                <LogIn className="inline w-4 h-4 mr-1" /> Login
              </button>
              <button
                className={`px-4 py-2 rounded-r-md border -ml-px ${tab === 'signup' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                onClick={() => setTab('signup')}
                disabled={tab === 'signup'}
              >
Sign Up
              </button>
            </div>

            {/* Google Login */}
            <Button
              type="button"
              className="w-full mb-4 flex items-center justify-center gap-2"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <GoogleIcon /> Continue with Google
            </Button>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md mb-2">
                {error}
              </div>
            )}
            {success && tab === 'signup' && (
              <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md mb-2">
                Account created! Redirecting...
              </div>
            )}

            {/* Login Form */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">🔒</span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            )}

            {/* Signup Form */}
            {tab === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label htmlFor="signupName" className="text-sm font-medium">Name</label>
                  <input
                    id="signupName"
                    type="text"
                    value={signupName}
                    onChange={e => setSignupName(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signupEmail" className="text-sm font-medium">Email</label>
                  <input
                    id="signupEmail"
                    type="email"
                    value={signupEmail}
                    onChange={e => setSignupEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="you@email.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signupPassword" className="text-sm font-medium">Password</label>
                  <input
                    id="signupPassword"
                    type="password"
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Create a password"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label htmlFor="signupPlan" className="text-sm font-medium">Plan</label>
                  <select
                    id="signupPlan"
                    value={signupPlan}
                    onChange={e => setSignupPlan(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  >
                    {PLANS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            )}

            <div className="mt-4 text-center text-sm">
              {tab === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button className="text-primary underline" onClick={() => setTab('signup')}>Sign up</button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button className="text-primary underline" onClick={() => setTab('login')}>Sign in</button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 