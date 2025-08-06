'use client';

import React, { FC, useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Image, { StaticImageData } from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import { roomThemes } from './content';

type RoomType = {
  image?: StaticImageData;
  name: string;
};

type ModalSelectRoomThemeProps = {
  handleSelectRoom: (data: string) => void;
  selected: string;
};

const ModalSelectRoomTheme: FC<ModalSelectRoomThemeProps> = ({ handleSelectRoom, selected }) => {
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>({
    name: selected || 'Bohemian',
  });

  const handleSave = () => {
    if (selectedRoom) {
      handleSelectRoom(selectedRoom.name);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <p className='text-subtle/70 font-medium text-sm'>View more</p>
      </DialogTrigger>
      <DialogContent className='max-w-2xl gap-10'>
        <DialogHeader>
          <DialogTitle className='text-default text-lg font-semibold text-center'>
            Select Room style
          </DialogTitle>
          <DialogDescription className='text-center text-sm text-subtle'>
            Select the best room style for your room
          </DialogDescription>
        </DialogHeader>

        <div>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
            {roomThemes.map((room, index) => (
              <div
                key={index}
                onClick={() => setSelectedRoom(room)}
                className={cn(
                  'relative flex flex-col justify-center items-center cursor-pointer border-4 border-transparent',
                  selectedRoom?.name === room.name && 'border-blue-600 rounded-lg'
                )}>
                <Image
                  src={room.image}
                  alt={room.name}
                  width={120}
                  height={120}
                  className='h-28 w-52 rounded'
                />
                <Badge className='absolute bottom-2' variant='transparent'>
                  {room.name}
                </Badge>
              </div>
            ))}
          </div>
          <div className='mt-5 flex gap-6'>
            <DialogClose className='w-full'>
              <Button variant='outline' className='w-full' onClick={() => setSelectedRoom(null)}>
                Cancel
              </Button>
            </DialogClose>
            <DialogClose className='w-full'>
              <Button className='w-full' onClick={handleSave}>
                Save
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalSelectRoomTheme;
