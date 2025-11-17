'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Cookie } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { BoundlessButton } from '@/components/buttons/BoundlessButton';
import { slideInFromBottomLeft } from '@/lib/motion';
import { CookiePreferences } from '@/hooks/use-cookie-consent';

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_PREFERENCES_KEY = 'cookie-preferences';
const COOKIE_EXPIRY_DAYS = 365;

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    // Check if consent has already been given
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // Small delay to ensure page is loaded
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch {
      // Failed to check cookie consent
      // Silently fail to avoid disrupting user experience
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));

      // Set actual cookies
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);

      Cookies.set('cookie-consent', 'accepted', {
        expires: COOKIE_EXPIRY_DAYS,
        sameSite: 'strict',
      });

      if (prefs.analytics) {
        Cookies.set('cookie-analytics', 'true', {
          expires: COOKIE_EXPIRY_DAYS,
          sameSite: 'strict',
        });
      }

      if (prefs.marketing) {
        Cookies.set('cookie-marketing', 'true', {
          expires: COOKIE_EXPIRY_DAYS,
          sameSite: 'strict',
        });
      }

      setPreferences(prefs);
      setIsVisible(false);
      setShowCustomize(false);

      // Trigger custom event for analytics initialization
      if (prefs.analytics) {
        window.dispatchEvent(new CustomEvent('cookie-consent-accepted'));
      }
    } catch {
      // Failed to save cookie preferences
      // Silently fail to avoid disrupting user experience
    }
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    savePreferences(allAccepted);
  };

  const handleReject = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
      const rejectedPrefs: CookiePreferences = {
        essential: true,
        analytics: false,
        marketing: false,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(
        COOKIE_PREFERENCES_KEY,
        JSON.stringify(rejectedPrefs)
      );

      Cookies.set('cookie-consent', 'rejected', {
        expires: COOKIE_EXPIRY_DAYS,
        sameSite: 'strict',
      });

      setIsVisible(false);
    } catch {
      // Failed to reject cookies
      // Silently fail to avoid disrupting user experience
    }
  };

  const handleSaveCustomPreferences = () => {
    savePreferences(preferences);
  };

  const handleCustomizeAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial='hidden'
            animate='visible'
            exit='hidden'
            variants={slideInFromBottomLeft}
            className='fixed right-4 bottom-4 left-4 z-50 mx-auto w-full max-w-md sm:right-auto sm:left-4 sm:max-w-lg'
            role='dialog'
            aria-labelledby='cookie-consent-title'
            aria-describedby='cookie-consent-description'
          >
            <div className='rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl sm:p-6'>
              <div className='mb-4 flex items-start gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800'>
                  <Cookie className='h-5 w-5 text-white' />
                </div>
                <div className='flex-1'>
                  <h3
                    id='cookie-consent-title'
                    className='mb-2 text-lg font-semibold text-white'
                  >
                    We use cookies to enhance your experience
                  </h3>
                  <p
                    id='cookie-consent-description'
                    className='mb-4 text-sm text-zinc-400'
                  >
                    We use cookies to analyze site usage and personalize
                    content. By continuing, you agree to our use of cookies.
                  </p>
                </div>
              </div>

              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex flex-wrap items-center gap-2'>
                  <Link
                    href='/privacy'
                    className='text-primary focus:ring-primary rounded text-sm hover:underline focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:outline-none'
                  >
                    Learn More
                  </Link>
                </div>

                <div className='flex flex-col gap-2 sm:flex-row'>
                  <BoundlessButton
                    variant='outline'
                    size='sm'
                    onClick={handleReject}
                    className='border-zinc-800 bg-zinc-900/50 text-white hover:bg-zinc-800 hover:text-white'
                    aria-label='Reject all cookies'
                  >
                    Reject
                  </BoundlessButton>
                  <BoundlessButton
                    variant='outline'
                    size='sm'
                    onClick={() => setShowCustomize(true)}
                    className='border-zinc-800 bg-zinc-900/50 text-white hover:bg-zinc-800 hover:text-white'
                    aria-label='Customize cookie preferences'
                  >
                    Customize
                  </BoundlessButton>
                  <BoundlessButton
                    variant='default'
                    size='sm'
                    onClick={handleAcceptAll}
                    className='bg-primary text-primary-foreground'
                    aria-label='Accept all cookies'
                  >
                    Accept All
                  </BoundlessButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
        <DialogContent className='max-w-2xl border-zinc-800 bg-zinc-900 text-white'>
          <DialogHeader>
            <DialogTitle className='text-xl text-white'>
              Cookie Preferences
            </DialogTitle>
            <DialogDescription className='text-zinc-400'>
              Manage your cookie preferences. You can enable or disable
              different types of cookies below.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-6 py-4'>
            {/* Essential Cookies */}
            <div className='flex items-start justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4'>
              <div className='flex-1'>
                <div className='mb-1 flex items-center gap-2'>
                  <h4 className='font-semibold text-white'>
                    Essential Cookies
                  </h4>
                  <span className='rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400'>
                    Always Active
                  </span>
                </div>
                <p className='text-sm text-zinc-400'>
                  These cookies are necessary for the website to function and
                  cannot be switched off. They are usually only set in response
                  to actions made by you.
                </p>
              </div>
              <Switch
                checked={true}
                disabled
                className='mt-1'
                aria-label='Essential cookies (always enabled)'
              />
            </div>

            {/* Analytics Cookies */}
            <div className='flex items-start justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4'>
              <div className='flex-1'>
                <h4 className='mb-1 font-semibold text-white'>
                  Analytics Cookies
                </h4>
                <p className='text-sm text-zinc-400'>
                  These cookies help us understand how visitors interact with
                  our website by collecting and reporting information
                  anonymously.
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={checked =>
                  setPreferences(prev => ({
                    ...prev,
                    analytics: checked,
                  }))
                }
                className='mt-1'
                aria-label='Enable analytics cookies'
              />
            </div>

            {/* Marketing Cookies */}
            <div className='flex items-start justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4'>
              <div className='flex-1'>
                <h4 className='mb-1 font-semibold text-white'>
                  Marketing Cookies
                </h4>
                <p className='text-sm text-zinc-400'>
                  These cookies may be set through our site by our advertising
                  partners to build a profile of your interests.
                </p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={checked =>
                  setPreferences(prev => ({
                    ...prev,
                    marketing: checked,
                  }))
                }
                className='mt-1'
                aria-label='Enable marketing cookies'
              />
            </div>
          </div>

          <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
            <BoundlessButton
              variant='outline'
              onClick={handleCustomizeAcceptAll}
              className='border-zinc-800 bg-zinc-900/50 text-white hover:bg-zinc-800 hover:text-white'
            >
              Accept All
            </BoundlessButton>
            <BoundlessButton
              variant='default'
              onClick={handleSaveCustomPreferences}
              className='bg-primary text-primary-foreground'
            >
              Save Preferences
            </BoundlessButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
