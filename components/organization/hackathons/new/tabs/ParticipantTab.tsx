import React from 'react';
import { BoundlessButton } from '@/components/buttons';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Minus,
  Plus,
  Users,
  UserCheck,
  UsersRound,
  Loader2,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  participantSchema,
  ParticipantFormData,
} from './schemas/participantSchema';

interface ParticipantTabProps {
  onContinue?: () => void;
  onSave?: (data: ParticipantFormData) => Promise<void>;
  initialData?: ParticipantFormData;
  isLoading?: boolean;
  isRegistrationClosed?: boolean;
}

const participantTypes = [
  { value: 'individual' as const, label: 'Individual', icon: UserCheck },
  { value: 'team' as const, label: 'Team', icon: Users },
  {
    value: 'team_or_individual' as const,
    label: 'Team or Individual',
    icon: UsersRound,
  },
];

const submissionRequirements = [
  {
    name: 'require_github' as const,
    label: 'GitHub Repository',
    description: 'Require a link to their project source code on GitHub',
  },
  {
    name: 'require_demo_video' as const,
    label: 'Demo Video',
    description: 'Require a demo video link (YouTube or Vimeo)',
  },
  {
    name: 'require_other_links' as const,
    label: 'Other Links',
    description: 'Allow additional links (social media, Google Drive, etc.)',
  },
];

const tabVisibility = [
  { name: 'detailsTab' as const, label: 'Details' },
  { name: 'participantsTab' as const, label: 'Participants' },
  { name: 'resourcesTab' as const, label: 'Resources' },
  { name: 'submissionTab' as const, label: 'Submissions' },
  { name: 'announcementsTab' as const, label: 'Announcements' },
  { name: 'discussionTab' as const, label: 'Discussion' },
  { name: 'winnersTab' as const, label: 'Winners' },
  { name: 'sponsorsTab' as const, label: 'Sponsors' },
  { name: 'joinATeamTab' as const, label: 'Join a Team' },
  { name: 'rulesTab' as const, label: 'Rules' },
];

const defaultParticipantValues: ParticipantFormData = {
  participantType: 'individual',
  teamMin: 2,
  teamMax: 5,
  maxParticipants: undefined,
  require_github: true,
  require_demo_video: true,
  require_other_links: true,
  detailsTab: true,
  participantsTab: true,
  resourcesTab: true,
  submissionTab: true,
  announcementsTab: true,
  discussionTab: true,
  winnersTab: true,
  sponsorsTab: true,
  joinATeamTab: true,
  rulesTab: true,
};

function normalizeParticipantInitialData(
  data: ParticipantFormData | undefined
): ParticipantFormData {
  if (!data) return defaultParticipantValues;
  const type = data.participantType;
  const needsTeamSize = type === 'team' || type === 'team_or_individual';
  return {
    ...defaultParticipantValues,
    ...data,
    teamMin: needsTeamSize
      ? data.teamMin && data.teamMin >= 1
        ? data.teamMin
        : 2
      : data.teamMin,
    teamMax: needsTeamSize
      ? data.teamMax && data.teamMax >= 1
        ? data.teamMax
        : 5
      : data.teamMax,
    maxParticipants:
      data.maxParticipants != null && data.maxParticipants >= 1
        ? data.maxParticipants
        : undefined,
  };
}

export default function ParticipantTab({
  onContinue,
  onSave,
  initialData,
  isLoading = false,
  isRegistrationClosed = false,
}: ParticipantTabProps) {
  const normalizedInitial = React.useMemo(
    () => normalizeParticipantInitialData(initialData),
    [initialData]
  );

  const form = useForm<ParticipantFormData>({
    resolver: zodResolver(participantSchema),
    defaultValues: normalizedInitial,
  });

  const participantType = form.watch('participantType');
  const maxParticipants = form.watch('maxParticipants');
  const hasParticipantCap =
    maxParticipants !== undefined && maxParticipants !== null;

  React.useEffect(() => {
    form.reset(normalizedInitial);
  }, [normalizedInitial, form]);

  const onSubmit = async (data: ParticipantFormData) => {
    try {
      if (onSave) {
        await onSave(data);
      }
      if (onContinue) {
        onContinue();
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      const message = err.response?.data?.message || err.message;
      const errorMessage = Array.isArray(message) ? message[0] : message;
      toast.error(
        errorMessage || 'Failed to save participant settings. Please try again.'
      );
    }
  };

  interface NumberInputProps {
    value: number;
    onIncrement: () => void;
    onDecrement: () => void;
    disabled?: boolean;
  }

  const NumberInput = ({
    value,
    onIncrement,
    onDecrement,
    disabled = false,
  }: NumberInputProps) => (
    <div className='flex items-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50'>
      <div
        className={cn(
          'flex-1 px-4 py-2.5 text-sm font-medium text-white',
          disabled && 'text-zinc-500'
        )}
      >
        {value}
      </div>
      <div className='flex border-l border-zinc-800'>
        <button
          type='button'
          onClick={onDecrement}
          disabled={disabled}
          className={cn(
            'flex h-full items-center justify-center bg-zinc-900/50 px-3 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <Minus className='h-4 w-4' />
        </button>
        <button
          type='button'
          onClick={onIncrement}
          disabled={disabled}
          className={cn(
            'flex h-full items-center justify-center border-l border-zinc-800 bg-zinc-900/50 px-3 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <Plus className='h-4 w-4' />
        </button>
      </div>
    </div>
  );

  const handleInvalid = (errors: Record<string, { message?: string }>) => {
    const firstKey = Object.keys(errors)[0];
    const firstMessage =
      firstKey && errors[firstKey]?.message
        ? errors[firstKey].message
        : undefined;
    toast.error('Please fix the errors below before continuing.', {
      description: firstMessage,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, handleInvalid)}
        className='space-y-8'
      >
        {/* Participant Type */}
        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium text-white'>
              Participant Type <span className='text-red-500'>*</span>
            </h3>
            <p className='mt-1 text-sm text-zinc-500'>
              Choose how participants can join your hackathon
            </p>
          </div>

          <FormField
            control={form.control}
            name='participantType'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className='grid gap-3 sm:grid-cols-3'>
                    {participantTypes.map(({ value, label, icon: Icon }) => {
                      const isSelected = field.value === value;
                      return (
                        <button
                          key={value}
                          type='button'
                          onClick={() =>
                            !isRegistrationClosed && field.onChange(value)
                          }
                          disabled={isRegistrationClosed}
                          className={cn(
                            'flex items-center gap-3 rounded-lg border p-4 text-left transition-all',
                            isSelected
                              ? 'border-primary/50 bg-primary/10 shadow-primary/10 shadow-sm'
                              : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50',
                            isRegistrationClosed &&
                              'cursor-not-allowed opacity-60'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                              isSelected
                                ? 'bg-primary/20 text-primary'
                                : 'bg-zinc-800 text-zinc-500'
                            )}
                          >
                            <Icon className='h-5 w-5' />
                          </div>
                          <span
                            className={cn(
                              'text-sm font-medium',
                              isSelected ? 'text-primary' : 'text-white'
                            )}
                          >
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />

          {/* Team Size Settings */}
          {participantType === 'team' && (
            <div className='rounded-lg border border-zinc-800 bg-zinc-900/30 p-6'>
              <h4 className='mb-1 text-sm font-medium text-white'>Team Size</h4>
              <p className='mb-4 text-sm text-zinc-500'>
                Set minimum and maximum team members
              </p>

              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='teamMin'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-center gap-4'>
                        <div className='w-20 text-sm font-medium text-zinc-400'>
                          Minimum
                        </div>
                        <NumberInput
                          value={field.value || 2}
                          disabled={isRegistrationClosed}
                          onIncrement={() => {
                            const next = Math.min(
                              (field.value || 2) + 1,
                              form.getValues('teamMax') || 20
                            );
                            field.onChange(next);
                          }}
                          onDecrement={() => {
                            const next = Math.max((field.value || 2) - 1, 2);
                            field.onChange(next);
                          }}
                        />
                      </div>
                      <FormMessage className='text-xs text-red-500' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='teamMax'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-center gap-4'>
                        <div className='w-20 text-sm font-medium text-zinc-400'>
                          Maximum
                        </div>
                        <NumberInput
                          value={field.value || 5}
                          onIncrement={() => {
                            const next = Math.min((field.value || 5) + 1, 20);
                            field.onChange(next);
                          }}
                          onDecrement={() => {
                            const next = Math.max(
                              (field.value || 5) - 1,
                              form.getValues('teamMin') || 2
                            );
                            field.onChange(next);
                          }}
                        />
                      </div>
                      <FormMessage className='text-xs text-red-500' />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>

        {/* Participant Cap */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 p-4'>
            <div>
              <h3 className='text-sm font-medium text-white'>
                Limit Participants
              </h3>
              <p className='mt-0.5 text-xs text-zinc-500'>
                Leave off for unlimited. Once the cap is reached, new
                registrations are automatically rejected.
              </p>
            </div>
            <Switch
              checked={hasParticipantCap}
              onCheckedChange={checked => {
                if (checked) {
                  form.setValue('maxParticipants', 100, {
                    shouldValidate: true,
                  });
                } else {
                  form.setValue('maxParticipants', undefined, {
                    shouldValidate: true,
                  });
                }
              }}
              disabled={isRegistrationClosed}
            />
          </div>

          {hasParticipantCap && (
            <FormField
              control={form.control}
              name='maxParticipants'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className='rounded-lg border border-zinc-800 bg-zinc-900/30 p-4'>
                      <label className='mb-2 block text-sm font-medium text-white'>
                        Maximum Participants
                      </label>
                      <Input
                        type='number'
                        min={1}
                        className='h-10 rounded-lg border-zinc-800 bg-zinc-900/50 text-white'
                        value={field.value ?? ''}
                        onChange={e => {
                          const val = parseInt(e.target.value, 10);
                          field.onChange(isNaN(val) ? undefined : val);
                        }}
                        disabled={isRegistrationClosed}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs text-red-500' />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Submission Requirements */}
        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium text-white'>
              Submission Requirements <span className='text-red-500'>*</span>
            </h3>
            <p className='mt-1 text-sm text-zinc-500'>
              Choose what participants must include in submissions
            </p>
          </div>

          <div className='space-y-3'>
            {submissionRequirements.map(({ name, label, description }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4'>
                        <div className='flex-1'>
                          <p className='text-sm font-medium text-white'>
                            {label}
                          </p>
                          <p className='mt-0.5 text-xs text-zinc-500'>
                            {description}
                          </p>
                        </div>
                        <Switch
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                          disabled={isRegistrationClosed}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className='text-xs text-red-500' />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        {/* Tab Visibility */}
        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium text-white'>
              Page Tabs <span className='text-red-500'>*</span>
            </h3>
            <p className='mt-1 text-sm text-zinc-500'>
              Control which tabs appear on the hackathon page
            </p>
          </div>

          <div className='grid gap-3 sm:grid-cols-2'>
            {tabVisibility.map(({ name, label }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3'>
                        <span className='text-sm font-medium text-white'>
                          {label}
                        </span>
                        <Switch
                          checked={Boolean(field.value ?? true)}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className='text-xs text-red-500' />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className='flex justify-end pt-4'>
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
