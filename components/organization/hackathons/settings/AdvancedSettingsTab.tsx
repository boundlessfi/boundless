'use client';

import React, { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { api } from '@/lib/api/api';
import { toast } from 'sonner';

const advancedSettingsSchema = z.object({
  isPublic: z.boolean(),
  allowLateRegistration: z.boolean(),
  requireApproval: z.boolean(),
  maxParticipants: z.number().optional(),
  customDomain: z.string().optional(),
  enableDiscord: z.boolean(),
  discordInviteLink: z.string().optional(),
  enableTelegram: z.boolean(),
  telegramInviteLink: z.string().optional(),
});

type AdvancedSettingsFormData = z.infer<typeof advancedSettingsSchema>;

interface AdvancedSettingsTabProps {
  organizationId: string;
  hackathonId: string;
  onSave?: (data: AdvancedSettingsFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function AdvancedSettingsTab({
  organizationId,
  hackathonId,
  onSave,
  isLoading = false,
}: AdvancedSettingsTabProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm<AdvancedSettingsFormData>({
    resolver: zodResolver(advancedSettingsSchema),
    defaultValues: {
      isPublic: true,
      allowLateRegistration: false,
      requireApproval: false,
      maxParticipants: undefined,
      customDomain: '',
      enableDiscord: false,
      discordInviteLink: '',
      enableTelegram: false,
      telegramInviteLink: '',
    },
  });

  const onSubmit = async (data: AdvancedSettingsFormData) => {
    if (onSave) {
      await onSave(data);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(
        `/organizations/${organizationId}/hackathons/${hackathonId}`
      );
      toast.success('Hackathon deleted successfully');
      setShowDeleteDialog(false);
      // Redirect to hackathons list
      window.location.href = `/organizations/${organizationId}/hackathons`;
    } catch {
      toast.error('Failed to delete hackathon');
    }
  };

  return (
    <div className='space-y-6'>
      <div className='bg-background-card rounded-xl border border-gray-900 p-6'>
        <div className='mb-6'>
          <h2 className='text-xl font-semibold text-white'>
            Advanced Settings
          </h2>
          <p className='mt-1 text-sm text-gray-400'>
            Configure advanced options and integrations for your hackathon.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-white'>
                Visibility & Access
              </h3>

              <FormField
                control={form.control}
                name='isPublic'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border border-gray-900 p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm text-white'>
                        Public Hackathon
                      </FormLabel>
                      <FormDescription className='text-xs text-gray-400'>
                        Allow anyone to view and register for this hackathon
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='allowLateRegistration'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border border-gray-900 p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm text-white'>
                        Allow Late Registration
                      </FormLabel>
                      <FormDescription className='text-xs text-gray-400'>
                        Allow participants to register after the deadline
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='requireApproval'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border border-gray-900 p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm text-white'>
                        Require Approval
                      </FormLabel>
                      <FormDescription className='text-xs text-gray-400'>
                        Manually approve participant registrations
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='maxParticipants'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm text-white'>
                      Maximum Participants
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder='Unlimited'
                        value={field.value || ''}
                        onChange={e =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                        className='bg-background-card h-12 w-full rounded-[12px] border border-gray-900 p-4 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0'
                      />
                    </FormControl>
                    <FormDescription className='text-xs text-gray-400'>
                      Leave empty for unlimited participants
                    </FormDescription>
                    <FormMessage className='text-error-400 text-xs' />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-white'>Custom Domain</h3>

              <FormField
                control={form.control}
                name='customDomain'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm text-white'>
                      Custom Domain
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='text'
                        placeholder='hackathon.example.com'
                        className='bg-background-card h-12 w-full rounded-[12px] border border-gray-900 p-4 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0'
                      />
                    </FormControl>
                    <FormDescription className='text-xs text-gray-400'>
                      Set a custom domain for your hackathon page
                    </FormDescription>
                    <FormMessage className='text-error-400 text-xs' />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-white'>
                Community Integrations
              </h3>

              <FormField
                control={form.control}
                name='enableDiscord'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border border-gray-900 p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm text-white'>
                        Enable Discord
                      </FormLabel>
                      <FormDescription className='text-xs text-gray-400'>
                        Add a Discord community link
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch('enableDiscord') && (
                <FormField
                  control={form.control}
                  name='discordInviteLink'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type='text'
                          placeholder='https://discord.gg/...'
                          className='bg-background-card h-12 w-full rounded-[12px] border border-gray-900 p-4 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0'
                        />
                      </FormControl>
                      <FormMessage className='text-error-400 text-xs' />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name='enableTelegram'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border border-gray-900 p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm text-white'>
                        Enable Telegram
                      </FormLabel>
                      <FormDescription className='text-xs text-gray-400'>
                        Add a Telegram community link
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch('enableTelegram') && (
                <FormField
                  control={form.control}
                  name='telegramInviteLink'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type='text'
                          placeholder='https://t.me/...'
                          className='bg-background-card h-12 w-full rounded-[12px] border border-gray-900 p-4 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0'
                        />
                      </FormControl>
                      <FormMessage className='text-error-400 text-xs' />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className='flex justify-end pt-4'>
              <BoundlessButton
                type='submit'
                variant='default'
                size='lg'
                disabled={isLoading}
                className='min-w-[120px]'
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </BoundlessButton>
            </div>
          </form>
        </Form>
      </div>

      <div className='bg-background-card rounded-xl border border-red-900/50 p-6'>
        <div className='mb-4'>
          <h3 className='text-lg font-semibold text-red-400'>Danger Zone</h3>
          <p className='mt-1 text-sm text-gray-400'>
            Irreversible and destructive actions
          </p>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant='destructive'
              className='gap-2 bg-red-600 hover:bg-red-700'
            >
              <Trash2 className='h-4 w-4' />
              Delete Hackathon
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className='bg-background-card border-gray-800'>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-white'>
                Delete Hackathon
              </AlertDialogTitle>
              <AlertDialogDescription className='text-gray-400'>
                Are you sure you want to delete this hackathon? This action
                cannot be undone and will permanently delete all associated data
                including participants, submissions, and rewards.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='border-gray-800 text-white hover:bg-gray-800'>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className='bg-red-600 text-white hover:bg-red-700'
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
