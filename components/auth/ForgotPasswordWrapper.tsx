'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
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

const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordWrapperProps {
  setLoadingState: (isLoading: boolean) => void;
}

const ForgotPasswordWrapper = ({
  setLoadingState,
}: ForgotPasswordWrapperProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleSubmit = useCallback(
    async (data: ForgotPasswordFormData) => {
      setIsLoading(true);
      setLoadingState(true);

      try {
        // Use token-based password reset flow
        // This sends a reset link with a token to the user's email
        const { error } = await authClient.requestPasswordReset(
          {
            email: data.email,
            redirectTo: `${window.location.origin}/auth/reset-password`,
          },
          {
            onRequest: () => {
              setIsLoading(true);
              setLoadingState(true);
            },
            onSuccess: () => {
              setIsSuccess(true);
              toast.success('Password reset link sent to your email');
              form.reset();
            },
            onError: ctx => {
              form.setError('root', {
                type: 'manual',
                message: ctx.error.message || 'Failed to send reset link',
              });
              toast.error(ctx.error.message || 'Failed to send reset link');
            },
          }
        );

        if (error) {
          form.setError('root', {
            type: 'manual',
            message: error.message || 'Failed to send reset link',
          });
          toast.error(error.message || 'Failed to send reset link');
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
    [form, setLoadingState]
  );

  if (isSuccess) {
    return (
      <div className='space-y-6'>
        <div className='text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20'>
            <Mail className='h-8 w-8 text-green-500' />
          </div>
          <h2 className='text-2xl font-semibold text-white'>
            Check Your Email
          </h2>
          <p className='mt-2 text-sm text-[#D9D9D9]'>
            We've sent password reset instructions to your email address.
          </p>
        </div>

        <div className='text-center'>
          <Link
            href='/auth?mode=signin'
            className='text-primary hover:text-primary/80 inline-flex items-center text-sm'
          >
            <ArrowLeft className='mr-1 h-4 w-4' />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className=''>
        <h2 className='text-[40px] leading-[120%] font-medium tracking-[-1.6px] text-white'>
          Reset Password
        </h2>
        <p className='mt-2 text-[16px] leading-relaxed tracking-[-0.64px] text-[#D9D9D9]'>
          Enter the email address you used when you joined, and we'll send you
          instructions to reset your password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs font-medium text-white'>
                  Email
                </FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Mail className='absolute top-3 left-3 h-4 w-4 text-[#B5B5B5]' />
                    <Input
                      {...field}
                      type='email'
                      placeholder='Enter your email'
                      className='w-full border-[#2B2B2B] bg-[#1C1C1C] pl-10 text-white caret-white placeholder:text-[#B5B5B5] focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
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
            Send Reset Link
          </BoundlessButton>
        </form>
      </Form>

      <div className='text-center'>
        <Link
          href='/auth?mode=signin'
          className='text-primary hover:text-primary/80 inline-flex items-center text-sm'
        >
          <ArrowLeft className='mr-1 h-4 w-4' />
          Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordWrapper;
