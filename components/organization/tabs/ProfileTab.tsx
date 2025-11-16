'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useOrganization } from '@/lib/providers/OrganizationProvider';
import { BoundlessButton } from '@/components/buttons';
import { toast } from 'sonner';
import { uploadService } from '@/lib/api/upload';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProfileTabProps {
  organizationId?: string;
  initialData?: {
    name?: string;
    logo?: string;
    tagline?: string;
    about?: string;
  };
  onSave?: (data: Record<string, unknown>) => void;
  isCreating?: boolean;
}

export default function ProfileTab({
  organizationId,
  initialData,
  onSave,
  isCreating = false,
}: ProfileTabProps) {
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
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousOrgIdRef = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isCreating) {
      setFormData({ name: '', logo: '', tagline: '', about: '' });
      setLogoPreview('');
      setHasUserChanges(false);
      setIsInitialized(true);
    } else if (!isInitialized) {
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
  }, [activeOrg, initialData, isInitialized, isCreating]);

  useEffect(() => {
    if (activeOrg && isInitialized && !isCreating) {
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
  }, [activeOrg, isInitialized, isCreating]);

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

    if (!formData.logo.trim()) {
      toast.error('Logo is required');
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

      if (isCreating) {
        const newOrg = await createOrganization({
          name: formData.name,
          logo: formData.logo,
          tagline: formData.tagline,
          about: formData.about,
        });

        toast.success('Organization created successfully');
        setTimeout(() => {
          router.push(`/organizations/${newOrg._id}/settings`);
        }, 500);
      } else if (organizationId || activeOrgId) {
        const orgId = organizationId || activeOrgId;
        await updateOrganization(orgId as string, {
          name: formData.name,
          logo: formData.logo,
          tagline: formData.tagline,
          about: formData.about,
        });

        toast.success('Organization profile updated successfully');
        setHasUserChanges(false);
      }

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
      {/* Organization Name */}
      <div className='space-y-2'>
        <Label className='text-sm font-medium text-white'>
          Organization Name <span className='text-red-500'>*</span>
        </Label>
        <Input
          onChange={e => handleInputChange('name', e.target.value)}
          placeholder='Enter organization name'
          className='h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
          value={formData.name}
          disabled={isSaving}
        />
      </div>

      {/* Logo Upload */}
      <div className='space-y-3'>
        <Label className='text-sm font-medium text-white'>
          Logo <span className='text-red-500'>*</span>
        </Label>

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
            'group relative flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all',
            isDragOver
              ? 'border-primary bg-primary/10 scale-105'
              : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50',
            (isSaving || isUploading) && 'cursor-not-allowed opacity-50'
          )}
        >
          {isUploading ? (
            <div className='flex flex-col items-center gap-2'>
              <Loader2 className='text-primary h-8 w-8 animate-spin' />
              <span className='text-xs text-zinc-400'>Uploading...</span>
            </div>
          ) : logoPreview || formData.logo ? (
            <div className='relative h-full w-full'>
              <Image
                src={formData.logo || logoPreview || ''}
                alt='Logo'
                fill
                className='object-cover'
              />
              <div className='absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100'>
                <div className='flex flex-col items-center gap-2'>
                  <Upload className='h-6 w-6 text-white' />
                  <span className='text-xs text-white'>Change</span>
                </div>
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center gap-2'>
              <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800'>
                <Upload className='h-6 w-6 text-zinc-500' />
              </div>
              <div className='text-center'>
                <p className='text-sm font-medium text-white'>
                  {isDragOver ? 'Drop image' : 'Upload logo'}
                </p>
                <p className='text-xs text-zinc-500'>or drag and drop</p>
              </div>
            </div>
          )}
        </label>

        <div className='flex items-start gap-2 rounded-lg bg-zinc-900/30 p-3 text-xs text-zinc-500'>
          <AlertCircle className='h-4 w-4 flex-shrink-0 text-zinc-600' />
          <div className='space-y-1'>
            <p>JPEG or PNG, max 2MB</p>
            <p>Recommended: 480 × 480 px</p>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <Label className='text-sm font-medium text-white'>
            Tagline <span className='text-red-500'>*</span>
          </Label>
          <span className='text-xs text-zinc-500'>
            {formData.tagline.length}/300
          </span>
        </div>
        <Input
          placeholder='Describe your mission in one line'
          className='h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
          maxLength={300}
          value={formData.tagline}
          onChange={e => handleInputChange('tagline', e.target.value)}
          disabled={isSaving}
        />
        <p className='text-xs text-zinc-500'>
          Share the future your organization is building
        </p>
      </div>

      {/* About */}
      <div className='space-y-2'>
        <Label className='text-sm font-medium text-white'>
          About <span className='text-red-500'>*</span>
        </Label>
        <Textarea
          placeholder="Tell your organization's story..."
          className='min-h-32 resize-y border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
          value={formData.about}
          onChange={e => handleInputChange('about', e.target.value)}
          disabled={isSaving}
        />
      </div>

      {/* Save Button */}
      <div className='space-y-3 pt-2'>
        {hasUserChanges && !isCreating && (
          <div className='flex items-center gap-2 rounded-lg border border-amber-900/50 bg-amber-500/5 px-3 py-2 text-sm text-amber-500'>
            <div className='h-2 w-2 flex-shrink-0 rounded-full bg-amber-500' />
            <span>You have unsaved changes</span>
          </div>
        )}

        <BoundlessButton
          onClick={handleSave}
          variant='default'
          size='lg'
          disabled={isSaving || isLoading}
          className='w-full'
        >
          {isSaving ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              {isCreating ? 'Creating...' : 'Saving...'}
            </>
          ) : (
            <>
              {isCreating ? (
                <>
                  <CheckCircle2 className='mr-2 h-4 w-4' />
                  Create Organization
                </>
              ) : (
                'Save Changes'
              )}
            </>
          )}
        </BoundlessButton>
      </div>
    </div>
  );
}
