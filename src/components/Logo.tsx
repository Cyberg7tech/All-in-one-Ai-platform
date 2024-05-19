// Logo Component that redirects users to the homepage.
// It is used across various parts of the application to provide a consistent way to return to the main page.

'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Logo() {
  const [logoSrc, setLogoSrc] = useState<string>('/light-logo.png');

  const { theme } = useTheme();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const src = isHomePage || theme === 'dark' ? '/light-logo.png' : '/dark-logo.png';
    setLogoSrc(src);
  }, [isHomePage, theme]);

  return (
    <Link href='https://www.builderkit.ai/#pricing'>
      <div className='flex items-center gap-2 w-fit'>
        <Image src={logoSrc} width={150} height={128} alt='logo' />
      </div>
    </Link>
  );
}
