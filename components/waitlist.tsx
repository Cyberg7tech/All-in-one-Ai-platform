'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, Bell, Users, Star } from 'lucide-react';

interface WaitlistProps {
  title?: string;
  description?: string;
  buttonText?: string;
  successMessage?: string;
  className?: string;
}

export function Waitlist({
  title = "Join the Waitlist",
  description = "Be the first to know when we launch new AI features.",
  buttonText = "Join Waitlist",
  successMessage = "Thanks! We'll notify you when it's ready.",
  className = ""
}: WaitlistProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call - replace with actual waitlist API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, call your waitlist API here
      // await fetch('/api/waitlist', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      setIsSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className={`max-w-md mx-auto ${className}`}>
        <CardContent className="text-center py-8">
          <CheckCircle className="size-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">You're on the list!</h3>
          <p className="text-muted-foreground mb-4">{successMessage}</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="size-4 mr-1" />
              1,250+ joined
            </div>
            <div className="flex items-center">
              <Star className="size-4 mr-1" />
              Early access
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <Badge variant="secondary" className="w-fit mx-auto mb-2">
          <Bell className="size-3 mr-1" />
          Coming Soon
        </Badge>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading || !email}>
            {isLoading ? 'Joining...' : buttonText}
          </Button>
          
          <div className="text-center text-xs text-muted-foreground">
            Join 1,250+ others waiting for early access
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Inline Waitlist Component for landing pages
export function InlineWaitlist({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSuccess(true);
    setEmail('');
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className={`flex items-center justify-center space-x-2 ${className}`}>
        <CheckCircle className="size-5 text-green-500" />
        <span className="text-green-600 font-medium">Thanks! You're on the list.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 max-w-md mx-auto ${className}`}>
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="pl-10"
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={isLoading || !email} className="whitespace-nowrap">
        {isLoading ? 'Joining...' : 'Join Waitlist'}
      </Button>
    </form>
  );
}
