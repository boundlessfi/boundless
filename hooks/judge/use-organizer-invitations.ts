'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  cancelJudgeInvitation,
  inviteJudge,
  listJudgeInvitations,
  resendJudgeInvitation,
  type InviteJudgePayload,
  type JudgeInvitationStatus,
} from '@/lib/api/judge';
import { extractApiErrorMessage } from '@/lib/api/api';

export const orgJudgeKeys = {
  all: ['org-judge'] as const,
  invitations: (
    orgId: string,
    hackathonId: string,
    status?: JudgeInvitationStatus
  ) =>
    [
      ...orgJudgeKeys.all,
      'invitations',
      orgId,
      hackathonId,
      status ?? 'all',
    ] as const,
};

export function useOrgJudgeInvitations(
  organizationId: string | null | undefined,
  hackathonId: string | null | undefined,
  status?: JudgeInvitationStatus
) {
  return useQuery({
    queryKey: orgJudgeKeys.invitations(
      organizationId ?? '',
      hackathonId ?? '',
      status
    ),
    queryFn: async () => {
      const res = await listJudgeInvitations(
        organizationId as string,
        hackathonId as string,
        status
      );
      if (!res.success) throw new Error(res.message);
      return res.data ?? [];
    },
    enabled: !!organizationId && !!hackathonId,
    // Organizers actively monitor the panel — refresh every minute so
    // accepted/declined invitations surface without a manual reload.
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });
}

export function useInviteJudge(organizationId: string, hackathonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: InviteJudgePayload) => {
      const res = await inviteJudge(organizationId, hackathonId, payload);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Invitation sent');
      qc.invalidateQueries({ queryKey: orgJudgeKeys.all });
    },
    onError: err => {
      toast.error(extractApiErrorMessage(err, 'Could not send invitation'));
    },
  });
}

export function useResendInvitation(
  organizationId: string,
  hackathonId: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await resendJudgeInvitation(
        organizationId,
        hackathonId,
        invitationId
      );
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Invitation resent with a fresh link');
      qc.invalidateQueries({ queryKey: orgJudgeKeys.all });
    },
    onError: err => {
      toast.error(extractApiErrorMessage(err, 'Could not resend invitation'));
    },
  });
}

export function useCancelInvitation(
  organizationId: string,
  hackathonId: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await cancelJudgeInvitation(
        organizationId,
        hackathonId,
        invitationId
      );
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Invitation cancelled');
      qc.invalidateQueries({ queryKey: orgJudgeKeys.all });
    },
    onError: err => {
      toast.error(extractApiErrorMessage(err, 'Could not cancel invitation'));
    },
  });
}
