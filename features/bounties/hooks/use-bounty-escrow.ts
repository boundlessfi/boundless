'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reportError } from '@/lib/error-reporting';

const BOUNDED_PREFIX = ['bounties'] as const;

type BountySummary = {
  id: string;
  title: string;
  description: string;
  reward: string;
  status: 'open' | 'in_progress' | 'completed';
  createdAt: string;
  claimCount?: number;
};

type BountyApplication = {
  id: string;
  bountyId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
};

type ParticipantActivityItem =
  | { kind: 'application'; data: BountyApplication }
  | { kind: 'submission'; data: { id: string; bountyId: string; status: string } };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(body || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function useBountiesList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...BOUNDED_PREFIX, 'list', params],
    queryFn: async (): Promise<{ bounties: BountySummary[]; pagination: Record<string, unknown> } => {
      const search = new URLSearchParams({ page: String(params?.page ?? 1), limit: String(params?.limit ?? 20) });
      const data = await request<{ bounties: BountySummary[]; pagination: Record<string, unknown> }>(`/api/bounties?${search}`);
      return { bounties: data.bounties ?? [], pagination: data.pagination ?? {} };
    },
    staleTime: 30_000,
  });
}

export function useBounty(id: string) {
  return useQuery({
    queryKey: [...BOUNDED_PREFIX, 'detail', id],
    queryFn: async () => {
      const data = await request<{ bounty: BountySummary }>(`/api/bounties/${encodeURIComponent(id)}`);
      return data.bounty;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useMyBountyApplications(bountyId: string) {
  return useQuery({
    queryKey: [...BOUNDED_PREFIX, 'my-applications', bountyId],
    queryFn: async () => {
      const data = await request<{ applications: BountyApplication[] }>(`/api/bounties/${encodeURIComponent(bountyId)}/applications/me`);
      return data.applications ?? [];
    },
    enabled: !!bountyId,
    staleTime: 20_000,
  });
}

export function useApplyToBounty(bountyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      const data = await request<{ application: BountyApplication }>(`/api/bounties/${encodeURIComponent(bountyId)}/applications`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      return data.application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BOUNDED_PREFIX, 'my-applications', bountyId] });
      toast.success('Application submitted');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to apply';
      reportError(err, { context: 'bounties-applyToBounty', bountyId });
      toast.error(message);
    },
  });
}

export function useJoinCompetition(bountyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload?: { teamName?: string; message?: string }) => {
      const data = await request<{ application: BountyApplication }>(`/api/bounties/${encodeURIComponent(bountyId)}/join`, {
        method: 'POST',
        body: JSON.stringify({ type: 'TEAM', ...payload }),
      });
      return data.application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BOUNDED_PREFIX, 'my-applications', bountyId] });
      toast.success('Joined bounty');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to join competition';
      reportError(err, { context: 'bounties-joinCompetition', bountyId });
      toast.error(message);
    },
  });
}

export function useEditApplication(bountyId: string, applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Pick<BountyApplication, 'message'>>) => {
      const data = await request<{ application: BountyApplication }>(`/api/bounties/${encodeURIComponent(bountyId)}/applications/${encodeURIComponent(applicationId)}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      return data.application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BOUNDED_PREFIX, 'my-applications', bountyId] });
      toast.success('Application updated');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to update application';
      reportError(err, { context: 'bounties-editApplication', bountyId, applicationId });
      toast.error(message);
    },
  });
}

export function useWithdrawApplication(bountyId: string, applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await request(`/api/bounties/${encodeURIComponent(bountyId)}/applications/${encodeURIComponent(applicationId)}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BOUNDED_PREFIX, 'my-applications', bountyId] });
      toast.success('Application withdrawn');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to withdraw application';
      reportError(err, { context: 'bounties-withdrawApplication', bountyId, applicationId });
      toast.error(message);
    },
  });
}

async function runEscrowOp<T>(expected: 'terminal' | 'any' = 'any'): Promise<T> {
  const data = await request<T>('/api/escrow/ops', {
    method: 'POST',
    body: JSON.stringify({ scope: 'participant', mode: 'MANAGED' }),
  });
  return data;
}

export function useSubmitBounty(bountyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { description: string; links?: Array<{ type?: string; url: string }> }) => {
      const description = payload?.description;
      const links = payload?.links;
      if (!description) {
        throw new Error('Description is required to submit bounty work');
      }
      const result = await runEscrowOp<{ submission: { id: string; status: string } }>();
      if (!result || !('submission' in result)) {
        throw new Error('Escrow operation did not return a submission');
      }
      return result as { submission: { id: string; status: string } };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [...BOUNDED_PREFIX, bountyId] });
      toast.success(`Submission recorded${result?.submission?.id ? ': ' + result.submission.id : ''}`);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to submit bounty work';
      reportError(err, { context: 'bounties-submitBounty', bountyId });
      toast.error(message);
    },
  });
}

export function useWithdrawSubmission(bountyId: string, submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await request(`/api/bounties/${encodeURIComponent(bountyId)}/submissions/${encodeURIComponent(submissionId)}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BOUNDED_PREFIX, bountyId] });
      toast.success('Submission withdrawn');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to withdraw submission';
      reportError(err, { context: 'bounties-withdrawSubmission', bountyId, submissionId });
      toast.error(message);
    },
  });
}

export function useMyBountyActivity(bountyId: string) {
  const applications = useMyBountyApplications(bountyId);
  return useQuery({
    queryKey: [...BOUNDED_PREFIX, 'my-activity', bountyId],
    queryFn: async (): Promise<ParticipantActivityItem[]> => {
      const apps = applications.data ?? [];
      return apps.map<ParticipantActivityItem>(application => ({ kind: 'application', data: application }));
    },
    enabled: !!bountyId && applications.isFetched,
  });
}
