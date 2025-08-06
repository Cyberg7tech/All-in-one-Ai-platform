'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSupabaseClient } from '@/components/providers/supabase-provider';

export default function LoginForm() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPlan, setSignupPlan] = useState('free');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const router = useRouter();
  const supabase = useSupabaseClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(signupEmail, signupPassword, signupName, signupPlan);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  const handleGoogleOAuth = async () => {
    const redirectTo =
      process.env.NODE_ENV === 'production'
        ? 'https://one-ai.sgbizsolution.com/auth/callback'
        : `${window.location.origin}/auth/callback`;

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
  };

  return (
    <div>
      <button onClick={handleGoogleOAuth}>Continue with Google</button>
      {/* other form logic here for login/signup */}
    </div>
  );
}
