'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  acceptJudgeInvitation,
  declineJudgeInvitation,
  getJudgeCriteria,
  getJudgeHackathon,
  getJudgeHackathons,
  getJudgeInvitations,
  getJudgeQueueNeighbors,
  getJudgeResults,
  getJudgeSubmission,
  getJudgeSubmissions,
  previewJudgeInvitation,
  submitJudgeScore,
  type SubmitJudgeScoreRequest,
} from '@/lib/api/judge';
import { extractApiErrorMessage } from '@/lib/api/api';

export const judgeKeys = {
  all: ['judge'] as const,
  hackathons: () => [...judgeKeys.all, 'hackathons'] as const,
  hackathon: (id: string) => [...judgeKeys.all, 'hackathon', id] as const,
  criteria: (id: string) => [...judgeKeys.all, 'criteria', id] as const,
  submissions: (id: string, params?: Record<string, unknown>) =>
    [...judgeKeys.all, 'submissions', id, params ?? {}] as const,
  submission: (hackathonId: string, submissionId: string) =>
    [...judgeKeys.all, 'submission', hackathonId, submissionId] as const,
  neighbors: (hackathonId: string, submissionId: string) =>
    [...judgeKeys.all, 'neighbors', hackathonId, submissionId] as const,
  results: (hackathonId: string) =>
    [...judgeKeys.all, 'results', hackathonId] as const,
  invitations: () => [...judgeKeys.all, 'invitations'] as const,
  invitation: (token: string) =>
    [...judgeKeys.all, 'invitation', token] as const,
};

export function useJudgeHackathons() {
  return useQuery({
    queryKey: judgeKeys.hackathons(),
    queryFn: async () => {
      const res = await getJudgeHackathons();
      if (!res.success) throw new Error(res.message);
      return res.data ?? [];
    },
  });
}

export function useJudgeHackathon(hackathonId: string | null | undefined) {
  return useQuery({
    queryKey: judgeKeys.hackathon(hackathonId ?? ''),
    queryFn: async () => {
      const res = await getJudgeHackathon(hackathonId as string);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: !!hackathonId,
  });
}

export function useJudgeCriteria(hackathonId: string | null | undefined) {
  return useQuery({
    queryKey: judgeKeys.criteria(hackathonId ?? ''),
    queryFn: async () => {
      const res = await getJudgeCriteria(hackathonId as string);
      if (!res.success) throw new Error(res.message);
      return res.data ?? [];
    },
    enabled: !!hackathonId,
  });
}

export function useJudgeSubmissions(
  hackathonId: string | null | undefined,
  params: { page?: number; limit?: number; search?: string } = {}
) {
  return useQuery({
    queryKey: judgeKeys.submissions(hackathonId ?? '', params),
    queryFn: async () => {
      const res = await getJudgeSubmissions(hackathonId as string, params);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: !!hackathonId,
  });
}

export function useJudgeResults(hackathonId: string | null | undefined) {
  return useQuery({
    queryKey: judgeKeys.results(hackathonId ?? ''),
    queryFn: async () => {
      const res = await getJudgeResults(hackathonId as string);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: !!hackathonId,
  });
}

export function useJudgeSubmission(
  hackathonId: string | null | undefined,
  submissionId: string | null | undefined
) {
  return useQuery({
    queryKey: judgeKeys.submission(hackathonId ?? '', submissionId ?? ''),
    queryFn: async () => {
      const res = await getJudgeSubmission(
        hackathonId as string,
        submissionId as string
      );
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: !!hackathonId && !!submissionId,
  });
}

export function useJudgeQueueNeighbors(
  hackathonId: string | null | undefined,
  submissionId: string | null | undefined
) {
  return useQuery({
    queryKey: judgeKeys.neighbors(hackathonId ?? '', submissionId ?? ''),
    queryFn: async () => {
      const res = await getJudgeQueueNeighbors(
        hackathonId as string,
        submissionId as string
      );
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: !!hackathonId && !!submissionId,
  });
}

export function useSubmitJudgeScore(hackathonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      submissionId: string;
      payload: SubmitJudgeScoreRequest;
    }) => {
      const res = await submitJudgeScore(
        hackathonId,
        args.submissionId,
        args.payload
      );
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (_data, args) => {
      toast.success('Score submitted');
      qc.invalidateQueries({ queryKey: judgeKeys.hackathon(hackathonId) });
      qc.invalidateQueries({
        queryKey: judgeKeys.submissions(hackathonId),
        exact: false,
      });
      qc.invalidateQueries({
        queryKey: judgeKeys.submission(hackathonId, args.submissionId),
      });
      qc.invalidateQueries({
        queryKey: judgeKeys.neighbors(hackathonId, args.submissionId),
      });
    },
    onError: err => {
      toast.error(extractApiErrorMessage(err, 'Failed to submit score'));
    },
  });
}

export function useMyJudgeInvitations() {
  return useQuery({
    queryKey: judgeKeys.invitations(),
    queryFn: async () => {
      const res = await getJudgeInvitations();
      if (!res.success) throw new Error(res.message);
      return res.data ?? [];
    },
  });
}

/**
 * Public preview — works when logged out, so the invitee can see
 * what they're being invited to before signing in.
 */
export function useJudgeInvitationPreview(token: string | undefined) {
  return useQuery({
    queryKey: judgeKeys.invitation(token ?? ''),
    queryFn: async () => {
      const res = await previewJudgeInvitation(token as string);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: !!token,
    retry: false,
  });
}

export function useAcceptJudgeInvitation(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { displayName?: string } = {}) => {
      const res = await acceptJudgeInvitation(token, payload);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Invitation accepted — you’re on the panel.');
      qc.invalidateQueries({ queryKey: judgeKeys.all });
    },
    onError: err => {
      toast.error(extractApiErrorMessage(err, 'Could not accept invitation'));
    },
  });
}

export function useDeclineJudgeInvitation(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await declineJudgeInvitation(token);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Invitation declined.');
      qc.invalidateQueries({ queryKey: judgeKeys.invitations() });
      qc.invalidateQueries({ queryKey: judgeKeys.invitation(token) });
    },
    onError: err => {
      toast.error(extractApiErrorMessage(err, 'Could not decline invitation'));
    },
  });
}
