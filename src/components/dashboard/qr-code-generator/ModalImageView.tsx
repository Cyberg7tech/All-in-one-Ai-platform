import React, { FC } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TypeQrCodeGeneration } from '@/types/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type ModalImageViewProps = {
  children: React.ReactNode;
  data: TypeQrCodeGeneration;
  imageUrl: string;
  isFooter?: boolean;
};

const blurImageDataUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEXSURBVHgBVZDPSsNAEMa//dP8WVOheFToJejBKh7E4hMIXn0FwcfwrQSvPoFevFQUIdrE0NBTXRPTcbJrxc4yLHzz229nRtzd3lCy2YdJ+og5oyiG1hpSKwhICAEXWrGgdYBeEPLdg1TKp5AOEL8kaxqqc+Ci4tr8PcP11SUuzs/+IO/YAdq70HeLx4d7JIMBtmyNpq4RhKEHheQ+GArDCDGL6f4I6egQL08TlHmO7eHQg0RLgLgHfmCbBvOiwPQtg+2K/NMqZFM3WLYtiAgbxiCvKuzs7kGsBmETZ0RuIp6CtS+7wPHJGCaKYGLTkcz4o4/Gp8wIB05fn5FNuLfyA0VZIl0cwNpPtzZRzWYknDthPVj5J/0AA1VXn/cQBtkAAAAASUVORK5CYII=';

const ModalImageView: FC<ModalImageViewProps> = ({ children, data, imageUrl, isFooter = true }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Medium portrait shot of a golden retriever.</DialogTitle>
        </DialogHeader>
        <div className='w-full space-y-5'>
          <Image
            src={imageUrl}
            alt='generated-room'
            className='w-full rounded h-96'
            width={500}
            height={300}
            placeholder='blur'
            blurDataURL={blurImageDataUrl}
          />
          <div className='space-y-1'>
            <p className='text-default font-semibold'>Prompt</p>
            <p className='text-default font-medium text-sm'>{data.prompt}</p>
          </div>
          {isFooter && (
            <div className='flex gap-4'>
              <DialogClose className='w-full'>
                <Button className='w-full' variant='secondary'>
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose className='w-full'>
                <Link href='/generate'>
                  <Button className='w-full'>Generate new image</Button>
                </Link>
              </DialogClose>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalImageView;
