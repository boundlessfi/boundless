import { authClient } from '@/lib/auth-client';

export async function requireAuthClient(redirectTo = '/auth?mode=signin') {
  const { data: session } = await authClient.getSession();

  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
    return null;
  }

  return session;
}

export async function handleProtectedAction() {
  const session = await requireAuthClient();
  if (!session) return;

  // Proceed with authenticated action
}
