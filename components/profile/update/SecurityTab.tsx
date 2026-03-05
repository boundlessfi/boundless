'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { BoundlessButton } from '@/components/buttons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, LockIcon } from 'lucide-react';
import { User } from '@/types/user';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface SecurityTabProps {
  user: User;
}

const SecurityTab = ({ user }: SecurityTabProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (error) {
        toast.error(error.message || 'Failed to update password');
      } else {
        toast.success('Password updated successfully');
        reset();
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8'>
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-[#a7f950]/10 p-2'>
            <LockIcon className='h-5 w-5 text-[#a7f950]' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-white'>
              Change Password
            </h3>
            <p className='text-sm text-[#B5B5B5]'>
              Update your account password
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='currentPassword'>Current Password</Label>
            <Input
              id='currentPassword'
              type='password'
              {...register('currentPassword')}
              className='h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
            />
            {errors.currentPassword && (
              <p className='text-sm text-red-500'>
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='newPassword'>New Password</Label>
            <Input
              id='newPassword'
              type='password'
              {...register('newPassword')}
              className='h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
            />
            {errors.newPassword && (
              <p className='text-sm text-red-500'>
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm New Password</Label>
            <Input
              id='confirmPassword'
              type='password'
              {...register('confirmPassword')}
              className='h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
            />
            {errors.confirmPassword && (
              <p className='text-sm text-red-500'>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <BoundlessButton type='submit' loading={isLoading}>
            Update Password
          </BoundlessButton>
        </form>
      </div>

      <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8'>
        <div className='flex items-start justify-between'>
          <div className='flex gap-3'>
            <div className='rounded-lg bg-[#a7f950]/10 p-2'>
              <ShieldCheck className='h-5 w-5 text-[#a7f950]' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-white'>
                Two-Factor Authentication
              </h3>
              <p className='mt-1 text-sm text-[#B5B5B5]'>
                Add an extra layer of security to your account. You can manage
                this in the dedicated 2FA tab.
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1'>
            <div
              className={`h-2 w-2 rounded-full ${user.twoFactorEnabled ? 'bg-[#a7f950]' : 'bg-[#B5B5B5]'}`}
            />
            <span className='text-xs font-medium text-white uppercase'>
              {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
