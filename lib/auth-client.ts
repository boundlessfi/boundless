'use client';
import { createAuthClient } from 'better-auth/react';
import {
  emailOTPClient,
  inferAdditionalFields,
  lastLoginMethodClient,
  oneTapClient,
  organizationClient,
  twoFactorClient,
  usernameClient,
} from 'better-auth/client/plugins';
import { nextCookiesRequest } from './next-cookies-request';

const getAuthBaseURL = () => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.boundlessfi.xyz';
  const baseURL = apiUrl.replace(/\/$/, '').replace(/\/api$/i, '');
  return `${baseURL}/api/auth`;
};

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  cookiePrefix: 'boundless_auth',
  plugins: [
    nextCookiesRequest,
    inferAdditionalFields({
      user: {
        profile: { type: 'json', required: false },
        organizations: { type: 'json', required: false },
        stats: { type: 'json', required: false },
        following: { type: 'json', required: false },
        followers: { type: 'json', required: false },
        projects: { type: 'json', required: false },
        activities: { type: 'json', required: false },
        _id: { type: 'string', required: false },
        isVerified: { type: 'boolean', required: false },
        contributedProjects: { type: 'json', required: false },
        createdAt: { type: 'date', required: false },
        updatedAt: { type: 'date', required: false },
        __v: { type: 'number', required: false },
        lastLogin: { type: 'string', required: false },
        isProfileComplete: { type: 'boolean', required: false },
        missingProfileFields: { type: 'string[]', required: false },
        profileCompletionPercentage: { type: 'number', required: false },
        roles: { type: 'json', required: true },
        wallet: {
          type: 'json',
          required: false,
          defaultValue: {
            address: '',
            balances: [],
            transactions: [],
          },
        },
      },
    }),
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
    usernameClient(),
    organizationClient(),
    twoFactorClient(),
  ],
});
