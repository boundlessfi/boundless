import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import {
  useBountiesList,
  useBounty,
  useMyBountyApplications,
  useApplyToBounty,
  useJoinCompetition,
  useEditApplication,
  useWithdrawApplication,
  useSubmitBounty,
  useWithdrawSubmission,
  useMyBountyActivity,
} from '@/features/bounties/hooks/use-bounty-escrow';

function wrap(hook: () => unknown) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderHook(() => hook(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    ),
  });
}

describe('use-bounty-escrow', () => {
  it('useBountiesList fetches bounties', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ bounties: [{ id: 'b1', title: 'T', description: '', reward: '1', status: 'open', createdAt: '2026-01-01T00:00:00Z' }], pagination: { total: 1 } }),
      } as Response),
    );

    const { result } = wrap(() => useBountiesList());
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data?.bounties).toHaveLength(1);
  });

  it('useSubmitBounty forwards payload to escrow op', async () => {
    const captured: Array<{ url?: string; body?: BodyInit | null }> = [];
    global.fetch = vi.fn((url: string, init?: RequestInit) => {
      captured.push({ url, body: init?.body });
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ submission: { id: 'sub_1', status: 'ok' } }),
      } as Response);
    });

    const { result } = wrap(() => useSubmitBounty('bounty-1'));

    await act(async () => {
      await result.current.mutateAsync({ description: 'my submission payload' });
    });

    expect(
      captured.some(
        (c): c is { url: string; body?: BodyInit | null } =>
          typeof c.url === 'string' &&
          c.url.includes('/api/escrow/ops') &&
          typeof c.body === 'string' &&
          c.body.includes('bounty-1') &&
          c.body.includes('my submission payload'),
      ),
    ).toBe(true);
  });
});
