'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn, slugify } from '@/lib/utils';
import { useOrganization } from '@/lib/providers/OrganizationProvider';
import { BoundlessButton } from '@/components/buttons';
import { toast } from 'sonner';
import { uploadService } from '@/lib/api/upload';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { authClient } from '@/lib/auth-client';
import { z } from 'zod';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProfileTabProps {
  organizationId?: string;
  initialData?: {
    name?: string;
    slug?: string;
    logo?: string;
    metadata?: {
      tagline?: string;
      about?: string;
      links?: {
        website?: string;
        x?: string;
        github?: string;
        others?: string;
      };
    };
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
    isLoadingOrganizations,
  } = useOrganization();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    metadata: {
      tagline: '',
      about: '',
      links: {
        website: '',
        x: '',
        github: '',
        others: '',
      },
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [hasUserChanges, setHasUserChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousOrgIdRef = useRef<string | null>(null);
  const slugManuallyEditedRef = useRef(false);
  const router = useRouter();
  const debouncedSlug = useDebounce(formData.slug, 500);

  useEffect(() => {
    const checkSlugAvailability = async () => {
      if (!debouncedSlug) {
        setIsSlugAvailable(null);
        return;
      }
      if (debouncedSlug.length < 3) {
        setIsSlugAvailable(null);
        return;
      }
      const slugValidation = z.string().min(3).safeParse(debouncedSlug);
      if (!slugValidation.success) {
        setIsSlugAvailable(false);
        return;
      }
      try {
        const { data: response } = await authClient.organization.checkSlug({
          slug: debouncedSlug,
        });
        setIsSlugAvailable(response?.status ?? true);
      } catch {
        setIsSlugAvailable(false);
      }
    };
    checkSlugAvailability();
  }, [debouncedSlug]);

  useEffect(() => {
    if (isCreating) {
      setFormData({
        name: '',
        slug: '',
        logo: '',
        metadata: {
          tagline: '',
          about: '',
          links: { website: '', x: '', github: '', others: '' },
        },
      });
      setLogoPreview('');
      setHasUserChanges(false);
      setIsInitialized(true);
    } else if (!isInitialized) {
      if (activeOrg) {
        setFormData({
          name: activeOrg.name || '',
          slug: activeOrg.slug || '',
          logo: activeOrg.logo || '',
          metadata: {
            tagline: activeOrg.tagline || '',
            about: activeOrg.about || '',
            links: {
              website: activeOrg.links?.website || '',
              x: activeOrg.links?.x || '',
              github: activeOrg.links?.github || '',
              others: activeOrg.links?.others || '',
            },
          },
        });
        setLogoPreview(activeOrg.logo || '');
        setHasUserChanges(false);
        setIsInitialized(true);
        previousOrgIdRef.current = activeOrg.id as string;
      } else if (initialData) {
        setFormData({
          name: initialData.name || '',
          slug: initialData.slug || '',
          logo: initialData.logo || '',
          metadata: {
            tagline: initialData.metadata?.tagline || '',
            about: initialData.metadata?.about || '',
            links: {
              website: initialData.metadata?.links?.website || '',
              x: initialData.metadata?.links?.x || '',
              github: initialData.metadata?.links?.github || '',
              others: initialData.metadata?.links?.others || '',
            },
          },
        });
        setHasUserChanges(false);
        setIsInitialized(true);
      }
    }
  }, [activeOrg, initialData, isInitialized, isCreating]);

  useEffect(() => {
    if (activeOrg && isInitialized && !isCreating) {
      const currentOrgId = activeOrg.id;
      const previousOrgId = previousOrgIdRef.current;

      if (currentOrgId && currentOrgId !== previousOrgId) {
        // Find links either top-level or in metadata
        const activeLinks =
          activeOrg.links || (activeOrg as any).metadata?.links;

        setFormData({
          name: activeOrg.name || '',
          slug: activeOrg.slug || '',
          logo: activeOrg.logo || '',
          metadata: {
            tagline:
              activeOrg.tagline || (activeOrg as any).metadata?.tagline || '',
            about: activeOrg.about || (activeOrg as any).metadata?.about || '',
            links: {
              website: activeLinks?.website || '',
              x: activeLinks?.x || '',
              github: activeLinks?.github || '',
              others: activeLinks?.others || '',
            },
          },
        });
        setLogoPreview(activeOrg.logo || '');
        setHasUserChanges(false);
        previousOrgIdRef.current = currentOrgId;
        slugManuallyEditedRef.current = true; // existing org: don't overwrite slug when name changes
      }
    }
  }, [activeOrg, isInitialized, isCreating]);

  const handleInputChange = (field: string, value: string) => {
    if (field === 'slug') {
      slugManuallyEditedRef.current = true;
      setFormData(prev => ({ ...prev, slug: value }));
    } else if (field === 'name') {
      const slugFromName = slugify(value);
      setFormData(prev => ({
        ...prev,
        name: value,
        ...(slugManuallyEditedRef.current ? {} : { slug: slugFromName }),
      }));
    } else if (field === 'tagline') {
      setFormData(prev => ({
        ...prev,
        metadata: { ...prev.metadata, tagline: value },
      }));
    } else if (field === 'about') {
      setFormData(prev => ({
        ...prev,
        metadata: { ...prev.metadata, about: value },
      }));
    } else if (field === 'links') {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          links: { ...prev.metadata.links, [field]: value },
        },
      }));
    } else if (field === 'logo') {
      setFormData(prev => ({ ...prev, logo: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        metadata: { ...prev.metadata, [field]: value },
      }));
    }
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

    if (!formData.metadata.tagline.trim()) {
      toast.error('Tagline is required');
      return;
    }

    if (!formData.metadata.about.trim()) {
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
          slug: formData.slug,
          logo: formData.logo,
          metadata: {
            tagline: formData.metadata.tagline,
            about: formData.metadata.about,
            links: {
              website: formData.metadata.links?.website,
              x: formData.metadata.links?.x,
              github: formData.metadata.links?.github,
              others: formData.metadata.links?.others,
            },
          },
        });

        toast.success('Organization created successfully');
        setTimeout(() => {
          router.push(`/organizations/${newOrg.id}/settings`);
        }, 500);
      } else if (organizationId || activeOrgId) {
        const orgId = organizationId || activeOrgId;
        const updatedOrg = await updateOrganization(orgId as string, {
          name: formData.name,
          logo: formData.logo,
          metadata: {
            tagline: formData.metadata.tagline,
            about: formData.metadata.about,
            links: {
              website: formData.metadata.links?.website,
              x: formData.metadata.links?.x,
              github: formData.metadata.links?.github,
              others: formData.metadata.links?.others,
            },
          },
        });

        if (updatedOrg) {
          const activeLinks =
            updatedOrg.links ||
            (updatedOrg as { metadata?: { links?: Record<string, string> } })
              .metadata?.links;
          setFormData({
            name: updatedOrg.name || '',
            slug: updatedOrg.slug || '',
            logo: updatedOrg.logo || '',
            metadata: {
              tagline:
                updatedOrg.tagline ||
                (updatedOrg as { metadata?: { tagline?: string } }).metadata
                  ?.tagline ||
                '',
              about:
                updatedOrg.about ||
                (updatedOrg as { metadata?: { about?: string } }).metadata
                  ?.about ||
                '',
              links: {
                website: activeLinks?.website || '',
                x: activeLinks?.x || '',
                github: activeLinks?.github || '',
                others: activeLinks?.others || '',
              },
            },
          });
          setLogoPreview(updatedOrg.logo || '');
        }

        toast.success('Organization profile updated successfully');
        setHasUserChanges(false);
      }

      if (onSave) {
        onSave(formData);
      }
    } catch (error) {
      // Try to extract the actual backend error message
      let errorMessage =
        'Failed to save organization profile. Please try again.';

      if (error instanceof Error) {
        // Better Auth errors have a nested structure: error.context.body.message
        const errorObj = error as any;

        // Check for Better Auth error structure
        if (errorObj.context?.body?.message) {
          errorMessage = errorObj.context.body.message;
        } else if (errorObj.response?.data?.message) {
          // Standard API error structure
          errorMessage = errorObj.response.data.message;
        } else if (errorObj.message) {
          // Parse common error patterns
          if (
            errorObj.message.includes('401') ||
            errorObj.message.includes('Unauthorized')
          ) {
            errorMessage = 'Authentication failed. Please login again.';
          } else if (
            errorObj.message.includes('403') ||
            errorObj.message.includes('Forbidden') ||
            errorObj.message.includes('not allowed')
          ) {
            errorMessage =
              'You do not have permission to update this organization.';
          } else if (
            errorObj.message.includes('404') ||
            errorObj.message.includes('Not Found')
          ) {
            errorMessage = 'Organization not found.';
          } else if (
            errorObj.message.includes('Network') ||
            errorObj.message.includes('timeout')
          ) {
            errorMessage =
              'Network error. Please check your connection and try again.';
          } else {
            errorMessage = errorObj.message;
          }
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const loadingui = isSaving || isLoadingOrganizations;
  if (loadingui) {
    return (
      <div className='relative h-[calc(100vh-300px)] space-y-8'>
        {loadingui && (
          <div className='absolute top-0 right-0 bottom-0 left-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
            <LoadingSpinner size='lg' className='z-20 text-white' />
          </div>
        )}
      </div>
    );
  }
  return (
    <div className='space-y-6'>
      {/* Organization Name */}
      <div className='flex justify-between gap-4'>
        <div className='flex-1 space-y-2'>
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
        <div className='flex-1 space-y-2'>
          <Label className='text-sm font-medium text-white'>
            Slug <span className='text-red-500'>*</span>
          </Label>
          <Input
            onChange={e => handleInputChange('slug', e.target.value)}
            placeholder='Enter organization slug'
            className='h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
            value={formData.slug}
            disabled={isSaving}
          />
          {isSlugAvailable === false && (
            <p className='text-xs text-red-500'>Slug is already taken</p>
          )}
          {isSlugAvailable === true && (
            <p className='text-xs text-green-500'>Slug is available</p>
          )}
          {isCreating && (
            <p className='text-xs text-zinc-500'>
              Generated from name; you can edit it.
            </p>
          )}
        </div>
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
          <AlertCircle className='h-4 w-4 shrink-0 text-zinc-600' />
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
            {formData.metadata.tagline.length}/300
          </span>
        </div>
        <Input
          placeholder='Describe your mission in one line'
          className='h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
          maxLength={300}
          value={formData.metadata.tagline}
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
          value={formData.metadata.about}
          onChange={e => handleInputChange('about', e.target.value)}
          disabled={isSaving}
        />
      </div>

      {/* Save Button */}
      <div className='space-y-3 pt-2'>
        {hasUserChanges && !isCreating && (
          <div className='flex items-center gap-2 rounded-lg border border-amber-900/50 bg-amber-500/5 px-3 py-2 text-sm text-amber-500'>
            <div className='h-2 w-2 shrink-0 rounded-full bg-amber-500' />
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
