'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useHackathon } from '@/hooks/hackathon/use-hackathon-queries';
import { TabsContent } from '@/components/ui/tabs';
import { HackathonDiscussions } from '@/components/hackathons/discussion/comment';

const HackathonDiscussionsTab = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: hackathon } = useHackathon(slug);

  if (!hackathon) return null;

  return (
    <TabsContent value='discussions' className='mt-0 w-full outline-none'>
      <div className='mb-10'>
        <h2 className='text-2xl font-bold text-white'>Discussions</h2>
        <p className='mt-1 text-gray-400'>
          Join the conversation, ask questions, and share updates.
        </p>
      </div>
      <HackathonDiscussions
        hackathonId={hackathon.id}
        isRegistered={hackathon.isParticipant}
      />
    </TabsContent>
  );
};

export default HackathonDiscussionsTab;
