import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getMe } from '@/lib/api/auth';
import { authClient } from '@/lib/auth-client';

export interface ServerUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: 'USER' | 'ADMIN';
  isVerified?: boolean;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

/**
 * Get Better Auth session using authClient.getSession()
 * Can be used in middleware by passing cookieHeader directly
 */
export async function getBetterAuthSession(
  cookieHeader?: string
): Promise<{ user?: ServerUser } | null> {
  try {
    // Get cookies from headers if not provided (for server components)
    // In middleware, cookieHeader should always be provided
    let cookiesToSend = cookieHeader;
    if (!cookiesToSend && typeof window === 'undefined') {
      try {
        const headersList = await headers();
        cookiesToSend = headersList.get('cookie') || '';
      } catch {
        // If headers() fails (e.g., in middleware), use empty string
        cookiesToSend = '';
      }
    }

    // Use Better Auth client's getSession() method with headers
    const { data: session, error } = await authClient.getSession({
      fetchOptions: {
        headers: cookiesToSend
          ? {
              Cookie: cookiesToSend,
            }
          : undefined,
        credentials: 'include',
        cache: 'no-store',
      },
    });

    if (error) {
      return null;
    }

    // Better Auth returns { user, session } object
    const user = session?.user;

    if (user) {
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name || null,
          image: user.image || null,
          role:
            ((user as { role?: string }).role as 'USER' | 'ADMIN') || 'USER',
          isVerified: user.emailVerified || false,
          profile: {
            firstName: user.name?.split(' ')[0] || undefined,
            lastName: user.name?.split(' ').slice(1).join(' ') || undefined,
            avatar: user.image || undefined,
          },
        },
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function getServerUser(): Promise<ServerUser | null> {
  try {
    // First try to get Better Auth session
    const betterAuthSession = await getBetterAuthSession();
    if (betterAuthSession?.user) {
      return betterAuthSession.user;
    }

    // Fallback to accessToken approach (for backward compatibility)
    // Better Auth handles authentication via cookies automatically
    // No need to check for accessToken - cookies are sent automatically
    const user = await getMe();

    return {
      id: (user._id || user.id) as string,
      email: user.email as string,
      name: (user.profile?.firstName || user.name) as string | null,
      image: (user.profile?.avatar || user.image) as string | null,
      role: user.roles?.[0] === 'ADMIN' ? 'ADMIN' : 'USER',
      isVerified: user.isVerified,
      profile: user.profile,
    };
  } catch {
    // Silently handle auth errors
    return null;
  }
}

export async function requireServerAuth(): Promise<ServerUser> {
  const user = await getServerUser();

  if (!user) {
    redirect('/auth?mode=signin');
  }

  return user;
}

export async function getServerAuthHeaders(): Promise<Record<string, string>> {
  const headersList = await headers();
  const cookieHeader = headersList.get('cookie') || '';

  // Better Auth handles auth via cookies automatically
  // Just forward the cookie header
  const authHeaders: Record<string, string> = {};

  if (cookieHeader) {
    authHeaders.Cookie = cookieHeader;
  }

  return authHeaders;
}

export async function isServerAuthenticated(): Promise<boolean> {
  const user = await getServerUser();
  return !!user;
}

// Utility for protected server components
export async function withServerAuth<T extends unknown[]>(
  fn: (user: ServerUser, ...args: T) => Promise<React.ReactNode>,
  ...args: T
): Promise<React.ReactNode> {
  const user = await requireServerAuth();
  return fn(user, ...args);
}
