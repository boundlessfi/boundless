import { createAuthClient } from 'better-auth/react';
import {
  emailOTPClient,
  lastLoginMethodClient,
  oneTapClient,
  organizationClient,
} from 'better-auth/client/plugins';

const getAuthBaseURL = () => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.boundlessfi.xyz';
  const baseURL = apiUrl.replace(/\/$/, '').replace(/\/api$/i, '');
  return `${baseURL}/api/auth`;
};

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  plugins: [
    emailOTPClient(),
    lastLoginMethodClient(),
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      autoSelect: false,
      cancelOnTapOutside: true,
      context: 'signin',
      additionalOptions: {},
      promptOptions: {
        baseDelay: 1000,
        maxAttempts: 5,
      },
    }),
    organizationClient(),
  ],
});
