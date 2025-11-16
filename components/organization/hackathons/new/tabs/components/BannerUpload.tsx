import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { useRef, useState } from 'react';
import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { uploadService } from '@/lib/api/upload';
import { Upload, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface BannerUploadProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue?: (name: any, value: any) => void;
}

export default function BannerUpload({
  control,
  name,
  setValue,
}: BannerUploadProps) {
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        toast.error('Please upload a JPEG, PNG, GIF, or WebP image');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        setBannerPreview(result);
      };
      reader.readAsDataURL(file);

      setIsUploading(true);
      try {
        const uploadResult = await uploadService.uploadSingle(file, {
          folder: 'boundless/hackathons/banners',
          tags: ['hackathon', 'banner'],
          transformation: {
            width: 1200,
            height: 600,
            crop: 'fit',
            quality: 'auto',
            format: 'auto',
          },
        });

        if (uploadResult.success) {
          if (setValue) {
            setValue(name, uploadResult.data.secure_url);
          }
          toast.success('Banner uploaded successfully');
        } else {
          throw new Error(uploadResult.message || 'Upload failed');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';
        toast.error(`Failed to upload banner: ${errorMessage}`);
      } finally {
        setIsUploading(false);
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

      if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        toast.error('Please upload a JPEG, PNG, GIF, or WebP image');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        setBannerPreview(result);
      };
      reader.readAsDataURL(file);

      setIsUploading(true);
      try {
        const uploadResult = await uploadService.uploadSingle(file, {
          folder: 'boundless/hackathons/banners',
          tags: ['hackathon', 'banner'],
          transformation: {
            width: 1200,
            height: 600,
            crop: 'fit',
            quality: 'auto',
            format: 'auto',
          },
        });

        if (uploadResult.success) {
          if (setValue) {
            setValue(name, uploadResult.data.secure_url);
          }
          toast.success('Banner uploaded successfully');
        } else {
          throw new Error(uploadResult.message || 'Upload failed');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';
        toast.error(`Failed to upload banner: ${errorMessage}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className='text-sm font-medium text-white'>
            Banner <span className='text-red-500'>*</span>
          </FormLabel>
          <p className='mb-3 text-sm text-zinc-500'>
            Upload a banner showcasing your hackathon's theme and key details
          </p>

          <FormControl>
            <div className='relative'>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/jpeg,image/jpg,image/png,image/gif,image/webp'
                className='hidden'
                id='banner-upload'
                onChange={handleBannerUpload}
              />

              <label
                htmlFor='banner-upload'
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'group relative flex aspect-[2/1] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all',
                  isDragOver
                    ? 'border-primary bg-primary/10 scale-[1.02]'
                    : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50',
                  isUploading && 'cursor-not-allowed opacity-50'
                )}
              >
                {isUploading ? (
                  <div className='flex flex-col items-center gap-3'>
                    <Loader2 className='text-primary h-10 w-10 animate-spin' />
                    <div className='text-center'>
                      <p className='text-sm font-medium text-white'>
                        Uploading banner...
                      </p>
                      <p className='text-xs text-zinc-500'>Please wait</p>
                    </div>
                  </div>
                ) : bannerPreview || field.value ? (
                  <div className='relative h-full w-full'>
                    <Image
                      src={field.value || bannerPreview || ''}
                      alt='Banner'
                      fill
                      className='object-cover'
                    />
                    <div className='absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100'>
                      <div className='flex flex-col items-center gap-2'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm'>
                          <Upload className='h-6 w-6 text-white' />
                        </div>
                        <span className='text-sm font-medium text-white'>
                          Change banner
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='flex flex-col items-center gap-4 px-4 py-12'>
                    <div className='flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-800'>
                      <ImageIcon className='h-8 w-8 text-zinc-500' />
                    </div>
                    <div className='text-center'>
                      <p className='mb-1 text-sm font-medium text-white'>
                        {isDragOver ? 'Drop banner here' : 'Upload banner'}
                      </p>
                      <p className='text-xs text-zinc-500'>
                        Click to browse or drag and drop
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </FormControl>

          <div className='mt-3 flex items-start gap-2 rounded-lg bg-zinc-900/30 p-3 text-xs text-zinc-500'>
            <AlertCircle className='h-4 w-4 flex-shrink-0 text-zinc-600' />
            <div className='space-y-1'>
              <p>JPEG, PNG, GIF, or WebP • Max 10MB</p>
              <p>Recommended: 2400 × 1200 px (2:1 ratio)</p>
            </div>
          </div>

          <FormMessage className='text-xs text-red-500' />
        </FormItem>
      )}
    />
  );
}
