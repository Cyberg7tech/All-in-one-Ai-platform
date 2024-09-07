'use client';

import { errorToast } from '@/utils/utils';
import { useDropzone } from 'react-dropzone';
import { MdCloudUpload } from 'react-icons/md';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadFile } from '@/app/dashboard/(apps)/chat-with-pdf/actions/storage';
import { createNewChat } from '@/app/dashboard/(apps)/chat-with-pdf/actions/store-chat';
import { ingestFileInVector } from '@/app/dashboard/(apps)/chat-with-pdf/actions/ingest-pdf';
import { LuLoader } from 'react-icons/lu';
import { supabaseBrowserClient } from '@/utils/supabase/client';
import { Input } from '@/components/ui/input';
import ModalLimitExceeded from '../ModalLimitExceeded';

// Max file size limit is 4.5mb. This is the limit allowed by Vercel.
// Alternate way is to upload the image to a cloud storage from the client side (front-end) and provide the link here.
const maxFileSize = 4.5 * 1024 * 1024;

export default function UploadFile() {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [hasLimitExceeded, setHasLimitExceeded] = useState(false);

  const router = useRouter();

  //function to check the limit of content creations and set the state accordingly
  const limitUser = useCallback(async () => {
    const supabase = supabaseBrowserClient();

    const { error, count } = await supabase
      .from('chat_with_file')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return errorToast(error.message);
    }

    if (count && count >= 5) {
      setHasLimitExceeded(true);
    }
  }, []);

  //checking on load if the user has reached the limit of content creations
  useEffect(() => {
    limitUser();
  }, [limitUser]);

  const handleFileUpload = async (file: File) => {
    if (hasLimitExceeded) {
      return errorToast(
        'You have reached the limit of content creations for the trial period.',
        'Limit Exceeded'
      );
    }
    setIsPending(true);

    const data = new FormData();
    data.append('file', file);

    try {
      const response = await uploadFile(data);
      if (typeof response == 'string') {
        throw response;
      }

      const newChatResponse = await createNewChat({
        uploadedFilePath: response.fileName,
        fileName: file.name,
      });
      if (typeof newChatResponse == 'string') {
        throw newChatResponse;
      }

      const fileIngestResponse = await ingestFileInVector(response.fileName);
      if (typeof fileIngestResponse == 'string') {
        throw fileIngestResponse;
      }

      router.replace(`/chat/${newChatResponse.id}`);
    } catch (error) {
      errorToast(`${error}`);
      setIsPending(false);
    }
  };

  const onDrop = async (files: File[]) => {
    const selectedPdf = files[0];

    if (selectedPdf == null) {
      throw new Error('No file uploaded');
    }
    if (selectedPdf.size > maxFileSize) {
      throw new Error('File size exceeds limit');
    }

    await handleFileUpload(selectedPdf);
  };

  // Retrieving funtions with configuration from react-dropzone to handle image uploads
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    maxSize: maxFileSize,
    disabled: hasLimitExceeded,
  });

  if (isPending) {
    return (
      <div className='border border-dashed border-muted-foreground/30 bg-secondary/30 rounded-lg'>
        <div className='h-[186px] flex flex-col items-center justify-center gap-6'>
          <LuLoader className='animate-[spin_3s_linear_infinite]' size={24} />
          <p className='text-sm text-muted-foreground'>Uploading your file</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {hasLimitExceeded && <ModalLimitExceeded isModalOpen={hasLimitExceeded} />}

      <div
        {...getRootProps()}
        className='border border-dashed border-muted-foreground/30 bg-secondary/30 rounded-lg py-10 cursor-pointer hover:border-gray'>
        <Input {...getInputProps()} />
        <div className='text-xs md:text-sm text-center h-full'>
          <div className='flex items-center justify-center gap-4'>
            <MdCloudUpload size={24} />
            <p>Upload your PDF</p>
          </div>
          <div className='mt-8 space-y-2'>
            <p>
              Click here to Upload <span className='text-muted-foreground'>or Drag/Drop your File</span>
            </p>
            <p className='text-muted-foreground'>Supported File Types: PDF</p>
            <p className='text-muted-foreground'>Max File Size: 4.5 Mb</p>
          </div>
        </div>
      </div>
    </>
  );
}
