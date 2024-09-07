// Layout component that includes the Navbar and ensures user authentication

import { getUserDetails } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ThemeProvider } from '@/components/theme-provider';
import Navbar from '@/components/dashboard/navbar/Navbar';
import Sidebar from '@/components/dashboard/chat-with-pdf/sidebar/Sidebar';

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
      <div className='h-screen flex gap-4 p-4'>
        <div className='w-[20vw] hidden md:flex flex-col'>
          <Sidebar />
        </div>

        <div className='w-full'>
          <Navbar />
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
