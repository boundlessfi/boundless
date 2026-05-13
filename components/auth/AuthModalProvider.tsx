'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LoginWrapper from '@/components/auth/LoginWrapper';

interface AuthModalOptions {
  redirectTo?: string;
  /**
   * Override the default post-auth navigation. When provided, the modal
   * closes and `onAuthSuccess` runs instead of the LoginWrapper's hard
   * `window.location.href = callbackUrl` reload — useful when the caller
   * wants to keep the current page interactive (e.g. open a different
   * route in a new tab). Only applies to email/password and 2FA paths;
   * Google sign-in still uses the provider redirect via callbackUrl.
   */
  onAuthSuccess?: () => void | Promise<void>;
}

interface AuthModalContextValue {
  isOpen: boolean;
  openAuthModal: (options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | undefined>(
  undefined
);

const getDefaultRedirect = () => {
  if (typeof window === 'undefined') return undefined;
  return `${window.location.pathname}${window.location.search}`;
};

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | undefined>();
  const [onAuthSuccess, setOnAuthSuccess] = useState<
    (() => void | Promise<void>) | undefined
  >();

  const openAuthModal = useCallback((options?: AuthModalOptions) => {
    setRedirectTo(options?.redirectTo ?? getDefaultRedirect());
    // Wrap in an arrow when calling setState because functional setState
    // signature `setX(prev => next)` would invoke the callback as an updater
    // — we want to STORE the function, not call it.
    setOnAuthSuccess(() => options?.onAuthSuccess);
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    if (isSubmitting) return;
    setIsOpen(false);
    setOnAuthSuccess(() => undefined);
  }, [isSubmitting]);

  const handleAuthSuccess = useCallback(async () => {
    if (!onAuthSuccess) return;
    try {
      await onAuthSuccess();
    } finally {
      setIsOpen(false);
      setOnAuthSuccess(() => undefined);
    }
  }, [onAuthSuccess]);

  const value: AuthModalContextValue = useMemo(
    () => ({
      isOpen,
      openAuthModal,
      closeAuthModal,
    }),
    [isOpen, openAuthModal, closeAuthModal]
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <Dialog
        open={isOpen}
        onOpenChange={open => {
          if (!open) {
            closeAuthModal();
          } else {
            setIsOpen(true);
          }
        }}
      >
        <DialogContent className='max-w-md border-white/10 bg-[#050505]'>
          <DialogHeader>
            <DialogTitle className='text-xl font-semibold text-white'>
              Sign in to continue
            </DialogTitle>
            <DialogDescription className='text-sm text-zinc-400'>
              You need to be signed in to participate in hackathons and perform
              this action.
            </DialogDescription>
          </DialogHeader>
          <div className='mt-2'>
            <LoginWrapper
              setLoadingState={isLoading => setIsSubmitting(isLoading)}
              callbackUrl={redirectTo}
              onAuthSuccess={onAuthSuccess ? handleAuthSuccess : undefined}
            />
          </div>
          {redirectTo && (
            <p className='mt-4 text-xs text-zinc-500'>
              After signing in, you may be redirected within the app based on
              your account.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};
