// Layout component that includes the Navbar and ensures user authentication

import { getUserDetails } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/sidebar/Sidebar';
import Navbar from '@/components/dashboard/navbar/Navbar';
import { ThemeProvider } from '@/components/theme-provider';

type Props = {
  children: React.ReactNode;
};

// Server-side component to check user authentication and render the Navbar
export default async function Layout({ children }: Props) {
  const user = await getUserDetails();

  // Redirects to login page if user is not authenticated
  if (user == null) {
    redirect('/login');
  }

  return (
    // Wraps a ThemeProvider around the Navbar and children components. It allows user to switch between light and dark themes.
    <ThemeProvider attribute='class' defaultTheme='dark' enableSystem disableTransitionOnChange>
      <div className='h-screen flex gap-6 p-2'>
        <div className='w-72 hidden md:flex flex-col'>
          <Sidebar />
        </div>

        <div className='w-full max-w-7xl overflow-auto px-1'>
          <Navbar />
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
