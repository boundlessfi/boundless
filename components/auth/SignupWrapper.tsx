'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import SignupForm from './SignupForm';
import { authClient } from '@/lib/auth-client';

const SignupWrapper = ({
  setLoadingState,
  invitation,
}: {
  setLoadingState: (isLoading: boolean) => void;
  invitation?: string | null;
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

  return (
    <SignupForm
      onLoadingChange={setIsLoading}
      invitation={invitation}
      onGoogleSignIn={handleGoogleSignIn}
      lastMethod={lastMethod}
    />
  );
};

export default SignupWrapper;
