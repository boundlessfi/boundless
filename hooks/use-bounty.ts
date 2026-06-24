'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getBounty,
  getBountyApplications,
  getBountySubmissions,
  getBountyWinners,
  getBountyEscrow,
  type Bounty,
  type BountyApplication,
  type BountySubmission,
  type BountyWinner,
  type BountyEscrow,
} from '@/lib/api/bounties';
import { reportError } from '@/lib/error-reporting';

interface UseBountyOptions {
  organizationId: string;
  bountyId: string;
}

export function useBounty({ organizationId, bountyId }: UseBountyOptions) {
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBounty = useCallback(async () => {
    if (!organizationId || !bountyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getBounty(organizationId, bountyId);
      if (res.success && res.data) {
        setBounty(res.data);
      } else {
        setError(res.message || 'Failed to load bounty');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load bounty';
      setError(msg);
      reportError(err, { context: 'useBounty-fetch', bountyId });
    } finally {
      setLoading(false);
    }
  }, [organizationId, bountyId]);

  useEffect(() => {
    fetchBounty();
  }, [fetchBounty]);

  return { bounty, loading, error, refetch: fetchBounty };
}

// ─── Applications hook ────────────────────────────────────────────────────────

export function useBountyApplications({
  organizationId,
  bountyId,
}: UseBountyOptions) {
  const [applications, setApplications] = useState<BountyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    if (!organizationId || !bountyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getBountyApplications(organizationId, bountyId);
      if (res.success && res.data) {
        setApplications(res.data);
        setTotal(res.meta?.pagination?.total ?? res.data.length);
      } else {
        setError(res.message || 'Failed to load applications');
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to load applications';
      setError(msg);
      reportError(err, { context: 'useBountyApplications', bountyId });
    } finally {
      setLoading(false);
    }
  }, [organizationId, bountyId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { applications, setApplications, loading, error, total, refetch: fetch };
}

// ─── Submissions hook ─────────────────────────────────────────────────────────

export function useBountySubmissions({
  organizationId,
  bountyId,
}: UseBountyOptions) {
  const [submissions, setSubmissions] = useState<BountySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    if (!organizationId || !bountyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getBountySubmissions(organizationId, bountyId);
      if (res.success && res.data) {
        setSubmissions(res.data);
        setTotal(res.meta?.pagination?.total ?? res.data.length);
      } else {
        setError(res.message || 'Failed to load submissions');
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to load submissions';
      setError(msg);
      reportError(err, { context: 'useBountySubmissions', bountyId });
    } finally {
      setLoading(false);
    }
  }, [organizationId, bountyId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { submissions, setSubmissions, loading, error, total, refetch: fetch };
}

// ─── Winners + Escrow hook ────────────────────────────────────────────────────

export function useBountyPayout({ organizationId, bountyId }: UseBountyOptions) {
  const [winners, setWinners] = useState<BountyWinner[]>([]);
  const [escrow, setEscrow] = useState<BountyEscrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!organizationId || !bountyId) return;
    setLoading(true);
    setError(null);
    try {
      const [winnersRes, escrowRes] = await Promise.allSettled([
        getBountyWinners(organizationId, bountyId),
        getBountyEscrow(organizationId, bountyId),
      ]);

      if (
        winnersRes.status === 'fulfilled' &&
        winnersRes.value.success &&
        winnersRes.value.data
      ) {
        setWinners(winnersRes.value.data);
      }
      if (
        escrowRes.status === 'fulfilled' &&
        escrowRes.value.success &&
        escrowRes.value.data
      ) {
        setEscrow(escrowRes.value.data);
      }

      // Surface errors when both calls fail
      const winnersFailed = winnersRes.status === 'rejected' || (winnersRes.status === 'fulfilled' && !winnersRes.value.success);
      const escrowFailed = escrowRes.status === 'rejected' || (escrowRes.status === 'fulfilled' && !escrowRes.value.success);
      if (winnersFailed && escrowFailed) {
        setError('Failed to load payout data');
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to load payout data';
      setError(msg);
      reportError(err, { context: 'useBountyPayout', bountyId });
    } finally {
      setLoading(false);
    }
  }, [organizationId, bountyId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { winners, escrow, loading, error, refetch: fetch };
}
