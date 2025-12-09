import { authClient } from './auth-client';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export const checkAuth = async () => {
  const { data } = await authClient.getSession();
  if (!data) {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const protocol = headersList.get('x-forwarded-proto') || 'http';

    // Try to get pathname from various headers
    let pathname = '/';
    const referer = headersList.get('referer');
    const xPathname = headersList.get('x-pathname');

    if (xPathname) {
      pathname = xPathname;
    } else if (referer) {
      try {
        const url = new URL(referer);
        pathname = url.pathname;
      } catch {
        pathname = '/';
      }
    }

    const currentUrl = `${protocol}://${host}${pathname}`;
    const redirectUrl = `/auth?mode=signin&callbackUrl=${encodeURIComponent(currentUrl)}`;
    redirect(redirectUrl);
  }
  return data;
};
