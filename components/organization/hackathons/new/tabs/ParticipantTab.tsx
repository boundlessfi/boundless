import React from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
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

export default function ParticipantTab({
  onContinue,
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
      about: '',
      require_github: false,
      require_demo_video: false,
      require_other_links: false,
      details_tab: true,
      schedule_tab: true,
      rules_tab: true,
      reward_tab: true,
      announcements_tab: true,
      partners_tab: true,
      join_a_team_tab: true,
      projects_tab: true,
      participants_tab: true,
    },
  });

  const onSubmit = async (data: ParticipantFormData) => {
    try {
      if (onSave) {
        await onSave(data);
        toast.success('Participation settings saved successfully!');
      }
      if (onContinue) {
        onContinue();
      }
    } catch {
      toast.error('Failed to save participation settings. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div>
          <h3 className='text-sm'>
            Participant Type <span className='text-error-400'>*</span>
          </h3>
          <p className='mt-1 text-sm text-gray-500'>
            Manage the visibility of tabs on the hackathon page. You can choose
            to show or hide these tabs based on your event needs.
          </p>
          <div className='bg-background-card mt-3 rounded-[12px] border border-gray-900 text-sm text-gray-300'>
            <FormField
              control={form.control}
              name='participantType'
              render={({ field }) => (
                <FormItem className='gap-3'>
                  <FormLabel className='sr-only text-sm'>Mode</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className='flex flex-col gap-0'
                    >
                      {(
                        ['individual', 'team', 'team_or_individual'] as const
                      ).map((option, idx, arr) => (
                        <React.Fragment key={option}>
                          <div
                            className={cn(
                              'mx-5 my-5 flex items-center justify-between space-x-3 rounded-[6px] border border-[#2B2B2B] bg-[#2B2B2B3D] p-3',
                              field.value === option &&
                                'bg-active-bg border-primary/24'
                            )}
                          >
                            <Label
                              htmlFor={`participant-${option}`}
                              className={cn(
                                'cursor-pointer text-sm font-normal',
                                field.value === option
                                  ? 'text-primary'
                                  : 'text-[#B5B5B5]'
                              )}
                            >
                              {option === 'individual'
                                ? 'Individual'
                                : option === 'team'
                                  ? 'Team'
                                  : 'Team or Individual'}
                            </Label>
                            <RadioGroupItem
                              value={option}
                              id={`participant-${option}`}
                              className={cn(
                                'text-primary border-[#B5B5B5] bg-transparent',
                                field.value === option && 'border-primary'
                              )}
                            />
                          </div>
                          {option === 'team' && field.value === 'team' && (
                            <div className='mt-3 mb-5 ml-0 px-5'>
                              <h4 className='mb-2 text-sm'>Team Size</h4>
                              <p className='mb-4 text-sm text-gray-500'>
                                Set minimum and maximum number of members for a
                                team.
                              </p>

                              <div className='space-y-4'>
                                <FormField
                                  control={form.control}
                                  name='teamMin'
                                  render={({ field: minField }) => (
                                    <FormItem>
                                      <div className='flex items-center gap-4'>
                                        <div className='w-16 text-sm text-gray-400'>
                                          Min
                                        </div>
                                        <div className='flex flex-1 items-stretch overflow-hidden rounded-[12px] border border-gray-900'>
                                          <div className='flex-1 px-4 py-3'>
                                            {minField.value}
                                          </div>
                                          <div className='flex gap-px'>
                                            <Button
                                              type='button'
                                              variant='outline'
                                              className='h-full rounded-none border-l border-gray-900 bg-gray-900'
                                              onClick={() => {
                                                const current =
                                                  Number(minField.value) || 2;
                                                const next = Math.max(
                                                  2,
                                                  current - 1
                                                );
                                                const maxVal =
                                                  form.getValues('teamMax') ??
                                                  5;
                                                minField.onChange(
                                                  Math.min(next, maxVal)
                                                );
                                              }}
                                            >
                                              <Minus className='size-5 text-white' />
                                            </Button>
                                            <Button
                                              type='button'
                                              variant='outline'
                                              className='h-full rounded-none border-l border-gray-900 bg-gray-900'
                                              onClick={() => {
                                                const current =
                                                  Number(minField.value) || 2;
                                                const maxVal =
                                                  form.getValues('teamMax') ??
                                                  5;
                                                const next = Math.min(
                                                  current + 1,
                                                  20
                                                );
                                                minField.onChange(
                                                  Math.min(next, maxVal)
                                                );
                                              }}
                                            >
                                              <Plus className='size-5 text-white' />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                      <FormMessage className='text-error-400 text-xs' />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name='teamMax'
                                  render={({ field: maxField }) => (
                                    <FormItem>
                                      <div className='flex items-center gap-4'>
                                        <div className='w-16 text-sm text-gray-400'>
                                          Max
                                        </div>
                                        <div className='flex flex-1 items-stretch overflow-hidden rounded-[12px] border border-gray-900'>
                                          <div className='flex-1 px-4 py-3'>
                                            {maxField.value}
                                          </div>
                                          <div className='flex gap-px'>
                                            <Button
                                              type='button'
                                              variant='outline'
                                              className='h-full rounded-none border-l border-gray-900 bg-gray-900'
                                              onClick={() => {
                                                const current =
                                                  Number(maxField.value) || 5;
                                                const minVal =
                                                  form.getValues('teamMin') ??
                                                  2;
                                                const next = Math.max(
                                                  minVal,
                                                  current - 1
                                                );
                                                maxField.onChange(next);
                                              }}
                                            >
                                              <Minus className='size-5 text-white' />
                                            </Button>
                                            <Button
                                              type='button'
                                              variant='outline'
                                              className='h-full rounded-none border-l border-gray-900 bg-gray-900'
                                              onClick={() => {
                                                const current =
                                                  Number(maxField.value) || 5;
                                                const next = Math.min(
                                                  20,
                                                  current + 1
                                                );
                                                maxField.onChange(next);
                                              }}
                                            >
                                              <Plus className='size-5 text-white' />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                      <FormMessage className='text-error-400 text-xs' />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          )}
                          {idx < arr.length - 1 && (
                            <Separator className='bg-gray-900' />
                          )}
                        </React.Fragment>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
          control={form.control}
          name='about'
          render={({ field }) => (
            <FormItem className='space-y-3'>
              <FormLabel className='text-sm'>
                About <span className='text-error-400'>*</span>
              </FormLabel>
              <FormControl>
                <div
                  className={cn(
                    'overflow-hidden rounded-lg border border-[#484848]',
                    form.formState.errors.about && 'border-red-500'
                  )}
                >
                  <MDEditor
                    value={field.value || ''}
                    onChange={value => field.onChange(value || '')}
                    height={400}
                    data-color-mode='dark'
                    preview='edit'
                    hideToolbar={false}
                    visibleDragbar={true}
                    textareaProps={{
                      placeholder:
                        "Tell your project's full story...\n\nUse text, images, links, or videos to bring your vision to life. Format freely with headings, lists, and more.",
                      style: {
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: '#ffffff',
                        backgroundColor: '#101010',
                        fontFamily: 'inherit',
                      },
                    }}
                    style={{
                      backgroundColor: '#101010',
                      color: '#ffffff',
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage className='text-error-400 text-xs' />
            </FormItem>
          )}
        />
        <div>
          <h3 className='text-sm'>
            Submission Requirements <span className='text-error-400'>*</span>
          </h3>
          <div className='bg-background-card mt-3 rounded-[12px] border border-gray-900 text-sm text-gray-300'>
            <FormField
              control={form.control}
              name='require_github'
              render={({ field }) => (
                <FormItem className='mx-5 my-5'>
                  <FormLabel className='text-sm'>Github</FormLabel>
                  <FormControl>
                    <div className='flex items-center justify-between gap-2 rounded-[12px] border border-gray-900 p-3'>
                      <Label
                        htmlFor='require_github'
                        className='text-sm font-normal'
                      >
                        Require a link to their project's source code hosted on
                        GitHub
                      </Label>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
            <Separator className='bg-gray-900' />
            <FormField
              control={form.control}
              name='require_demo_video'
              render={({ field }) => (
                <FormItem className='mx-5 my-5'>
                  <FormLabel className='text-sm'>Demo Video</FormLabel>
                  <FormControl>
                    <div className='flex items-center justify-between gap-2 rounded-[12px] border border-gray-900 p-3'>
                      <Label
                        htmlFor='require_demo_video'
                        className='text-sm font-normal'
                      >
                        Require a link to their project's demo video hosted on
                        YouTube or Vimeo
                      </Label>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
            <Separator className='bg-gray-900' />
            <FormField
              control={form.control}
              name='require_other_links'
              render={({ field }) => (
                <FormItem className='mx-5 my-5'>
                  <FormLabel className='text-sm'>Other Links</FormLabel>
                  <FormControl>
                    <div className='flex items-center justify-between gap-2 rounded-[12px] border border-gray-900 p-3'>
                      <Label
                        htmlFor='require_other_links'
                        className='text-sm font-normal'
                      >
                        Require social, google drive, or any other external
                        links
                      </Label>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div>
          <h3 className='text-sm'>
            Tabs Visibility <span className='text-error-400'>*</span>
          </h3>
          <p className='mt-1 text-sm text-gray-500'>
            Manage the visibility of tabs on the hackathon page. You can choose
            to show or hide these tabs based on your event needs.
          </p>
          <div className='bg-background-card mt-3 rounded-[12px] border border-gray-900 text-sm text-gray-300'>
            <FormField
              control={form.control}
              name='details_tab'
              render={({ field }) => (
                <FormItem className='mx-5 my-5'>
                  <FormLabel className='sr-only text-sm'>Details Tab</FormLabel>
                  <FormControl>
                    <div className='flex items-center justify-between gap-2 rounded-[12px] border border-gray-900 p-3'>
                      <Label
                        htmlFor='details_tab'
                        className='text-sm font-normal'
                      >
                        Details Tab
                      </Label>
                      <div className='flex items-center gap-2'>
                        <Switch
                          checked={field.value ?? true}
                          onCheckedChange={field.onChange}
                        />
                        <Label
                          htmlFor='details_tab'
                          className='text-sm font-normal'
                        >
                          Yes
                        </Label>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
            <Separator className='bg-gray-900' />
            <FormField
              control={form.control}
              name='schedule_tab'
              render={({ field }) => (
                <FormItem className='mx-5 my-5'>
                  <FormLabel className='sr-only text-sm'>
                    Schedule Tab
                  </FormLabel>
                  <FormControl>
                    <div className='flex items-center justify-between gap-2 rounded-[12px] border border-gray-900 p-3'>
                      <Label
                        htmlFor='schedule_tab'
                        className='text-sm font-normal'
                      >
                        Schedule Tab
                      </Label>
                      <div className='flex items-center gap-2'>
                        <Switch
                          checked={field.value ?? true}
                          onCheckedChange={field.onChange}
                        />
                        <Label
                          htmlFor='schedule_tab'
                          className='text-sm font-normal'
                        >
                          Yes
                        </Label>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
            <Separator className='bg-gray-900' />
            <FormField
              control={form.control}
              name='rules_tab'
              render={({ field }) => (
                <FormItem className='mx-5 my-5'>
                  <FormLabel className='sr-only text-sm'>Rules Tab</FormLabel>
                  <FormControl>
                    <div className='flex items-center justify-between gap-2 rounded-[12px] border border-gray-900 p-3'>
                      <Label
                        htmlFor='rules_tab'
                        className='text-sm font-normal'
                      >
                        Rules Tab
                      </Label>
                      <div className='flex items-center gap-2'>
                        <Switch
                          checked={field.value ?? true}
                          onCheckedChange={field.onChange}
                        />
                        <Label
                          htmlFor='rules_tab'
                          className='text-sm font-normal'
                        >
                          Yes
                        </Label>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
            <Separator className='bg-gray-900' />
            <FormField
              control={form.control}
              name='reward_tab'
              render={({ field }) => (
                <FormItem className='mx-5 my-5'>
                  <FormLabel className='sr-only text-sm'>Rewards Tab</FormLabel>
                  <FormControl>
                    <div className='flex items-center justify-between gap-2 rounded-[12px] border border-gray-900 p-3'>
                      <Label
                        htmlFor='reward_tab'
                        className='text-sm font-normal'
                      >
                        Reward Tab
                      </Label>
                      <div className='flex items-center gap-2'>
                        <Switch
                          checked={field.value ?? true}
                          onCheckedChange={field.onChange}
                        />
                        <Label
                          htmlFor='reward_tab'
                          className='text-sm font-normal'
                        >
                          Yes
                        </Label>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
            <Separator className='bg-gray-900' />
            <FormField
              control={form.control}
              name='announcements_tab'
              render={({ field }) => (
                <FormItem className='mx-5 my-5'>
                  <FormLabel className='sr-only text-sm'>
                    Announcements Tab
                  </FormLabel>
                  <FormControl>
                    <div className='flex items-center justify-between gap-2 rounded-[12px] border border-gray-900 p-3'>
                      <Label
                        htmlFor='announcements_tab'
                        className='text-sm font-normal'
                      >
                        Announcements Tab
                      </Label>
                      <div className='flex items-center gap-2'>
                        <Switch
                          checked={field.value ?? true}
                          onCheckedChange={field.onChange}
                        />
                        <Label
                          htmlFor='announcements_tab'
                          className='text-sm font-normal'
                        >
                          Yes
                        </Label>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
            <Separator className='bg-gray-900' />
            <FormField
              control={form.control}
              name='partners_tab'
              render={({ field }) => (
                <FormItem className='mx-5 my-5'>
                  <FormLabel className='sr-only text-sm'>
                    Partners Tab
                  </FormLabel>
                  <FormControl>
                    <div className='flex items-center justify-between gap-2 rounded-[12px] border border-gray-900 p-3'>
                      <Label
                        htmlFor='partners_tab'
                        className='text-sm font-normal'
                      >
                        Partners Tab
                      </Label>
                      <div className='flex items-center gap-2'>
                        <Switch
                          checked={field.value ?? true}
                          onCheckedChange={field.onChange}
                        />
                        <Label
                          htmlFor='partners_tab'
                          className='text-sm font-normal'
                        >
                          Yes
                        </Label>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
            <Separator className='bg-gray-900' />
            <FormField
              control={form.control}
              name='join_a_team_tab'
              render={({ field }) => (
                <FormItem className='mx-5 my-5'>
                  <FormLabel className='sr-only text-sm'>
                    Join a Team Tab
                  </FormLabel>
                  <FormControl>
                    <div className='flex items-center justify-between gap-2 rounded-[12px] border border-gray-900 p-3'>
                      <Label
                        htmlFor='join_a_team_tab'
                        className='text-sm font-normal'
                      >
                        Join a Team Tab
                      </Label>
                      <div className='flex items-center gap-2'>
                        <Switch
                          checked={field.value ?? true}
                          onCheckedChange={field.onChange}
                        />
                        <Label
                          htmlFor='join_a_team_tab'
                          className='text-sm font-normal'
                        >
                          Yes
                        </Label>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
            <Separator className='bg-gray-900' />
            <FormField
              control={form.control}
              name='projects_tab'
              render={({ field }) => (
                <FormItem className='mx-5 my-5'>
                  <FormLabel className='sr-only text-sm'>
                    Projects Tab
                  </FormLabel>
                  <FormControl>
                    <div className='flex items-center justify-between gap-2 rounded-[12px] border border-gray-900 p-3'>
                      <Label
                        htmlFor='projects_tab'
                        className='text-sm font-normal'
                      >
                        Projects Tab
                      </Label>
                      <div className='flex items-center gap-2'>
                        <Switch
                          checked={field.value ?? true}
                          onCheckedChange={field.onChange}
                        />
                        <Label
                          htmlFor='projects_tab'
                          className='text-sm font-normal'
                        >
                          Yes
                        </Label>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
            <Separator className='bg-gray-900' />
            <FormField
              control={form.control}
              name='participants_tab'
              render={({ field }) => (
                <FormItem className='mx-5 my-5'>
                  <FormLabel className='sr-only text-sm'>
                    Participants Tab
                  </FormLabel>
                  <FormControl>
                    <div className='flex items-center justify-between gap-2 rounded-[12px] border border-gray-900 p-3'>
                      <Label
                        htmlFor='participants_tab'
                        className='text-sm font-normal'
                      >
                        Participants Tab
                      </Label>
                      <div className='flex items-center gap-2'>
                        <Switch
                          checked={field.value ?? true}
                          onCheckedChange={field.onChange}
                        />
                        <Label
                          htmlFor='participants_tab'
                          className='text-sm font-normal'
                        >
                          Yes
                        </Label>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className='text-error-400 text-xs' />
                </FormItem>
              )}
            />
          </div>
        </div>

        <BoundlessButton type='submit' size='xl' disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </BoundlessButton>
      </form>
    </Form>
  );
}
