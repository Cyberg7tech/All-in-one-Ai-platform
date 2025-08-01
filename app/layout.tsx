import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'One Ai',
  description: 'Comprehensive One Ai platform with chat, agents, analytics, and creative tools',
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Only clear problematic legacy storage keys, preserve current auth
              (function() {
                try {
                  // Only clear specific problematic keys, not current ones
                  const problematicKeys = ['nuclear-oneai-auth', 'oneai-auth-permanent'];
                  problematicKeys.forEach(key => {
                    localStorage.removeItem(key);
                    sessionStorage.removeItem(key);
                  });
                  
                  console.log('Legacy storage cleanup completed');
                } catch (e) {
                  console.warn('Error clearing legacy storage:', e);
                }
              })();
              
              // Initialize browser debugger for development
              if (typeof window !== 'undefined') {
                console.log('%c🔧 OneAI Loading Debugger Active', 'color: #00aa00; font-size: 12px;');
              }
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 