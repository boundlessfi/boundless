import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, EyeOff, Lock, Loader2 } from 'lucide-react';

import { useDraft, type BountyDraftWithAi } from '@/features/bounties';

import { BoundlessButton } from '@/components/buttons';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  getModeFields,
  ModeSelection,
  type FieldRule,
} from './schemas/modeSchema';
import {
  makeSubmissionModelSchema,
  SubmissionModelFormData,
} from './schemas/submissionModelSchema';
import {
  CATEGORY_LABELS,
  CATEGORY_REPUTATION_BASELINE,
  type BountyCategory,
} from './schemas/scopeSchema';
import RegenerateBountySectionButton from '../RegenerateBountySectionButton';

interface SubmissionModelTabProps {
  /** The mode chosen in ModeTab; drives which fields show and how they validate. */
  mode?: ModeSelection;
  /** The category chosen in ScopeTab; sets the floor for the reputation minimum. */
  category?: BountyCategory;
  onContinue?: () => void;
  onBack?: () => void;
  onSave?: (data: SubmissionModelFormData) => Promise<void>;
  initialData?: Partial<SubmissionModelFormData>;
  isLoading?: boolean;
}

const labelFor: Record<FieldRule, string> = {
  required: ' *',
  optional: ' (optional)',
  hidden: '',
};

/** Parse a numeric input, treating empty as null. */
const toNumberOrNull = (raw: string): number | null => {
  if (raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
};

/** Trim an ISO date-time to the `YYYY-MM-DDTHH:mm` a datetime-local input wants. */
const toDatetimeLocal = (iso: unknown): string | null => {
  if (typeof iso !== 'string' || iso.trim() === '') return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return iso.slice(0, 16);
};

export default function SubmissionModelTab({
  mode,
  category,
  onContinue,
  onBack,
  onSave,
  initialData,
  isLoading = false,
}: SubmissionModelTabProps) {
  // Hooks must run unconditionally, so fall back to a neutral mode for the
  // form setup and render the "pick a mode" notice below if mode is unset.
  const effectiveMode: ModeSelection = mode ?? {
    entryType: 'OPEN',
    claimType: 'SINGLE_CLAIM',
  };
  const fields = getModeFields(
    effectiveMode.entryType,
    effectiveMode.claimType
  );

  // The category sets the lowest reputation the organizer can require; they may
  // raise it but not drop below it.
  const reputationFloor = category ? CATEGORY_REPUTATION_BASELINE[category] : 0;

  // Detect a mode change since the AI generated this draft, so we can nudge the
  // organizer to regenerate the (now mode-dependent) submission settings.
  const routeParams = useParams();
  const searchParams = useSearchParams();
  const organizationId = (routeParams?.id as string) ?? '';
  const draftId =
    (routeParams?.draftId as string) ?? searchParams.get('draftId') ?? '';
  const { data: draftRecord } = useDraft(organizationId, draftId || undefined);
  const generatedMode = (draftRecord as BountyDraftWithAi | undefined)
    ?.aiGeneration?.generatedMode;
  const modeChanged = Boolean(
    generatedMode &&
    mode &&
    (generatedMode.entryType !== mode.entryType ||
      generatedMode.claimType !== mode.claimType)
  );

  const form = useForm<SubmissionModelFormData>({
    resolver: zodResolver(
      makeSubmissionModelSchema(
        effectiveMode.entryType,
        effectiveMode.claimType,
        reputationFloor
      )
    ),
    defaultValues: {
      submissionDeadline: '',
      reputationMinimum:
        fields.reputationMinimum === 'hidden' ? null : reputationFloor,
      applicationWindowCloseAt: null,
      maxApplicants: null,
      shortlistSize: null,
      applicationCreditCost: null,
      requireDocumentation: false,
      requireTweet: false,
      requireDemoVideo: false,
      requireMedia: false,
      ...initialData,
      // The mode forces submission visibility, regardless of any saved value.
      submissionVisibility: fields.submissionVisibility,
    },
  });

  // Keep the forced visibility in sync if the mode changes between renders.
  React.useEffect(() => {
    form.setValue('submissionVisibility', fields.submissionVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.submissionVisibility]);

  // Default the reputation minimum to the category floor, and bump it up if a
  // saved/typed value sits below the floor (e.g. after switching category).
  React.useEffect(() => {
    if (fields.reputationMinimum === 'hidden') return;
    const current = form.getValues('reputationMinimum');
    if (current == null || current < reputationFloor) {
      form.setValue('reputationMinimum', reputationFloor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reputationFloor, fields.reputationMinimum]);

  if (!mode) {
    return (
      <div className='rounded-lg border border-zinc-800 bg-zinc-900/30 p-6 text-sm text-zinc-400'>
        Choose a mode in the previous step to configure the submission model.
      </div>
    );
  }

  const isCompetition = mode.claimType === 'COMPETITION';

  const onSubmit = async (data: SubmissionModelFormData) => {
    try {
      if (onSave) await onSave(data);
      if (onContinue) onContinue();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      const message = err.response?.data?.message || err.message;
      const errorMessage = Array.isArray(message) ? message[0] : message;
      toast.error(
        errorMessage || 'Failed to save submission settings. Please try again.'
      );
    }
  };

  const hidden = (rule: FieldRule) => rule === 'hidden';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {modeChanged && (
          <div className='border-primary/40 bg-primary/10 flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm text-white'>
              You changed the mode since this was drafted. Regenerate the
              submission settings so they match the new mode.
            </p>
          </div>
        )}
        <div className='flex justify-end'>
          <RegenerateBountySectionButton
            section='submission'
            defaultInstruction={
              modeChanged && mode
                ? `The bounty mode is now entryType=${mode.entryType}, claimType=${mode.claimType}. Update the submission settings (application window, submission visibility, applicant/shortlist caps, reputation) to match.`
                : undefined
            }
            onApply={data => {
              const deadline = toDatetimeLocal(data.submissionDeadline);
              if (deadline)
                form.setValue('submissionDeadline', deadline, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              if ('applicationWindowCloseAt' in data)
                form.setValue(
                  'applicationWindowCloseAt',
                  toDatetimeLocal(data.applicationWindowCloseAt)
                );
              if (typeof data.maxApplicants === 'number')
                form.setValue('maxApplicants', data.maxApplicants);
              if (typeof data.shortlistSize === 'number')
                form.setValue('shortlistSize', data.shortlistSize);
              if (
                typeof data.reputationMinimum === 'number' &&
                fields.reputationMinimum !== 'hidden'
              )
                form.setValue('reputationMinimum', data.reputationMinimum);
              if (typeof data.applicationCreditCost === 'number')
                form.setValue(
                  'applicationCreditCost',
                  data.applicationCreditCost
                );
            }}
          />
        </div>
        {/* Submission deadline (always required) */}
        <FormField
          control={form.control}
          name='submissionDeadline'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-white'>
                Submission deadline<span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type='datetime-local'
                  className='h-10 rounded-lg border-zinc-800 bg-zinc-900/50 text-white'
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage className='text-xs text-red-500' />
            </FormItem>
          )}
        />

        {/* Application window close (application entry types) */}
        {!hidden(fields.applicationWindowCloseAt) && (
          <FormField
            control={form.control}
            name='applicationWindowCloseAt'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-white'>
                  Application window closes
                  {labelFor[fields.applicationWindowCloseAt]}
                </FormLabel>
                <FormControl>
                  <Input
                    type='datetime-local'
                    className='h-10 rounded-lg border-zinc-800 bg-zinc-900/50 text-white'
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />
        )}

        {/* Reputation minimum (open + single claim) */}
        {!hidden(fields.reputationMinimum) && (
          <FormField
            control={form.control}
            name='reputationMinimum'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-white'>
                  Minimum reputation to claim
                  {labelFor[fields.reputationMinimum]}
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={reputationFloor}
                    className='h-10 rounded-lg border-zinc-800 bg-zinc-900/50 text-white'
                    value={field.value ?? ''}
                    onChange={e =>
                      field.onChange(toNumberOrNull(e.target.value))
                    }
                  />
                </FormControl>
                {reputationFloor > 0 && category && (
                  <p className='text-xs text-zinc-500'>
                    {CATEGORY_LABELS[category]} bounties start at{' '}
                    {reputationFloor}. You can raise this, but not lower it.
                  </p>
                )}
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />
        )}

        {/* Max applicants */}
        {!hidden(fields.maxApplicants) && (
          <FormField
            control={form.control}
            name='maxApplicants'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-white'>
                  Max applicants{labelFor[fields.maxApplicants]}
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={fields.maxApplicants === 'required' ? 2 : 1}
                    className='h-10 rounded-lg border-zinc-800 bg-zinc-900/50 text-white'
                    value={field.value ?? ''}
                    onChange={e =>
                      field.onChange(toNumberOrNull(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />
        )}

        {/* Shortlist size */}
        {!hidden(fields.shortlistSize) && (
          <FormField
            control={form.control}
            name='shortlistSize'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-white'>
                  Shortlist size{labelFor[fields.shortlistSize]}
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={fields.shortlistSize === 'required' ? 2 : 1}
                    className='h-10 rounded-lg border-zinc-800 bg-zinc-900/50 text-white'
                    value={field.value ?? ''}
                    onChange={e =>
                      field.onChange(toNumberOrNull(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />
        )}

        {/* Application credit cost (application entry types) */}
        {!hidden(fields.applicationCreditCost) && (
          <FormField
            control={form.control}
            name='applicationCreditCost'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium text-white'>
                  Credits required to apply
                  {labelFor[fields.applicationCreditCost]}
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    max={100}
                    className='h-10 rounded-lg border-zinc-800 bg-zinc-900/50 text-white'
                    value={field.value ?? ''}
                    onChange={e =>
                      field.onChange(toNumberOrNull(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />
        )}

        {/* Submission visibility (forced, read-only) */}
        <div className='rounded-lg border border-zinc-800 bg-zinc-900/30 p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400'>
              {isCompetition ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Lock className='h-4 w-4' />
              )}
            </div>
            <div>
              <p className='text-sm font-medium text-white'>
                Submission visibility
              </p>
              <p className='mt-0.5 text-xs text-zinc-500'>
                {isCompetition
                  ? 'Hidden until the deadline so the organizer cannot play favorites.'
                  : 'Visible to the organizer as submissions arrive.'}
              </p>
            </div>
          </div>
          <p className='mt-3 text-xs font-medium text-zinc-400'>
            {fields.submissionVisibility === 'HIDDEN_UNTIL_DEADLINE'
              ? 'Hidden until deadline'
              : 'Organizer only'}
            <span className='ml-2 text-zinc-600'>
              (set by the selected mode)
            </span>
          </p>
        </div>

        {/* Required submission fields — the primary link is always required. */}
        <div className='space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4'>
          <div>
            <p className='text-sm font-medium text-white'>
              Required submission fields
            </p>
            <p className='mt-0.5 text-xs text-zinc-500'>
              The submission link is always required. Toggle any extra fields
              builders must provide when they submit work.
            </p>
          </div>
          {(
            [
              ['requireDocumentation', 'Documentation link'],
              ['requireDemoVideo', 'Demo video link'],
              ['requireTweet', 'Tweet link'],
              ['requireMedia', 'Media image'],
            ] as const
          ).map(([name, label]) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem className='flex items-center justify-between gap-3 space-y-0'>
                  <FormLabel className='text-sm font-normal text-zinc-300'>
                    {label}
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className='flex items-center justify-between pt-4'>
          {onBack ? (
            <BoundlessButton
              type='button'
              variant='outline'
              size='lg'
              onClick={onBack}
              disabled={isLoading}
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back
            </BoundlessButton>
          ) : (
            <span />
          )}
          <BoundlessButton
            type='submit'
            size='lg'
            disabled={isLoading}
            className='min-w-32'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </BoundlessButton>
        </div>
      </form>
    </Form>
  );
}
