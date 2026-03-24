import { api } from '@/lib/api/api';

interface BackendWrapped<T> {
  success?: boolean;
  data: T;
}

const unwrap = <T>(body: T | BackendWrapped<T>): T => {
  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    body.data !== undefined
  ) {
    return (body as BackendWrapped<T>).data;
  }
  return body as T;
};

export interface OnboardingPayload {
  roles: string[];
  skills?: string[];
  smartWalletAddress?: string;
  smartWalletCredentialId?: string;
}

export interface OnboardingStatus {
  completed: boolean;
  roles: string[];
}

export async function completeOnboarding(
  payload: OnboardingPayload
): Promise<{ success: boolean }> {
  const { data } = await api.post<
    { success: boolean } | BackendWrapped<{ success: boolean }>
  >('users/profile/onboarding', payload);
  return unwrap(data);
}

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  const { data } = await api.get<
    OnboardingStatus | BackendWrapped<OnboardingStatus>
  >('users/profile/onboarding/status');
  return unwrap(data);
}

export async function getPlatformRoles(): Promise<{ roles: string[] }> {
  const { data } = await api.get<
    { roles: string[] } | BackendWrapped<{ roles: string[] }>
  >('users/profile/roles');
  return unwrap(data);
}

export async function updatePlatformRoles(
  roles: string[]
): Promise<{ success: boolean; roles: string[] }> {
  const { data } = await api.put<
    | { success: boolean; roles: string[] }
    | BackendWrapped<{ success: boolean; roles: string[] }>
  >('users/profile/roles', { roles });
  return unwrap(data);
}
