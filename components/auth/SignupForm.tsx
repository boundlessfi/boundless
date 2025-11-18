'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { LockIcon, MailIcon, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { BoundlessButton } from '../buttons';
import { Badge } from '../ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import OtpForm from './OtpForm';
import { authClient } from '@/lib/auth-client';

const formSchema = z.object({
  email: z.string().email({
    message: 'Invalid email address',
  }),
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters',
  }),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters',
  }),
});

interface SignupFormProps {
  onLoadingChange?: (isLoading: boolean) => void;
  invitation?: string | null;
  onGoogleSignIn?: () => void;
  lastMethod?: string | null;
}

const SignupForm = ({
  onLoadingChange,
  invitation,
  onGoogleSignIn,
  lastMethod,
}: SignupFormProps) => {
  const router = useRouter();
  const [step, setStep] = useState<'signup' | 'otp'>('signup');
  const [userData, setUserData] = useState<{ email: string } | null>(null);
  const isGoogleLastUsed = lastMethod === 'google';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
    },
  });

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(form.formState.isSubmitting);
  }, [form.formState.isSubmitting, onLoadingChange]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const signUpData = {
        email: values.email,
        password: values.password,
        name: `${values.firstName} ${values.lastName}`,
        ...(invitation && { invitation }),
      } as {
        email: string;
        password: string;
        name: string;
        invitation?: string;
      };

      const { error } = await authClient.signUp.email(signUpData, {
        onRequest: () => {
          // Loading state handled by form
        },
        onSuccess: () => {
          setUserData({ email: values.email });
          setStep('otp');
          toast.success('OTP sent to your email!');
        },
        onError: ctx => {
          if (ctx.error.status === 409 || ctx.error.code === 'CONFLICT') {
            form.setError('email', {
              type: 'manual',
              message: 'This email is already registered',
            });
          } else {
            form.setError('root', {
              type: 'manual',
              message:
                ctx.error.message ||
                'Failed to create account. Please try again.',
            });
          }
        },
      });

      if (error) {
        if (error.status === 409 || error.code === 'CONFLICT') {
          form.setError('email', {
            type: 'manual',
            message: 'This email is already registered',
          });
        } else {
          form.setError('root', {
            type: 'manual',
            message:
              error.message || 'Failed to create account. Please try again.',
          });
        }
      }
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: `Failed to create account. Please try again. ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  const handleOtpSuccess = () => {
    router.push('/auth?mode=signin');
  };

  const handleResendOtp = async () => {
    if (!userData) return;

    try {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email: userData.email,
        type: 'email-verification',
      });

      if (data) {
        toast.success('OTP resent successfully!');
      } else if (error) {
        toast.error(error.message || 'Failed to resend OTP');
      }
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  if (step === 'otp' && userData) {
    return (
      <OtpForm
        email={userData.email}
        onOtpSuccess={handleOtpSuccess}
        onResendOtp={handleResendOtp}
        onLoadingChange={onLoadingChange}
      />
    );
  }

  return (
    <>
      <div className='space-y-2'>
        <p className='mt-3 text-center text-sm leading-relaxed text-[#D9D9D9] md:text-left lg:text-base'>
          Sign up to manage campaigns, apply for grants, and track your funding
          progress.
        </p>
      </div>
      <div className='mt-6 space-y-6'>
        <div className='relative'>
          <BoundlessButton
            fullWidth
            centerContent={true}
            className={`group bg-background !text-white transition-all duration-200 ${
              isGoogleLastUsed
                ? 'border-2 !border-[#a7f950] shadow-sm shadow-[#a7f950]/20'
                : 'border !border-[#484848]'
            }`}
            onClick={onGoogleSignIn}
            disabled={form.formState.isSubmitting}
          >
            <div className='flex w-full items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Image
                  src='/auth/google.svg'
                  alt='google'
                  width={24}
                  height={24}
                  className='object-cover'
                  unoptimized
                />
                <span>Continue with Google</span>
              </div>
              {isGoogleLastUsed && (
                <Badge
                  variant='secondary'
                  className='group-hover:bg-background-card ml-2 border-[#a7f950]/30 bg-[#a7f950]/20 text-[#a7f950]'
                >
                  Last used
                </Badge>
              )}
            </div>
          </BoundlessButton>
        </div>
        <div className='flex items-center justify-center gap-2.5'>
          <div className='h-[1px] w-full bg-[#2B2B2B]'></div>
          <p className='text-center text-sm text-[#B5B5B5]'>Or</p>
          <div className='h-[1px] w-full bg-[#2B2B2B]'></div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='w-full space-y-4'
          >
            {form.formState.errors.root && (
              <div className='text-center text-sm text-red-500'>
                {form.formState.errors.root.message}
              </div>
            )}
            <div className='flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center'>
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs font-medium text-white'>
                      First Name
                    </FormLabel>
                    <FormControl className='h-11 w-full rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-2.5'>
                      <div className='flex w-full items-center gap-2.5'>
                        <User className='h-5 w-5 flex-shrink-0 text-[#B5B5B5]' />
                        <Input
                          {...field}
                          type='text'
                          placeholder='Enter your first name'
                          className='w-full border-none bg-transparent text-white caret-white placeholder:text-[#B5B5B5] focus-visible:ring-0 focus-visible:ring-offset-0'
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs font-medium text-white'>
                      Last Name
                    </FormLabel>
                    <FormControl className='h-11 w-full rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-2.5'>
                      <div className='flex w-full items-center gap-2.5'>
                        <User className='h-5 w-5 flex-shrink-0 text-[#B5B5B5]' />
                        <Input
                          {...field}
                          type='text'
                          placeholder='Enter your last name'
                          className='w-full border-none bg-transparent text-white caret-white placeholder:text-[#B5B5B5] focus-visible:ring-0 focus-visible:ring-offset-0'
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs font-medium text-white'>
                    Email
                  </FormLabel>
                  <FormControl className='h-11 w-full rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-2.5'>
                    <div className='flex w-full items-center gap-2.5'>
                      <MailIcon className='h-5 w-5 flex-shrink-0 text-[#B5B5B5]' />
                      <Input
                        {...field}
                        placeholder='Enter your email'
                        className='w-full border-none bg-transparent text-white caret-white placeholder:text-[#B5B5B5] focus-visible:ring-0 focus-visible:ring-offset-0'
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='mb-4'>
                  <FormLabel className='text-xs font-medium text-white'>
                    Password
                  </FormLabel>
                  <FormControl className='h-11 w-full rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-2.5'>
                    <div className='flex w-full items-center gap-2.5'>
                      <LockIcon className='h-5 w-5 flex-shrink-0 text-[#B5B5B5]' />
                      <Input
                        {...field}
                        type='password'
                        placeholder='Enter your password'
                        className='w-full border-none bg-transparent text-white caret-white placeholder:text-[#B5B5B5] focus-visible:ring-0 focus-visible:ring-offset-0'
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <BoundlessButton
              type='submit'
              className='w-full'
              disabled={form.formState.isSubmitting || !form.formState.isValid}
              fullWidth
              loading={form.formState.isSubmitting}
            >
              Continue
            </BoundlessButton>
          </form>
        </Form>

        <p className='text-center text-xs text-[#D9D9D9] lg:text-sm'>
          By continuing, you agree to our{' '}
          <Link href='/terms' className='text-primary/80'>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href='/privacy' className='text-primary/80'>
            Privacy Policy
          </Link>
        </p>

        <p className='text-center text-xs text-[#D9D9D9] lg:text-sm'>
          Already have an account?{' '}
          <Link href='/auth?mode=signin' className='text-primary underline'>
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
};

export default SignupForm;
