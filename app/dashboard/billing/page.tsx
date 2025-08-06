import PaymentManager from '@/components/payments/payment-manager';

export default function BillingPage() {
  return (
    <div className='container mx-auto py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Billing & Subscriptions</h1>
        <p className='text-gray-600 mt-2'>Manage your subscription and payment methods</p>
      </div>

      <PaymentManager />
    </div>
  );
}
