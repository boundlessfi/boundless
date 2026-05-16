'use client';

import { TabsContent } from '@/components/ui/tabs';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import { MainStageHeader } from './winners/MainStageHeader';
import { TopWinnerCard } from './winners/TopWinnerCard';
import { PodiumWinnerCard } from './winners/PodiumWinnerCard';
import { GeneralWinnerCard } from './winners/GeneralWinnerCard';
import { Trophy, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Winners = () => {
  const { currentHackathon, winners, trackWinners, submissions } =
    useHackathonData();

  const hasOverall = winners && winners.length > 0;
  const hasTracks = trackWinners && trackWinners.length > 0;

  if (!hasOverall && !hasTracks) {
    return (
      <TabsContent value='winners' className='mt-0 w-full outline-none'>
        <div className='mt-8 rounded-3xl border border-white/5 bg-[#0A0A0A] py-24 text-center'>
          <Trophy className='mx-auto mb-4 h-12 w-12 text-white/10' />
          <h3 className='text-2xl font-bold tracking-tight text-white/90'>
            Winners Coming Soon
          </h3>
          <p className='mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/40'>
            The judging phase is still in progress. Check back soon for the
            results.
          </p>
        </div>
      </TabsContent>
    );
  }

  // Sort winners by rank
  const sortedWinners = [...winners].sort((a, b) => a.rank - b.rank);

  const rank1 = sortedWinners.find(w => w.rank === 1);
  const podium = sortedWinners.filter(w => w.rank === 2 || w.rank === 3);
  const others = sortedWinners.filter(w => w.rank > 3);

  // Helper to find submission for a winner
  const getSubmission = (submissionId: string) => {
    return submissions.find(s => s._id === submissionId);
  };

  return (
    <TabsContent
      value='winners'
      className='animate-in fade-in mt-0 w-full duration-500 outline-none'
    >
      <div className='py-8'>
        <MainStageHeader />

        <div className='flex flex-col gap-6 lg:gap-8'>
          {rank1 && (
            <TopWinnerCard
              winner={rank1}
              submission={getSubmission(rank1.submissionId)}
            />
          )}

          {podium.length > 0 && (
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8'>
              {podium.map(winner => (
                <PodiumWinnerCard
                  key={winner.submissionId}
                  winner={winner}
                  submission={getSubmission(winner.submissionId)}
                />
              ))}
            </div>
          )}

          {others.length > 0 && (
            <div className='mt-8'>
              <div className='mb-6 flex items-center gap-3'>
                <div className='h-px flex-1 bg-white/5' />
                <span className='text-[10px] font-bold tracking-widest text-white/30 uppercase'>
                  Honorable Mentions
                </span>
                <div className='h-px flex-1 bg-white/5' />
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {others.map(winner => (
                  <GeneralWinnerCard
                    key={winner.submissionId}
                    winner={winner}
                    submission={getSubmission(winner.submissionId)}
                  />
                ))}
              </div>
            </div>
          )}

          {hasTracks && (
            <div className='mt-8'>
              <div className='mb-6 flex items-center gap-3'>
                <div className='h-px flex-1 bg-white/5' />
                <span className='flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-white/30 uppercase'>
                  <Layers className='h-3 w-3' />
                  Track Prizes
                </span>
                <div className='h-px flex-1 bg-white/5' />
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {trackWinners!.map(tw => {
                  // Adapt the track-winner shape to the GeneralWinnerCard
                  // contract: it expects a `winner` with rank + projectName +
                  // logo + participants + prize + submissionId. We feed
                  // wonRank as the rank so the card renders sanely; the
                  // surrounding Badge labels which track this is for.
                  const adapted = {
                    rank: tw.wonRank,
                    projectName: tw.projectName,
                    logo: tw.logo ?? '',
                    teamName: tw.teamName,
                    participants: tw.participants,
                    prize: tw.prize,
                    submissionId: tw.submissionId,
                  };
                  return (
                    <div
                      key={`${tw.submissionId}-${tw.track.id}`}
                      className='space-y-2'
                    >
                      <Badge
                        variant='outline'
                        className='border-primary/40 text-primary'
                      >
                        {tw.track.name}
                      </Badge>
                      <GeneralWinnerCard
                        winner={adapted}
                        submission={getSubmission(tw.submissionId)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  );
};

export default Winners;
