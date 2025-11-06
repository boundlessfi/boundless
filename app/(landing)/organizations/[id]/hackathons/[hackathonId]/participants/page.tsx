'use client';

import MetricsCard from '@/components/organization/cards/MetricsCard';
import Participant from '@/components/organization/cards/Participant';
import { useParams } from 'next/navigation';

export default function ParticipantsPage() {
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
        <Participant isSubmitted={true} />
        <Participant isSubmitted={false} />
        <Participant isSubmitted={true} />
        <Participant isSubmitted={false} />
      </div>
    </div>
  );
}
