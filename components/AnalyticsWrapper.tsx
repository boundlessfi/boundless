'use client';

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { useCookieConsent } from '@/hooks/use-cookie-consent';

export const AnalyticsWrapper = () => {
  const { isAnalyticsEnabled, isLoading } = useCookieConsent();
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!isLoading && isAnalyticsEnabled) {
      setShouldLoad(true);
    }
  }, [isAnalyticsEnabled, isLoading]);

  // Listen for consent acceptance event
  useEffect(() => {
    const handleConsentAccepted = () => {
      setShouldLoad(true);
    };

    window.addEventListener('cookie-consent-accepted', handleConsentAccepted);
    return () => {
      window.removeEventListener(
        'cookie-consent-accepted',
        handleConsentAccepted
      );
    };
  }, []);

  if (!shouldLoad) {
    return null;
  }

  return <Analytics />;
};
