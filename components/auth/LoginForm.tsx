'use client';
import { Eye, EyeOff, LockIcon, MailIcon } from 'lucide-react';
// import Image from 'next/image';
import Link from 'next/link';
import { UseFormReturn } from 'react-hook-form';
import z from 'zod';
import { BoundlessButton } from '../buttons';
import { Checkbox } from '../ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const formSchema = z.object({
  email: z.string().email({
    message: 'Invalid email address',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters',
  }),
});

interface LoginFormProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isLoading: boolean;
}

const LoginForm = ({
  form,
  onSubmit,
  showPassword,
  setShowPassword,
  isLoading,
}: LoginFormProps) => {
  return (
    <>
      <div className='space-y-2'>
        <p className='mt-3 text-center text-sm leading-relaxed text-[#D9D9D9] md:text-left lg:text-base'>
          Sign in to manage campaigns, apply for grants, and track your funding
          progress.
        </p>
      </div>
      <div className='mt-6 space-y-6'>
        {/* <BoundlessButton
          fullWidth
          size='xl'
          icon={
            <Image
              src='/auth/google.svg'
              alt='google'
              width={24}
              height={24}
              className='object-cover'
            />
          }
          className='bg-background hover:!text-background border !border-[#484848] text-base !text-white'
        >
          Continue with Google
        </BoundlessButton> */}
        {/* 
        <div className='flex items-center justify-center gap-2.5'>
          <div className='h-[1px] w-full bg-[#2B2B2B]'></div>
          <p className='text-center text-sm leading-[145%] text-[#B5B5B5]'>
            Or
          </p>
          <div className='h-[1px] w-full bg-[#2B2B2B]'></div>
        </div> */}

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
                <FormItem>
                  <FormLabel className='text-xs font-medium text-white'>
                    Password
                  </FormLabel>
                  <FormControl className='h-11 w-full rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-2.5'>
                    <div className='relative flex w-full items-center gap-2.5'>
                      <LockIcon className='h-5 w-5 flex-shrink-0 text-[#B5B5B5]' />
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Enter your password'
                        className='w-full border-none bg-transparent pr-10 pl-2 text-white caret-white placeholder:text-[#B5B5B5] focus-visible:ring-0 focus-visible:ring-offset-0'
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute top-3 right-3 text-gray-400 hover:text-gray-600'
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

            <div className='flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center'>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='remember'
                  className='h-6.5 w-6.5 border-[#6D6D6D]'
                />
                <Label htmlFor='remember' className='text-sm text-white'>
                  Remember me for 30 days
                </Label>
              </div>
              <Link
                href='/auth/forgot-password'
                className='text-sm text-[#D9D9D9] underline'
              >
                Forgot password?
              </Link>
            </div>

            <BoundlessButton
              type='submit'
              className='w-full'
              disabled={isLoading || !form.formState.isValid}
              fullWidth
              size='xl'
              loading={isLoading}
            >
              Sign in
            </BoundlessButton>
          </form>
        </Form>
      </div>
    </>
  );
};

export default LoginForm;
