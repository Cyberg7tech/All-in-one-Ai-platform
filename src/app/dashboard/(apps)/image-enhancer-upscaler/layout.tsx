// This Layout is specific to the Generate page.
// It ensures that a user is authenticated before rendering children components.
// If not authenticated, it redirects to the login page.

import Navbar from '@/components/dashboard/navbar/Navbar';
import { ThemeProvider } from '@/components/theme-provider';
import { getUserDetails } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/image-enhancer-upscaler/sidebar/Sidebar';
import UpgradePlan from '@/components/dashboard/UpgradePlan';

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: Props) {
  const user = await getUserDetails();

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

        <div className='w-full overflow-auto px-4 flex flex-col'>
          <Navbar />
          <div className='flex-1'>{children}</div>
          <UpgradePlan />
        </div>
      </div>
    </ThemeProvider>
  );
}
