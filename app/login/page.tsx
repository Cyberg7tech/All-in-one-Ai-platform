import { Metadata } from 'next';
import LoginForm from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Login - One Ai',
  description: 'Sign in to your One Ai account',
};

export default function LoginPage() {
  return <LoginForm />;
} 