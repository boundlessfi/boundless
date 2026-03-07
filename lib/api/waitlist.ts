type AddToWaitlistRequest = {
  email: string;
  firstName: string;
  lastName: string;
  source?: string;
  referrer?: string;
  tags?: string[];
};

export type NewsletterTag = 'bounties' | 'hackathons' | 'grants' | 'updates';

type NewsletterSubscribeRequest = {
  email: string;
  name?: string;
  source?: string;
  tags?: NewsletterTag[];
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

export const addToWaitlist = async (data: AddToWaitlistRequest) => {
  const res = await fetch('/api/waitlist/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const codeMap: Record<number, NewsletterApiError['code']> = {
      409: 'ALREADY_SUBSCRIBED',
      429: 'RATE_LIMITED',
      400: 'INVALID_TAGS',
      404: 'NOT_FOUND',
    };
    throw {
      status: res.status,
      code: codeMap[res.status] ?? 'UNKNOWN',
      message: body.message ?? 'Error',
    } as NewsletterApiError;
  }

  return body;
};
