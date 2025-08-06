'use client';
// This component is used to upload a input image for the image upscaling/enhancing
// It updates the uploaded image in the parent component state using the onImageChange prop.
// It also display the uploaded image in the component if the image is uploaded.

import { FC } from 'react';
import { useDropzone } from 'react-dropzone';
import InputWrapper from '@/components/InputWrapper';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { FiUploadCloud } from 'react-icons/fi';
import { Cross1Icon } from '@radix-ui/react-icons';

type UploadInputImageProps = {
  image?: string | null;
  onImageChange: (image: string) => void;
};

const UploadReferenceImage: FC<UploadInputImageProps> = ({ image, onImageChange }) => {
  const onDrop = (acceptedFiles: File[]) => {
    const reader = new FileReader();
    reader.readAsDataURL(acceptedFiles[0]);
    reader.onload = () => {
      const base64 = reader.result as string;
      onImageChange(base64);
    };
  };

  // Max file size limit is 4.5mb. This is the limit allowed by Vercel.
  // Alternate way is to upload the image to a cloud storage from the client side (front-end) and provide the link here.
  const maxFileSize = 4.5 * 1000 * 1000;

  // Functions to handle the image drop and upload through react-dropzone library
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['image/jpeg', 'image/jpg', 'image/png'] },
    multiple: false,
    onDrop,
    minSize: 1,
    maxSize: maxFileSize,
  });

  return (
    <InputWrapper
      label='Upload Image'
      description='Upload a photo to enhance/upscale'
      className=' flex flex-col leading-6'>
      <div
        {...getRootProps()}
        className='w-full border rounded-lg p-1 cursor-pointer object-fill flex items-center justify-center md:h-56'>
        <Input {...getInputProps()} />

        {/* Display selected image */}
        {image && (
          <div className='h-full relative'>
            <Image src={image} alt='Dropped Image' height={256} width={256} className='rounded-sm h-full' />
            <Cross1Icon
              className='size-6 absolute top-4 right-5 z-50 hover:scale-110 text-blue-500 bg-gray-200 rounded p-1'
              onClick={(e) => {
                e.stopPropagation();
                onImageChange('');
              }}
            />
          </div>
        )}

        {/* Placeholder to guide user to upload a input image */}
        {!image && (
          <div className='flex flex-col items-center justify-center p-6 gap-4'>
            <FiUploadCloud className='size-5' />
            <div className='flex flex-col'>
              <p className='text-primary text-center mb-1 font-semibold text-sm'>Click to upload</p>
              <p className='text-subtle text-xs'>PNG, JPG (max. 4MB)</p>
            </div>
          </div>
        )}
      </div>
    </InputWrapper>
  );
};

export default UploadReferenceImage;
