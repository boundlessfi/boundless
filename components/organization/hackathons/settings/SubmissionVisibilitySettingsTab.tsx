'use client';

import React, { useState, useEffect } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BoundlessButton } from '@/components/buttons';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import {
  SubmissionVisibility,
  SubmissionStatusVisibility,
  updateSubmissionVisibility,
  getHackathon,
} from '@/lib/api/hackathons';
import Loading from '@/components/Loading';

const visibilitySettingsSchema = z.object({
  submissionVisibility: z.nativeEnum(SubmissionVisibility),
  submissionStatusVisibility: z.nativeEnum(SubmissionStatusVisibility),
});

type VisibilitySettingsFormData = z.infer<typeof visibilitySettingsSchema>;

interface SubmissionVisibilitySettingsTabProps {
  organizationId: string;
  hackathonId: string;
}

export default function SubmissionVisibilitySettingsTab({
  organizationId,
  hackathonId,
}: SubmissionVisibilitySettingsTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<VisibilitySettingsFormData>({
    resolver: zodResolver(visibilitySettingsSchema),
    defaultValues: {
      submissionVisibility: SubmissionVisibility.PUBLIC,
      submissionStatusVisibility: SubmissionStatusVisibility.ALL,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getHackathon(hackathonId);
        if (response?.data) {
          form.reset({
            submissionVisibility:
              response.data.submissionVisibility || SubmissionVisibility.PUBLIC,
            submissionStatusVisibility:
              response.data.submissionStatusVisibility ||
              SubmissionStatusVisibility.ALL,
          });
        }
      } catch (error) {
        toast.error('Failed to fetch visibility settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [hackathonId]);

  const onSubmit = async (data: VisibilitySettingsFormData) => {
    setIsSaving(true);
    try {
      await updateSubmissionVisibility(organizationId, hackathonId, data);
      toast.success('Visibility settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update visibility settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className='space-y-6'>
      <div className='bg-background-card rounded-xl border border-gray-900 p-6'>
        <div className='mb-6'>
          <h2 className='text-xl font-semibold text-white'>
            Submission Visibility
          </h2>
          <p className='mt-1 text-sm text-gray-400'>
            Control who can view submissions and which projects are displayed in
            the showcase.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
              control={form.control}
              name='submissionVisibility'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <div>
                    <FormLabel className='text-base text-white'>
                      Who can view submissions?
                    </FormLabel>
                    <FormDescription className='text-sm text-gray-400'>
                      Decide if submissions are visible to the general public or
                      restricted to participants.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className='flex flex-col space-y-3'
                    >
                      <FormItem className='flex items-center space-y-0 space-x-3 rounded-lg border border-gray-900 p-4'>
                        <FormControl>
                          <RadioGroupItem value={SubmissionVisibility.PUBLIC} />
                        </FormControl>
                        <FormLabel className='cursor-pointer font-normal text-white'>
                          <div className='font-medium'>Public</div>
                          <div className='text-xs text-gray-400'>
                            Anyone visiting the hackathon page can see the
                            submissions.
                          </div>
                        </FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-y-0 space-x-3 rounded-lg border border-gray-900 p-4'>
                        <FormControl>
                          <RadioGroupItem
                            value={SubmissionVisibility.PARTICIPANTS_ONLY}
                          />
                        </FormControl>
                        <FormLabel className='cursor-pointer font-normal text-white'>
                          <div className='font-medium'>Participants Only</div>
                          <div className='text-xs text-gray-400'>
                            Only registered participants and organizers can see
                            the submissions.
                          </div>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='submissionStatusVisibility'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <div>
                    <FormLabel className='text-base text-white'>
                      Which submissions are visible?
                    </FormLabel>
                    <FormDescription className='text-sm text-gray-400'>
                      Filter which project statuses are displayed in the public
                      showcase.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className='flex flex-col space-y-3'
                    >
                      <FormItem className='flex items-center space-y-0 space-x-3 rounded-lg border border-gray-900 p-4'>
                        <FormControl>
                          <RadioGroupItem
                            value={SubmissionStatusVisibility.ALL}
                          />
                        </FormControl>
                        <FormLabel className='cursor-pointer font-normal text-white'>
                          <div className='font-medium'>All Submissions</div>
                          <div className='text-xs text-gray-400'>
                            Show all projects (accepted, shortlisted, and
                            rejected).
                          </div>
                        </FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-y-0 space-x-3 rounded-lg border border-gray-900 p-4'>
                        <FormControl>
                          <RadioGroupItem
                            value={
                              SubmissionStatusVisibility.ACCEPTED_SHORTLISTED
                            }
                          />
                        </FormControl>
                        <FormLabel className='cursor-pointer font-normal text-white'>
                          <div className='font-medium'>
                            Accepted/Shortlisted Only
                          </div>
                          <div className='text-xs text-gray-400'>
                            Only show projects that have been approved or
                            shortlisted.
                          </div>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end pt-4'>
              <BoundlessButton
                type='submit'
                variant='default'
                size='lg'
                disabled={isSaving}
                className='min-w-[120px]'
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </BoundlessButton>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
