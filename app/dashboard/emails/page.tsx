import EmailManager from '@/components/emails/email-manager';

export default function EmailsPage() {
  return (
    <div className='container mx-auto py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Email Management</h1>
        <p className='text-gray-600 mt-2'>Send emails and manage your email campaigns</p>
      </div>

      <EmailManager />
    </div>
  );
}
