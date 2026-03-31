'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import FormHint from '../form/FormHint';
import Image from 'next/image';
import MDEditor from '@uiw/react-md-editor';

export interface ProfileFormData {
  name: string;
  logo: File | null;
  logoUrl?: string;
  tagline: string;
  about: string;
}

interface ProfileSectionProps {
  onDataChange?: (data: ProfileFormData) => void;
  initialData?: Partial<ProfileFormData>;
}

const profileSchema = z
  .object({
    name: z.string().trim().min(1, 'Organization name is required'),
    logo: z.any().optional(),
    logoUrl: z.string().optional(),
    tagline: z
      .string()
      .trim()
      .min(1, 'Tagline is required')
      .max(300, 'Tagline must be 300 characters or less'),
    about: z.string().trim().min(1, 'About is required'),
  })
  .refine(data => data.logo || data.logoUrl, {
    message: 'Logo is required',
    path: ['logo'],
  });

const ProfileSection = forwardRef<
  { validate: () => boolean },
  ProfileSectionProps
>(({ onDataChange, initialData }, ref) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: initialData?.name || '',
    logo: initialData?.logo || null,
    logoUrl: initialData?.logoUrl || '',
    tagline: initialData?.tagline || '',
    about: initialData?.about || '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ProfileFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof ProfileFormData, boolean>>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        logo: initialData.logo || null,
        logoUrl: initialData.logoUrl || '',
        tagline: initialData.tagline || '',
        about: initialData.about || '',
      });
    }
  }, [initialData]);

  const handleInputChange = (
    field: keyof ProfileFormData,
    value: string | File | null
  ) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    onDataChange?.(newData);
  };

  const validateFile = (file: File): string | null => {
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      return 'Only JPEG and PNG files are allowed';
    }

    if (file.size > 2 * 1024 * 1024) {
      return 'File size must be less than 2MB';
    }

    return null;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setTouched(prev => ({ ...prev, logo: true }));
      setUploadError(null);

      const error = validateFile(file);
      if (error) {
        setErrors(prev => ({ ...prev, logo: error }));
        return;
      }

      handleInputChange('logo', file);
      setIsUploading(true);

      setTimeout(() => {
        setIsUploading(false);
        setErrors(prev => ({ ...prev, logo: undefined }));
      }, 500);
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
      setTouched(prev => ({ ...prev, logo: true }));
      setUploadError(null);

      const error = validateFile(file);
      if (error) {
        setErrors(prev => ({ ...prev, logo: error }));
        return;
      }

      handleInputChange('logo', file);
      setIsUploading(true);

      setTimeout(() => {
        setIsUploading(false);
        setErrors(prev => ({ ...prev, logo: undefined }));
      }, 500);
    }
  };

  const validateField = (field: keyof ProfileFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    try {
      switch (field) {
        case 'name':
          profileSchema.pick({ name: true }).parse({ name: formData.name });
          setErrors(prev => ({ ...prev, name: undefined }));
          break;
        case 'tagline':
          profileSchema
            .pick({ tagline: true })
            .parse({ tagline: formData.tagline });
          setErrors(prev => ({ ...prev, tagline: undefined }));
          break;
        case 'about':
          profileSchema.pick({ about: true }).parse({ about: formData.about });
          setErrors(prev => ({ ...prev, about: undefined }));
          break;
        case 'logo':
          if (isUploading) break;
          if (!formData.logo && !formData.logoUrl) {
            setErrors(prev => ({ ...prev, logo: 'Logo is required' }));
          } else {
            setErrors(prev => ({ ...prev, logo: undefined }));
          }
          break;
      }
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'issues' in e) {
        const zodError = e as { issues: Array<{ message: string }> };
        const issue = zodError.issues?.[0];
        const msg = issue?.message as string | undefined;
        setErrors(prev => ({ ...prev, [field]: msg || 'Invalid value' }));
      }
    }
  };

  const validateForm = (): boolean => {
    setSubmitted(true);
    if (isUploading) return false;

    const parsed = profileSchema.safeParse(formData);

    if (parsed.success) {
      setErrors({});
      return true;
    }

    const fieldErrors: Partial<Record<keyof ProfileFormData, string>> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0] as keyof ProfileFormData | undefined;
      if (path) {
        fieldErrors[path] = issue.message;
      }
    }

    setErrors(fieldErrors);
    return false;
  };

  useImperativeHandle(ref, () => ({
    validate: validateForm,
  }));

  return (
    <div className='min-h-full space-y-6 text-white'>
      {/* Organization Name */}
      <div className='space-y-2'>
        <Label className='text-white'>
          Project Name <span className='text-red-500'>*</span>
        </Label>
        <Input
          value={formData.name}
          onChange={e => handleInputChange('name', e.target.value)}
          onBlur={() => validateField('name')}
          placeholder='Enter a name for your organization'
          className={cn(
            'focus-visible:border-primary border-[#484848] bg-[#1A1A1A] p-4 text-white placeholder:text-[#919191]',
            (submitted || touched.name) && errors.name && 'border-red-500'
          )}
        />
        {(submitted || touched.name) && errors.name && (
          <p className='text-sm text-red-500'>{errors.name}</p>
        )}
      </div>

      {/* Logo Upload */}
      <div className='space-y-2'>
        <Label className='text-white'>
          Logo <span className='text-red-500'>*</span>
        </Label>

        <div className='relative'>
          <input
            type='file'
            accept='image/jpeg,image/png'
            onChange={handleFileUpload}
            className='hidden'
            id='logo-upload'
          />

          <label
            htmlFor='logo-upload'
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex h-32 w-32 cursor-pointer items-center justify-center rounded-[12px] border border-[#2B2B2B] bg-[#101010] transition-colors xl:h-[200px] xl:w-[200px]',
              formData.logo || formData.logoUrl
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary border-[#484848]',
              (submitted || touched.logo) && errors.logo && 'border-red-500',
              isDragOver && 'border-primary bg-primary/10 scale-105'
            )}
          >
            {formData.logo || formData.logoUrl ? (
              <div className='flex flex-col items-center space-y-2'>
                {isUploading ? (
                  <div className='flex flex-col items-center space-y-2'>
                    <div className='border-primary h-32 w-32 animate-spin rounded-full border-4 border-t-transparent'></div>
                    <span className='text-primary text-xs'>Uploading...</span>
                  </div>
                ) : (
                  <>
                    <Image
                      src={
                        formData.logoUrl ||
                        (formData.logo
                          ? URL.createObjectURL(formData.logo as File)
                          : '')
                      }
                      alt='Project logo'
                      className='h-32 w-32 rounded object-cover xl:h-[200px] xl:w-[200px]'
                      width={200}
                      height={200}
                      onError={e => {
                        if (formData.logo && !formData.logoUrl) {
                          e.currentTarget.src = URL.createObjectURL(
                            formData.logo as File
                          );
                        }
                      }}
                    />
                    <span className='text-xs text-white'>Change</span>
                  </>
                )}
              </div>
            ) : isDragOver ? (
              <div className='flex flex-col items-center space-y-2'>
                <svg
                  width='36'
                  height='36'
                  viewBox='0 0 36 36'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M17.875 2.75012H9.65C6.70972 2.75012 5.23959 2.75012 4.11655 3.32234C3.1287 3.82567 2.32555 4.62882 1.82222 5.61667C1.25 6.73971 1.25 8.20985 1.25 11.1501V25.8501C1.25 28.7904 1.25 30.2605 1.82222 31.3836C2.32555 32.3714 3.1287 33.1746 4.11655 33.6779C5.23959 34.2501 6.70972 34.2501 9.65 34.2501H25.75C27.3775 34.2501 28.1912 34.2501 28.8588 34.0712C30.6705 33.5858 32.0857 32.1707 32.5711 30.3589C32.75 29.6913 32.75 28.8776 32.75 27.2501M29.25 11.5001V1.00012M24 6.25012H34.5M14.375 12.3751C14.375 14.3081 12.808 15.8751 10.875 15.8751C8.942 15.8751 7.375 14.3081 7.375 12.3751C7.375 10.4421 8.942 8.87512 10.875 8.87512C12.808 8.87512 14.375 10.4421 14.375 12.3751ZM22.2326 18.3569L7.42951 31.8142C6.59688 32.5711 6.18057 32.9496 6.14375 33.2775C6.11183 33.5616 6.22079 33.8435 6.43557 34.0323C6.68336 34.2501 7.24599 34.2501 8.37125 34.2501H24.798C27.3165 34.2501 28.5758 34.2501 29.5649 33.827C30.8065 33.2959 31.7957 32.3066 32.3269 31.065C32.75 30.0759 32.75 28.8166 32.75 26.2981C32.75 25.4507 32.75 25.027 32.6574 24.6324C32.5409 24.1365 32.3177 23.672 32.0032 23.2713C31.7529 22.9525 31.4221 22.6878 30.7604 22.1584L25.8652 18.2423C25.2029 17.7125 24.8718 17.4476 24.5071 17.3541C24.1857 17.2717 23.8475 17.2823 23.5319 17.3848C23.1739 17.5011 22.8601 17.7864 22.2326 18.3569Z'
                    stroke='#2EEDAA'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <span className='text-primary text-xs font-medium'>
                  Drop image here
                </span>
              </div>
            ) : (
              <div className='flex flex-col items-center space-y-2'>
                <svg
                  width='36'
                  height='36'
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
                <span className='text-xs text-[#919191]'>
                  Click or drag to upload
                </span>
              </div>
            )}
          </label>
        </div>

        <div className='flex items-start gap-x-1.5'>
          <FormHint
            hint={
              <span>
                Accepted files should be JPEG or PNG, and less than 2 MB.
              </span>
            }
            side='top'
          />
          <div className='space-y-1 text-sm text-[#B5B5B5]'>
            <p>
              Accepted file type:{' '}
              <span className='font-medium text-white'>JPEG</span> or{' '}
              <span className='font-medium text-white'>PNG</span>, and less than{' '}
              <span className='font-medium text-white'>2 MB</span>.
            </p>
            <p>
              A size of{' '}
              <span className='font-medium text-white'>480 x 480 px</span> is
              recommended.
            </p>
          </div>
        </div>
        {(submitted || touched.logo) && errors.logo && (
          <p className='text-sm text-red-500'>{errors.logo}</p>
        )}
        {uploadError && <p className='text-sm text-red-500'>{uploadError}</p>}
      </div>

      {/* Tagline */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <Label className='text-white'>
            Tagline <span className='text-red-500'>*</span>
          </Label>
          <span className='text-sm text-[#919191]'>
            {formData.tagline.length}/300
          </span>
        </div>

        <Textarea
          placeholder='Share the future your project is building'
          value={formData.tagline}
          onChange={e => handleInputChange('tagline', e.target.value)}
          onBlur={() => validateField('tagline')}
          className={cn(
            'focus-visible:border-primary min-h-24 resize-none border-[#484848] bg-[#1A1A1A] text-white placeholder:text-[#919191] xl:min-h-[172px]',
            (submitted || touched.tagline) && errors.tagline && 'border-red-500'
          )}
          maxLength={300}
        />

        <div className='flex items-start gap-x-1.5'>
          <FormHint
            hint={
              <span>
                Describe your project's long-term goal or the positive change it
                will bring to people, communities, or industries.
              </span>
            }
            side='top'
          />
          <p className='text-sm text-[#B5B5B5]'>
            Describe your project's long-term goal or the positive change it
            will bring to people, communities, or industries.
          </p>
        </div>
        {(submitted || touched.tagline) && errors.tagline && (
          <p className='text-sm text-red-500'>{errors.tagline}</p>
        )}
      </div>

      {/* About */}
      <div className='space-y-3'>
        <Label className='text-white'>
          About <span className='text-red-500'>*</span>
        </Label>

        <div className='space-y-3'>
          <div
            className={cn(
              'overflow-hidden rounded-lg border border-[#484848]',
              (submitted || touched.about) && errors.about && 'border-red-500'
            )}
          >
            <MDEditor
              value={formData.about}
              onChange={value => handleInputChange('about', value || '')}
              height={400}
              data-color-mode='dark'
              preview='edit'
              hideToolbar={false}
              visibleDragbar={true}
              textareaProps={{
                placeholder:
                  "Tell your project's full story...\n\nUse text, images, links, or videos to bring your vision to life. Format freely with headings, lists, and more.",
                style: {
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: '#ffffff',
                  backgroundColor: '#101010',
                  fontFamily: 'inherit',
                },
                onBlur: () => validateField('about'),
              }}
              style={{
                backgroundColor: '#101010',
                color: '#ffffff',
              }}
            />
          </div>
        </div>

        {(submitted || touched.about) && errors.about && (
          <p className='text-sm text-red-500'>{errors.about}</p>
        )}
      </div>
    </div>
  );
});

ProfileSection.displayName = 'ProfileSection';

export default ProfileSection;
