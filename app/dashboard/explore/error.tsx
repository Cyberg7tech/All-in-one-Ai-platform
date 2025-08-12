'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Explore page error:', error);
  }, [error]);

  return (
    <div className='flex h-[calc(100vh-10rem)] flex-col items-center justify-center'>
      <div className='text-center space-y-4 max-w-md'>
        <AlertCircle className='mx-auto size-12 text-destructive' />
        <h2 className='text-2xl font-semibold'>Something went wrong!</h2>
        <p className='text-muted-foreground'>
          {error.message || 'An error occurred while loading the explore page.'}
        </p>
        <div className='flex gap-4 justify-center'>
          <Button onClick={reset}>Try again</Button>
          <Button variant='outline' onClick={() => (window.location.href = '/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
