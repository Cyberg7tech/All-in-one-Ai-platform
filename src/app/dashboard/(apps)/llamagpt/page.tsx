import ChatBoard from '@/components/dashboard/llamagpt/Chat';
import { getUserDetails } from '@/utils/supabase/server';

export default async function Chat() {
  const user = await getUserDetails();

  return (
    <>
      <ChatBoard userName={user ? user.user_metadata.full_name : 'User'} />
    </>
  );
}
