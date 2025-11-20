'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import BoundlessSheet from '@/components/sheet/boundless-sheet';
import Stepper from '@/components/stepper/Stepper';
import { uploadService } from '@/lib/api/upload';
import { useSubmission } from '@/hooks/hackathon/use-submission';
import { toast } from 'sonner';
import { Loader2, Upload, X, Link2, Plus } from 'lucide-react';
import Image from 'next/image';

type StepState = 'pending' | 'active' | 'completed';

interface Step {
  title: string;
  description: string;
  state: StepState;
}

const submissionSchema = z.object({
  projectName: z.string().min(3, 'Project name must be at least 3 characters'),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  logo: z.string().optional(),
  videoUrl: z
    .union([z.string().url('Please enter a valid URL'), z.literal('')])
    .optional(),
  introduction: z.string().optional(),
  links: z
    .array(
      z.object({
        type: z.string(),
        url: z.string().url('Please enter a valid URL'),
      })
    )
    .optional(),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

interface CreateSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hackathonSlugOrId: string;
  organizationId?: string;
  initialData?: Partial<SubmissionFormData>;
  submissionId?: string;
  onSuccess?: () => void;
}

const INITIAL_STEPS: Step[] = [
  {
    title: 'Basic Info',
    description: 'Project name, category, and description',
    state: 'active',
  },
  {
    title: 'Media & Links',
    description: 'Logo, video, and project links',
    state: 'pending',
  },
  {
    title: 'Review',
    description: 'Review and submit your project',
    state: 'pending',
  },
];

const LINK_TYPES = [
  { value: 'github', label: 'GitHub' },
  { value: 'demo', label: 'Demo' },
  { value: 'website', label: 'Website' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'other', label: 'Other' },
];

const CATEGORIES = [
  'Web Development',
  'Mobile App',
  'Blockchain',
  'AI/ML',
  'IoT',
  'Game Development',
  'Design',
  'Other',
];

const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url || url.trim() === '') return false;
  // Check if it's a data URL
  if (url.startsWith('data:image/')) return true;
  // Check if it's an absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) return true;
  // Check if it's a relative path
  if (url.startsWith('/')) return true;
  return false;
};

export function CreateSubmissionModal({
  open,
  onOpenChange,
  hackathonSlugOrId,
  organizationId,
  initialData,
  submissionId,
  onSuccess,
}: CreateSubmissionModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const { create, update, isSubmitting } = useSubmission({
    hackathonSlugOrId,
    organizationId,
    autoFetch: false,
  });

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    mode: 'onChange',
    defaultValues: {
      projectName: '',
      category: '',
      description: '',
      logo: '',
      videoUrl: '',
      introduction: '',
      links: [],
    },
  });

  // Watch links to keep them in sync
  const formLinks = form.watch('links') || [];

  // Initialize form when modal opens with data
  useEffect(() => {
    if (open && initialData) {
      form.reset({
        projectName: initialData.projectName || '',
        category: initialData.category || '',
        description: initialData.description || '',
        logo: initialData.logo || '',
        videoUrl: initialData.videoUrl || '',
        introduction: initialData.introduction || '',
        links: initialData.links || [],
      });
      if (initialData.logo && isValidImageUrl(initialData.logo)) {
        setLogoPreview(initialData.logo);
      }
    }
  }, [open, initialData, form]);

  // Reset everything when modal closes
  useEffect(() => {
    if (!open) {
      // Use setTimeout to ensure modal animation completes before reset
      const timer = setTimeout(() => {
        form.reset({
          projectName: '',
          category: '',
          description: '',
          logo: '',
          videoUrl: '',
          introduction: '',
          links: [],
        });
        setLogoPreview('');
        setCurrentStep(0);
        setSteps(INITIAL_STEPS);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, form]);

  const handleLogoUpload = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      toast.error('Please upload a JPEG, PNG, GIF, or WebP image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setLogoPreview(result);
    };
    reader.readAsDataURL(file);

    setIsUploadingLogo(true);
    try {
      const uploadResult = await uploadService.uploadSingle(file, {
        folder: 'boundless/hackathons/submissions/logos',
        tags: ['hackathon', 'submission', 'logo'],
        transformation: {
          width: 400,
          height: 400,
          crop: 'fit',
          quality: 'auto',
          format: 'auto',
        },
      });

      if (uploadResult.success) {
        form.setValue('logo', uploadResult.data.secure_url, {
          shouldValidate: true,
        });
        toast.success('Logo uploaded successfully');
      } else {
        throw new Error(uploadResult.message || 'Upload failed');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';
      toast.error(`Failed to upload logo: ${errorMessage}`);
      // Clear preview on error
      setLogoPreview('');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleFillMockData = () => {
    const mockData = {
      projectName: 'AI-Powered Task Manager',
      category: 'AI/ML',
      description:
        'An intelligent task management application that uses machine learning to prioritize tasks, predict deadlines, and suggest optimal work schedules. It integrates with calendar apps and provides personalized productivity insights based on your work patterns.',
      logo: '',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      introduction:
        'This project leverages advanced AI algorithms to help users manage their time more effectively. It learns from user behavior and adapts to individual work styles.',
      links: [
        { type: 'github', url: 'https://github.com/example/ai-task-manager' },
        { type: 'demo', url: 'https://demo.example.com/ai-task-manager' },
        { type: 'website', url: 'https://www.example.com/ai-task-manager' },
      ],
    };

    form.reset(mockData);
    form.setValue('links', mockData.links, { shouldValidate: false });
    toast.success('Form filled with mock data');
  };

  const handleAddLink = () => {
    const currentLinks = form.getValues('links') || [];
    form.setValue('links', [...currentLinks, { type: 'github', url: '' }], {
      shouldValidate: false,
    });
  };

  const handleRemoveLink = (index: number) => {
    const currentLinks = form.getValues('links') || [];
    form.setValue(
      'links',
      currentLinks.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const handleLinkChange = (
    index: number,
    field: 'type' | 'url',
    value: string
  ) => {
    const currentLinks = form.getValues('links') || [];
    const updatedLinks = [...currentLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    form.setValue('links', updatedLinks, { shouldValidate: true });
  };

  const updateStepState = useCallback((stepIndex: number, state: StepState) => {
    setSteps(prev =>
      prev.map((step, index) =>
        index === stepIndex ? { ...step, state } : step
      )
    );
  }, []);

  const handleNext = async () => {
    let isValid = false;

    if (currentStep === 0) {
      // Validate required fields for step 1
      isValid = await form.trigger(['projectName', 'category', 'description']);
    } else if (currentStep === 1) {
      // Step 2 fields are all optional, but validate them if filled
      const videoUrl = form.getValues('videoUrl');
      const links = form.getValues('links') || [];

      // Only validate videoUrl if it has a value
      if (videoUrl && videoUrl.trim() !== '') {
        const videoValid = await form.trigger('videoUrl');
        if (!videoValid) {
          return;
        }
      }

      // Validate links if any exist
      if (links.length > 0) {
        const linksValid = await form.trigger('links');
        if (!linksValid) {
          return;
        }
      }

      isValid = true;
    }

    if (isValid && currentStep < steps.length - 1) {
      updateStepState(currentStep, 'completed');
      updateStepState(currentStep + 1, 'active');
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      updateStepState(currentStep, 'pending');
      updateStepState(currentStep - 1, 'active');
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: SubmissionFormData) => {
    try {
      // Use the data parameter directly (it's already validated by the form)
      // Get current form values as fallback
      const currentValues = form.getValues();

      // Ensure all required fields are strings (never undefined)
      // Use data parameter first, then fallback to currentValues
      const safeData = {
        projectName: (data.projectName ?? currentValues.projectName ?? '')
          .toString()
          .trim(),
        category: (data.category ?? currentValues.category ?? '')
          .toString()
          .trim(),
        description: (data.description ?? currentValues.description ?? '')
          .toString()
          .trim(),
        logo:
          (data.logo ?? currentValues.logo) &&
          String(data.logo ?? currentValues.logo).trim() !== ''
            ? String(data.logo ?? currentValues.logo).trim()
            : undefined,
        videoUrl:
          (data.videoUrl ?? currentValues.videoUrl) &&
          String(data.videoUrl ?? currentValues.videoUrl).trim() !== ''
            ? String(data.videoUrl ?? currentValues.videoUrl).trim()
            : undefined,
        introduction:
          (data.introduction ?? currentValues.introduction) &&
          String(data.introduction ?? currentValues.introduction).trim() !== ''
            ? String(data.introduction ?? currentValues.introduction).trim()
            : undefined,
        links:
          (data.links ?? currentValues.links) &&
          (data.links ?? currentValues.links)!.length > 0
            ? (data.links ?? currentValues.links)!
                .filter(
                  (link: { type: string; url: string }) =>
                    link && link.url && link.url.toString().trim() !== ''
                )
                .map((link: { type: string; url: string }) => ({
                  type: link.type.toString(),
                  url: link.url.toString().trim(),
                }))
            : undefined,
      };

      // Validate all required fields one more time before submission
      const isValid = await form.trigger([
        'projectName',
        'category',
        'description',
      ]);
      if (
        !isValid ||
        !safeData.projectName ||
        !safeData.category ||
        !safeData.description
      ) {
        toast.error('Please fill in all required fields');
        setCurrentStep(0);
        updateStepState(0, 'active');
        return;
      }

      // Clean and prepare submission data
      const submissionData = {
        projectName: safeData.projectName,
        category: safeData.category,
        description: safeData.description,
        logo: safeData.logo,
        videoUrl: safeData.videoUrl,
        introduction: safeData.introduction,
        links: safeData.links,
      };

      if (submissionId) {
        await update(submissionId, submissionData);
      } else {
        await create(submissionData);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error is already handled in the hook
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div key='step-0' className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div></div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleFillMockData}
                className='border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
              >
                Fill with Mock Data
              </Button>
            </div>
            <FormField
              control={form.control}
              name='projectName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-white'>Project Name *</FormLabel>
                  <FormControl>
                    <Input
                      key='projectName-input'
                      placeholder='Enter your project name'
                      className='border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-white'>Category *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='border-gray-700 bg-gray-800/50 text-white'>
                        <SelectValue placeholder='Select a category' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='border-gray-700 bg-gray-800 text-white'>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-white'>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Describe your project in detail (minimum 50 characters)'
                      className='min-h-[120px] border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className='text-gray-400'>
                    {field.value?.length || 0} / 50 characters minimum
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 1:
        return (
          <div key='step-1' className='space-y-6'>
            <FormField
              control={form.control}
              name='logo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-white'>Project Logo</FormLabel>
                  <FormControl>
                    <div className='space-y-4'>
                      {logoPreview || isValidImageUrl(field.value) ? (
                        <div className='relative inline-block'>
                          <Image
                            src={logoPreview || field.value || ''}
                            alt='Logo preview'
                            width={200}
                            height={200}
                            className='rounded-lg object-cover'
                          />
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setLogoPreview('');
                              form.setValue('logo', '', {
                                shouldValidate: true,
                              });
                            }}
                            className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 p-0 hover:bg-red-600'
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      ) : (
                        <label className='flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 p-8 hover:border-gray-600'>
                          <input
                            type='file'
                            className='hidden'
                            accept='image/jpeg,image/jpg,image/png,image/gif,image/webp'
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleLogoUpload(file);
                              }
                            }}
                            disabled={isUploadingLogo}
                          />
                          {isUploadingLogo ? (
                            <Loader2 className='mb-2 h-8 w-8 animate-spin text-gray-400' />
                          ) : (
                            <Upload className='mb-2 h-8 w-8 text-gray-400' />
                          )}
                          <span className='text-sm text-gray-400'>
                            {isUploadingLogo
                              ? 'Uploading...'
                              : 'Click to upload or drag and drop'}
                          </span>
                          <span className='text-xs text-gray-500'>
                            PNG, JPG, GIF up to 5MB
                          </span>
                        </label>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='videoUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-white'>Demo Video URL</FormLabel>
                  <FormControl>
                    <Input
                      key='videoUrl-input'
                      placeholder='https://youtube.com/watch?v=...'
                      className='border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormDescription className='text-gray-400'>
                    Optional: Link to a demo video (YouTube, Vimeo, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='introduction'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-white'>Introduction</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Tell us more about your project...'
                      className='min-h-[100px] border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className='text-gray-400'>
                    Optional: Additional information about your project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <FormLabel className='text-white'>Project Links</FormLabel>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleAddLink}
                  className='border-gray-700 text-white hover:bg-gray-800'
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Add Link
                </Button>
              </div>

              {formLinks.length === 0 ? (
                <p className='text-sm text-gray-400'>
                  No links added. Click "Add Link" to add project links.
                </p>
              ) : (
                <div className='space-y-3'>
                  {formLinks.map((link, index) => (
                    <div key={index} className='flex gap-2'>
                      <Select
                        value={link.type}
                        onValueChange={value =>
                          handleLinkChange(index, 'type', value)
                        }
                      >
                        <SelectTrigger className='w-[140px] border-gray-700 bg-gray-800/50 text-white'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className='border-gray-700 bg-gray-800 text-white'>
                          {LINK_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder='https://...'
                        value={link.url}
                        onChange={e =>
                          handleLinkChange(index, 'url', e.target.value)
                        }
                        className='flex-1 border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => handleRemoveLink(index)}
                        className='text-red-400 hover:bg-red-500/20'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-6'>
            <div className='rounded-lg border border-gray-700 bg-gray-800/50 p-6'>
              <h3 className='mb-4 text-lg font-semibold text-white'>
                Review Your Submission
              </h3>
              <div className='space-y-4'>
                <div>
                  <p className='text-sm font-medium text-gray-400'>
                    Project Name
                  </p>
                  <p className='text-white'>{form.watch('projectName')}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-400'>Category</p>
                  <p className='text-white'>{form.watch('category')}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-400'>
                    Description
                  </p>
                  <p className='text-white'>{form.watch('description')}</p>
                </div>
                {isValidImageUrl(form.watch('logo')) && (
                  <div>
                    <p className='mb-2 text-sm font-medium text-gray-400'>
                      Logo
                    </p>
                    <Image
                      src={form.watch('logo') || ''}
                      alt='Logo'
                      width={100}
                      height={100}
                      className='rounded-lg object-cover'
                    />
                  </div>
                )}
                {form.watch('videoUrl') && (
                  <div>
                    <p className='text-sm font-medium text-gray-400'>
                      Demo Video
                    </p>
                    <a
                      href={form.watch('videoUrl')}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-[#a7f950] hover:underline'
                    >
                      {form.watch('videoUrl')}
                    </a>
                  </div>
                )}
                {form.watch('introduction') && (
                  <div>
                    <p className='text-sm font-medium text-gray-400'>
                      Introduction
                    </p>
                    <p className='text-white'>{form.watch('introduction')}</p>
                  </div>
                )}
                {formLinks.filter(link => link.url.trim() !== '').length >
                  0 && (
                  <div>
                    <p className='mb-2 text-sm font-medium text-gray-400'>
                      Links
                    </p>
                    <div className='space-y-1'>
                      {formLinks
                        .filter(link => link.url.trim() !== '')
                        .map((link, index) => (
                          <div key={index} className='flex items-center gap-2'>
                            <Link2 className='h-4 w-4 text-gray-400' />
                            <span className='text-xs text-gray-500'>
                              {link.type}:
                            </span>
                            <a
                              href={link.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-[#a7f950] hover:underline'
                            >
                              {link.url}
                            </a>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <BoundlessSheet
      open={open}
      setOpen={onOpenChange}
      title={submissionId ? 'Edit Submission' : 'Create Submission'}
      size='large'
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex gap-8'>
          <Stepper steps={steps} />
          <div className='flex-1 space-y-6'>
            {renderStepContent()}
            <div className='flex justify-between pt-6'>
              <Button
                type='button'
                variant='outline'
                onClick={handleBack}
                disabled={currentStep === 0}
                className='border-gray-700 text-white hover:bg-gray-800'
              >
                Back
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button
                  type='button'
                  onClick={handleNext}
                  className='bg-[#a7f950] text-black hover:bg-[#8fd93f]'
                >
                  Next
                </Button>
              ) : (
                <Button
                  type='submit'
                  disabled={isSubmitting}
                  className='bg-[#a7f950] text-black hover:bg-[#8fd93f] disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {submissionId ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : submissionId ? (
                    'Update Submission'
                  ) : (
                    'Submit Project'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </BoundlessSheet>
  );
}
