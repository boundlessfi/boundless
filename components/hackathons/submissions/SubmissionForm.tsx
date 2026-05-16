'use client';
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
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
import {
  ExpandableScreen,
  ExpandableScreenContent,
  ExpandableScreenTrigger,
  useExpandableScreen,
  useOptionalExpandableScreen,
} from '@/components/ui/expandable-screen';
import Stepper from '@/components/stepper/Stepper';
import { uploadService } from '@/lib/api/upload';
import {
  useSubmission,
  type SubmissionFormData,
} from '@/hooks/hackathon/use-submission';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import { listTracks, type HackathonTrack } from '@/lib/api/hackathons/tracks';
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
import { useTeamPosts } from '@/hooks/hackathon/use-team-posts';
import { useTeamInvite } from '@/hooks/hackathon/use-team-invite';
import { CreateTeamPostModal } from '@/components/hackathons/team-formation/CreateTeamPostModal';
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

const LICENSE_OPTIONS = [
  'MIT',
  'Apache-2.0',
  'GPL-3.0',
  'BSD-3',
  'PROPRIETARY',
  'OTHER',
] as const;
type License = (typeof LICENSE_OPTIONS)[number];

const baseSubmissionSchema = z.object({
  projectName: z
    .string()
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name cannot exceed 100 characters'),
  category: z.string().min(1, 'Please select a category'),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  logo: z.string().optional(),
  banner: z.string().optional(),
  videoUrl: z
    .union([z.string().url('Please enter a valid URL'), z.literal('')])
    .optional(),
  introduction: z
    .string()
    .max(500, 'Introduction cannot exceed 500 characters')
    .optional(),
  links: z.array(
    z.object({
      type: z.string(),
      url: z.union([
        z
          .string()
          .url('Please enter a valid URL')
          .max(500, 'URL cannot exceed 500 characters'),
        z.literal(''),
      ]),
    })
  ),
  participationType: z.enum(['INDIVIDUAL', 'TEAM']),
  teamName: z.string().optional(),
  teamMembers: z.array(teamMemberSchema).optional(),
  /** Track ids the submitter has opted into. Capped client-side by
   *  hackathon.tracksMaxPerSubmission; the backend re-validates. */
  trackIds: z.array(z.string()).optional(),
  /** Track-specific answers, keyed by trackId (Phase B). The backend
   *  validates required fields against each track's customization. */
  trackAnswers: z
    .record(
      z.string(),
      z.object({
        promptAnswer: z.string().max(2000).optional(),
        customAnswers: z.record(z.string(), z.string()).optional(),
        artifacts: z.record(z.string(), z.string()).optional(),
      })
    )
    .optional(),

  // ── Phase A submission polish ──
  tagline: z
    .string()
    .max(200, 'Tagline must be 200 characters or fewer')
    .optional(),
  builtWith: z
    .array(z.string().max(40, 'Tag must be 40 characters or fewer'))
    .max(20, 'Up to 20 tags')
    .optional(),
  screenshots: z
    .array(z.string().url('Each screenshot must be a valid URL'))
    .max(5, 'Up to 5 screenshots')
    .optional(),
  license: z
    .enum(LICENSE_OPTIONS as unknown as [License, ...License[]])
    .optional(),
  // codeAttested is enforced at submit time (see onSubmit) rather than
  // here so the user can move between steps without the schema blocking
  // them. The Review step UI wires it as a required gate.
  codeAttested: z.boolean().optional(),
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
  /**
   * Pre-populates the form when editing an existing submission. Accepts
   * the raw submission shape from the API so server-only fields like
   * trackEntries and codeAttestedAt can be hydrated alongside the Zod-
   * typed form fields (which the form reads via a typed cast).
   */
  initialData?: Partial<SubmissionFormDataLocal> & {
    trackEntries?: Array<{
      trackId: string;
      trackAnswers?: {
        promptAnswer?: string;
        customAnswers?: Record<string, string>;
        artifacts?: Record<string, string>;
      };
    }>;
    codeAttestedAt?: string | null;
  };
  submissionId?: string;
  onSuccess?: () => void;
  onClose?: () => void;
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
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Document' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'other', label: 'Other' },
];

const OTHER_LINK_TYPES = ['demo', 'video', 'document', 'presentation', 'other'];

const MAX_OTHER_LINKS = 5;
const FIXED_LINK_TYPES = LINK_TYPES.map(t => t.value).filter(
  v => v !== 'other'
);

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
  onClose,
}) => {
  const expandableCtx = useOptionalExpandableScreen();
  const collapse = expandableCtx?.collapse ?? (() => {});
  const open = expandableCtx?.isExpanded ?? true;

  const { currentHackathon } = useHackathonData();
  const { user } = useAuthStatus();

  const requireGithub = currentHackathon?.requireGithub ?? false;

  // ── Tracks ────────────────────────────────────────────────────────────
  // Best-effort load — if the endpoint fails the form falls back to
  // overall-only and the submission still goes through.
  const [availableTracks, setAvailableTracks] = useState<HackathonTrack[]>([]);
  const trackCap = currentHackathon?.tracksMaxPerSubmission ?? 3;
  const prizeStructure = currentHackathon?.prizeStructure ?? 'OVERALL_ONLY';
  const tracksEnabled = prizeStructure !== 'OVERALL_ONLY';

  useEffect(() => {
    if (!hackathonSlugOrId || !tracksEnabled) {
      setAvailableTracks([]);
      return;
    }
    let cancelled = false;
    listTracks(hackathonSlugOrId)
      .then(rows => {
        if (!cancelled) {
          // Only OPT_IN tracks need a pick — OPEN tracks auto-include
          // every submission, so showing them in a checkbox group would
          // just confuse submitters.
          setAvailableTracks(rows.filter(t => t.eligibility === 'OPT_IN'));
        }
      })
      .catch(() => {
        if (!cancelled) setAvailableTracks([]);
      });
    return () => {
      cancelled = true;
    };
  }, [hackathonSlugOrId, tracksEnabled]);
  const requireDemoVideo = currentHackathon?.requireDemoVideo ?? false;
  const requireOtherLinks = currentHackathon?.requireOtherLinks ?? false;

  // Source the dropdown ONLY from the categories the organizer picked. We
  // intentionally do not fall back to a platform-wide list — submitting a
  // category the organizer didn't enable causes the backend to reject the
  // submission with "Invalid category. Must be one of: ...", which is exactly
  // the bug we're avoiding here.
  const categoryOptions = useMemo(
    () => currentHackathon?.categories ?? [],
    [currentHackathon?.categories]
  );
  const hasConfiguredCategories = categoryOptions.length > 0;

  // participantType reaches us in mixed case across endpoints; normalize once.
  const rawParticipantType = currentHackathon?.participantType;
  const hackathonParticipantType = (rawParticipantType ?? '')
    .toString()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  const submissionSchema = useMemo(
    () => createSubmissionSchema(requireDemoVideo),
    [requireDemoVideo]
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [hasCheckedMyTeam, setHasCheckedMyTeam] = useState(false);
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

  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);

  const form = useForm<SubmissionFormDataLocal>({
    resolver: zodResolver(submissionSchema),
    mode: 'onChange',
    defaultValues: {
      projectName: '',
      category: '',
      description: '',
      logo: '',
      banner: '',
      videoUrl: '',
      introduction: '',
      links: [],
      participationType: 'INDIVIDUAL',
      teamName: '',
      teamMembers: [],
      trackIds: [],
      trackAnswers: {},
      tagline: '',
      builtWith: [],
      screenshots: [],
      license: undefined,
      codeAttested: false,
    },
  });

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = initialData as any;
      form.reset({
        projectName: initialData.projectName || '',
        category: initialData.category || '',
        description: initialData.description || '',
        logo: initialData.logo || '',
        banner: initialData.banner || '',
        videoUrl: initialData.videoUrl || '',
        introduction: initialData.introduction || '',
        links: initialData.links || [],
        participationType: initialData.participationType || 'INDIVIDUAL',
        trackIds:
          raw.trackIds ??
          ((raw.trackEntries ?? []) as Array<{ trackId: string }>).map(
            e => e.trackId
          ),
        // Reconstruct trackAnswers from trackEntries the backend returns
        // on reload. The shape is { [trackId]: TrackAnswer }.
        trackAnswers: ((): Record<
          string,
          {
            promptAnswer?: string;
            customAnswers?: Record<string, string>;
            artifacts?: Record<string, string>;
          }
        > => {
          const entries = (raw.trackEntries ?? []) as Array<{
            trackId: string;
            trackAnswers?: {
              promptAnswer?: string;
              customAnswers?: Record<string, string>;
              artifacts?: Record<string, string>;
            };
          }>;
          const out: Record<
            string,
            {
              promptAnswer?: string;
              customAnswers?: Record<string, string>;
              artifacts?: Record<string, string>;
            }
          > = {};
          for (const e of entries) {
            if (e.trackAnswers && typeof e.trackAnswers === 'object') {
              out[e.trackId] = e.trackAnswers;
            }
          }
          return out;
        })(),
        tagline: raw.tagline ?? '',
        builtWith: raw.builtWith ?? [],
        screenshots: raw.screenshots ?? [],
        license: raw.license,
        // The attestation timestamp coming back from the server gets
        // mapped to the boolean form field; reloading a previously
        // attested submission keeps the box checked.
        codeAttested: !!raw.codeAttestedAt || !!raw.codeAttested,
      });
      if (initialData.logo && isValidImageUrl(initialData.logo)) {
        setLogoPreview(initialData.logo);
      }
      if (initialData.banner && isValidImageUrl(initialData.banner)) {
        setBannerPreview(initialData.banner);
      }
    }
  }, [open, initialData, form]);

  // Track when the team-membership check has completed at least once. The
  // hook starts with `isLoadingMyTeam = false` and only flips to true once the
  // mounted effect runs, so we can't rely on it alone — wait for the first
  // false-after-true transition (or immediately mark complete if the user is
  // not authenticated and the fetch will never run).
  useEffect(() => {
    if (!user?.id) {
      setHasCheckedMyTeam(true);
      return;
    }
    if (isLoadingMyTeam) {
      setHasCheckedMyTeam(false);
    } else if (myTeam !== undefined) {
      setHasCheckedMyTeam(true);
    }
  }, [user?.id, isLoadingMyTeam, myTeam]);

  // Participation type enforcement
  useEffect(() => {
    if (!open || !currentHackathon) return;
    if (hasAutoAdvanced.current) return;
    // Don't snap the participation type or auto-advance until we know whether
    // the user is on a team — otherwise we can briefly land on INDIVIDUAL for
    // a user who's actually on a team.
    if (!hasCheckedMyTeam) return;

    const hackathonType = hackathonParticipantType;

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
  }, [
    open,
    currentHackathon,
    hackathonParticipantType,
    myTeam,
    submissionId,
    form,
    updateStepState,
    hasCheckedMyTeam,
  ]);

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
        setBannerPreview('');
        setCurrentStep(0);
        setSteps(INITIAL_STEPS);
        hasAutoAdvanced.current = false;
        setHasCheckedMyTeam(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, form]);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve((e.target?.result as string) || '');
      reader.onerror = () => reject(reader.error ?? new Error('Read failed'));
      reader.readAsDataURL(file);
    });

  const handleLogoUpload = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      toast.error('Please upload a JPEG, PNG, GIF, or WebP image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Show local preview immediately so the user sees their selection before
    // the upload round-trip completes. We await the FileReader so the preview
    // is guaranteed to be in state before we kick off the upload.
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setLogoPreview(dataUrl);
    } catch {
      // Non-fatal — we'll still attempt the upload and show the remote URL.
    }

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

      const remoteUrl = uploadResult?.data?.secure_url;
      if (uploadResult?.success && remoteUrl) {
        form.setValue('logo', remoteUrl, {
          shouldValidate: true,
          shouldDirty: true,
        });
        // Switch the inline preview to the remote URL so the review step and
        // the Cloudinary-served image stay in lockstep.
        setLogoPreview(remoteUrl);
        toast.success('Logo uploaded successfully');
      } else {
        throw new Error(uploadResult?.message || 'Upload failed');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';
      toast.error(`Failed to upload logo: ${errorMessage}`);
      // Keep the local preview so the user can retry without re-selecting.
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      toast.error('Please upload a JPEG, PNG, GIF, or WebP image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setBannerPreview(dataUrl);
    } catch {
      // Non-fatal — we'll still attempt the upload and show the remote URL.
    }

    setIsUploadingBanner(true);
    try {
      const uploadResult = await uploadService.uploadSingle(file, {
        folder: 'boundless/hackathons/submissions/banners',
        tags: ['hackathon', 'submission', 'banner'],
        transformation: {
          width: 1600,
          height: 900,
          crop: 'fill',
          quality: 'auto',
          format: 'auto',
        },
      });

      const remoteUrl = uploadResult?.data?.secure_url;
      if (uploadResult?.success && remoteUrl) {
        form.setValue('banner', remoteUrl, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setBannerPreview(remoteUrl);
        toast.success('Banner uploaded successfully');
      } else {
        throw new Error(uploadResult?.message || 'Upload failed');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';
      toast.error(`Failed to upload banner: ${errorMessage}`);
      // Keep the local preview so the user can retry without re-selecting.
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleFillMockData = () => {
    const participationType: 'INDIVIDUAL' | 'TEAM' = myTeam
      ? 'TEAM'
      : 'INDIVIDUAL';
    const mockData = {
      projectName: 'AI-Powered Task Manager',
      category: categoryOptions[0],
      description:
        'An intelligent task management application that uses machine learning to prioritize tasks...',
      logo: '',
      videoUrl: 'https://youtu.be/rOSZhhblE_8?si=Hf_YvPTMmyWTUOKQ',
      introduction: 'This project leverages advanced AI algorithms...',
      links: [
        { type: 'github', url: 'https://github.com/example/ai-task-manager' },
        { type: 'demo', url: 'https://demo.example.com/ai-task-manager' },
      ],
      participationType,
    };

    form.reset(mockData);
    form.setValue('links', mockData.links, { shouldValidate: false });
    toast.success('Form filled with mock data');
  };

  const handleAddLink = () => {
    const currentLinks = form.getValues('links') || [];
    const usedFixedTypes = new Set(
      currentLinks.map(l => l.type).filter(t => t !== 'other')
    );
    const otherCount = currentLinks.filter(l => l.type === 'other').length;

    const firstUnusedFixed = FIXED_LINK_TYPES.find(t => !usedFixedTypes.has(t));

    let nextType: string;
    if (firstUnusedFixed) {
      nextType = firstUnusedFixed;
    } else if (otherCount < MAX_OTHER_LINKS) {
      nextType = 'other';
    } else {
      toast.error('Cannot add another link', {
        description: `All fixed link types are used and you have reached the limit of ${MAX_OTHER_LINKS} "Other" links.`,
        duration: 6000,
      });
      return;
    }

    form.setValue('links', [...currentLinks, { type: nextType, url: '' }], {
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

    if (field === 'type') {
      if (value !== 'other') {
        const isDuplicate = currentLinks.some(
          (l, i) => i !== index && l.type === value
        );
        if (isDuplicate) {
          toast.error('Duplicate link type', {
            description: `"${value}" is already used. Each link type can be used at most once. Choose "Other" for additional links.`,
            duration: 6000,
          });
          return;
        }
      } else {
        const otherCount = currentLinks.filter(
          (l, i) => i !== index && l.type === 'other'
        ).length;
        if (otherCount >= MAX_OTHER_LINKS) {
          toast.error('Too many "Other" links', {
            description: `You can include at most ${MAX_OTHER_LINKS} "Other" links per submission.`,
            duration: 6000,
          });
          return;
        }
      }
    }

    const updatedLinks = [...currentLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    form.setValue('links', updatedLinks, { shouldValidate: true });
  };

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();
    let isValid = false;

    if (currentStep === 0) {
      const participationType = form.getValues('participationType');
      if (participationType === 'TEAM' && !myTeam) {
        toast.error('Please create your team before continuing');
        return;
      }
      isValid = true;
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
            'At least one additional link (Demo, Video, Document, Presentation, or Other) is required for this hackathon.',
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
      myTeam?.leader?.id !== user?.id
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
        banner:
          (data.banner ?? currentValues.banner) &&
          String(data.banner ?? currentValues.banner).trim() !== ''
            ? String(data.banner ?? currentValues.banner).trim()
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
        trackIds:
          (data.trackIds ?? currentValues.trackIds)?.filter(
            (id): id is string => typeof id === 'string' && id.length > 0
          ) ?? undefined,
        // Pull per-track answers only for the tracks that are
        // currently selected. Stale entries from de-selected tracks
        // get dropped so the backend doesn't store dangling answers.
        trackAnswers: (():
          | Record<
              string,
              {
                promptAnswer?: string;
                customAnswers?: Record<string, string>;
                artifacts?: Record<string, string>;
              }
            >
          | undefined => {
          const picked = data.trackIds ?? currentValues.trackIds ?? [];
          const all = (data.trackAnswers ??
            currentValues.trackAnswers ??
            {}) as Record<
            string,
            {
              promptAnswer?: string;
              customAnswers?: Record<string, string>;
              artifacts?: Record<string, string>;
            }
          >;
          if (picked.length === 0) return undefined;
          const next: Record<
            string,
            {
              promptAnswer?: string;
              customAnswers?: Record<string, string>;
              artifacts?: Record<string, string>;
            }
          > = {};
          for (const id of picked) {
            if (typeof id !== 'string' || !id) continue;
            if (all[id]) next[id] = all[id];
          }
          return Object.keys(next).length > 0 ? next : undefined;
        })(),
        // ── Phase A submission polish ─ string fields default to undefined
        // (not empty string) so the backend update path doesn't clobber
        // existing values with empties.
        tagline:
          (data.tagline ?? currentValues.tagline)?.toString().trim() ||
          undefined,
        builtWith:
          (data.builtWith ?? currentValues.builtWith)
            ?.map(t => t.trim())
            .filter(t => t.length > 0) ?? undefined,
        screenshots:
          (data.screenshots ?? currentValues.screenshots)
            ?.map(u => u.trim())
            .filter(u => u.length > 0) ?? undefined,
        license: data.license ?? currentValues.license ?? undefined,
        codeAttested: data.codeAttested ?? currentValues.codeAttested ?? false,
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
            'At least one additional link (Demo, Video, Document, Presentation, or Other) is required for this hackathon.',
        });
        setCurrentStep(2);
        updateStepState(2, 'active');
        return;
      }

      const participationType = safeData.participationType || 'INDIVIDUAL';
      const teamId = participationType === 'TEAM' ? myTeam?.id : undefined;

      // Gate the compliance fields on NEW submissions only.
      //
      // For an existing submission (`submissionId` is set), license +
      // attestation are optional so participants who submitted before
      // the Phase A polish rolled out aren't blocked from editing
      // other fields like videoUrl or screenshots. They CAN fill in
      // the new fields if they want — the form still shows them and
      // the data round-trips.
      //
      // The schema marks both fields optional, so we enforce the gate
      // here (at the moment of submit) instead of letting zod block
      // step navigation.
      const isNewSubmission = !submissionId;
      if (isNewSubmission && !safeData.license) {
        toast.error('Pick a license on the Review step before submitting.');
        setCurrentStep(3);
        updateStepState(3, 'active');
        return;
      }
      if (isNewSubmission && !safeData.codeAttested) {
        toast.error(
          'Please confirm the code is original or properly attributed on the Review step.'
        );
        setCurrentStep(3);
        updateStepState(3, 'active');
        return;
      }

      // Team submissions always go through a real team. handleNext blocks
      // advancing past step 0 if participationType is TEAM but myTeam is
      // empty, so we no longer stamp teamName/teamMembers from the form.
      const submissionData: SubmissionFormData = {
        ...safeData,
        teamId: teamId ?? undefined,
        teamName: undefined,
        teamMembers: undefined,
      };

      if (submissionId) {
        await update(submissionId, submissionData);
      } else {
        await create(submissionData);
      }
      if (onSuccess) {
        onSuccess();
      } else if (onClose) {
        onClose();
      } else {
        collapse();
      }
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
            {/* Wait for the team membership lookup to settle before showing the
                participation selector. Otherwise a user who is already on a
                team can briefly select Individual and trigger the backend's
                "you're on a team" rejection. */}
            {!hasCheckedMyTeam || isLoadingMyTeam ? (
              <div className='flex items-center justify-center rounded-lg border border-gray-800 bg-gray-900/50 p-8'>
                <Loader2 className='text-primary mr-2 h-5 w-5 animate-spin' />
                <span className='text-sm text-gray-400'>
                  Checking your team membership...
                </span>
              </div>
            ) : myTeam ? (
              <div className='rounded-lg border border-blue-900/50 bg-blue-900/20 p-4'>
                <p className='text-sm text-blue-200'>
                  You're on team{' '}
                  <span className='text-primary font-bold'>
                    {myTeam.teamName}
                  </span>{' '}
                  for this hackathon. This submission will be made on behalf of
                  your team.
                </p>
              </div>
            ) : !rawParticipantType ||
              hackathonParticipantType === 'TEAM_OR_INDIVIDUAL' ? (
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
                        <FormItem className='flex items-center space-y-0 space-x-3 rounded-md border border-gray-800 p-4 hover:border-gray-700'>
                          <FormControl>
                            <RadioGroupItem value='INDIVIDUAL' />
                          </FormControl>
                          <div className='flex items-center space-x-2'>
                            <User className='h-5 w-5 text-gray-400' />
                            <FormLabel className='font-normal text-white'>
                              As an Individual
                            </FormLabel>
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
                  <span className='text-primary font-bold'>
                    {hackathonParticipantType === 'TEAM'
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
                    <Loader2 className='text-primary h-6 w-6 animate-spin' />
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
                        className='border-primary text-primary'
                      >
                        Your Team
                      </Badge>
                    </div>

                    {myTeam?.leader?.id !== user?.id && (
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
                        {(myTeam.members ?? []).map((member, idx) => (
                          <Badge
                            key={member.userId || idx}
                            variant='outline'
                            className='bg-gray-800 text-gray-300'
                          >
                            {member.name}{' '}
                            {member.userId === myTeam?.leader?.id && '(Leader)'}
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
                  // No team yet. Route the user through the formation flow
                  // so a real team is created (with invitations sent) instead
                  // of just stamping teamName/teamMembers on the submission.
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <h4 className='font-semibold text-white'>
                        You don't have a team yet
                      </h4>
                      <p className='text-sm text-gray-400'>
                        Create your team first, then come back here to submit on
                        its behalf. You'll be able to invite teammates after
                        creating it.
                      </p>
                    </div>
                    <Button
                      type='button'
                      onClick={() => setIsCreateTeamModalOpen(true)}
                      className='bg-primary text-black hover:bg-[#1ec78d]'
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      Create Team
                    </Button>
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
              {process.env.NODE_ENV === 'development' && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleFillMockData}
                  className='border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                >
                  Fill with Mock Data
                </Button>
              )}
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
              name='tagline'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-white'>
                    Tagline{' '}
                    <span className='text-xs font-normal text-gray-500'>
                      (one-line pitch, up to 200 chars)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Trustless escrow for one-time freelance gigs on Stellar.'
                      maxLength={200}
                      className='border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormDescription className='text-gray-400'>
                    Shown on hackathon cards, sidebar, and the judge queue.
                    {field.value
                      ? ` ${field.value.length} / 200`
                      : ' Optional but strongly recommended.'}
                  </FormDescription>
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
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!hasConfiguredCategories}
                  >
                    <FormControl>
                      <SelectTrigger className='border-gray-700 bg-gray-800/50 text-white'>
                        <SelectValue
                          placeholder={
                            hasConfiguredCategories
                              ? 'Select a category'
                              : 'No categories available'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='border-gray-700 bg-gray-800 text-white'>
                      {categoryOptions.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!hasConfiguredCategories && (
                    <FormDescription className='text-yellow-500'>
                      The organizer hasn't set submission categories for this
                      hackathon yet. Reach out to them before submitting.
                    </FormDescription>
                  )}
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

            {tracksEnabled && availableTracks.length > 0 && (
              <FormField
                control={form.control}
                name='trackIds'
                render={({ field }) => {
                  const value: string[] = field.value ?? [];
                  const toggle = (id: string) => {
                    if (value.includes(id)) {
                      field.onChange(value.filter(v => v !== id));
                    } else {
                      if (value.length >= trackCap) {
                        toast.error(
                          `You can enter at most ${trackCap} track${
                            trackCap === 1 ? '' : 's'
                          }.`
                        );
                        return;
                      }
                      field.onChange([...value, id]);
                    }
                  };
                  return (
                    <FormItem>
                      <FormLabel className='text-white'>
                        Tracks{' '}
                        <span className='text-xs font-normal text-gray-500'>
                          (optional, up to {trackCap})
                        </span>
                      </FormLabel>
                      <FormDescription className='text-gray-400'>
                        Pick the tracks your project should be considered for.
                        Overall placements always apply; tracks unlock
                        additional category prizes.
                      </FormDescription>
                      <div className='space-y-2'>
                        {availableTracks.map(track => {
                          const checked = value.includes(track.id);
                          return (
                            <label
                              key={track.id}
                              className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
                                checked
                                  ? 'border-primary bg-primary/10'
                                  : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'
                              }`}
                            >
                              <input
                                type='checkbox'
                                checked={checked}
                                onChange={() => toggle(track.id)}
                                className='accent-primary mt-1 h-4 w-4'
                              />
                              <div className='flex-1'>
                                <div className='flex items-center gap-2'>
                                  <span className='text-sm font-medium text-white'>
                                    {track.name}
                                  </span>
                                  {track.type && (
                                    <Badge
                                      variant='outline'
                                      className='text-xs'
                                    >
                                      {track.type}
                                    </Badge>
                                  )}
                                </div>
                                {track.description && (
                                  <p className='mt-1 text-xs text-gray-400'>
                                    {track.description}
                                  </p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      {value.length > 0 && (
                        <p className='mt-2 text-xs text-gray-500'>
                          {value.length} of {trackCap} selected
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}

            {/* Per-track answer collection (Phase B). Renders one card
                per selected track, with the track's prompt, custom
                questions, and required artifacts inline. The form
                field is a single nested object so the value naturally
                round-trips through react-hook-form. */}
            {tracksEnabled &&
              availableTracks.length > 0 &&
              (() => {
                const picked =
                  (form.watch('trackIds') as string[] | undefined) ?? [];
                const tracksById = new Map(
                  availableTracks.map(t => [t.id, t] as const)
                );
                const relevant = picked
                  .map(id => tracksById.get(id))
                  .filter((t): t is (typeof availableTracks)[number] => !!t)
                  .filter(
                    t =>
                      !!t.prompt ||
                      (t.customQuestions && t.customQuestions.length > 0) ||
                      (t.requiredArtifacts && t.requiredArtifacts.length > 0)
                  );
                if (relevant.length === 0) return null;
                return (
                  <FormField
                    control={form.control}
                    name='trackAnswers'
                    render={({ field }) => {
                      const value =
                        (field.value as
                          | Record<
                              string,
                              {
                                promptAnswer?: string;
                                customAnswers?: Record<string, string>;
                                artifacts?: Record<string, string>;
                              }
                            >
                          | undefined) ?? {};
                      const setAnswer = (
                        trackId: string,
                        patch: Partial<{
                          promptAnswer: string;
                          customAnswers: Record<string, string>;
                          artifacts: Record<string, string>;
                        }>
                      ) => {
                        const prev = value[trackId] ?? {};
                        field.onChange({
                          ...value,
                          [trackId]: { ...prev, ...patch },
                        });
                      };
                      return (
                        <FormItem className='space-y-3'>
                          <FormLabel className='text-white'>
                            Track answers{' '}
                            <span className='text-xs font-normal text-gray-500'>
                              ({relevant.length} of your selected{' '}
                              {relevant.length === 1 ? 'track' : 'tracks'} needs
                              more info)
                            </span>
                          </FormLabel>
                          {relevant.map(track => {
                            const answer = value[track.id] ?? {};
                            return (
                              <div
                                key={track.id}
                                className='space-y-3 rounded-md border border-gray-800 bg-gray-900/40 p-4'
                              >
                                <p className='text-sm font-semibold text-white'>
                                  {track.name}
                                </p>
                                {track.prompt && (
                                  <div className='space-y-1'>
                                    <label className='text-xs font-medium text-gray-300'>
                                      {track.prompt}{' '}
                                      <span className='text-red-400'>*</span>
                                    </label>
                                    <Textarea
                                      value={answer.promptAnswer ?? ''}
                                      maxLength={2000}
                                      onChange={e =>
                                        setAnswer(track.id, {
                                          promptAnswer: e.target.value,
                                        })
                                      }
                                      placeholder='Your answer...'
                                      className='min-h-[80px] border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                                    />
                                  </div>
                                )}
                                {(track.customQuestions ?? []).map(q => {
                                  const v = answer.customAnswers?.[q.id] ?? '';
                                  const onChange = (val: string) =>
                                    setAnswer(track.id, {
                                      customAnswers: {
                                        ...(answer.customAnswers ?? {}),
                                        [q.id]: val,
                                      },
                                    });
                                  return (
                                    <div key={q.id} className='space-y-1'>
                                      <label className='text-xs font-medium text-gray-300'>
                                        {q.label}
                                        {q.required && (
                                          <span className='text-red-400'>
                                            {' '}
                                            *
                                          </span>
                                        )}
                                      </label>
                                      {q.type === 'long' ? (
                                        <Textarea
                                          value={v}
                                          maxLength={q.maxLength ?? 1000}
                                          onChange={e =>
                                            onChange(e.target.value)
                                          }
                                          className='min-h-[60px] border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                                        />
                                      ) : (
                                        <Input
                                          type={
                                            q.type === 'url' ? 'url' : 'text'
                                          }
                                          value={v}
                                          maxLength={
                                            q.maxLength ??
                                            (q.type === 'url' ? 500 : 200)
                                          }
                                          onChange={e =>
                                            onChange(e.target.value)
                                          }
                                          placeholder={
                                            q.type === 'url'
                                              ? 'https://...'
                                              : ''
                                          }
                                          className='border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                                {(track.requiredArtifacts ?? []).map(a => {
                                  const v = answer.artifacts?.[a.id] ?? '';
                                  return (
                                    <div key={a.id} className='space-y-1'>
                                      <label className='text-xs font-medium text-gray-300'>
                                        {a.label}{' '}
                                        <span className='text-[10px] tracking-widest text-gray-500 uppercase'>
                                          {a.type}
                                        </span>
                                        {a.required && (
                                          <span className='text-red-400'>
                                            {' '}
                                            *
                                          </span>
                                        )}
                                      </label>
                                      <Input
                                        type='url'
                                        value={v}
                                        maxLength={500}
                                        onChange={e =>
                                          setAnswer(track.id, {
                                            artifacts: {
                                              ...(answer.artifacts ?? {}),
                                              [a.id]: e.target.value,
                                            },
                                          })
                                        }
                                        placeholder='https://...'
                                        className='border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </FormItem>
                      );
                    }}
                  />
                );
              })()}
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
              render={({ field }) => {
                // Prefer the local preview (data URL or remote URL set after
                // upload completes) so the user always sees the image they
                // just selected. Fall back to the form value for previously
                // saved submissions being edited.
                const previewSrc =
                  logoPreview ||
                  (isValidImageUrl(field.value) ? field.value : '');
                return (
                  <FormItem>
                    <FormLabel className='text-white'>Project Logo</FormLabel>
                    <FormControl>
                      <div className='space-y-4'>
                        {previewSrc ? (
                          <div className='relative inline-block'>
                            {/* Plain <img> intentionally — previews use data
                                URLs and freshly-uploaded Cloudinary URLs that
                                Next.js Image's optimizer can stumble on. */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={previewSrc}
                              alt='Logo preview'
                              width={200}
                              height={200}
                              className='h-[200px] w-[200px] rounded-lg object-cover'
                            />
                            {isUploadingLogo && (
                              <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-black/60'>
                                <Loader2 className='h-6 w-6 animate-spin text-white' />
                              </div>
                            )}
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              disabled={isUploadingLogo}
                              onClick={() => {
                                setLogoPreview('');
                                form.setValue('logo', '', {
                                  shouldValidate: true,
                                  shouldDirty: true,
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
                );
              }}
            />

            <FormField
              control={form.control}
              name='banner'
              render={({ field }) => {
                const previewSrc =
                  bannerPreview ||
                  (isValidImageUrl(field.value) ? field.value : '');
                return (
                  <FormItem>
                    <FormLabel className='text-white'>Project Banner</FormLabel>
                    <FormControl>
                      <div className='space-y-4'>
                        {previewSrc ? (
                          <div className='relative w-full overflow-hidden rounded-lg'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={previewSrc}
                              alt='Banner preview'
                              className='aspect-video w-full object-cover'
                            />
                            {isUploadingBanner && (
                              <div className='absolute inset-0 flex items-center justify-center bg-black/60'>
                                <Loader2 className='h-6 w-6 animate-spin text-white' />
                              </div>
                            )}
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              disabled={isUploadingBanner}
                              onClick={() => {
                                setBannerPreview('');
                                form.setValue('banner', '', {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
                              }}
                              className='absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 p-0 hover:bg-red-600'
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          </div>
                        ) : (
                          <label className='flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 hover:border-gray-600'>
                            <input
                              type='file'
                              className='hidden'
                              accept='image/jpeg,image/jpg,image/png,image/gif,image/webp'
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleBannerUpload(file);
                                }
                              }}
                              disabled={isUploadingBanner}
                            />
                            {isUploadingBanner ? (
                              <Loader2 className='mb-2 h-8 w-8 animate-spin text-gray-400' />
                            ) : (
                              <Upload className='mb-2 h-8 w-8 text-gray-400' />
                            )}
                            <span className='text-sm text-gray-400'>
                              {isUploadingBanner
                                ? 'Uploading...'
                                : 'Click to upload or drag and drop'}
                            </span>
                            <span className='text-xs text-gray-500'>
                              16:9 hero image. PNG, JPG, GIF up to 5MB.
                            </span>
                          </label>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name='screenshots'
              render={({ field }) => {
                const value: string[] = field.value ?? [];
                const setAt = (i: number, v: string) => {
                  const next = value.slice();
                  next[i] = v;
                  field.onChange(next.filter(u => u !== undefined));
                };
                const remove = (i: number) =>
                  field.onChange(value.filter((_, j) => j !== i));
                const add = () => {
                  if (value.length >= 5) return;
                  field.onChange([...value, '']);
                };
                return (
                  <FormItem>
                    <FormLabel className='text-white'>
                      Screenshots{' '}
                      <span className='text-xs font-normal text-gray-500'>
                        (up to 5, public image URLs)
                      </span>
                    </FormLabel>
                    <div className='space-y-2'>
                      {value.map((url, i) => (
                        <div
                          key={`screenshot-${i}`}
                          className='flex items-center gap-2'
                        >
                          <Input
                            placeholder='https://...'
                            value={url}
                            onChange={e => setAt(i, e.target.value)}
                            className='border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                          />
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => remove(i)}
                            className='text-red-400 hover:bg-red-500/20'
                            aria-label='Remove screenshot'
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      ))}
                      {value.length < 5 && (
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={add}
                          className='border-gray-700'
                        >
                          + Add screenshot
                        </Button>
                      )}
                    </div>
                    <FormDescription className='text-gray-400'>
                      First screenshot is used as the hero image on judge /
                      public views.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name='builtWith'
              render={({ field }) => {
                const value: string[] = field.value ?? [];
                const [draft, setDraft] = [
                  // useState-like inline; the parent component owns the
                  // input through field state instead of an extra hook.
                  // Keeping the chip-list lean — Enter or comma adds.
                  '' as string,
                  (_: string) => {},
                ];
                void setDraft;
                void draft;
                const addRaw = (raw: string) => {
                  const tags = raw
                    .split(',')
                    .map(t => t.trim())
                    .filter(t => t.length > 0 && t.length <= 40);
                  if (tags.length === 0) return;
                  const next = Array.from(new Set([...value, ...tags])).slice(
                    0,
                    20
                  );
                  field.onChange(next);
                };
                const remove = (i: number) =>
                  field.onChange(value.filter((_, j) => j !== i));
                return (
                  <FormItem>
                    <FormLabel className='text-white'>
                      Built with{' '}
                      <span className='text-xs font-normal text-gray-500'>
                        (tech stack tags, up to 20)
                      </span>
                    </FormLabel>
                    <div className='space-y-2'>
                      {value.length > 0 && (
                        <div className='flex flex-wrap gap-2'>
                          {value.map((tag, i) => (
                            <Badge
                              key={`${tag}-${i}`}
                              variant='outline'
                              className='gap-1 border-gray-700 text-white'
                            >
                              {tag}
                              <button
                                type='button'
                                onClick={() => remove(i)}
                                className='ml-1 rounded-full p-0.5 text-gray-400 hover:bg-gray-700 hover:text-white'
                                aria-label={`Remove ${tag}`}
                              >
                                <X className='h-3 w-3' />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Input
                        placeholder='Soroban, Stellar SDK, Next.js — comma or Enter to add'
                        className='border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                        onKeyDown={e => {
                          const target = e.currentTarget;
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            addRaw(target.value);
                            target.value = '';
                          }
                        }}
                        onBlur={e => {
                          if (e.currentTarget.value.trim()) {
                            addRaw(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                    <FormDescription className='text-gray-400'>
                      {value.length} / 20 tags
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
                      maxLength={500}
                      className='min-h-[100px] border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className='text-gray-400'>
                    Optional. {field.value?.length || 0} / 500 characters max
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
                          ? 'GitHub repository link and at least one additional link (Demo, Video, Document, Presentation, or Other) are required for this hackathon.'
                          : requireGithub
                            ? 'GitHub repository link is required for this hackathon.'
                            : 'At least one additional link (Demo, Video, Document, Presentation, or Other) is required for this hackathon.'}
                      </FormDescription>
                    )}
                    <FormDescription className='text-gray-400'>
                      Each link type can be used at most once. For additional
                      links, choose &quot;Other&quot; (up to {MAX_OTHER_LINKS}{' '}
                      allowed).
                    </FormDescription>
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
                {tracksEnabled &&
                  (() => {
                    const picked =
                      (form.watch('trackIds') as string[] | undefined) ?? [];
                    if (picked.length === 0) {
                      return (
                        <div>
                          <p className='text-sm font-medium text-gray-400'>
                            Tracks
                          </p>
                          <p className='text-sm text-gray-500'>
                            None — your submission will be considered for
                            overall placements only.
                          </p>
                        </div>
                      );
                    }
                    const byId = new Map(
                      availableTracks.map(t => [t.id, t] as const)
                    );
                    return (
                      <div>
                        <p className='text-sm font-medium text-gray-400'>
                          Tracks
                        </p>
                        <div className='mt-1 flex flex-wrap gap-2'>
                          {picked.map(id => {
                            const t = byId.get(id);
                            return (
                              <Badge
                                key={id}
                                variant='outline'
                                className='text-white'
                              >
                                {t?.name ?? id}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                {(() => {
                  const reviewLogo =
                    (isValidImageUrl(form.watch('logo'))
                      ? form.watch('logo')
                      : '') || logoPreview;
                  return reviewLogo ? (
                    <div>
                      <p className='mb-2 text-sm font-medium text-gray-400'>
                        Logo
                      </p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={reviewLogo}
                        alt='Logo'
                        width={100}
                        height={100}
                        className='h-[100px] w-[100px] rounded-lg object-cover'
                      />
                    </div>
                  ) : null;
                })()}
                {(() => {
                  const reviewBanner =
                    (isValidImageUrl(form.watch('banner'))
                      ? form.watch('banner')
                      : '') || bannerPreview;
                  return reviewBanner ? (
                    <div>
                      <p className='mb-2 text-sm font-medium text-gray-400'>
                        Banner
                      </p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={reviewBanner}
                        alt='Banner'
                        className='aspect-video w-full max-w-sm rounded-lg object-cover'
                      />
                    </div>
                  ) : null;
                })()}
                {form.watch('videoUrl') && (
                  <div>
                    <p className='text-sm font-medium text-gray-400'>
                      Demo Video
                    </p>
                    <a
                      href={form.watch('videoUrl')}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-primary hover:underline'
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
                              className='text-primary hover:underline'
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

            {/* Compliance.
                - NEW submissions: license + attestation are required.
                  Submit is hard-gated client-side and the asterisks
                  show on the labels.
                - Existing submissions (created before Phase A): both
                  fields are optional, the asterisks hide, and submit
                  isn't blocked. Filling them in still works and the
                  data round-trips. */}
            <div className='space-y-4 rounded-lg border border-gray-700 bg-gray-800/50 p-6'>
              <h3 className='text-lg font-semibold text-white'>
                License & attestation
                {submissionId && (
                  <span className='ml-2 text-xs font-normal text-gray-400'>
                    (optional for existing submissions)
                  </span>
                )}
              </h3>
              <FormField
                control={form.control}
                name='license'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-white'>
                      License{' '}
                      {!submissionId && <span className='text-red-400'>*</span>}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <FormControl>
                        <SelectTrigger className='border-gray-700 bg-gray-900/50 text-white'>
                          <SelectValue placeholder='Pick a license' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='border-gray-700 bg-gray-800 text-white'>
                        {LICENSE_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>
                            {opt === 'PROPRIETARY'
                              ? 'Proprietary / All rights reserved'
                              : opt === 'OTHER'
                                ? 'Other (specify in description)'
                                : opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className='text-gray-400'>
                      The license your code ships under. Pick MIT or Apache-2.0
                      if you want maximum compatibility.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='codeAttested'
                render={({ field }) => (
                  <FormItem>
                    <label className='flex cursor-pointer items-start gap-3 rounded-md border border-gray-700 bg-gray-900/40 p-3'>
                      <input
                        type='checkbox'
                        checked={!!field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        className='accent-primary mt-0.5 h-4 w-4'
                      />
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-white'>
                          I confirm the code is original or properly attributed.
                          {!submissionId && (
                            <>
                              {' '}
                              <span className='text-red-400'>*</span>
                            </>
                          )}
                        </p>
                        <p className='mt-0.5 text-xs text-gray-400'>
                          Any third-party libraries, assets, or pre-existing
                          work used in this project are either
                          MIT/Apache-compatible or have explicit credit in your
                          README. The organizer may audit this before paying out
                          prizes.
                        </p>
                      </div>
                    </label>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
          className='flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 sm:px-10 md:flex-row md:gap-8'
        >
          <div className='mt-4 h-fit w-full md:sticky md:top-0 md:mt-0 md:w-auto'>
            <Stepper steps={steps} />
          </div>
          <div className='flex w-full flex-1 flex-col space-y-6'>
            {renderStepContent()}
            <div className='mt-auto flex justify-between pt-6 pb-6'>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  if (currentStep > 0) {
                    handleBack();
                  } else {
                    if (onClose) {
                      onClose();
                    } else {
                      collapse();
                    }
                  }
                }}
                className='border-gray-700 text-white hover:bg-gray-800'
              >
                {currentStep === 0 ? 'Cancel' : 'Back'}
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button
                  type='button'
                  onClick={handleNext}
                  disabled={
                    !!(
                      form.watch('participationType') === 'TEAM' &&
                      myTeam &&
                      myTeam?.leader?.id !== user?.id
                    )
                  }
                  className='bg-primary text-black hover:bg-[#1ec78d] disabled:cursor-not-allowed disabled:opacity-50'
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
                        myTeam?.leader?.id !== user?.id)
                    )
                  }
                  className='bg-primary text-black hover:bg-[#1ec78d] disabled:cursor-not-allowed disabled:opacity-50'
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
      <CreateTeamPostModal
        open={isCreateTeamModalOpen}
        onOpenChange={setIsCreateTeamModalOpen}
        hackathonSlugOrId={hackathonSlugOrId}
        teamMax={currentHackathon?.teamMax}
        organizationId={organizationId}
      />
    </div>
  );
};

export { SubmissionFormContent };

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
