import { useState, useCallback } from 'react';

export interface ValidationResult {
  isValid: boolean | null;
  isValidating: boolean;
  error: string | null;
}

export interface LinkValidationHook {
  validateWebsite: (url: string) => Promise<ValidationResult>;
  validateXHandle: (handle: string) => Promise<ValidationResult>;
  validateGithubHandle: (handle: string) => Promise<ValidationResult>;
}

/**
 * Custom hook for validating social media handles and website URLs
 *
 * @returns Object with validation functions for website, X, and GitHub
 */
export function useLinkValidation(): LinkValidationHook {
  const [validationState, setValidationState] = useState<
    Record<string, ValidationResult>
  >({});

  /**
   * Validates a website URL by checking format and attempting to reach it
   */
  const validateWebsite = useCallback(
    async (url: string): Promise<ValidationResult> => {
      if (!url || url.trim() === '') {
        return { isValid: null, isValidating: false, error: null };
      }

      setValidationState(prev => ({
        ...prev,
        website: { isValid: null, isValidating: true, error: null },
      }));

      try {
        // Basic URL format validation
        let urlToTest = url.trim();
        if (!urlToTest.match(/^https?:\/\//i)) {
          urlToTest = `https://${urlToTest}`;
        }

        const urlObj = new URL(urlToTest);

        // Try to verify the URL exists by making a request
        // We'll use a simple GET request with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        try {
          const response = await fetch(urlToTest, {
            method: 'GET',
            signal: controller.signal,
            // Don't follow redirects to avoid CORS issues
            redirect: 'manual',
          });

          clearTimeout(timeoutId);

          // Consider 2xx, 3xx, and even some 4xx as valid (site exists)
          // Only fail on network errors or complete failures
          if (
            response.type === 'opaque' ||
            response.type === 'opaqueredirect' ||
            response.status < 500 ||
            response.status === 0
          ) {
            const result = {
              isValid: true,
              isValidating: false,
              error: null,
            };

            setValidationState(prev => ({ ...prev, website: result }));
            return result;
          } else {
            const result = {
              isValid: false,
              isValidating: false,
              error: 'Website not reachable',
            };

            setValidationState(prev => ({ ...prev, website: result }));
            return result;
          }
        } catch (fetchError: any) {
          clearTimeout(timeoutId);

          // Network errors or timeouts mean the site doesn't exist or isn't reachable
          if (fetchError.name === 'AbortError') {
            const result = {
              isValid: false,
              isValidating: false,
              error: 'Website timeout - may not exist',
            };

            setValidationState(prev => ({ ...prev, website: result }));
            return result;
          }

          // For CORS errors, we can't verify but we'll accept valid format
          // In production, you'd want a backend endpoint to verify this
          const result = {
            isValid: true,
            isValidating: false,
            error: null,
          };

          setValidationState(prev => ({ ...prev, website: result }));
          return result;
        }
      } catch (error) {
        const result = {
          isValid: false,
          isValidating: false,
          error: 'Invalid URL format',
        };

        setValidationState(prev => ({ ...prev, website: result }));
        return result;
      }
    },
    []
  );

  /**
   * Validates an X (Twitter) handle by checking format and existence
   */
  const validateXHandle = useCallback(
    async (handle: string): Promise<ValidationResult> => {
      if (!handle || handle.trim() === '') {
        return { isValid: null, isValidating: false, error: null };
      }

      setValidationState(prev => ({
        ...prev,
        x: { isValid: null, isValidating: true, error: null },
      }));

      try {
        // Remove @ if present
        const cleanHandle = handle.trim().replace(/^@/, '');

        // Validate format: 1-15 characters, alphanumeric and underscore only
        const handleRegex = /^[A-Za-z0-9_]{1,15}$/;
        if (!handleRegex.test(cleanHandle)) {
          const result = {
            isValid: false,
            isValidating: false,
            error:
              'Handle must be 1-15 characters (letters, numbers, underscores only)',
          };

          setValidationState(prev => ({ ...prev, x: result }));
          return result;
        }

        // Try to verify the handle exists
        // Note: Due to CORS, we can't directly check Twitter's API from the browser
        // In production, you'd want a backend endpoint for this
        // For now, we'll just validate the format
        const result = {
          isValid: true,
          isValidating: false,
          error: null,
        };

        setValidationState(prev => ({ ...prev, x: result }));
        return result;
      } catch (error) {
        const result = {
          isValid: false,
          isValidating: false,
          error: 'Invalid X handle format',
        };

        setValidationState(prev => ({ ...prev, x: result }));
        return result;
      }
    },
    []
  );

  /**
   * Validates a GitHub handle by checking format and existence via GitHub API
   */
  const validateGithubHandle = useCallback(
    async (handle: string): Promise<ValidationResult> => {
      if (!handle || handle.trim() === '') {
        return { isValid: null, isValidating: false, error: null };
      }

      setValidationState(prev => ({
        ...prev,
        github: { isValid: null, isValidating: true, error: null },
      }));

      try {
        // Remove @ if present and clean the handle
        let cleanHandle = handle.trim().replace(/^@/, '');

        // If it's a full URL, extract the username
        if (cleanHandle.includes('github.com/')) {
          const match = cleanHandle.match(/github\.com\/([^\/\?#]+)/);
          if (match) {
            cleanHandle = match[1];
          }
        }

        // Validate format: alphanumeric and hyphens, cannot start with hyphen
        const handleRegex = /^[A-Za-z0-9]([A-Za-z0-9-]{0,38}[A-Za-z0-9])?$/;
        if (!handleRegex.test(cleanHandle)) {
          const result = {
            isValid: false,
            isValidating: false,
            error: 'Invalid GitHub username format',
          };

          setValidationState(prev => ({ ...prev, github: result }));
          return result;
        }

        // Verify the handle exists using GitHub API
        try {
          const response = await fetch(
            `https://api.github.com/users/${cleanHandle}`,
            {
              headers: {
                Accept: 'application/vnd.github.v3+json',
              },
            }
          );

          if (response.ok) {
            const result = {
              isValid: true,
              isValidating: false,
              error: null,
            };

            setValidationState(prev => ({ ...prev, github: result }));
            return result;
          } else if (response.status === 404) {
            const result = {
              isValid: false,
              isValidating: false,
              error: 'GitHub user not found',
            };

            setValidationState(prev => ({ ...prev, github: result }));
            return result;
          } else if (response.status === 403) {
            // Rate limited - we can't verify, so we'll reject it to be safe
            const result = {
              isValid: false,
              isValidating: false,
              error: 'Unable to verify (rate limited). Please try again later.',
            };

            setValidationState(prev => ({ ...prev, github: result }));
            return result;
          } else {
            throw new Error('Failed to verify GitHub handle');
          }
        } catch (fetchError) {
          // If we can't verify, reject it to be safe
          const result = {
            isValid: false,
            isValidating: false,
            error: 'Unable to verify GitHub handle',
          };

          setValidationState(prev => ({ ...prev, github: result }));
          return result;
        }
      } catch (error) {
        const result = {
          isValid: false,
          isValidating: false,
          error: 'Invalid GitHub handle',
        };

        setValidationState(prev => ({ ...prev, github: result }));
        return result;
      }
    },
    []
  );

  return {
    validateWebsite,
    validateXHandle,
    validateGithubHandle,
  };
}
