/**
 * Cookie forwarding utilities for Better Auth with separate backend setup
 *
 * This module provides helpers to forward cookies from Next.js server-side requests
 * to your backend API for proper authentication handling.
 *
 * Usage in server components/actions:
 * ```typescript
 * const { data: session } = await authClient.getSession(await authCookies());
 * ```
 *
 * Backend Configuration Requirements:
 * Your backend must include your frontend in `trustedOrigins`:
 * ```typescript
 * export const auth = betterAuth({
 *   trustedOrigins: ['http://localhost:3000'] // Your frontend URL
 * });
 * ```
 *
 * OAuth Configuration:
 * Configure redirectURI to point to your backend:
 * ```typescript
 * socialProviders: {
 *   google: {
 *     redirectURI: "http://localhost:3001/api/auth/callback/google" // Backend URL
 *   }
 * }
 * ```
 *
 * When calling authClient.signIn.social, set callbackURL to your frontend URL.
 */

import { cookies } from 'next/headers';

export async function authCookies() {
  const cookie = await cookies();
  return {
    fetchOptions: {
      headers: {
        Cookie: cookie.toString(),
      },
    },
  };
}
