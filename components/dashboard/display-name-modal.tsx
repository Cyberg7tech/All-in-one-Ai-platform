'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface DisplayNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName?: string;
}

export function DisplayNameModal({ isOpen, onClose, currentName = '' }: DisplayNameModalProps) {
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const { updateDisplayName } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid name',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateDisplayName(name.trim());
      toast({
        title: 'Success',
        description: 'Display name updated successfully!',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update display name. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Set Your Display Name</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='display-name'>Display Name</Label>
              <Input
                id='display-name'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Enter your display name'
                autoComplete='name'
                required
                disabled={isLoading}
              />
            </div>
            <div className='flex justify-end space-x-2'>
              <Button type='button' variant='outline' onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Name'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
