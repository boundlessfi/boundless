import { authClient } from './auth-client';
import { redirect } from 'next/navigation';

export const checkAuth = async () => {
  const session = await authClient.getSession();
  if (!session) {
    redirect('/auth?mode=signin');
  }
  return session;
};
