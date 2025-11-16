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
import {
  participantSchema,
  ParticipantFormData,
} from './schemas/participantSchema';

interface ParticipantTabProps {
  onContinue?: () => void;
  onSave?: (data: ParticipantFormData) => Promise<void>;
  initialData?: ParticipantFormData;
  isLoading?: boolean;
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

export default function ParticipantTab({
  onSave,
  initialData,
  isLoading = false,
}: ParticipantTabProps) {
  const form = useForm<ParticipantFormData>({
    resolver: zodResolver(participantSchema),
    defaultValues: initialData || {
      participantType: 'individual',
      teamMin: 2,
      teamMax: 5,
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
    },
  });

  const participantType = form.watch('participantType');

  const onSubmit = async (data: ParticipantFormData) => {
    try {
      if (onSave) {
        await onSave(data);
        toast.success('Participation settings saved successfully');
      }
    } catch {
      toast.error('Failed to save participation settings. Please try again.');
    }
  };

  interface NumberInputProps {
    value: number;
    onIncrement: () => void;
    onDecrement: () => void;
  }

  const NumberInput = ({
    value,
    onIncrement,
    onDecrement,
  }: NumberInputProps) => (
    <div className='flex items-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50'>
      <div className='flex-1 px-4 py-2.5 text-sm font-medium text-white'>
        {value}
      </div>
      <div className='flex border-l border-zinc-800'>
        <button
          type='button'
          onClick={onDecrement}
          className='flex h-full items-center justify-center bg-zinc-900/50 px-3 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white'
        >
          <Minus className='h-4 w-4' />
        </button>
        <button
          type='button'
          onClick={onIncrement}
          className='flex h-full items-center justify-center border-l border-zinc-800 bg-zinc-900/50 px-3 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white'
        >
          <Plus className='h-4 w-4' />
        </button>
      </div>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
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
                          onClick={() => field.onChange(value)}
                          className={cn(
                            'flex items-center gap-3 rounded-lg border p-4 text-left transition-all',
                            isSelected
                              ? 'border-primary/50 bg-primary/10 shadow-primary/10 shadow-sm'
                              : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'
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
