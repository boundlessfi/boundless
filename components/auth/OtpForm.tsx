'use client';
import { maskEmail } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { BoundlessButton } from '../buttons';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../ui/form';
import { InputOTP, InputOTPSlot } from '../ui/input-otp';
import { authClient } from '@/lib/auth-client';
import { useAuthStore } from '@/lib/stores/auth-store';

const formSchema = z.object({
  otp: z.string().length(6, {
    message: 'OTP must be 6 digits',
  }),
});

interface OtpFormProps {
  email: string;
  onOtpSuccess: () => void;
  onResendOtp: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

const OtpForm = ({
  email,
  onOtpSuccess,
  onResendOtp,
  onLoadingChange,
}: OtpFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(form.formState.isSubmitting);
  }, [form.formState.isSubmitting, onLoadingChange]);

  const handleOtpError = (
    error:
      | { message?: string; status?: number; code?: string }
      | null
      | undefined
  ) => {
    // Log error for debugging

    const errorMessage =
      error?.message ||
      (typeof error === 'string' ? error : 'Invalid OTP. Please try again.');

    form.setError('otp', {
      type: 'manual',
      message: errorMessage,
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await authClient.emailOtp.verifyEmail(
        {
          email,
          otp: values.otp,
        },
        {
          onRequest: () => {
            // Loading state handled by form
          },
          onSuccess: async () => {
            // Get session after successful verification
            const session = await authClient.getSession();

            // Type guard for Better Auth session
            if (session && typeof session === 'object' && 'user' in session) {
              const sessionUser = session.user as
                | {
                    id: string;
                    email: string;
                    name?: string | null;
                    image?: string | null;
                  }
                | null
                | undefined;

              if (sessionUser && sessionUser.id && sessionUser.email) {
                // Sync with Zustand store
                const authStore = useAuthStore.getState();
                await authStore.syncWithSession({
                  id: sessionUser.id,
                  email: sessionUser.email,
                  name: sessionUser.name || undefined,
                  image: sessionUser.image || undefined,
                  role: 'USER', // Default role
                  username: undefined,
                  accessToken: undefined, // Better Auth handles tokens via cookies
                });
              }
            }

            toast.success('Email verified successfully!');
            onOtpSuccess();
          },
          onError: (ctx: {
            error?: { message?: string; status?: number; code?: string };
          }) => {
            // Handle error from Better Auth callback
            const errorObj = ctx.error
              ? ctx.error
              : { message: 'Invalid OTP. Please try again.' };
            handleOtpError(errorObj);
          },
        }
      );

      // Handle error from return value
      if (error) {
        handleOtpError(error);
      }
    } catch (error) {
      // Handle unexpected errors
      const errorObj =
        error instanceof Error
          ? { message: error.message }
          : { message: 'Failed to verify OTP. Please try again.' };

      handleOtpError(errorObj);
    }
  };

  const handleResendOtp = async () => {
    try {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp(
        {
          email,
          type: 'email-verification',
        },
        {
          onError: (ctx: {
            error?: { message?: string; status?: number; code?: string };
          }) => {
            const errorMessage = ctx.error?.message || 'Failed to resend OTP';
            toast.error(errorMessage);
          },
        }
      );

      if (data) {
        onResendOtp();
        toast.success('OTP resent successfully!');
      } else if (error) {
        toast.error(error.message || 'Failed to resend OTP');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to resend OTP. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div className='space-y-6'>
        <div>
          <h2 className='mb-3 text-2xl font-medium text-white lg:text-[40px]'>
            Enter OTP
          </h2>
          <p className='text-sm leading-relaxed text-[#D9D9D9] lg:text-base'>
            Enter the OTP that was sent to {maskEmail(email)}
          </p>
          <p className='text-sm leading-relaxed text-[#D9D9D9] lg:text-base'>
            Please keep this code private.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='w-full space-y-6'
          >
            <FormField
              control={form.control}
              name='otp'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP
                      {...field}
                      maxLength={6}
                      className='flex items-center justify-between'
                      containerClassName='justify-between'
                    >
                      <InputOTPSlot
                        index={0}
                        className='h-[73px] w-[73px] !rounded-2xl border border-[#2B2B2B] bg-[#1C1C1C] text-center text-white'
                      />
                      <InputOTPSlot
                        index={1}
                        className='h-[73px] w-[73px] rounded-2xl border border-[#2B2B2B] bg-[#1C1C1C] text-center text-white'
                      />
                      <InputOTPSlot
                        index={2}
                        className='h-[73px] w-[73px] rounded-2xl border border-[#2B2B2B] bg-[#1C1C1C] text-center text-white'
                      />
                      <InputOTPSlot
                        index={3}
                        className='h-[73px] w-[73px] rounded-2xl border border-[#2B2B2B] bg-[#1C1C1C] text-center text-white'
                      />
                      <InputOTPSlot
                        index={4}
                        className='h-[73px] w-[73px] rounded-2xl border border-[#2B2B2B] bg-[#1C1C1C] text-center text-white'
                      />
                      <InputOTPSlot
                        index={5}
                        className='h-[73px] w-[73px] rounded-2xl border border-[#2B2B2B] bg-[#1C1C1C] text-center text-white'
                      />
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <BoundlessButton
              type='submit'
              className='w-full'
              disabled={
                form.formState.isSubmitting || form.watch('otp').length !== 6
              }
              fullWidth
              loading={form.formState.isSubmitting}
            >
              Continue
            </BoundlessButton>
          </form>
        </Form>

        <div className='text-center'>
          <button
            type='button'
            onClick={handleResendOtp}
            className='hover:text-primary text-sm text-white underline transition-colors'
          >
            Send code again
          </button>
        </div>
      </div>
    </>
  );
};

export default OtpForm;
