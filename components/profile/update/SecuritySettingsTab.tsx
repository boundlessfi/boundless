'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { Loader2, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
    revokeOtherSessions: z.boolean(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function SecuritySettingsTab() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      revokeOtherSessions: true,
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: data.revokeOtherSessions,
      });
      if (error) {
        toast.error(error.message ?? 'Failed to change password');
        return;
      }
      toast.success('Password updated successfully');
      form.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        revokeOtherSessions: data.revokeOtherSessions,
      });
    } catch {
      toast.error('Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-lg font-semibold text-white'>Security</h2>
        <p className='text-sm text-zinc-500'>
          Change your password and manage account security
        </p>
      </div>

      <Card className='border-zinc-800 bg-zinc-900/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base text-white'>
            <Lock className='h-4 w-4' />
            Change password
          </CardTitle>
          <CardDescription className='text-zinc-400'>
            Use a strong password that you do not use elsewhere. After changing,
            you can optionally sign out all other sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='currentPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-zinc-300'>
                      Current password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        autoComplete='current-password'
                        placeholder='••••••••'
                        className='border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='text-red-400' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='newPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-zinc-300'>
                      New password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        autoComplete='new-password'
                        placeholder='••••••••'
                        className='border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='text-red-400' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-zinc-300'>
                      Confirm new password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        autoComplete='new-password'
                        placeholder='••••••••'
                        className='border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='text-red-400' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='revokeOtherSessions'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border border-zinc-700/50 p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-zinc-300'>
                        Sign out other sessions
                      </FormLabel>
                      <p className='text-xs text-zinc-500'>
                        After changing your password, log out all other devices
                        and browsers.
                      </p>
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
              <Button
                type='submit'
                disabled={isSubmitting}
                className='bg-white text-black hover:bg-zinc-200'
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Updating…
                  </>
                ) : (
                  'Update password'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
