import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { ErrorBoundary } from '@/components/providers/error-boundary';

import { Toaster } from 'sonner';
import SupabaseProvider from '@/components/providers/supabase-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'One Ai',
  description: 'Comprehensive One Ai platform with chat, agents, analytics, and creative tools',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <link rel='manifest' href='/manifest.json' />
        <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
        <meta name='theme-color' content='#3B82F6' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='style-insertion-point' content='' />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
            <SupabaseProvider>
              <AuthProvider>
                <QueryProvider>
                  {children}
                  <Toaster />
                </QueryProvider>
              </AuthProvider>
            </SupabaseProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
