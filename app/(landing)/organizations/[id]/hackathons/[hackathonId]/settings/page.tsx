'use client';

import { useParams } from 'next/navigation';

export default function SettingsPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const hackathonId = params.hackathonId as string;

  return (
    <div className='min-h-screen bg-black p-8 text-white'>
      <h1 className='mb-4 text-2xl font-bold'>Hackathon Settings</h1>
      <p className='text-gray-400'>Organization ID: {organizationId}</p>
      <p className='text-gray-400'>Hackathon ID: {hackathonId}</p>
    </div>
  );
}
