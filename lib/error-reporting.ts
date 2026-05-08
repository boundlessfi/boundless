/* eslint-disable no-console */

export type ReportContext = Record<string, unknown>;

export type ReportLevel = 'info' | 'warning' | 'error';

function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);
  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
}

export function reportError(error: unknown, context?: ReportContext): void {
  const normalized = normalizeError(error);
  const payload = {
    name: normalized.name,
    message: normalized.message,
    stack: normalized.stack,
    ...(context ?? {}),
  };

  if (process.env.NODE_ENV !== 'production') {
    console.error('[reportError]', payload);
  } else {
    console.error(JSON.stringify({ level: 'error', ...payload }));
  }
}

export function reportMessage(
  message: string,
  level: ReportLevel = 'info',
  context?: ReportContext
): void {
  const payload = { message, ...(context ?? {}) };
  const method =
    level === 'error'
      ? console.error
      : level === 'warning'
        ? console.warn
        : console.info;

  if (process.env.NODE_ENV !== 'production') {
    method('[reportMessage]', level, payload);
  } else {
    method(JSON.stringify({ level, ...payload }));
  }
}
