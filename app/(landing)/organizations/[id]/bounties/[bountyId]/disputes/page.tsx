import { DisputeList } from '@/features/bounties/components/dispute/dispute-list';
import { useParams } from 'next/navigation';

export default function DisputesPage() {
  const { id: orgId, bountyId } = useParams<{ id: string; bountyId: string }>();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Disputes</h1>
      <DisputeList orgId={orgId} bountyId={bountyId} />
    </div>
  );
}
