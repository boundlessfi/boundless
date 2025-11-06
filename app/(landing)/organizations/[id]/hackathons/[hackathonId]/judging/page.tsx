'use client';

import MetricsCard from '@/components/organization/cards/MetricsCard';
import JudgingParticipant from '@/components/organization/cards/JudgingParticipant';
import { useParams } from 'next/navigation';

export default function JudgingPage() {
  const params = useParams();
  void params.id;
  void params.hackathonId;

  return (
    <div className='bg-background min-h-screen space-y-4 p-8 text-white'>
      <div className='flex gap-4'>
        <MetricsCard />
        <MetricsCard />
      </div>
      <div className='flex flex-col gap-4'>
        <JudgingParticipant isSubmitted={true} />
        <JudgingParticipant isSubmitted={true} />
        <JudgingParticipant isSubmitted={true} />
        <JudgingParticipant isSubmitted={true} />
      </div>
    </div>
  );
}
