import { toast } from '@/components/ui/use-toast';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Function: cn (Class Name)
// This utility function combines and deduplicates class names using clsx and twMerge.
export const errorToast = (description: string, title?: string) =>
  toast({ title, description, variant: 'destructive' });

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get the initials of a user's name for MULTILLM CHATGPT & CHAT WITH PDF
export function userNameInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('');
}

// Get the document ID from the filename for CHAT WITH PDF
export function getDocIdFromFilename(fileName: string) {
  return fileName.split('.')[0];
}
