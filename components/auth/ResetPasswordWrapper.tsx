'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import z from 'zod';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { BoundlessButton } from '../buttons';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { authClient } from '@/lib/auth-client';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, {
      message: 'Password must be at least 8 characters long',
    }),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordWrapperProps {
  setLoadingState: (isLoading: boolean) => void;
}

const ResetPasswordWrapper = ({
  setLoadingState,
}: ResetPasswordWrapperProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isValidParams, setIsValidParams] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // Check for token parameter (token-based reset flow)
    const tokenParam = searchParams.get('token');
    // Also check for otp and email (OTP-based reset flow) for backward compatibility
    const otpParam = searchParams.get('otp');
    const emailParam = searchParams.get('email');

    if (tokenParam) {
      // Token-based flow
      setToken(tokenParam);
      setIsValidParams(true);
    } else if (otpParam && emailParam) {
      // OTP-based flow (for backward compatibility)
      // Note: This would require using emailOtp.resetPassword instead
      setIsValidParams(false); // OTP flow not fully implemented in this component
    } else {
      setIsValidParams(false);
    }
  }, [searchParams]);

  const handleSubmit = useCallback(
    async (data: ResetPasswordFormData) => {
      if (!token) return;

      setIsLoading(true);
      setLoadingState(true);

      try {
        const { error } = await authClient.resetPassword(
          {
            token,
            newPassword: data.password,
          },
          {
            onRequest: () => {
              setIsLoading(true);
              setLoadingState(true);
            },
            onSuccess: () => {
              setIsSuccess(true);
              toast.success('Password reset successfully!');
              form.reset();
              setTimeout(() => {
                router.push('/auth?mode=signin');
              }, 2000);
            },
            onError: ctx => {
              form.setError('root', {
                type: 'manual',
                message: ctx.error.message || 'Failed to reset password',
              });
              toast.error(ctx.error.message || 'Failed to reset password');
            },
          }
        );

        if (error) {
          form.setError('root', {
            type: 'manual',
            message: error.message || 'Failed to reset password',
          });
          toast.error(error.message || 'Failed to reset password');
        }
      } catch {
        form.setError('root', {
          type: 'manual',
          message: 'An unexpected error occurred. Please try again.',
        });
        toast.error('An unexpected error occurred');
      } finally {
        setIsLoading(false);
        setLoadingState(false);
      }
    },
    [token, form, router, setLoadingState]
  );

  if (!isValidParams) {
    return (
      <div className='space-y-6'>
        <div className='text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20'>
            <AlertCircle className='h-8 w-8 text-red-500' />
          </div>
          <h2 className='text-2xl font-semibold text-white'>
            Invalid Reset Link
          </h2>
          <p className='mt-2 text-sm text-[#D9D9D9]'>
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
        </div>

        <div className='text-center'>
          <Link
            href='/auth/forgot-password'
            className='text-primary hover:text-primary/80 inline-flex items-center text-sm'
          >
            Request new reset link
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className='space-y-6'>
        <div className='text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20'>
            <CheckCircle className='h-8 w-8 text-green-500' />
          </div>
          <h2 className='text-2xl font-semibold text-white'>
            Password Reset Successfully!
          </h2>
          <p className='mt-2 text-sm text-[#D9D9D9]'>
            Your password has been updated. You can now sign in with your new
            password.
          </p>
        </div>

        <div className='text-center'>
          <Link
            href='/auth?mode=signin'
            className='text-primary hover:text-primary/80 inline-flex items-center text-sm'
          >
            Continue to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <Image
          src='/auth/logo.svg'
          alt='logo'
          width={123}
          height={22}
          className='mx-auto mb-6 object-cover'
        />
        <h2 className='text-2xl font-semibold text-white'>
          Reset Your Password
        </h2>
        <p className='mt-2 text-sm text-[#D9D9D9]'>
          Enter your new password below
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs font-medium text-white'>
                  New Password
                </FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Lock className='absolute top-3 left-3 h-4 w-4 text-[#B5B5B5]' />
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Enter new password'
                      className='w-full border-[#2B2B2B] bg-[#1C1C1C] pr-10 pl-10 text-white caret-white placeholder:text-[#B5B5B5] focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute top-3 right-3 text-[#B5B5B5] hover:text-white'
                    >
                      {showPassword ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs font-medium text-white'>
                  Confirm New Password
                </FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Lock className='absolute top-3 left-3 h-4 w-4 text-[#B5B5B5]' />
                    <Input
                      {...field}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder='Confirm new password'
                      className='w-full border-[#2B2B2B] bg-[#1C1C1C] pr-10 pl-10 text-white caret-white placeholder:text-[#B5B5B5] focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
                    <button
                      type='button'
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className='absolute top-3 right-3 text-[#B5B5B5] hover:text-white'
                    >
                      {showConfirmPassword ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <div className='text-sm text-red-500'>
              {form.formState.errors.root.message}
            </div>
          )}

          <BoundlessButton
            type='submit'
            className='w-full'
            disabled={isLoading || !form.formState.isValid}
            fullWidth
            loading={isLoading}
          >
            Reset Password
          </BoundlessButton>
        </form>
      </Form>

      <div className='text-center'>
        <Link
          href='/auth?mode=signin'
          className='text-primary hover:text-primary/80 inline-flex items-center text-sm'
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default ResetPasswordWrapper;
