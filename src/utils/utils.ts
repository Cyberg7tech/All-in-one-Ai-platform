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

// ---------- MULTILLM CHATGPT + CHAT WITH PDF ----------
// Get the initials of a user's name
export function userNameInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('');
}

// ---------- CHAT WITH PDF ----------
// Get the document ID from the filename for CHAT WITH PDF
export function getDocIdFromFilename(fileName: string) {
  return fileName.split('.')[0];
}

// ---------- HEADSHOT GENERATOR ----------
// Common helper function to capitalize the first letter of a string.
export function sentenceCase(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Helper function: image download
function forceDownload(blobUrl: string, filename: string) {
  const a = document.createElement('a');
  a.download = filename;
  a.href = blobUrl;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// QR Code download function. It takes the URL of the QR code image and the filename as arguments.
export default function downloadHeadshot(url: string, filename: string) {
  fetch(url, {
    headers: new Headers({
      Origin: location.origin,
    }),
    mode: 'cors',
  })
    .then((response) => response.blob())
    .then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      forceDownload(blobUrl, filename);
    })
    .catch((e) => console.error(e));
}

export function formatDate(date: string) {
  const formattedDate = new Date(date).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  return formattedDate;
}
