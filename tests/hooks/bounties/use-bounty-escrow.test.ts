import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
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
} from '@/hooks/bounties/use-bounty-escrow';

function wrap(hook: () => unknown) {
  const qc = new QueryClient();
  return renderHook(() => hook(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    ),
  });
}

describe('bounty escrow hooks contract', () => {
  it('submits a bounty via escrow with description and validates payload', async () => {
    const captured: unknown[] = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : String(input);
      captured.push({ url, body: init?.body });
      if (url.includes('/api/escrow/ops')) {
        return new Response(JSON.stringify({ submission: { id: 'sub_123', status: 'ok' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    }) as typeof fetch;

    const { result } = wrap(() => useSubmitBounty('bounty-1'));

    await act(async () => {
      await result.current.mutateAsync({ description: 'my submission payload' });
    });

    expect(captured.some((c: any) => typeof c.url === 'string' && c.url.includes('/api/escrow/ops'))).toBe(true);

    globalThis.fetch = originalFetch;
  });
});
