// This component is used to switch between light and dark themes.
// It uses the next-themes package to switch between themes.
// The component uses the useTheme hook to get the current theme and setTheme to switch between themes.

'use client';

import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function SelectTheme() {
  const { theme, setTheme } = useTheme();

  // Set the theme to the opposite of the current theme between light and dark
  const handleThemeChange = () => {
    const selectedTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(selectedTheme);
  };

  return (
    <Button
      variant='link'
      size='icon'
      className='focus-visible:ring-0 hover:no-underline'
      onClick={handleThemeChange}>
      {theme === 'light' ? (
        <SunIcon className='size-5 rotate-0 scale-100 transition-all' />
      ) : (
        <MoonIcon className='size-5 rotate-0 scale-100 transition-all' />
      )}
    </Button>
  );
}
