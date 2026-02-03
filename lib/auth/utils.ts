import { User } from '@/lib/api/types';

/**
 * Safely extracts role from user data, defaulting to 'USER'
 */
export function safeRole(val: unknown): 'USER' | 'ADMIN' {
  return val === 'ADMIN' || val === 'super_admin' ? 'ADMIN' : 'USER';
}

/**
 * Safely extracts ID from user data with fallback
 */
export function getId(val1: unknown, val2: unknown): string {
  if (typeof val1 === 'string') return val1;
  if (typeof val2 === 'string') return val2;
  return 'unknown';
}

/**
 * Safely extracts string value with fallback
 */
export function safeString(value: unknown, fallback: string = ''): string {
  return typeof value === 'string' ? value : fallback;
}

/**
 * Safely extracts string value or null
 */
export function safeStringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

/**
 * Extracts and normalizes user information from API response
 * @param user - User object from API
 * @returns Normalized user information
 */
export function extractUserInfo(user: User) {
  // Extract role with proper fallback logic
  let role: 'USER' | 'ADMIN' = 'USER';
  if (typeof user.role === 'string') {
    role = safeRole(user.role);
  }

  // Extract profile information with proper type checking
  const profile =
    user.profile && typeof user.profile === 'object' ? user.profile : {};

  const firstName = safeStringOrNull(
    (profile as Record<string, unknown>).firstName || user.name?.split(' ')[0]
  );

  const lastName = safeStringOrNull(
    (profile as Record<string, unknown>).lastName ||
      user.name?.split(' ').slice(1).join(' ')
  );

  const image = safeStringOrNull(
    (profile as Record<string, unknown>).avatar || user.image
  );

  const username = safeStringOrNull(
    (profile as Record<string, unknown>).username || user.username
  );

  return {
    id: getId(user.id, user.id),
    email: safeString(user.email),
    firstName,
    lastName,
    image,
    role,
    username,
    profile: {
      firstName,
      lastName,
      avatar: image,
      username,
    },
  };
}

/**
 * Validates required environment variables for auth
 */
export function validateAuthEnv() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (clientId === '' || clientSecret === '') {
    throw new Error(
      `Missing required environment variables: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET`
    );
  }
}
