'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    $crisp: any;
    CRISP_WEBSITE_ID: string;
  }
}

interface CrispChatProps {
  websiteId?: string;
  tokenId?: string;
  locale?: string;
  autoload?: boolean;
  className?: string;
}

export function CrispChat({
  websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID || '',
  tokenId,
  locale = 'en',
  autoload = true,
  className = '',
}: CrispChatProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!websiteId || !autoload) return;

    // Set up Crisp configuration
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = websiteId;

    // Configure Crisp before loading
    window.$crisp.push(['safe', true]);
    window.$crisp.push(['set', 'user:email', '']);
    window.$crisp.push(['set', 'user:nickname', '']);
    window.$crisp.push(['set', 'session:segments', [['builderkit-users']]]);

    if (locale) {
      window.$crisp.push(['set', 'locale', locale]);
    }

    if (tokenId) {
      window.$crisp.push(['set', 'user:token', tokenId]);
    }

    // Load Crisp script
    const script = document.createElement('script');
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);

      // Set up event listeners
      window.$crisp.push(['on', 'chat:opened', () => setIsVisible(true)]);
      window.$crisp.push(['on', 'chat:closed', () => setIsVisible(false)]);
      window.$crisp.push(['on', 'chat:minimized', () => setIsMinimized(true)]);
      window.$crisp.push(['on', 'chat:maximized', () => setIsMinimized(false)]);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script and reset global variables
      const existingScript = document.querySelector('script[src="https://client.crisp.chat/l.js"]');
      if (existingScript) {
        existingScript.remove();
      }
      delete window.$crisp;
      delete (window as any).CRISP_WEBSITE_ID;
    };
  }, [websiteId, tokenId, locale, autoload]);

  const openChat = () => {
    if (window.$crisp) {
      window.$crisp.push(['do', 'chat:open']);
      window.$crisp.push(['do', 'chat:show']);
    }
  };

  const closeChat = () => {
    if (window.$crisp) {
      window.$crisp.push(['do', 'chat:close']);
      window.$crisp.push(['do', 'chat:hide']);
    }
  };

  const toggleChat = () => {
    if (window.$crisp) {
      if (isVisible) {
        closeChat();
      } else {
        openChat();
      }
    }
  };

  const minimizeChat = () => {
    if (window.$crisp) {
      window.$crisp.push(['do', 'chat:minimize']);
    }
  };

  const maximizeChat = () => {
    if (window.$crisp) {
      window.$crisp.push(['do', 'chat:maximize']);
    }
  };

  // Custom chat bubble component (optional)
  if (!autoload) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={openChat}
          className='rounded-full size-14 shadow-lg bg-primary hover:bg-primary/90'
          disabled={!isLoaded}>
          <MessageCircle className='size-6' />
        </Button>
      </div>
    );
  }

  // Return null when using default Crisp widget
  return null;
}

// Crisp utilities and hooks
export const useCrispChat = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.$crisp) {
      setIsLoaded(true);
    }
  }, []);

  const setUser = (user: { email?: string; nickname?: string; avatar?: string; phone?: string }) => {
    if (!window.$crisp) return;

    if (user.email) {
      window.$crisp.push(['set', 'user:email', user.email]);
    }
    if (user.nickname) {
      window.$crisp.push(['set', 'user:nickname', user.nickname]);
    }
    if (user.avatar) {
      window.$crisp.push(['set', 'user:avatar', user.avatar]);
    }
    if (user.phone) {
      window.$crisp.push(['set', 'user:phone', user.phone]);
    }
  };

  const setMessage = (message: string) => {
    if (window.$crisp) {
      window.$crisp.push(['set', 'message:text', message]);
    }
  };

  const sendMessage = (message: string, from: 'user' | 'operator' = 'user') => {
    if (window.$crisp) {
      window.$crisp.push(['do', 'message:send', [from, message]]);
    }
  };

  const openChat = () => {
    if (window.$crisp) {
      window.$crisp.push(['do', 'chat:open']);
      window.$crisp.push(['do', 'chat:show']);
    }
  };

  const closeChat = () => {
    if (window.$crisp) {
      window.$crisp.push(['do', 'chat:close']);
    }
  };

  const resetChat = () => {
    if (window.$crisp) {
      window.$crisp.push(['do', 'session:reset']);
    }
  };

  const setSegments = (segments: string[]) => {
    if (window.$crisp) {
      window.$crisp.push(['set', 'session:segments', [segments]]);
    }
  };

  const setCustomData = (key: string, value: any) => {
    if (window.$crisp) {
      window.$crisp.push(['set', 'session:data', [[key, value]]]);
    }
  };

  return {
    isLoaded,
    setUser,
    setMessage,
    sendMessage,
    openChat,
    closeChat,
    resetChat,
    setSegments,
    setCustomData,
  };
};

// Provider component to wrap your app
interface CrispProviderProps {
  children: React.ReactNode;
  websiteId: string;
  tokenId?: string;
  locale?: string;
  autoload?: boolean;
}

export function CrispProvider({
  children,
  websiteId,
  tokenId,
  locale = 'en',
  autoload = true,
}: CrispProviderProps) {
  return (
    <>
      {children}
      <CrispChat websiteId={websiteId} tokenId={tokenId} locale={locale} autoload={autoload} />
    </>
  );
}

// Custom chat button with status
export function CrispChatButton({ className = '' }: { className?: string }) {
  const { isLoaded, openChat } = useCrispChat();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (window.$crisp) {
      window.$crisp.push([
        'on',
        'message:received',
        () => {
          setUnreadCount((prev) => prev + 1);
        },
      ]);

      window.$crisp.push([
        'on',
        'chat:opened',
        () => {
          setUnreadCount(0);
        },
      ]);
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={openChat}
        disabled={!isLoaded}
        className='rounded-full size-12 shadow-lg bg-primary hover:bg-primary/90'>
        <MessageCircle className='size-5' />
      </Button>

      {unreadCount > 0 && (
        <div className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center animate-pulse'>
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </div>
  );
}
