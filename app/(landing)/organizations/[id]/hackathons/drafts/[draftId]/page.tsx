import React from 'react';
import NewHackathonTab from '@/components/organization/hackathons/new/NewHackathonTab';

interface DraftPageProps {
  params: Promise<{
    id: string;
    draftId: string;
  }>;
}

const DraftPage = async ({ params }: DraftPageProps) => {
  const { id, draftId } = await params;

  return (
    <div>
      <NewHackathonTab organizationId={id} draftId={draftId} />
    </div>
  );
};

export default DraftPage;
