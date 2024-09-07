import { FC } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TypeImageGeneration } from '@/types/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { imageModels } from '@/app/dashboard/(apps)/image-generator/models';
import { format } from 'date-fns';
import Link from 'next/link';

type ModalViewImageProps = {
  data: TypeImageGeneration;
  imageUrl: string;
  isFooter?: boolean;
};

const getModelName = (modelValue: string) => {
  const model = imageModels.find((m) => m.value === modelValue);
  return model ? model.name : '';
};

const blurImageDataUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEXSURBVHgBVZDPSsNAEMa//dP8WVOheFToJejBKh7E4hMIXn0FwcfwrQSvPoFevFQUIdrE0NBTXRPTcbJrxc4yLHzz229nRtzd3lCy2YdJ+og5oyiG1hpSKwhICAEXWrGgdYBeEPLdg1TKp5AOEL8kaxqqc+Ci4tr8PcP11SUuzs/+IO/YAdq70HeLx4d7JIMBtmyNpq4RhKEHheQ+GArDCDGL6f4I6egQL08TlHmO7eHQg0RLgLgHfmCbBvOiwPQtg+2K/NMqZFM3WLYtiAgbxiCvKuzs7kGsBmETZ0RuIp6CtS+7wPHJGCaKYGLTkcz4o4/Gp8wIB05fn5FNuLfyA0VZIl0cwNpPtzZRzWYknDthPVj5J/0AA1VXn/cQBtkAAAAASUVORK5CYII=';

const ModalViewImage: FC<ModalViewImageProps> = ({ data, imageUrl, isFooter = true }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Image
          src={imageUrl}
          alt='generated-image'
          className='object-cover rounded-lg w-full h-72 cursor-pointer'
          width={300}
          height={300}
        />
      </DialogTrigger>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>Medium portrait shot of a golden retriever.</DialogTitle>
        </DialogHeader>
        <div className='w-full space-y-5'>
          <Image
            src={imageUrl}
            alt='generated-image'
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
          <div className='flex gap-6'>
            <div className='space-y-1'>
              <p className='text-default font-semibold'>Model</p>
              <p className='text-default font-medium text-sm'>{getModelName(data.model)}</p>
            </div>
            <div className='space-y-1'>
              <p className='text-default font-semibold'>Created</p>
              <p className='text-default font-medium text-sm'>
                {format(data.created_at, 'MMM dd, yyyy h:mm aa')}
              </p>
            </div>
          </div>
          {isFooter && (
            <div className='flex gap-4'>
              <DialogClose className='w-full'>
                <Button className='w-1/2' variant='secondary'>
                  Cancel
                </Button>
                <Link href='/dashboard/image-generator'>
                  <Button className='w-1/2'>Generate new image</Button>
                </Link>
              </DialogClose>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalViewImage;
