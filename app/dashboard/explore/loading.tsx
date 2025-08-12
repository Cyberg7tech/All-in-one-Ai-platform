import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className='p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='mb-8'>
        <Skeleton className='h-8 w-48 mb-2' />
        <Skeleton className='h-4 w-96' />
      </div>

      {/* Featured Tools */}
      <div className='mb-8'>
        <Skeleton className='h-7 w-40 mb-4' />
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className='border rounded-lg p-6 space-y-4'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center space-x-3'>
                  <Skeleton className='size-12 rounded-lg' />
                  <div className='space-y-2'>
                    <Skeleton className='h-5 w-32' />
                    <Skeleton className='h-3 w-20' />
                  </div>
                </div>
              </div>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
              <div className='flex items-center justify-between'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-16' />
              </div>
              <div className='flex gap-2'>
                <Skeleton className='h-6 w-16 rounded-full' />
                <Skeleton className='h-6 w-20 rounded-full' />
                <Skeleton className='h-6 w-14 rounded-full' />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className='mb-6 space-y-4'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <Skeleton className='h-10 flex-1' />
          <div className='flex gap-2'>
            <Skeleton className='h-10 w-24' />
            <Skeleton className='h-10 w-24' />
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className='h-8 w-24' />
          ))}
        </div>
      </div>
    </div>
  );
}