import { useState, useEffect, useCallback } from 'react';
import {
  getPreferences,
  updatePreferences as updatePreferencesApi,
} from '@/lib/api/notifications';
import type {
  NotificationPreferences,
  UpdatePreferencesRequest,
} from '@/types/notifications';

interface UseNotificationPreferencesReturn {
  preferences: NotificationPreferences | null;
  loading: boolean;
  error: Error | null;
  updatePreferences: (prefs: UpdatePreferencesRequest) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useNotificationPreferences =
  (): UseNotificationPreferencesReturn => {
    const [preferences, setPreferences] =
      useState<NotificationPreferences | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchPreferences = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPreferences();

        // Response is NotificationPreferences directly
        if (response && typeof response === 'object') {
          setPreferences(response);
        } else {
          throw new Error('Invalid preferences response format');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err
            : new Error('Failed to fetch notification preferences');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchPreferences();
    }, [fetchPreferences]);

    const updatePreferences = useCallback(
      async (prefs: UpdatePreferencesRequest) => {
        // Optimistic update
        if (preferences) {
          setPreferences({
            ...preferences,
            ...prefs,
          });
        }

        try {
          await updatePreferencesApi(prefs);
          // Refetch to ensure consistency
          await fetchPreferences();
        } catch (err) {
          // Revert on error
          await fetchPreferences();
          throw err;
        }
      },
      [preferences, fetchPreferences]
    );

    return {
      preferences,
      loading,
      error,
      updatePreferences,
      refetch: fetchPreferences,
    };
  };
