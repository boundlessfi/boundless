import { useRef, useState } from 'react';
import React from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { uploadService } from '@/lib/api/upload';
import {
  Upload,
  Loader2,
  FileText,
  X,
  File,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResourceFileUploadProps {
  value?: { url: string; name: string };
  onChange: (file: { url: string; name: string } | undefined) => void;
  disabled?: boolean;
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.ppt', '.pptx', '.doc', '.docx'];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const getFileIcon = (fileName: string) => {
  const extension = fileName.toLowerCase().split('.').pop();
  if (extension === 'pdf') {
    return <FileText className='h-5 w-5 text-red-500' />;
  }
  if (extension === 'ppt' || extension === 'pptx') {
    return <FileSpreadsheet className='h-5 w-5 text-orange-500' />;
  }
  if (extension === 'doc' || extension === 'docx') {
    return <File className='h-5 w-5 text-blue-500' />;
  }
  return <FileText className='h-5 w-5 text-zinc-500' />;
};

export default function ResourceFileUpload({
  value,
  onChange,
  disabled = false,
}: ResourceFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    const isValidType =
      ALLOWED_FILE_TYPES.includes(file.type) ||
      ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValidType) {
      toast.error(
        'Please upload a PDF, PowerPoint (.ppt, .pptx), or Word document (.doc, .docx)'
      );
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 10MB');
      return false;
    }

    return true;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      return;
    }

    setIsUploading(true);
    try {
      const uploadResult = await uploadService.uploadSingle(file, {
        folder: 'boundless/hackathons/resources',
        tags: ['hackathon', 'resource'],
      });

      if (uploadResult.success) {
        onChange({
          url: uploadResult.data.secure_url,
          name: file.name,
        });
        toast.success('File uploaded successfully');
      } else {
        throw new Error(uploadResult.message || 'Upload failed');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';
      toast.error(`Failed to upload file: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!validateFile(file)) {
        return;
      }

      setIsUploading(true);
      try {
        const uploadResult = await uploadService.uploadSingle(file, {
          folder: 'boundless/hackathons/resources',
          tags: ['hackathon', 'resource'],
        });

        if (uploadResult.success) {
          onChange({
            url: uploadResult.data.secure_url,
            name: file.name,
          });
          toast.success('File uploaded successfully');
        } else {
          throw new Error(uploadResult.message || 'Upload failed');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';
        toast.error(`Failed to upload file: ${errorMessage}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemove = () => {
    onChange(undefined);
  };

  return (
    <div className='w-full'>
      <input
        ref={fileInputRef}
        type='file'
        accept='.pdf,.ppt,.pptx,.doc,.docx'
        className='hidden'
        id='resource-file-upload'
        onChange={handleFileUpload}
        disabled={disabled || isUploading}
      />

      {value ? (
        <div className='flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3'>
          <div className='flex-shrink-0'>{getFileIcon(value.name)}</div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium text-white'>
              {value.name}
            </p>
            <p className='text-xs text-zinc-500'>File uploaded</p>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={handleRemove}
            disabled={disabled || isUploading}
            className='h-8 w-8 p-0 text-zinc-400 hover:text-red-500'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      ) : (
        <label
          htmlFor='resource-file-upload'
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-all',
            isDragOver
              ? 'border-primary bg-primary/10'
              : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50',
            (disabled || isUploading) && 'cursor-not-allowed opacity-50'
          )}
        >
          <div className='flex flex-col items-center gap-3 p-6'>
            {isUploading ? (
              <>
                <Loader2 className='text-primary h-8 w-8 animate-spin' />
                <div className='text-center'>
                  <p className='text-sm font-medium text-white'>
                    Uploading file...
                  </p>
                  <p className='text-xs text-zinc-500'>Please wait</p>
                </div>
              </>
            ) : (
              <>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800'>
                  <Upload className='h-6 w-6 text-zinc-500' />
                </div>
                <div className='text-center'>
                  <p className='mb-1 text-sm font-medium text-white'>
                    {isDragOver ? 'Drop file here' : 'Upload file'}
                  </p>
                  <p className='text-xs text-zinc-500'>
                    PDF, PPT, PPTX, DOC, DOCX • Max 10MB
                  </p>
                </div>
              </>
            )}
          </div>
        </label>
      )}
    </div>
  );
}
