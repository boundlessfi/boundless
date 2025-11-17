'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import LoginForm from './LoginForm';
import { authClient } from '@/lib/auth-client';
import { useAuthStore } from '@/lib/stores/auth-store';

const formSchema = z.object({
  email: z.string().email({
    message: 'Invalid email address',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters',
  }),
});

type FormData = z.infer<typeof formSchema>;

interface LoginWrapperProps {
  setLoadingState: (isLoading: boolean) => void;
}

const LoginWrapper = ({ setLoadingState }: LoginWrapperProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastMethod, setLastMethod] = useState<string | null>(null);

  const callbackUrl =
    searchParams.get('callbackUrl') || 'http://localhost:3000/';

  useEffect(() => {
    const method = authClient.getLastUsedLoginMethod();
    setLastMethod(method);
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleAuthError = useCallback(
    (
      error:
        | { message?: string; status?: number; code?: string }
        | null
        | undefined,
      values: FormData
    ) => {
      // Log error for debugging

      if (!error) {
        const defaultMessage = 'Authentication failed. Please try again.';
        form.setError('root', {
          type: 'manual',
          message: defaultMessage,
        });
        return;
      }

      // Extract error message - handle different error formats
      const errorMessage =
        error.message ||
        (typeof error === 'string'
          ? error
          : 'Authentication failed. Please try again.');
      const errorStatus = error.status;
      const errorCode = error.code;

      if (errorStatus === 403 || errorCode === 'FORBIDDEN') {
        const message =
          'Please verify your email before signing in. Check your inbox for a verification link.';
        form.setError('root', {
          type: 'manual',
          message,
        });
        // Show toast for email verification since it requires user action
        toast.error(message);
        setTimeout(() => {
          router.push(
            `/auth?mode=signin&email=${encodeURIComponent(values.email)}`
          );
        }, 3000);
      } else if (
        errorStatus === 401 ||
        errorCode === 'UNAUTHORIZED' ||
        errorCode === 'INVALID_EMAIL_OR_PASSWORD'
      ) {
        const message = 'Invalid email or password';
        form.setError('root', {
          type: 'manual',
          message,
        });
      } else {
        // Show all other errors in the form
        form.setError('root', {
          type: 'manual',
          message: errorMessage,
        });
      }
    },
    [form, router]
  );

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    setLoadingState(true);

    try {
      await authClient.signIn.social(
        {
          provider: 'google',
          callbackURL: 'http://localhost:3000/',
        },
        {
          onRequest: () => {
            setIsLoading(true);
            setLoadingState(true);
          },
          onError: ctx => {
            setIsLoading(false);
            setLoadingState(false);

            const errorObj = ctx.error || ctx;
            const errorMessage =
              typeof errorObj === 'object' && errorObj.message
                ? errorObj.message
                : 'Failed to sign in with Google. Please try again.';

            toast.error(errorMessage);
          },
        }
      );
    } catch (error) {
      setIsLoading(false);
      setLoadingState(false);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred during Google sign-in.';

      toast.error(errorMessage);
    }
  }, [setLoadingState]);

  const onSubmit = useCallback(
    async (values: FormData) => {
      setIsLoading(true);
      setLoadingState(true);

      try {
        const { error } = await authClient.signIn.email(
          {
            email: values.email,
            password: values.password,
            rememberMe: true,
            callbackURL: callbackUrl,
          },
          {
            onRequest: () => {
              setIsLoading(true);
              setLoadingState(true);
            },
            onSuccess: async () => {
              setIsLoading(false);
              setLoadingState(false);

              // Wait a bit for cookies to be set by Better Auth
              await new Promise(resolve => setTimeout(resolve, 100));

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

              // Use full page reload to ensure cookies are available in middleware
              // Use callbackUrl if provided, otherwise redirect to home
              window.location.href = callbackUrl;
            },
            onError: ctx => {
              // Handle error from Better Auth callback
              const errorObj = ctx.error || ctx;
              handleAuthError(
                typeof errorObj === 'object'
                  ? errorObj
                  : { message: String(errorObj) },
                values
              );
              setIsLoading(false);
              setLoadingState(false);
            },
          }
        );

        // Handle error from return value
        if (error) {
          handleAuthError(error, values);
          setIsLoading(false);
          setLoadingState(false);
        }
      } catch (error) {
        // Handle unexpected errors
        const errorObj =
          error instanceof Error
            ? { message: error.message, status: undefined, code: undefined }
            : { message: String(error), status: undefined, code: undefined };

        handleAuthError(errorObj, values);
        setIsLoading(false);
        setLoadingState(false);
      }
    },
    [handleAuthError, setLoadingState, callbackUrl]
  );

  return (
    <LoginForm
      form={form}
      onSubmit={onSubmit}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      isLoading={isLoading}
      onGoogleSignIn={handleGoogleSignIn}
      lastMethod={lastMethod}
    />
  );
};

export default LoginWrapper;
