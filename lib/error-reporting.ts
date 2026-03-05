/**
 * Central error reporting for production observability.
 * When NEXT_PUBLIC_SENTRY_DSN is set, errors are sent to Sentry.
 * Otherwise logs to console in development and no-ops in production.
 */

type ReportContext = Record<string, unknown>;

const hasSentry = (): boolean =>
  typeof process !== 'undefined' &&
  typeof process.env !== 'undefined' &&
  Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

/**
 * Report an error to the configured service (e.g. Sentry).
 * Safe to call from any environment; no-ops when Sentry is not configured.
 */
export const reportError = (error: unknown, context?: ReportContext): void => {
  if (hasSentry()) {
    try {
      import('@sentry/nextjs')
        .then(Sentry => {
          const err = error instanceof Error ? error : new Error(String(error));
          if (context && Object.keys(context).length > 0) {
            Sentry.withScope(scope => {
              scope.setContext('extra', context);
              Sentry.captureException(err);
            });
          } else {
            Sentry.captureException(err);
          }
        })
        .catch(() => {
          if (process.env.NODE_ENV === 'development') {
            console.error(
              '[reportError] Sentry capture failed',
              error,
              context
            );
          }
        });
    } catch {
      if (process.env.NODE_ENV === 'development') {
        console.error('[reportError]', error, context);
      }
    }
    return;
  }
  if (process.env.NODE_ENV === 'development') {
    console.error('[reportError]', error, context ?? '');
  }
};

/**
 * Report a message (warning or info) to the configured service.
 * Use for non-exception events you want to track in production.
 */
export const reportMessage = (
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: ReportContext
): void => {
  if (hasSentry()) {
    try {
      import('@sentry/nextjs')
        .then(Sentry => {
          if (context && Object.keys(context).length > 0) {
            Sentry.withScope(scope => {
              scope.setContext('extra', context);
              Sentry.captureMessage(message, level);
            });
          } else {
            Sentry.captureMessage(message, level);
          }
        })
        .catch(() => {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[reportMessage] ${level}:`, message, context);
          }
        });
    } catch {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[reportMessage] ${level}:`, message, context);
      }
    }
    return;
  }
  if (process.env.NODE_ENV === 'development') {
    if (level === 'error')
      console.error('[reportMessage]', message, context ?? '');
    else console.warn('[reportMessage]', message, context ?? '');
  }
};
