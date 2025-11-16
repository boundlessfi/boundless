'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthActions, useAuthErrorHandler } from '@/hooks/use-auth';
import { authClient } from '@/lib/auth-client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { setError } = useAuthActions();
  const { handleAuthError } = useAuthErrorHandler();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
          rememberMe: true,
        },
        {
          onSuccess: async () => {
            // Get session after successful login
            const session = await authClient.getSession();

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
                const authStore = useAuthStore.getState();
                await authStore.syncWithSession({
                  id: sessionUser.id,
                  email: sessionUser.email,
                  name: sessionUser.name || undefined,
                  image: sessionUser.image || undefined,
                  role: 'USER',
                  username: undefined,
                  accessToken: undefined,
                });
              }
            }

            toast.success('Login successful!');
            onSuccess?.();
          },
          onError: ctx => {
            const errorObj = ctx.error || ctx;
            const errorMessage =
              typeof errorObj === 'object' && errorObj?.message
                ? errorObj.message
                : 'Login failed. Please try again.';

            if (
              handleAuthError(errorObj as { status?: number; code?: string })
            ) {
              return;
            }

            setError(errorMessage);
            onError?.(errorMessage);
            toast.error(errorMessage);
          },
        }
      );

      if (error) {
        const errorMessage = error.message || 'Login failed. Please try again.';
        setError(errorMessage);
        onError?.(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Login failed. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          type='email'
          placeholder='Enter your email'
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className='text-sm text-red-500'>{errors.email.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='password'>Password</Label>
        <Input
          id='password'
          type='password'
          placeholder='Enter your password'
          {...register('password')}
          className={errors.password ? 'border-red-500' : ''}
        />
        {errors.password && (
          <p className='text-sm text-red-500'>{errors.password.message}</p>
        )}
      </div>

      <Button type='submit' className='w-full' disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
