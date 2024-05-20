'use client';

import { NewContentContextProvider } from '@/hooks/use-new-content';
import { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute='class' defaultTheme='dark' enableSystem disableTransitionOnChange>
      <NewContentContextProvider>{children}</NewContentContextProvider>
    </ThemeProvider>
  );
}
