import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'sonner'
// import BrowserAuthInitializer from '@/components/browser-auth-initializer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'One Ai',
  description: 'Comprehensive One Ai platform with chat, agents, analytics, and creative tools',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
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
              // NUCLEAR CACHE CLEARING - Force fresh everything
              (function() {
                try {
                  // Clear ALL problematic storage
                  const problematicKeys = ['nuclear-oneai-auth', 'oneai-auth-permanent', 'oneai-auth'];
                  problematicKeys.forEach(key => {
                    localStorage.removeItem(key);
                    sessionStorage.removeItem(key);
                  });
                  
                  // Force service worker refresh
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(function(registrations) {
                      for(let registration of registrations) {
                        registration.unregister();
                      }
                    });
                  }
                  
                  // Clear caches
                  if ('caches' in window) {
                    caches.keys().then(function(names) {
                      for (let name of names) {
                        caches.delete(name);
                      }
                    });
                  }
                  
                  // Add cache busting timestamp and force reload flag
                  window.__CACHE_BUST = Date.now();
                  window.__FORCE_RELOAD = true;
                  console.log('🚀 NUCLEAR CACHE CLEAR at:', new Date().toISOString());
                } catch (e) {
                  console.warn('Error in nuclear cleanup:', e);
                }
              })();
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
              {/* <BrowserAuthInitializer /> */}
              {children}
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 