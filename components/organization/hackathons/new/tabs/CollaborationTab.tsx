import React, { useRef, useState } from 'react';
import { BoundlessButton } from '@/components/buttons';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  useForm,
  useFieldArray,
  Control,
  UseFormSetValue,
  Path,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  collaborationSchema,
  CollaborationFormData,
} from './schemas/collaborationSchema';
import { cn } from '@/lib/utils';
import { Plus, X, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { uploadService } from '@/lib/api/upload';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Separator } from '@/components/ui/separator';

interface CollaborationTabProps {
  onContinue?: () => void;
  onSave?: (data: CollaborationFormData) => Promise<void>;
  initialData?: CollaborationFormData;
  isLoading?: boolean;
}

// Logo Upload Component
const LogoUpload = ({
  control,
  name,
  setValue,
  index,
}: {
  control: Control<CollaborationFormData>;
  name: Path<CollaborationFormData>;
  setValue: UseFormSetValue<CollaborationFormData>;
  index: number;
}) => {
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          folder: 'boundless/hackathons/sponsors',
          tags: ['hackathon', 'sponsor', 'logo'],
          transformation: {
            width: 2400,
            height: 1200,
            crop: 'fit',
            quality: 'auto',
            format: 'auto',
          },
        });

        if (uploadResult.success) {
          setValue(name, uploadResult.data.secure_url);
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

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className='relative'>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/jpeg,image/jpg,image/png'
                className='hidden'
                id={`logo-upload-${index}`}
                onChange={handleLogoUpload}
              />
              <label
                htmlFor={`logo-upload-${index}`}
                className={cn(
                  'hover:border-primary flex h-[200px] w-[200px] cursor-pointer items-center justify-center rounded-[12px] border border-gray-900 bg-[#101010] transition-colors',
                  isUploading && 'cursor-not-allowed opacity-50'
                )}
              >
                {logoPreview || field.value ? (
                  <div className='relative h-full w-full overflow-hidden rounded-[12px]'>
                    {isUploading ? (
                      <div className='flex h-full w-full items-center justify-center'>
                        <LoadingSpinner
                          size='md'
                          color='primary'
                          variant='spinner'
                        />
                      </div>
                    ) : (
                      <Image
                        src={(field.value as string) || logoPreview || ''}
                        alt='Logo preview'
                        fill
                        className='object-contain'
                      />
                    )}
                  </div>
                ) : (
                  <div className='flex flex-col items-center gap-2'>
                    <ImagePlus
                      size={42}
                      strokeWidth={1}
                      className='text-gray-600'
                    />
                  </div>
                )}
              </label>
            </div>
          </FormControl>
          <p className='mt-2 text-xs text-gray-500'>
            Accepted file type: JPEG or PNG, and cannot exceed 2 MB. A size of
            2400 x 1200 px is recommended.
          </p>
          <FormMessage className='text-error-400 text-xs' />
        </FormItem>
      )}
    />
  );
};

export default function CollaborationTab({
  onContinue,
  onSave,
  initialData,
  isLoading = false,
}: CollaborationTabProps) {
  const form = useForm<CollaborationFormData>({
    resolver: zodResolver(collaborationSchema),
    defaultValues: initialData || {
      contactEmail: '',
      telegram: '',
      discord: '',
      socialLinks: ['', ''],
      sponsorsPartners: [
        {
          id: `sponsor-${Date.now()}-1`,
          name: '',
          logo: '',
          link: '',
        },
      ],
    },
  });

  const {
    fields: socialLinkFields,
    append: appendSocialLink,
    remove: removeSocialLink,
  } = useFieldArray({
    control: form.control,
    name: 'socialLinks' as never,
  });

  const {
    fields: sponsorFields,
    append: appendSponsor,
    remove: removeSponsor,
  } = useFieldArray({
    control: form.control,
    name: 'sponsorsPartners',
  });

  // Initialize default social links if empty (only on mount)
  React.useEffect(() => {
    const currentLinks = form.getValues('socialLinks');
    if (!currentLinks || currentLinks.length === 0) {
      appendSocialLink('');
      appendSocialLink('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: CollaborationFormData) => {
    try {
      if (onSave) {
        await onSave(data);
        toast.success('Collaboration settings saved successfully!');
      }
      if (onContinue) {
        onContinue();
      }
    } catch {
      toast.error('Failed to save collaboration settings. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {/* Contact Section */}
        <div>
          <h3 className='text-sm'>
            Contact <span className='text-error-400'>*</span>
          </h3>
          <p className='mt-1 mb-3 text-sm text-gray-500'>
            Provide channels where participants can connect, ask questions, and
            stay updated throughout the hackathon.
          </p>
          <div className='bg-background-card mt-3 space-y-4 rounded-[12px] border border-gray-900 py-6'>
            {/* Email */}
            <FormField
              control={form.control}
              name='contactEmail'
              render={({ field }) => (
                <FormItem className='px-6'>
                  <FormLabel className='text-sm'>
                    Email (primary contact)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='Enter support email for participants.'
                      value={field.value}
                      onChange={field.onChange}
                      className='focus-visible:border-primary h-12 border-gray-900 bg-[#101010] text-white placeholder:text-gray-600'
                    />
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />

            <Separator className='bg-gray-900' />
            {/* Channels */}
            <div className='space-y-4 px-6'>
              <label className='text-sm text-gray-400'>
                Channels (optional)
              </label>

              {/* Telegram */}
              <div className='border-primary flex items-center rounded-[12px] border'>
                <div className='bg-primary/8 h-12 rounded-l-[12px] px-4 py-3 text-sm font-medium text-white'>
                  Telegram
                </div>
                <FormField
                  control={form.control}
                  name='telegram'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormControl>
                        <Input
                          placeholder='@ Telegram username'
                          value={field.value || ''}
                          onChange={field.onChange}
                          className='focus-visible:border-primary h-12 rounded-l-none rounded-r-[12px] border-gray-900 bg-[#101010] text-white placeholder:text-gray-600'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Discord */}
              <div className='flex items-center rounded-[12px] border border-gray-900'>
                <div className='h-12 rounded-l-[12px] bg-gray-900 px-4 py-3 text-sm font-medium text-gray-500'>
                  Discord
                </div>
                <FormField
                  control={form.control}
                  name='discord'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormControl>
                        <Input
                          placeholder='Discord username'
                          value={field.value || ''}
                          onChange={field.onChange}
                          className='focus-visible:border-primary h-12 rounded-l-none rounded-r-[12px] border-gray-900 bg-[#101010] text-white placeholder:text-gray-600'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Separator className='bg-gray-900' />
            {/* Social Links */}
            <div className='space-y-3 px-6'>
              <label className='mb-2 text-sm text-gray-400'>Social Links</label>
              {socialLinkFields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`socialLinks.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className='relative flex items-center justify-between gap-1'>
                          <div className='relative flex h-12 w-full items-center gap-2 rounded-[12px] border border-gray-900 p-2'>
                            <span className='text-sm text-white'>www.</span>
                            <Input
                              placeholder='x, website, or other relevant links'
                              value={field.value || ''}
                              onChange={field.onChange}
                              className='h-auto flex-1 border-none bg-transparent px-0 text-white placeholder:text-gray-600 focus-visible:border-none focus-visible:ring-0'
                            />
                          </div>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => removeSocialLink(index)}
                            className='text-primary bg-primary/8 hover:bg-primary/10 hover:text-primary h-5 w-5 rounded-full p-0'
                          >
                            <X className='h-2 w-2' />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className='text-error-400 text-xs' />
                    </FormItem>
                  )}
                />
              ))}
              <BoundlessButton
                type='button'
                variant='outline'
                onClick={() => appendSocialLink('')}
                size='xl'
                className='border-primary hover:bg-primary/10 text-primary w-full bg-transparent font-normal'
              >
                Add Link
                <Plus className='ml-2 h-4 w-4' />
              </BoundlessButton>
            </div>
          </div>
        </div>

        {/* Sponsors & Partners Section */}
        <div>
          <h3 className='text-sm'>
            Sponsors & Partners <span className='text-error-400'>*</span>
          </h3>
          <p className='mt-1 mb-3 text-sm text-gray-500'>
            Showcase the organizations supporting your hackathon. Add logos,
            names, and links to highlight their role.
          </p>
          <div className='bg-background-card mt-3 space-y-6 rounded-[12px] border border-gray-900 p-6'>
            {sponsorFields.map((sponsor, index) => (
              <div
                key={sponsor.id}
                className='relative rounded-[12px] border border-gray-900 p-6'
              >
                {sponsorFields.length > 1 && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => removeSponsor(index)}
                    className='hover:bg-primary/10 hover:text-primary absolute top-4 right-4 h-5 w-5 rounded-full bg-gray-900 p-0 text-gray-500'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                )}
                <div className='grid grid-cols-1 gap-6'>
                  <div className='space-y-4'>
                    <FormField
                      control={form.control}
                      name={`sponsorsPartners.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-sm'>
                            Organizer / Sponsor Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Enter organizer or sponsor name'
                              value={field.value}
                              onChange={field.onChange}
                              className='focus-visible:border-primary h-12 border-gray-900 bg-[#101010] text-white placeholder:text-gray-600'
                            />
                          </FormControl>
                          <FormMessage className='text-error-400 text-xs' />
                        </FormItem>
                      )}
                    />
                    <LogoUpload
                      control={form.control}
                      name={`sponsorsPartners.${index}.logo`}
                      setValue={form.setValue}
                      index={index}
                    />
                    <FormField
                      control={form.control}
                      name={`sponsorsPartners.${index}.link`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-sm'>
                            Partnership Links{' '}
                            <span className='text-error-500'>*</span>
                          </FormLabel>
                          <FormControl>
                            <div className='relative flex items-center justify-between gap-1'>
                              <div className='relative flex h-12 w-full items-center gap-2 rounded-[12px] border border-gray-900 p-2'>
                                <span className='text-sm text-white'>www.</span>
                                <Input
                                  placeholder='Link to the organization website'
                                  value={field.value || ''}
                                  onChange={field.onChange}
                                  className='h-auto flex-1 border-none bg-transparent px-0 text-white placeholder:text-gray-600 focus-visible:border-none focus-visible:ring-0'
                                />
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage className='text-error-400 text-xs' />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
            <BoundlessButton
              type='button'
              variant='outline'
              size='xl'
              onClick={() =>
                appendSponsor({
                  id: `sponsor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: '',
                  logo: '',
                  link: '',
                })
              }
              className='border-primary hover:bg-primary/10 text-primary w-full bg-transparent font-normal'
            >
              Add Partner/Sponsor
              <Plus className='ml-2 h-4 w-4' />
            </BoundlessButton>
          </div>
          {form.formState.errors.sponsorsPartners && (
            <p className='text-error-400 mt-2 text-sm'>
              {form.formState.errors.sponsorsPartners.message}
            </p>
          )}
        </div>

        <BoundlessButton type='submit' size='xl' disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Review and Publish'}
        </BoundlessButton>
      </form>
    </Form>
  );
}
