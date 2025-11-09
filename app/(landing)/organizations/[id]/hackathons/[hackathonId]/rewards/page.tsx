'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Megaphone } from 'lucide-react';
import PodiumSection from '@/components/organization/hackathons/rewards/PodiumSection';
import SubmissionsList from '@/components/organization/hackathons/rewards/SubmissionsList';
import AnnounceWinnersModal from '@/components/organization/hackathons/rewards/AnnounceWinnersModal';
import WinnersPreviewPage from '@/components/organization/hackathons/rewards/WinnersPreviewPage';
import { Submission } from '@/components/organization/hackathons/rewards/types';
import { BoundlessButton } from '@/components/buttons';
import { api } from '@/lib/api/api';
import { toast } from 'sonner';

export default function RewardsPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const hackathonId = params.hackathonId as string;

  // Mock data - replace with API call
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: '1',
      name: 'Team Alpha',
      projectName: 'Binance',
      avatar: 'https://github.com/shadcn.png',
      score: 21,
      maxScore: 25,
      rank: 1,
      submissionTitle: 'Blockchain Health Platform',
    },
    {
      id: '2',
      name: 'Collins Odumeje',
      projectName: 'Bitmed',
      avatar: 'https://github.com/shadcn.png',
      score: 21,
      maxScore: 25,
      rank: 2,
      submissionTitle: 'DeFi Trading Bot',
    },
    {
      id: '3',
      name: 'Team Beta',
      projectName: 'Figma',
      avatar: 'https://github.com/shadcn.png',
      score: 15,
      maxScore: 25,
      rank: 3,
      submissionTitle: 'Design System Platform',
    },
    {
      id: '4',
      name: 'John Doe',
      projectName: 'Project X',
      avatar: 'https://github.com/shadcn.png',
      score: 18,
      maxScore: 25,
      submissionTitle: 'AI Assistant Tool',
    },
    {
      id: '5',
      name: 'Jane Smith',
      projectName: 'Project Y',
      avatar: 'https://github.com/shadcn.png',
      score: 17,
      maxScore: 25,
      submissionTitle: 'Blockchain Wallet',
    },
    {
      id: '6',
      name: 'Alice Johnson',
      projectName: 'Project Z',
      avatar: 'https://github.com/shadcn.png',
      score: 16,
      maxScore: 25,
      submissionTitle: 'NFT Marketplace',
    },
    {
      id: '7',
      name: 'Bob Williams',
      projectName: 'Project A',
      avatar: 'https://github.com/shadcn.png',
      score: 15,
      maxScore: 25,
      submissionTitle: 'DeFi Protocol',
    },
    {
      id: '8',
      name: 'Charlie Brown',
      projectName: 'Project B',
      avatar: 'https://github.com/shadcn.png',
      score: 14,
      maxScore: 25,
      submissionTitle: 'Web3 Social Network',
    },
    {
      id: '9',
      name: 'Diana Prince',
      projectName: 'Project C',
      avatar: 'https://github.com/shadcn.png',
      score: 11,
      maxScore: 25,
      submissionTitle: 'Crypto Exchange',
    },
  ]);

  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Mock prize tiers - replace with API call
  // This should come from the hackathon's reward configuration
  const prizeTiers = [
    { rank: 1, prizeAmount: '10000', currency: 'USDC' },
    { rank: 2, prizeAmount: '5000', currency: 'USDC' },
    { rank: 3, prizeAmount: '8000', currency: 'USDC' },
  ];

  // Fetch submissions from API
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await api.get<Submission[]>(
          `/organizations/${organizationId}/hackathons/${hackathonId}/submissions`
        );
        if (response.data) {
          setSubmissions(response.data);
        }
      } catch {
        toast.error('Failed to load submissions');
        // Keep mock data as fallback
      }
    };

    if (organizationId && hackathonId) {
      fetchSubmissions();
    }
  }, [organizationId, hackathonId]);

  const maxRank = prizeTiers.length;
  const winners = submissions.filter(s => s.rank && s.rank <= maxRank);
  const hasWinners = winners.length > 0;

  const handleRankChange = (submissionId: string, newRank: number | null) => {
    setSubmissions(prev =>
      prev.map(sub => {
        if (sub.id === submissionId) {
          return { ...sub, rank: newRank || undefined };
        }
        // Remove rank from other submission if assigning to a winner rank
        if (
          newRank &&
          newRank <= maxRank &&
          sub.rank === newRank &&
          sub.id !== submissionId
        ) {
          return { ...sub, rank: undefined };
        }
        return sub;
      })
    );
  };

  const handleAnnounceContinue = (announcementText: string) => {
    setAnnouncement(announcementText);
    setShowPreview(true);
  };

  const handlePublish = async () => {
    try {
      await api.post(
        `/organizations/${organizationId}/hackathons/${hackathonId}/winners/announce`,
        {
          winners: winners.map(w => ({ submissionId: w.id, rank: w.rank })),
          announcement,
        }
      );
      toast.success('Winners announced successfully!');
      setShowPreview(false);
    } catch {
      toast.error('Failed to announce winners');
    }
  };

  if (showPreview) {
    return (
      <WinnersPreviewPage
        submissions={submissions}
        announcement={announcement}
        prizeTiers={prizeTiers}
        onBack={() => setShowPreview(false)}
        onEdit={() => {
          setShowPreview(false);
          setIsAnnounceModalOpen(true);
        }}
        onPublish={handlePublish}
      />
    );
  }

  return (
    <div className='bg-background min-h-screen p-4 text-white sm:p-6 md:p-8'>
      {hasWinners && (
        <div className='mb-6 flex justify-end'>
          <BoundlessButton
            variant='default'
            size='lg'
            onClick={() => setIsAnnounceModalOpen(true)}
            className='gap-2'
          >
            <Megaphone className='h-4 w-4' />
            Announce Winners
          </BoundlessButton>
        </div>
      )}

      <PodiumSection submissions={submissions} maxRank={maxRank} />
      <SubmissionsList
        submissions={submissions}
        onRankChange={handleRankChange}
        maxRank={maxRank}
      />

      <AnnounceWinnersModal
        open={isAnnounceModalOpen}
        onOpenChange={setIsAnnounceModalOpen}
        onContinue={handleAnnounceContinue}
        initialAnnouncement={announcement}
      />
    </div>
  );
}
