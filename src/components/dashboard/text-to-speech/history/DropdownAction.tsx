import { FC } from 'react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LuMoreHorizontal } from 'react-icons/lu';
import ModalDeleteContent from './ModalDeleteContent';
import { FiDownload } from 'react-icons/fi';
import Link from 'next/link';
import DropdownContentWrapper from '../../sidebar/DropdownContentWrapper';

interface DropdownActionProps {
  id: string;
  audioUrl: string;
  title: string;
}

const DropdownAction: FC<DropdownActionProps> = ({ id, audioUrl, title }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='focus:outline-none'>
        <LuMoreHorizontal />
      </DropdownMenuTrigger>

      <DropdownContentWrapper>
        <DropdownMenuItem asChild>
          <Link
            href={`${audioUrl}?download=${title}.mp3`}
            target='_blank'
            className='flex items-center gap-2 cursor-pointer'>
            <FiDownload />
            Download
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <ModalDeleteContent id={id} />
        </DropdownMenuItem>
      </DropdownContentWrapper>
    </DropdownMenu>
  );
};

export default DropdownAction;
