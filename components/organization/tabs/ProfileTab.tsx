'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import FormHint from '../../form/FormHint';
import MDEditor from '@uiw/react-md-editor';
import { useOrganization } from '@/lib/providers/OrganizationProvider';
import { BoundlessButton } from '@/components/buttons';
import { toast } from 'sonner';
import { uploadService } from '@/lib/api/upload';
import { useRouter } from 'next/navigation';

interface ProfileTabProps {
  organizationId: string;
  initialData?: {
    name?: string;
    logo?: string;
    tagline?: string;
    about?: string;
  };
  onSave?: (data: Record<string, unknown>) => void;
}

export default function ProfileTab({ initialData, onSave }: ProfileTabProps) {
  const {
    activeOrgId,
    activeOrg,
    createOrganization,
    updateOrganization,
    isLoading,
  } = useOrganization();

  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    tagline: '',
    about: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [hasUserChanges, setHasUserChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousOrgIdRef = useRef<string | null>(null);
  const router = useRouter();

  // useEffect(() => {
  //   setIsInitialized(false);
  //   previousOrgIdRef.current = null;
  // }, [organizationId]);

  useEffect(() => {
    if (!isInitialized) {
      if (activeOrg) {
        setFormData({
          name: activeOrg.name || '',
          logo: activeOrg.logo || '',
          tagline: activeOrg.tagline || '',
          about: activeOrg.about || '',
        });
        setLogoPreview(activeOrg.logo || '');
        setHasUserChanges(false);
        setIsInitialized(true);
        previousOrgIdRef.current = activeOrg._id;
      } else if (initialData) {
        setFormData({
          name: initialData.name || '',
          logo: initialData.logo || '',
          tagline: initialData.tagline || '',
          about: initialData.about || '',
        });
        setLogoPreview(initialData.logo || '');
        setHasUserChanges(false);
        setIsInitialized(true);
      }
    }
  }, [activeOrg, initialData, isInitialized]);

  useEffect(() => {
    if (activeOrg && isInitialized) {
      const currentOrgId = activeOrg._id;
      const previousOrgId = previousOrgIdRef.current;

      if (currentOrgId && currentOrgId !== previousOrgId) {
        setFormData({
          name: activeOrg.name || '',
          logo: activeOrg.logo || '',
          tagline: activeOrg.tagline || '',
          about: activeOrg.about || '',
        });
        setLogoPreview(activeOrg.logo || '');
        setHasUserChanges(false);
        previousOrgIdRef.current = currentOrgId;
      }
    }
  }, [activeOrg, isInitialized]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUserChanges(true);
  };

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        toast.error('Please upload a JPEG or PNG image');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }

      setUploadError(null);

      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);

      setIsUploading(true);
      try {
        const uploadResult = await uploadService.uploadSingle(file, {
          folder: 'boundless/organizations/logos',
          tags: ['organization', 'logo'],
          transformation: {
            width: 400,
            height: 400,
            crop: 'fit',
            quality: 'auto',
            format: 'auto',
          },
        });

        if (uploadResult.success) {
          setFormData(prev => ({
            ...prev,
            logo: uploadResult.data.secure_url,
          }));
          setHasUserChanges(true);
          toast.success('Logo uploaded successfully');
        } else {
          throw new Error(uploadResult.message || 'Upload failed');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';
        setUploadError(errorMessage);
        toast.error(`Failed to upload logo: ${errorMessage}`);
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

      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        toast.error('Please upload a JPEG or PNG image');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }

      setUploadError(null);

      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);

      setIsUploading(true);
      try {
        const uploadResult = await uploadService.uploadSingle(file, {
          folder: 'boundless/organizations/logos',
          tags: ['organization', 'logo'],
          transformation: {
            width: 400,
            height: 400,
            crop: 'fit',
            quality: 'auto',
            format: 'auto',
          },
        });

        if (uploadResult.success) {
          setFormData(prev => ({
            ...prev,
            logo: uploadResult.data.secure_url,
          }));
          setHasUserChanges(true);
          toast.success('Logo uploaded successfully');
        } else {
          throw new Error(uploadResult.message || 'Upload failed');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';
        setUploadError(errorMessage);
        toast.error(`Failed to upload logo: ${errorMessage}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    if (!formData.tagline.trim()) {
      toast.error('Tagline is required');
      return;
    }

    if (!formData.about.trim()) {
      toast.error('About section is required');
      return;
    }

    setIsSaving(true);

    try {
      if (!updateOrganization || !createOrganization) {
        throw new Error(
          'Organization functions not available. Please refresh the page.'
        );
      }

      if (activeOrgId && activeOrg) {
        await updateOrganization(activeOrgId, {
          name: formData.name,
          logo: formData.logo,
          tagline: formData.tagline,
          about: formData.about,
        });
        toast.success('Organization profile updated successfully');
        if (activeOrgId) {
          setTimeout(() => {
            router.push(`/organizations/${activeOrgId}/settings`);
          }, 500);
        }
      } else {
        await createOrganization({
          name: formData.name,
          logo: formData.logo,
          tagline: formData.tagline,
          about: formData.about,
        });
        toast.success('Organization created successfully');
        if (activeOrgId) {
          setTimeout(() => {
            router.push(`/organizations/${activeOrgId}/settings`);
          }, 500);
        }
      }

      setHasUserChanges(false);

      if (onSave) {
        onSave(formData);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('401') ||
          error.message.includes('Unauthorized')
        ) {
          toast.error('Authentication failed. Please login again.');
        } else if (
          error.message.includes('403') ||
          error.message.includes('Forbidden')
        ) {
          toast.error(
            'You do not have permission to update this organization.'
          );
        } else if (
          error.message.includes('404') ||
          error.message.includes('Not Found')
        ) {
          toast.error('Organization not found.');
        } else if (
          error.message.includes('Network') ||
          error.message.includes('timeout')
        ) {
          toast.error(
            'Network error. Please check your connection and try again.'
          );
        } else {
          toast.error(`Failed to save organization profile: ${error.message}`);
        }
      } else {
        toast.error('Failed to save organization profile. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Label className='text-white'>
          Organization Name <span className='text-red-500'>*</span>
        </Label>
        <Input
          onChange={e => handleInputChange('name', e.target.value)}
          placeholder='Enter a name for your organization'
          className={cn(
            'focus-visible:border-primary border-[#484848] bg-[#1A1A1A] p-4 text-white placeholder:text-[#919191]'
          )}
          value={formData.name}
          disabled={isSaving}
        />
      </div>

      <div className='space-y-2'>
        <Label className='text-white'>
          Logo <span className='text-red-500'>*</span>
        </Label>

        <div className='relative'>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/jpeg,image/png'
            className='hidden'
            id='logo-upload'
            onChange={handleLogoUpload}
            disabled={isSaving}
          />

          <label
            htmlFor='logo-upload'
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'hover:border-primary flex h-32 w-32 cursor-pointer items-center justify-center rounded-[12px] border border-[#2B2B2B] bg-[#101010] transition-colors xl:h-[200px] xl:w-[200px]',
              (isSaving || isUploading) && 'cursor-not-allowed opacity-50',
              isDragOver && 'border-primary bg-primary/10 scale-105'
            )}
          >
            {logoPreview || formData.logo ? (
              <div className='flex flex-col items-center space-y-2'>
                {isUploading ? (
                  <div className='flex flex-col items-center space-y-2'>
                    <div className='border-primary h-32 w-32 animate-spin rounded-full border-4 border-t-transparent'></div>
                    <span className='text-primary text-xs'>Uploading...</span>
                  </div>
                ) : (
                  <>
                    <div className='relative h-32 w-32 overflow-hidden rounded-[12px]'>
                      <Image
                        src={formData.logo || logoPreview || ''}
                        alt='Logo preview'
                        fill
                        sizes='128px'
                        className='object-cover'
                      />
                    </div>
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
                    stroke='#A7F950'
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
            {uploadError && (
              <p className='text-sm text-red-500'>{uploadError}</p>
            )}
          </div>
        </div>
      </div>

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
          className='focus-visible:border-primary min-h-24 resize-none border-[#484848] bg-[#1A1A1A] text-white placeholder:text-[#919191] xl:min-h-[172px]'
          maxLength={300}
          value={formData.tagline}
          onChange={e => handleInputChange('tagline', e.target.value)}
          disabled={isSaving}
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
      </div>

      <div className='space-y-2'>
        <Label htmlFor='about' className='text-sm font-medium text-white'>
          About <span className='text-red-500'>*</span>
        </Label>

        <div className='space-y-3'>
          <div>
            <div className='overflow-hidden rounded-lg border border-[#484848]'>
              <MDEditor
                height={400}
                data-color-mode='dark'
                preview='edit'
                hideToolbar={false}
                visibleDragbar={true}
                value={formData.about}
                onChange={value => handleInputChange('about', value || '')}
                textareaProps={{
                  placeholder:
                    "Tell your organization's full story...\n\nUse text, images, links, or videos to bring your vision to life. Format freely with headings, lists, and more.",
                  style: {
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: '#ffffff',
                    backgroundColor: '#101010',
                    fontFamily: 'inherit',
                  },
                  disabled: isSaving,
                }}
                style={{
                  backgroundColor: '#101010',
                  color: '#ffffff',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className='space-y-2'>
        {hasUserChanges && (
          <div className='flex items-center gap-2 text-sm text-amber-400'>
            <div className='h-2 w-2 rounded-full bg-amber-400' />
            You have unsaved changes
          </div>
        )}
        <BoundlessButton
          onClick={handleSave}
          variant='default'
          size='lg'
          disabled={isSaving || isLoading}
          className={cn(
            'w-full',
            (isSaving || isLoading) && 'cursor-not-allowed opacity-50'
          )}
        >
          {isSaving
            ? 'Saving...'
            : activeOrgId
              ? 'Save Changes'
              : 'Create Organization'}
        </BoundlessButton>
      </div>
    </div>
  );
}
