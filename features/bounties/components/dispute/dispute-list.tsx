'use client';

import { useState } from 'react';
import { useDisputes, useResolveDispute, type Dispute } from '../../api/use-disputes';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface DisputeListProps {
  orgId: string;
  bountyId: string;
}

export function DisputeList({ orgId, bountyId }: DisputeListProps) {
  const { data: disputes, isLoading, isError, error } = useDisputes(orgId, bountyId);
  const resolveMutation = useResolveDispute(orgId, bountyId);
  const [resolving, setResolving] = useState<Record<string, boolean>>({});

  const handleResolve = async (disputeId: string, resolution: 'winner' | 'refund' | 'dismiss') => {
    setResolving((prev) => ({ ...prev, [disputeId]: true }));
    try {
      await resolveMutation.mutateAsync({ disputeId, resolution });
      toast.success('Dispute resolved successfully');
    } catch (err) {
      toast.error('Failed to resolve dispute');
    } finally {
      setResolving((prev) => ({ ...prev, [disputeId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500">Error loading disputes: {error.message}</div>;
  }

  if (!disputes || disputes.length === 0) {
    return <div className="text-muted-foreground">No disputes found for this bounty.</div>;
  }

  return (
    <div className="space-y-4">
      {disputes.map((dispute) => (
        <DisputeCard
          key={dispute.id}
          dispute={dispute}
          onResolve={handleResolve}
          isResolving={resolving[dispute.id]}
        />
      ))}
    </div>
  );
}

interface DisputeCardProps {
  dispute: Dispute;
  onResolve: (disputeId: string, resolution: 'winner' | 'refund' | 'dismiss') => void;
  isResolving: boolean;
}

function DisputeCard({ dispute, onResolve, isResolving }: DisputeCardProps) {
  const statusBadge = getStatusBadge(dispute.status);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Dispute by {dispute.claimantId}</CardTitle>
            <CardDescription>{dispute.reason}</CardDescription>
          </div>
          <span className="text-sm font-medium px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
            {statusBadge}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          <strong>Evidence:</strong> {dispute.evidence || 'No evidence provided'}
        </p>
      </CardContent>
      {dispute.status === 'pending' && (
        <CardFooter className="space-x-2">
          <Button
            variant="destructive"
            size="sm"
            disabled={isResolving}
            onClick={() => onResolve(dispute.id, 'refund')}
          >
            Refund
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isResolving}
            onClick={() => onResolve(dispute.id, 'winner')}
          >
            Payout Winner
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isResolving}
            onClick={() => onResolve(dispute.id, 'dismiss')}
          >
            Dismiss
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function getStatusBadge(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'resolved':
      return 'Resolved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Unknown';
  }
}
