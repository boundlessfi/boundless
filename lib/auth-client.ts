import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';

// Get base URL for Better Auth
// Better Auth endpoints are at /api/auth, so we need to construct the baseURL correctly
const getAuthBaseURL = () => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'https://api.boundlessfi.xyz';
  // Remove trailing slash
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
