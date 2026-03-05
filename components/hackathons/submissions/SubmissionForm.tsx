'use client';
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
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
import {
  ExpandableScreen,
  ExpandableScreenContent,
  ExpandableScreenTrigger,
  useExpandableScreen,
} from '@/components/ui/expandable-screen';
import Stepper from '@/components/stepper/Stepper';
import { uploadService } from '@/lib/api/upload';
import {
  useSubmission,
  type SubmissionFormData,
} from '@/hooks/hackathon/use-submission';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import { toast } from 'sonner';
import {
  Loader2,
  Upload,
  X,
  Link2,
  Plus,
  Users,
  User,
  ShieldAlert,
  Check,
} from 'lucide-react';
import Image from 'next/image';
import { useTeamPosts } from '@/hooks/hackathon/use-team-posts';
import { useTeamInvite } from '@/hooks/hackathon/use-team-invite';
import { useAuthStatus } from '@/hooks/use-auth';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

type StepState = 'pending' | 'active' | 'completed';

interface Step {
  title: string;
  description: string;
  state: StepState;
}

const teamMemberSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    role: z.string().min(1, 'Role is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    userId: z.string().optional(),
  })
  .refine(data => data.email || data.userId, {
    message: 'Either email or User ID is required',
    path: ['email'],
  });

const baseSubmissionSchema = z.object({
  projectName: z.string().min(3, 'Project name must be at least 3 characters'),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  logo: z.string().optional(),
  videoUrl: z
    .union([z.string().url('Please enter a valid URL'), z.literal('')])
    .optional(),
  introduction: z.string().optional(),
  links: z.array(
    z.object({
      type: z.string(),
      url: z.union([z.string().url('Please enter a valid URL'), z.literal('')]),
    })
  ),
  participationType: z.enum(['INDIVIDUAL', 'TEAM']),
  teamName: z.string().optional(),
  teamMembers: z.array(teamMemberSchema).optional(),
});

const createSubmissionSchema = (requireDemoVideo: boolean) =>
  requireDemoVideo
    ? baseSubmissionSchema.refine(
        data =>
          data.videoUrl !== undefined &&
          data.videoUrl !== null &&
          String(data.videoUrl).trim() !== '',
        {
          message: 'Demo video URL is required for this hackathon',
          path: ['videoUrl'],
        }
      )
    : baseSubmissionSchema;

type SubmissionFormDataLocal = z.infer<typeof baseSubmissionSchema>;

interface SubmissionFormContentProps {
  hackathonSlugOrId: string;
  organizationId?: string;
  initialData?: Partial<SubmissionFormDataLocal>;
  submissionId?: string;
  onSuccess?: () => void;
}

const INITIAL_STEPS: Step[] = [
  {
    title: 'Participation',
    description: 'Choose how you want to participate',
    state: 'active',
  },
  {
    title: 'Basic Info',
    description: 'Project name, category, and description',
    state: 'pending',
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

const OTHER_LINK_TYPES = ['demo', 'website', 'documentation', 'other'];

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

const isValidUrl = (url: string | undefined): boolean => {
  if (!url || String(url).trim() === '') return false;
  try {
    const u = new URL(String(url).trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

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

const SubmissionFormContent: React.FC<SubmissionFormContentProps> = ({
  hackathonSlugOrId,
  organizationId,
  initialData,
  submissionId,
  onSuccess,
}) => {
  const { collapse, isExpanded: open } = useExpandableScreen();
  const { currentHackathon } = useHackathonData();
  const { user } = useAuthStatus();

  const requireGithub = currentHackathon?.requireGithub ?? false;
  const requireDemoVideo = currentHackathon?.requireDemoVideo ?? false;
  const requireOtherLinks = currentHackathon?.requireOtherLinks ?? false;

  const submissionSchema = useMemo(
    () => createSubmissionSchema(requireDemoVideo),
    [requireDemoVideo]
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const hasAutoAdvanced = useRef(false);

  const { create, update, isSubmitting } = useSubmission({
    hackathonSlugOrId,
    organizationId,
    autoFetch: false,
  });

  const {
    myTeam,
    fetchMyTeam,
    isLoading: isLoadingPosts,
    isLoadingMyTeam,
  } = useTeamPosts({
    hackathonSlugOrId,
    organizationId,
    autoFetch: open,
  });

  const [currentInviteeName, setCurrentInviteeName] = useState('');
  const [currentInviteeEmail, setCurrentInviteeEmail] = useState('');
  const [currentInviteeRole, setCurrentInviteeRole] = useState('');

  const form = useForm<SubmissionFormDataLocal>({
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
      participationType: 'INDIVIDUAL',
      teamName: '',
      teamMembers: [],
    },
  });

  const invitees = form.watch('teamMembers') || [];
  const formLinks = form.watch('links') || [];

  const updateStepState = useCallback((stepIndex: number, state: StepState) => {
    setSteps(prev =>
      prev.map((step, index) =>
        index === stepIndex ? { ...step, state } : step
      )
    );
  }, []);

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
        participationType: initialData.participationType || 'INDIVIDUAL',
      });
      if (initialData.logo && isValidImageUrl(initialData.logo)) {
        setLogoPreview(initialData.logo);
      }
    }
  }, [open, initialData, form]);

  // Participation type enforcement
  useEffect(() => {
    if (!open || !currentHackathon) return;
    if (hasAutoAdvanced.current) return;

    const hackathonType = currentHackathon.participantType;

    if (hackathonType === 'INDIVIDUAL') {
      form.setValue('participationType', 'INDIVIDUAL');
      if (!submissionId) {
        setCurrentStep(1);
        updateStepState(0, 'completed');
        updateStepState(1, 'active');
        hasAutoAdvanced.current = true;
      }
    } else if (hackathonType === 'TEAM') {
      form.setValue('participationType', 'TEAM');
      if (!submissionId && !!myTeam) {
        setCurrentStep(1);
        updateStepState(0, 'completed');
        updateStepState(1, 'active');
        hasAutoAdvanced.current = true;
      }
    } else if (hackathonType === 'TEAM_OR_INDIVIDUAL') {
      if (!submissionId) {
        if (myTeam) {
          form.setValue('participationType', 'TEAM');
          setCurrentStep(1);
          updateStepState(0, 'completed');
          updateStepState(1, 'active');
          hasAutoAdvanced.current = true;
        } else {
          form.setValue('participationType', 'INDIVIDUAL');
        }
      }
    }
  }, [open, currentHackathon, myTeam, submissionId, form, updateStepState]);

  // Reset everything when modal closes
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        form.reset({
          projectName: '',
          category: '',
          description: '',
          logo: '',
          videoUrl: '',
          introduction: '',
          links: [],
          participationType: 'INDIVIDUAL',
        });
        setLogoPreview('');
        setCurrentStep(0);
        setSteps(INITIAL_STEPS);
        hasAutoAdvanced.current = false;
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
        'An intelligent task management application that uses machine learning to prioritize tasks...',
      logo: '',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      introduction: 'This project leverages advanced AI algorithms...',
      links: [
        { type: 'github', url: 'https://github.com/example/ai-task-manager' },
        { type: 'demo', url: 'https://demo.example.com/ai-task-manager' },
      ],
      participationType: 'INDIVIDUAL' as const,
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

  const canRemoveLink = (index: number): boolean => {
    const links = form.getValues('links') || [];
    const link = links[index];
    if (!link) return true;

    if (requireGithub && link.type === 'github') {
      const otherGithubCount = links.filter(
        (l, i) => i !== index && l.type === 'github'
      ).length;
      if (otherGithubCount === 0) return false;
    }

    if (requireOtherLinks && OTHER_LINK_TYPES.includes(link.type)) {
      const otherLinkCount = links.filter(
        (l, i) => i !== index && OTHER_LINK_TYPES.includes(l.type)
      ).length;
      if (otherLinkCount === 0) return false;
    }

    return true;
  };

  const handleRemoveLink = (index: number) => {
    if (!canRemoveLink(index)) return;
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

  // Team size configuration and computed state (only when hackathon defines limits)
  const teamMin = currentHackathon?.teamMin;
  const teamMax = currentHackathon?.teamMax;
  const hasTeamLimits = teamMin !== undefined && teamMax !== undefined;
  const watchedTeamMembers = form.watch('teamMembers');
  const currentTeamSize = (watchedTeamMembers?.length ?? 0) + 1;
  const isTeamAtCapacity = hasTeamLimits && currentTeamSize >= teamMax;
  const isTeamBelowMinimum = hasTeamLimits && currentTeamSize < teamMin;
  const membersNeededForMinimum = hasTeamLimits ? teamMin - currentTeamSize : 0;

  function getTeamSizeBadgeStyle(): string {
    if (isTeamAtCapacity) {
      return 'border-yellow-500 bg-yellow-500/10 text-yellow-500';
    }
    if (isTeamBelowMinimum) {
      return 'border-orange-500 bg-orange-500/10 text-orange-500';
    }
    return 'border-gray-600 text-gray-400';
  }

  const handleAddInvitee = () => {
    // Guard: prevent adding members when team is at capacity
    if (isTeamAtCapacity) {
      toast.error(`Team is at maximum capacity (${teamMax} members)`);
      return;
    }

    if (!currentInviteeName || !currentInviteeRole || !currentInviteeEmail) {
      toast.error('Please fill in name, email and role');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentInviteeEmail)) {
      toast.error('Please enter a valid email');
      return;
    }

    const currentMembers = form.getValues('teamMembers') || [];
    form.setValue('teamMembers', [
      ...currentMembers,
      {
        name: currentInviteeName,
        email: currentInviteeEmail,
        role: currentInviteeRole,
      },
    ]);

    setCurrentInviteeName('');
    setCurrentInviteeEmail('');
    setCurrentInviteeRole('');
  };

  const handleRemoveInvitee = (index: number) => {
    const currentMembers = form.getValues('teamMembers') || [];
    form.setValue(
      'teamMembers',
      currentMembers.filter((_, i) => i !== index)
    );
  };

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();
    let isValid = false;

    if (currentStep === 0) {
      const participationType = form.getValues('participationType');
      if (participationType === 'TEAM') {
        if (myTeam) {
          isValid = true;
        } else {
          const teamName = form.getValues('teamName');
          if (!teamName) {
            form.setError('teamName', { message: 'Team Name is required' });
            return;
          }

          if (isTeamBelowMinimum) {
            toast.error(
              `Your team needs at least ${teamMin} members. Please invite ${membersNeededForMinimum} more member${membersNeededForMinimum > 1 ? 's' : ''} to continue.`
            );
            return;
          }

          isValid = true;
        }
      } else {
        isValid = true;
      }
    } else if (currentStep === 1) {
      isValid = await form.trigger(['projectName', 'category', 'description']);
    } else if (currentStep === 2) {
      const videoUrl = form.getValues('videoUrl');
      const links = form.getValues('links') || [];

      form.clearErrors(['videoUrl', 'links']);

      if (requireDemoVideo) {
        const videoTrimmed =
          videoUrl !== undefined && videoUrl !== null
            ? String(videoUrl).trim()
            : '';
        if (videoTrimmed === '') {
          form.setError('videoUrl', {
            message: 'Demo video URL is required for this hackathon',
          });
          return;
        }
        const videoValid = await form.trigger('videoUrl');
        if (!videoValid) return;
      } else if (videoUrl && String(videoUrl).trim() !== '') {
        const videoValid = await form.trigger('videoUrl');
        if (!videoValid) return;
      }

      const hasValidGithubLink = links.some(
        link => link.type === 'github' && isValidUrl(link.url)
      );

      if (requireGithub && !hasValidGithubLink) {
        form.setError('links', {
          message:
            'GitHub repository link is required for this hackathon. Please add your GitHub link.',
        });
        return;
      }

      const hasValidOtherLink = links.some(
        link => OTHER_LINK_TYPES.includes(link.type) && isValidUrl(link.url)
      );

      if (requireOtherLinks && !hasValidOtherLink) {
        form.setError('links', {
          message:
            'At least one additional link (Demo, Website, Documentation, or Other) is required for this hackathon.',
        });
        return;
      }

      if (links.length > 0) {
        const linksValid = await form.trigger('links');
        if (!linksValid) return;
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

  const onSubmit = async (data: SubmissionFormDataLocal) => {
    if (
      data.participationType === 'TEAM' &&
      myTeam &&
      myTeam.leaderId !== user?.id
    ) {
      toast.error('Only the team leader can submit the project');
      return;
    }
    try {
      const currentValues = form.getValues();
      const safeData: SubmissionFormData = {
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
            : [],
        participationType: data.participationType || 'INDIVIDUAL',
      };

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
        setCurrentStep(1);
        updateStepState(1, 'active');
        return;
      }

      form.clearErrors(['videoUrl', 'links']);

      if (requireDemoVideo) {
        const videoVal = safeData.videoUrl ?? currentValues.videoUrl ?? '';
        const videoTrimmed =
          videoVal !== undefined && videoVal !== null
            ? String(videoVal).trim()
            : '';
        if (videoTrimmed === '') {
          form.setError('videoUrl', {
            message: 'Demo video URL is required for this hackathon',
          });
          setCurrentStep(2);
          updateStepState(2, 'active');
          return;
        }
        const videoValid = await form.trigger('videoUrl');
        if (!videoValid) {
          setCurrentStep(2);
          updateStepState(2, 'active');
          return;
        }
      }

      const rawLinks = data.links ?? currentValues.links ?? [];
      const hasValidGithubLink = rawLinks.some(
        (link: { type: string; url: string }) =>
          link.type === 'github' && isValidUrl(link.url)
      );

      if (requireGithub && !hasValidGithubLink) {
        form.setError('links', {
          message:
            'GitHub repository link is required for this hackathon. Please add your GitHub link.',
        });
        setCurrentStep(2);
        updateStepState(2, 'active');
        return;
      }

      const hasValidOtherLink = rawLinks.some(
        (link: { type: string; url: string }) =>
          OTHER_LINK_TYPES.includes(link.type) && isValidUrl(link.url)
      );

      if (requireOtherLinks && !hasValidOtherLink) {
        form.setError('links', {
          message:
            'At least one additional link (Demo, Website, Documentation, or Other) is required for this hackathon.',
        });
        setCurrentStep(2);
        updateStepState(2, 'active');
        return;
      }

      const participationType = safeData.participationType || 'INDIVIDUAL';
      const teamId = participationType === 'TEAM' ? myTeam?.id : undefined;

      const submissionData: SubmissionFormData = {
        ...safeData,
        teamId: teamId ?? undefined,
        teamName:
          !myTeam && participationType === 'TEAM'
            ? safeData.teamName
            : undefined,
        teamMembers:
          !myTeam && participationType === 'TEAM'
            ? safeData.teamMembers
            : undefined,
      };

      if (submissionId) {
        await update(submissionId, submissionData);
      } else {
        await create(submissionData);
      }
      collapse();
      onSuccess?.();
    } catch {
      // Error handled in hook
    }
  };

  // Note: Auto-select TEAM logic is now consolidated in the participation type enforcement effect above

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div key='step-0' className='space-y-6'>
            {currentHackathon?.participantType === 'TEAM_OR_INDIVIDUAL' ? (
              <FormField
                control={form.control}
                name='participationType'
                render={({ field }) => (
                  <FormItem className='space-y-3'>
                    <FormLabel className='text-white'>
                      I am participating...
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className='flex flex-col space-y-1'
                        disabled={false}
                      >
                        <FormItem
                          className={cn(
                            'flex items-center space-y-0 space-x-3 rounded-md border border-gray-800 p-4 hover:border-gray-700',
                            myTeam && 'cursor-not-allowed opacity-50'
                          )}
                        >
                          <FormControl>
                            <RadioGroupItem
                              value='INDIVIDUAL'
                              disabled={!!myTeam}
                            />
                          </FormControl>
                          <div className='flex items-center space-x-2'>
                            <User className='h-5 w-5 text-gray-400' />
                            <div>
                              <FormLabel className='font-normal text-white'>
                                As an Individual
                              </FormLabel>
                              {myTeam && (
                                <FormDescription className='text-xs text-yellow-500'>
                                  You are already part of a team (
                                  {myTeam.teamName})
                                </FormDescription>
                              )}
                            </div>
                          </div>
                        </FormItem>
                        <FormItem className='flex items-center space-y-0 space-x-3 rounded-md border border-gray-800 p-4 hover:border-gray-700'>
                          <FormControl>
                            <RadioGroupItem value='TEAM' />
                          </FormControl>
                          <div className='flex items-center space-x-2'>
                            <Users className='h-5 w-5 text-gray-400' />
                            <FormLabel className='font-normal text-white'>
                              As a Team
                            </FormLabel>
                          </div>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className='rounded-lg border border-blue-900/50 bg-blue-900/20 p-4'>
                <p className='text-sm text-blue-200'>
                  This hackathon is set for{' '}
                  <span className='font-bold text-[#a7f950]'>
                    {currentHackathon?.participantType === 'TEAM'
                      ? 'Team'
                      : 'Individual'}
                  </span>{' '}
                  participation only.
                </p>
              </div>
            )}

            {form.watch('participationType') === 'TEAM' && (
              <div className='mt-6 space-y-6 rounded-lg border border-gray-800 bg-gray-900/50 p-6'>
                {isLoadingMyTeam ? (
                  <div className='flex items-center justify-center py-4'>
                    <Loader2 className='h-6 w-6 animate-spin text-[#a7f950]' />
                  </div>
                ) : myTeam ? (
                  // Existing Team UI
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h4 className='text-lg font-semibold text-white'>
                          {myTeam.teamName}
                        </h4>
                        <p className='text-sm text-gray-400'>
                          {myTeam.members?.length || 1} members
                        </p>
                      </div>
                      <Badge
                        variant='outline'
                        className='border-[#a7f950] text-[#a7f950]'
                      >
                        Your Team
                      </Badge>
                    </div>

                    {myTeam.leaderId !== user?.id && (
                      <Alert
                        variant='destructive'
                        className='mt-4 border-red-900/50 bg-red-900/20'
                      >
                        <ShieldAlert className='h-4 w-4 text-red-500' />
                        <AlertTitle className='text-red-500'>
                          Permission Denied
                        </AlertTitle>
                        <AlertDescription className='text-red-400'>
                          You are a member of team '{myTeam.teamName}'. Only the
                          team leader can submit the project.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-gray-300'>
                        Team Members:
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {myTeam.members?.map(member => (
                          <Badge
                            key={member.userId}
                            variant='secondary'
                            className='bg-gray-800 text-gray-300'
                          >
                            {member.name}{' '}
                            {member.userId === myTeam.leaderId && '(Leader)'}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Alert className='border-blue-900/50 bg-blue-900/20'>
                      <AlertTitle className='text-blue-200'>
                        Team Submission
                      </AlertTitle>
                      <AlertDescription className='text-blue-300'>
                        Submitting this project will submit it on behalf of your
                        entire team. Only the team leader can perform this
                        action.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  // Create Team UI
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <h4 className='font-semibold text-white'>
                        Create Your Team
                      </h4>
                      <p className='text-sm text-gray-400'>
                        You'll be the team leader. Invite others to join you!
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name='teamName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-white'>
                            Team Name <span className='text-red-400'>*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='e.g. The Innovators'
                              className='border-gray-700 bg-gray-800/50 text-white'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <FormLabel className='text-white'>
                          Invite Members
                          {hasTeamLimits && teamMin > 1 && (
                            <span className='ml-1 text-xs text-gray-400'>
                              (min {teamMin} members)
                            </span>
                          )}
                        </FormLabel>
                        {hasTeamLimits && (
                          <Badge
                            variant='outline'
                            className={cn(
                              'transition-colors',
                              getTeamSizeBadgeStyle()
                            )}
                          >
                            <Users className='mr-1 h-3 w-3' />
                            {currentTeamSize} / {teamMax} members
                          </Badge>
                        )}
                      </div>
                      {isTeamBelowMinimum && (
                        <p className='text-xs text-orange-400'>
                          You need at least {membersNeededForMinimum} more
                          member{membersNeededForMinimum > 1 ? 's' : ''} to
                          proceed.
                        </p>
                      )}
                      <div className='flex flex-col gap-3'>
                        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                          <Input
                            placeholder='Name'
                            value={currentInviteeName}
                            onChange={e =>
                              setCurrentInviteeName(e.target.value)
                            }
                            className='border-gray-700 bg-gray-800/50 text-white'
                            disabled={isTeamAtCapacity}
                          />
                          <Input
                            placeholder='Email'
                            type='email'
                            value={currentInviteeEmail}
                            onChange={e =>
                              setCurrentInviteeEmail(e.target.value)
                            }
                            className='border-gray-700 bg-gray-800/50 text-white'
                            disabled={isTeamAtCapacity}
                          />
                          <Input
                            placeholder='Role (e.g. Designer)'
                            value={currentInviteeRole}
                            onChange={e =>
                              setCurrentInviteeRole(e.target.value)
                            }
                            className='border-gray-700 bg-gray-800/50 text-white'
                            disabled={isTeamAtCapacity}
                          />
                        </div>
                        <Button
                          type='button'
                          onClick={handleAddInvitee}
                          disabled={isTeamAtCapacity}
                          className={cn(
                            'self-start',
                            isTeamAtCapacity
                              ? 'cursor-not-allowed bg-gray-700 text-gray-500 opacity-50'
                              : 'bg-gray-800 text-white hover:bg-gray-700'
                          )}
                        >
                          <Plus className='mr-2 h-4 w-4' />
                          {isTeamAtCapacity ? 'Team Full' : 'Add Member'}
                        </Button>
                      </div>

                      {invitees.length > 0 && (
                        <div className='mt-4 flex flex-wrap gap-2'>
                          {invitees.map((invitee, idx) => (
                            <Badge
                              key={idx}
                              variant='secondary'
                              className='gap-1 bg-gray-800 py-1 pr-1 pl-3 text-gray-300'
                            >
                              <div className='mr-2 flex flex-col text-left text-xs'>
                                <span className='font-semibold'>
                                  {invitee.name}
                                </span>
                                <span className='text-[10px] text-gray-500'>
                                  {invitee.role} • {invitee.email}
                                </span>
                              </div>
                              <button
                                type='button'
                                onClick={() => handleRemoveInvitee(idx)}
                                className='ml-1 rounded-full p-1 hover:bg-gray-700'
                              >
                                <X className='h-3 w-3' />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div key='step-1' className='space-y-6'>
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
                  <FormLabel className='text-white'>
                    Project Name <span className='text-red-400'>*</span>
                  </FormLabel>
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
                  <FormLabel className='text-white'>
                    Category <span className='text-red-400'>*</span>
                  </FormLabel>
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
                  <FormLabel className='text-white'>
                    Description <span className='text-red-400'>*</span>
                  </FormLabel>
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

      case 2:
        return (
          <div key='step-2' className='space-y-6'>
            {(requireGithub || requireDemoVideo || requireOtherLinks) && (
              <p className='text-sm text-gray-400'>
                <span className='text-red-400'>*</span> Required for this
                hackathon
              </p>
            )}
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
                  <FormLabel className='text-white'>
                    Demo Video URL
                    {requireDemoVideo && (
                      <span className='text-red-400'> *</span>
                    )}
                  </FormLabel>
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
                    {requireDemoVideo
                      ? 'Link to a demo video (YouTube, Vimeo, etc.) is required for this hackathon'
                      : 'Optional: Link to a demo video (YouTube, Vimeo, etc.)'}
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

            <FormField
              control={form.control}
              name='links'
              render={() => (
                <FormItem>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <FormLabel className='text-white'>
                        Project Links
                        {(requireGithub || requireOtherLinks) && (
                          <span className='text-red-400'> *</span>
                        )}
                      </FormLabel>
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

                    {(requireGithub || requireOtherLinks) && (
                      <FormDescription className='text-gray-400'>
                        {requireGithub && requireOtherLinks
                          ? 'GitHub repository link and at least one additional link (Demo, Website, Documentation, or Other) are required for this hackathon.'
                          : requireGithub
                            ? 'GitHub repository link is required for this hackathon.'
                            : 'At least one additional link (Demo, Website, Documentation, or Other) is required for this hackathon.'}
                      </FormDescription>
                    )}
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
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
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
                            {canRemoveLink(index) && (
                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={() => handleRemoveLink(index)}
                                className='text-red-400 hover:bg-red-500/20'
                              >
                                <X className='h-4 w-4' />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
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
    <div className='bg-background flex h-full flex-col text-white'>
      <div className='border-b border-gray-800 p-6'>
        <h2 className='text-xl font-semibold'>
          {submissionId ? 'Edit Submission' : 'Create Submission'}
        </h2>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-1 gap-8 overflow-y-auto px-10 py-6'
        >
          <div className='sticky top-0 h-fit'>
            <Stepper steps={steps} />
          </div>
          <div className='flex flex-1 flex-col space-y-6'>
            {renderStepContent()}
            <div className='mt-auto flex justify-between pt-6 pb-6'>
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
                  disabled={
                    !!(
                      form.watch('participationType') === 'TEAM' &&
                      myTeam &&
                      myTeam.leaderId !== user?.id
                    )
                  }
                  className='bg-[#a7f950] text-black hover:bg-[#8fd93f] disabled:cursor-not-allowed disabled:opacity-50'
                >
                  Next
                </Button>
              ) : (
                <Button
                  type='submit'
                  disabled={
                    !!(
                      isSubmitting ||
                      (form.watch('participationType') === 'TEAM' &&
                        myTeam &&
                        myTeam.leaderId !== user?.id)
                    )
                  }
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
    </div>
  );
};

interface SubmissionScreenWrapperProps extends SubmissionFormContentProps {
  children: React.ReactNode;
}

export const SubmissionScreenWrapper: React.FC<
  SubmissionScreenWrapperProps
> = ({ children, ...props }) => {
  return (
    <ExpandableScreen
      layoutId='cta-card'
      triggerRadius='100px'
      contentRadius='24px'
    >
      {children}
      <ExpandableScreenContent className='bg-background overflow-hidden border border-gray-800 p-0 sm:rounded-3xl'>
        <SubmissionFormContent {...props} />
      </ExpandableScreenContent>
    </ExpandableScreen>
  );
};
