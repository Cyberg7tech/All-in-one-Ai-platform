// This component is used to upload a reference image for the design generation
// It updates the uploaded image in the parent component state using the onImageChange prop.
// It also display the uploaded image in the component if the image is uploaded.

import { FC } from 'react';
import { useDropzone } from 'react-dropzone';
import InputWrapper from '@/components/InputWrapper';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { FiUploadCloud } from 'react-icons/fi';

type UploadReferenceImageProps = {
  image?: string | null;
  onImageChange: (image: string) => void;
};

const UploadReferenceImage: FC<UploadReferenceImageProps> = ({ image, onImageChange }) => {
  // Handle image file drop or upload
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
    <InputWrapper label='Upload Image' description='Upload a photo of a room to improve'>
      <div {...getRootProps()} className='w-full h-44 border rounded-lg p-1 cursor-pointer object-fill'>
        <Input {...getInputProps()} />

        {/* Display selected image */}
        {image && (
          <Image
            src={image}
            alt='Dropped Image'
            height={256}
            width={256}
            className='size-full flex justify-center rounded-sm'
          />
        )}

        {/* Placeholder to guide user to upload a reference image */}
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
