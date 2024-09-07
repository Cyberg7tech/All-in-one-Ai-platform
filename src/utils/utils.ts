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

// ---------- HEADSHOT + QR CODE GENERATOR ----------
// Helper function: image download
function forceDownload(blobUrl: string, filename: string) {
  const a = document.createElement('a');
  a.download = filename;
  a.href = blobUrl;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Image download function. It takes the URL of the Image and the filename as arguments.
export default function downloadImage(url: string, filename: string) {
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

// ---------- VOICE TRANSCRIPTION ----------
// formatTime is a utility function that takes a recording time in seconds and returns a formatted time string.
export const formatTime = (recordingTime: number): string => {
  // Convert recordingTime to minutes and seconds
  const minutes = Math.floor(recordingTime / 60);
  const seconds = recordingTime % 60;

  // Pad the minutes and seconds with leading zeros if necessary
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  // Return the formatted time
  return `${formattedMinutes}:${formattedSeconds}`;
};
