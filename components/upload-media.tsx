'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, Video, Music, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress?: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
}

interface UploadMediaProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  onUpload?: (files: UploadedFile[]) => void;
  onRemove?: (id: string) => void;
  className?: string;
  disabled?: boolean;
}

export function UploadMedia({
  accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx',
  multiple = true,
  maxSize = 10, // 10MB default
  maxFiles = 5,
  onUpload,
  onRemove,
  className = '',
  disabled = false,
}: UploadMediaProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className='size-6 text-blue-500' />;
    if (file.type.startsWith('video/')) return <Video className='size-6 text-purple-500' />;
    if (file.type.startsWith('audio/')) return <Music className='size-6 text-green-500' />;
    if (file.type.includes('pdf')) return <FileText className='size-6 text-red-500' />;
    return <File className='size-6 text-gray-500' />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    return null;
  };

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const simulateUpload = async (file: UploadedFile): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? {
                    ...f,
                    progress,
                    status: 'completed' as const,
                    url: `https://example.com/uploads/${file.file.name}`,
                  }
                : f
            )
          );
          resolve();
        } else {
          setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, progress } : f)));
        }
      }, 200);
    });
  };

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      const newFiles = Array.from(fileList);

      if (files.length + newFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const validFiles: UploadedFile[] = [];

      for (const file of newFiles) {
        const error = validateFile(file);
        if (error) {
          alert(error);
          continue;
        }

        const preview = await createFilePreview(file);
        const uploadedFile: UploadedFile = {
          id: Math.random().toString(36).substring(7),
          file,
          preview,
          progress: 0,
          status: 'uploading',
        };

        validFiles.push(uploadedFile);
      }

      setFiles((prev) => [...prev, ...validFiles]);

      // Simulate upload for each file
      validFiles.forEach((file) => {
        simulateUpload(file);
      });

      if (onUpload) {
        onUpload(validFiles);
      }
    },
    [files.length, maxFiles, onUpload, validateFile, createFilePreview, simulateUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFiles(droppedFiles);
      }
    },
    [handleFiles, disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (onRemove) {
      onRemove(id);
    }
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}>
        <CardContent className='p-8 text-center'>
          <Upload className='size-12 mx-auto text-muted-foreground mb-4' />
          <h3 className='text-lg font-medium mb-2'>Drop files here or click to upload</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Support for {accept.split(',').length} file types, up to {maxSize}MB each
          </p>
          <Button variant='outline' size='sm' disabled={disabled}>
            Choose Files
          </Button>

          <input
            ref={fileInputRef}
            type='file'
            accept={accept}
            multiple={multiple}
            onChange={handleFileInput}
            className='hidden'
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium'>
            Uploaded Files ({files.length}/{maxFiles})
          </h4>

          {files.map((file) => (
            <Card key={file.id} className='p-3'>
              <div className='flex items-center space-x-3'>
                {/* File Icon/Preview */}
                <div className='shrink-0'>
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={`Preview of ${file.file.name}`}
                      className='size-12 object-cover rounded'
                    />
                  ) : (
                    getFileIcon(file.file)
                  )}
                </div>

                {/* File Info */}
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>{file.file.name}</p>
                  <p className='text-xs text-muted-foreground'>{formatFileSize(file.file.size)}</p>

                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <div className='w-full bg-muted rounded-full h-1.5 mt-1'>
                      <div
                        className='bg-primary h-1.5 rounded-full transition-all duration-300'
                        style={{ width: `${file.progress || 0}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className='flex items-center space-x-2'>
                  {file.status === 'completed' && (
                    <Badge variant='secondary' className='text-green-600'>
                      Uploaded
                    </Badge>
                  )}
                  {file.status === 'error' && (
                    <Badge variant='destructive'>
                      <AlertCircle className='size-3 mr-1' />
                      Error
                    </Badge>
                  )}

                  <Button
                    variant='ghost'
                    size='sm'
                    className='size-8 px-0'
                    onClick={() => removeFile(file.id)}>
                    <X className='size-4' />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
