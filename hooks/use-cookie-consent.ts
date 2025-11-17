'use client';

import { useState, useEffect } from 'react';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

export const useCookieConsent = () => {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);
  const [preferences, setPreferences] = useState<CookiePreferences | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      const prefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);

      if (consent === 'accepted' || consent === 'rejected') {
        setHasConsented(true);
      } else {
        setHasConsented(false);
      }

      if (prefs) {
        try {
          const parsedPrefs = JSON.parse(prefs) as CookiePreferences;
          setPreferences(parsedPrefs);
        } catch {
          setPreferences(null);
        }
      } else {
        setPreferences(null);
      }
    } catch {
      // Handle localStorage access errors (e.g., private browsing mode)
      // Silently fail to avoid disrupting user experience
      setHasConsented(false);
      setPreferences(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isAnalyticsEnabled = preferences?.analytics ?? false;

  return {
    hasConsented,
    preferences,
    isAnalyticsEnabled,
    isLoading,
  };
};
