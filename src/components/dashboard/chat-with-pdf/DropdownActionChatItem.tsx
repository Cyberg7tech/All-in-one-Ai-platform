'use client';

import { FC } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IoIosMore } from 'react-icons/io';
import { buttonVariants } from '@/components/ui/button';

interface DropdownActionChatItemProps {
  chatId: string;
}

const DropdownActionChatItem: FC<DropdownActionChatItemProps> = ({ chatId }) => {
  const handleDeleteChat = async () => {
    console.log('Delete chat with id:', chatId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
        <IoIosMore />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleDeleteChat}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownActionChatItem;
