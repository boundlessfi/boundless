'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import SignupForm from './SignupForm';
import { authClient } from '@/lib/auth-client';

const SignupWrapper = ({
  setLoadingState,
  invitation,
  defaultEmail,
}: {
  setLoadingState: (isLoading: boolean) => void;
  invitation?: string | null;
  defaultEmail?: string | null;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastMethod, setLastMethod] = useState<string | null>(null);
  setLoadingState(isLoading);

  useEffect(() => {
    const method = authClient.getLastUsedLoginMethod();
    setLastMethod(method);
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    setLoadingState(true);

    // Better Auth treats a relative `callbackURL` as relative to the API
    // host that handled the OAuth callback (e.g. api.boundlessfi.xyz),
    // not the frontend host. The previous default of '/' caused
    // successful sign-ups to land on the API host's root, so users saw
    // a blank/404 page and thought sign-up had failed — yet the session
    // cookie was already set, so a later cache clear silently logged
    // them in. Always send an absolute URL pointing at the frontend.
    const callbackURL =
      typeof window !== 'undefined'
        ? window.location.origin
        : (
            process.env.NEXT_PUBLIC_APP_URL || 'https://boundlessfi.xyz'
          ).replace(/\/$/, '');

    try {
      await authClient.signIn.social(
        {
          provider: 'google',
          callbackURL,
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

  return (
    <SignupForm
      onLoadingChange={setIsLoading}
      invitation={invitation}
      defaultEmail={defaultEmail}
      onGoogleSignIn={handleGoogleSignIn}
      lastMethod={lastMethod}
    />
  );
};

export default SignupWrapper;
