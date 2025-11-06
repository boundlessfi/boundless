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
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

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
  const [uploadError, setUploadError] = useState<string | null>(null);
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

      setUploadError(null);

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
        setUploadError(errorMessage);
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

      setUploadError(null);

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
        setUploadError(errorMessage);
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
        <FormItem className='gap-3'>
          <FormLabel className='text-sm'>
            Banner <span className='text-error-400'>*</span>
          </FormLabel>
          <span className='text-sm text-gray-500'>
            Upload a banner image for the hackathon page. We recommend including
            key details and showcasing the theme of the hackathon.
          </span>
          <FormControl>
            <div className='relative'>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/jpeg,image/jpg,image/png,image/gif'
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
                  'hover:border-primary bg-background-card flex h-75 w-full cursor-pointer items-center justify-center overflow-hidden rounded-[12px] border border-gray-900 transition-colors',
                  isUploading && 'cursor-not-allowed opacity-50',
                  isDragOver && 'border-primary bg-primary/5'
                )}
              >
                {bannerPreview || field.value ? (
                  <div className='flex flex-col items-center space-y-2'>
                    {isUploading ? (
                      <div className='flex flex-col items-center space-y-2'>
                        <LoadingSpinner
                          size='xl'
                          color='primary'
                          variant='spinner'
                        />
                      </div>
                    ) : (
                      <Image
                        src={field.value || bannerPreview || ''}
                        alt='Banner preview'
                        width={1200}
                        height={600}
                        className='aspect-[2400/1200] h-full w-full object-cover'
                      />
                    )}
                  </div>
                ) : isDragOver ? (
                  <div className='flex flex-col items-center space-y-2'>
                    <svg
                      width='48'
                      height='48'
                      viewBox='0 0 36 36'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M17.875 2.75012H9.65C6.70972 2.75012 5.23959 2.75012 4.11655 3.32234C3.1287 3.82567 2.32555 4.62882 1.82222 5.61667C1.25 6.73971 1.25 8.20985 1.25 11.1501V25.8501C1.25 28.7904 1.25 30.2605 1.82222 31.3836C2.32555 32.3714 3.1287 33.1746 4.11655 33.6779C5.23959 34.2501 6.70972 34.2501 9.65 34.2501H25.75C27.3775 34.2501 28.1912 34.2501 28.8588 34.0712C30.6705 33.5858 32.0857 32.1707 32.5711 30.3589C32.75 29.6913 32.75 28.8776 32.75 27.2501M29.25 11.5001V1.00012M24 6.25012H34.5M14.375 12.3751C14.375 14.3081 12.808 15.8751 10.875 15.8751C8.942 15.8751 7.375 14.3081 7.375 12.3751C7.375 10.4421 8.942 8.87512 10.875 8.87512C12.808 8.87512 14.375 10.4421 14.375 12.3751ZM22.2326 18.3569L7.42951 31.8142C6.59688 32.5711 6.18057 32.9496 6.14375 33.2775C6.11183 33.5616 6.22079 33.8435 6.43557 34.0323C6.68336 34.2501 7.24599 34.2501 8.37125 34.2501H24.798C27.3165 34.2501 28.5758 34.2501 29.5649 33.827C30.8065 33.2959 31.7957 32.3066 32.3269 31.065C32.75 30.0759 32.75 28.8166 32.75 26.2981C32.75 25.4507 32.75 25.027 32.6574 24.6324C32.5409 24.1365 32.3177 23.672 32.0032 23.2713C31.7529 22.9525 31.4221 22.6878 30.7604 22.1584L25.8652 18.2423C25.2029 17.7125 24.8718 17.4476 24.5071 17.3541C24.1857 17.2717 23.8475 17.2823 23.5319 17.3848C23.1739 17.5011 22.8601 17.7864 22.2326 18.3569Z'
                        stroke='#A7F950'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                    <span className='text-primary text-sm font-medium'>
                      Drop banner here
                    </span>
                  </div>
                ) : (
                  <div className='flex flex-col items-center space-y-2'>
                    <svg
                      width='48'
                      height='48'
                      viewBox='0 0 36 36'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M17.875 2.75012H9.65C6.70972 2.75012 5.23959 2.75012 4.11655 3.32234C3.1287 3.82567 2.32555 4.62882 1.82222 5.61667C1.25 6.73971 1.25 8.20985 1.25 11.1501V25.8501C1.25 28.7904 1.25 30.2605 1.82222 31.3836C2.32555 32.3714 3.1287 33.1746 4.11655 33.6779C5.23959 34.2501 6.70972 34.2501 9.65 34.2501H25.75C27.3775 34.2501 28.1912 34.2501 28.8588 34.0712C30.6705 33.5858 32.0857 32.1707 32.5711 30.3589C32.75 29.6913 32.75 28.8776 32.75 27.2501M29.25 11.5001V1.00012M24 6.25012H34.5M14.375 12.3751C14.375 14.3081 12.808 15.8751 10.875 15.8751C8.942 15.8751 7.375 14.3081 7.375 12.3751C7.375 10.4421 8.942 8.87512 10.875 8.87512C12.808 8.87512 14.375 10.4421 14.375 12.3751ZM22.2326 18.3569L7.42951 31.8142C6.59688 32.5711 6.18057 32.9496 6.14375 33.2775C6.11183 33.5616 6.22079 33.8435 6.43557 34.0323C6.68336 34.2501 7.24599 34.2501 8.37125 34.2501H24.798C27.3165 34.2501 28.5758 34.2501 29.5649 33.827C30.8065 33.2959 31.7957 32.3066 32.3269 31.065C32.75 30.0759 32.75 28.8166 32.75 26.2981C32.75 25.4507 32.75 25.027 32.6574 24.6324C32.5409 24.1365 32.3177 23.672 32.0032 23.2713C31.7529 22.9525 31.4221 22.6878 30.7604 22.1584L25.8652 18.2423C25.2029 17.7125 24.8718 17.4476 24.5071 17.3541C24.1857 17.2717 23.8475 17.2823 23.5319 17.3848C23.1739 17.5011 22.8601 17.7864 22.2326 18.3569Z'
                        stroke='#919191'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                    <span className='text-sm text-[#919191]'>
                      Click or drag to upload banner
                    </span>
                  </div>
                )}
              </label>
            </div>
          </FormControl>
          <div className='flex space-y-1 text-sm text-[#B5B5B5]'>
            <div className='w-8'>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className='h-4 w-4' />
                  </TooltipTrigger>
                  <TooltipContent side='right'>
                    <p>
                      Accepted file types:{' '}
                      <span className='font-medium'>JPEG, PNG, GIF</span>, and
                      less than <span className='font-medium'>2 MB</span>.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div>
              <p>
                Accepted file types:{' '}
                <span className='font-medium text-white'>JPEG, PNG, GIF</span>,
                and less than{' '}
                <span className='font-medium text-white'>2 MB</span>.
              </p>
              <p>
                A size of{' '}
                <span className='font-medium text-white'>2400 x 1200 px</span>{' '}
                is recommended.
              </p>
              {uploadError && (
                <p className='text-sm text-red-500'>{uploadError}</p>
              )}
            </div>
          </div>
          <FormMessage className='text-error-400 text-xs' />
        </FormItem>
      )}
    />
  );
}
