import { useRouter } from 'next/navigation';

const TopicCell = ({ row }: { row: any }) => {
  const router = useRouter();

  const handlePush = (id: string) => {
    router.push(`/home/${id}`);
  };

  return (
    <div className='cursor-pointer' onClick={() => handlePush(row.original.id)}>
      <div>
        {row.original.topic.length > 40 ? `${row.original.topic.substring(0, 40)} ...` : row.original.topic}
      </div>
    </div>
  );
};

export default TopicCell;
