type AddToWaitlistRequest = {
  email: string;
  firstName: string;
  lastName: string;
  source?: string;
  referrer?: string;
  tags?: string[];
};

export type NewsletterTag = 'bounties' | 'hackathons' | 'grants' | 'updates';

export const NEWSLETTER_TAGS: NewsletterTag[] = [
  'bounties',
  'hackathons',
  'grants',
  'updates',
];

type NewsletterSubscribeRequest = {
  email: string;
  name?: string;
  source?: string;
  tags?: NewsletterTag[];
};

type NewsletterUnsubscribeRequest = {
  email: string;
};

type NewsletterPreferencesRequest = {
  email: string;
  tags: NewsletterTag[];
};

export type NewsletterApiError = {
  status: number;
  code:
    | 'INVALID_TAGS'
    | 'ALREADY_SUBSCRIBED'
    | 'RATE_LIMITED'
    | 'NOT_FOUND'
    | 'UNKNOWN';
  message: string;
};

const codeMap: Record<number, NewsletterApiError['code']> = {
  400: 'INVALID_TAGS',
  404: 'NOT_FOUND',
  409: 'ALREADY_SUBSCRIBED',
  429: 'RATE_LIMITED',
};

function throwApiError(status: number, body: { message?: string }): never {
  throw {
    status,
    code: codeMap[status] ?? 'UNKNOWN',
    message: body.message ?? 'An unexpected error occurred.',
  } as NewsletterApiError;
}

export const addToWaitlist = async (data: AddToWaitlistRequest) => {
  const res = await fetch('/api/waitlist/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to subscribe to waitlist');
  }

  return res.json();
};

export const newsletterSubscribe = async (data: NewsletterSubscribeRequest) => {
  const res = await fetch('/api/newsletter/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throwApiError(res.status, body);
  return body as { message: string; id: string };
};

export const newsletterUnsubscribe = async (
  data: NewsletterUnsubscribeRequest
) => {
  const res = await fetch('/api/newsletter/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throwApiError(res.status, body);
  return body as { message: string };
};

export const newsletterUpdatePreferences = async (
  data: NewsletterPreferencesRequest
) => {
  const invalid = data.tags.filter(t => !NEWSLETTER_TAGS.includes(t));
  if (invalid.length > 0) {
    throw {
      status: 400,
      code: 'INVALID_TAGS',
      message: `Invalid tags: ${invalid.join(', ')}. Allowed: ${NEWSLETTER_TAGS.join(', ')}.`,
    } as NewsletterApiError;
  }

  const res = await fetch('/api/newsletter/preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throwApiError(res.status, body);
  return body as { message: string };
};
