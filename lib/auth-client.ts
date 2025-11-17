import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';

// Get base URL for Better Auth
// Use proxy route on client-side to avoid CORS issues
// On server-side, use direct backend URL
const getAuthBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use proxy route (same origin, no CORS)
    // Better Auth requires absolute URL, so construct it from window.location
    const origin = window.location.origin;
    return `${origin}/api/proxy/auth`;
  }

  // Server-side: use direct backend URL
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.boundlessfi.xyz';
  const baseURL = apiUrl.replace(/\/$/, '');

  // If baseURL already ends with /api, add /auth
  // Otherwise, add /api/auth
  return baseURL.endsWith('/api') ? `${baseURL}/auth` : `${baseURL}/api/auth`;
};

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  plugins: [
    emailOTPClient(), // Required for OTP email verification
  ],
});
