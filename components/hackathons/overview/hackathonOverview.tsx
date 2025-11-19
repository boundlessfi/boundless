'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { HackathonTimeline } from './hackathonTimeline';
import { HackathonPrizes } from './hackathonPrizes';
import { JoinHackathonBanner } from './joinHackathon';
import { RegisterHackathonModal } from './RegisterHackathonModal';
import { useRegisterHackathon } from '@/hooks/hackathon/use-register-hackathon';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight, Users, Search } from 'lucide-react';

interface TimelineEvent {
  event: string;
  date: string;
}

interface Prize {
  title: string;
  rank: string;
  prize: string;
  details: string[];
  icon?: string;
}

interface HackathonOverviewProps {
  content: string;
  timelineEvents?: TimelineEvent[];
  prizes?: Prize[];
  className?: string;
  hackathonSlugOrId?: string;
  organizationId?: string;
}

export function HackathonOverview({
  content,
  timelineEvents,
  prizes,
  className = '',
  hackathonSlugOrId,
  organizationId,
}: HackathonOverviewProps) {
  const router = useRouter();
  const { currentHackathon } = useHackathonData();
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Get hackathon slug/ID from prop or current hackathon
  const hackathonId =
    hackathonSlugOrId || currentHackathon?.slug || currentHackathon?.id || '';
  const orgId = organizationId || undefined; // organizationId not available in currentHackathon type

  const { isRegistered, hasSubmitted, checkStatus } = useRegisterHackathon({
    hackathonSlugOrId: hackathonId,
    organizationId: orgId,
    autoCheck: !!hackathonId,
  });

  const isEnded = currentHackathon?.status === 'ended';
  const participantsCount = currentHackathon?.participants || 0;
  const prizePool = currentHackathon?.totalPrizePool || '0';

  // Check if team formation is available
  const isTeamHackathon =
    currentHackathon?.participation?.participantType === 'team' ||
    currentHackathon?.participation?.participantType === 'team_or_individual';

  const isTeamFormationEnabled =
    isTeamHackathon &&
    currentHackathon?.participation?.tabVisibility?.joinATeamTab !== false;

  const handleJoinClick = () => {
    setShowRegisterModal(true);
  };

  const handleRegisterSuccess = () => {
    checkStatus();
    // Optionally redirect to submission tab
    router.push('?tab=submission');
  };

  const handleSubmitProject = () => {
    router.push('?tab=submission');
  };

  const handleViewSubmission = () => {
    router.push('?tab=submission');
  };

  const handleFindTeam = () => {
    router.push('?tab=team-formation');
  };

  return (
    <div className={`w-full py-8 ${className}`}>
      {/* Join Banner - Show if not registered or not ended */}
      {!isEnded && (
        <div className='mb-8'>
          {!isRegistered ? (
            <JoinHackathonBanner
              onJoinClick={handleJoinClick}
              participants={participantsCount}
              prizePool={prizePool}
              isEnded={isEnded}
            />
          ) : (
            <div className='relative w-full overflow-hidden rounded-lg border border-[#a7f950]/30 bg-gradient-to-r from-[#a7f950]/20 via-[#8fd93f]/20 to-[#a7f950]/20 backdrop-blur-sm'>
              <div className='absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-[#a7f950]/10 to-transparent' />
              <div className='relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row'>
                <div className='text-center md:text-left'>
                  <h2 className='mb-2 text-2xl font-bold text-white md:text-3xl'>
                    You're Registered!
                  </h2>
                  <p className='text-sm text-gray-300 md:text-base'>
                    {hasSubmitted
                      ? 'Your submission has been received. Good luck!'
                      : 'Ready to submit your project? Get started now!'}
                  </p>
                </div>
                <div className='flex gap-3'>
                  {hasSubmitted ? (
                    <Button
                      onClick={handleViewSubmission}
                      className='bg-[#a7f950] text-black hover:bg-[#8fd93f]'
                    >
                      <FileText className='mr-2 h-4 w-4' />
                      View Submission
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitProject}
                      className='bg-[#a7f950] text-black hover:bg-[#8fd93f]'
                    >
                      <FileText className='mr-2 h-4 w-4' />
                      Submit Project
                      <ArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Team Formation Call-to-Action */}
      {!isEnded && !isTeamFormationEnabled && isRegistered && (
        <div className='mb-8'>
          <div className='relative w-full overflow-hidden rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/20 via-blue-600/20 to-blue-500/20 backdrop-blur-sm'>
            <div className='absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-blue-500/10 to-transparent' />
            <div className='relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row'>
              <div className='text-center md:text-left'>
                <div className='mb-2 flex items-center justify-center gap-2 md:justify-start'>
                  <Users className='h-6 w-6 text-blue-400' />
                  <h2 className='text-2xl font-bold text-white md:text-3xl'>
                    Looking for Team Members?
                  </h2>
                </div>
                <p className='text-sm text-gray-300 md:text-base'>
                  Create a recruitment post to find teammates or browse existing
                  posts from other participants.
                </p>
              </div>
              <div className='flex gap-3'>
                <Button
                  onClick={handleFindTeam}
                  className='bg-blue-600 text-white hover:bg-blue-700'
                >
                  <Search className='mr-2 h-4 w-4' />
                  Find Team
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <article className='prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none text-left'>
        <ReactMarkdown
          components={{
            h1: ({ ...props }) => (
              <h1 className='mb-6 text-4xl font-bold' {...props} />
            ),
            h2: ({ ...props }) => (
              <h2 className='mt-8 mb-4 text-3xl font-bold' {...props} />
            ),
            h3: ({ ...props }) => (
              <h3 className='mt-6 mb-3 text-2xl font-semibold' {...props} />
            ),
            p: ({ ...props }) => (
              <p className='mb-4 text-base leading-7' {...props} />
            ),
            ul: ({ ...props }) => (
              <ul
                className='marker:text-primary mb-4 ml-4 list-inside list-disc space-y-2'
                {...props}
              />
            ),
            ol: ({ ...props }) => (
              <ol
                className='marker:text-primary mb-4 ml-4 list-inside list-decimal space-y-2'
                {...props}
              />
            ),
            li: ({ ...props }) => <li className='mb-1 text-base' {...props} />,
            blockquote: ({ ...props }) => (
              <blockquote
                className='border-primary my-4 border-l-4 pl-4 text-gray-600 italic dark:text-gray-400'
                {...props}
              />
            ),
            code: ({ ...props }) => (
              <code
                className='rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800'
                {...props}
              />
            ),
            pre: ({ ...props }) => (
              <pre
                className='mb-4 overflow-auto rounded bg-gray-100 p-4 dark:bg-gray-800'
                {...props}
              />
            ),
            table: ({ ...props }) => (
              <table className='mb-4 w-full border-collapse' {...props} />
            ),
            th: ({ ...props }) => (
              <th
                className='border border-gray-300 bg-gray-100 px-4 py-2 dark:border-gray-700 dark:bg-gray-800'
                {...props}
              />
            ),
            td: ({ ...props }) => (
              <td
                className='border border-gray-300 px-4 py-2 dark:border-gray-700'
                {...props}
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

      {timelineEvents && <HackathonTimeline events={timelineEvents} />}
      {prizes && <HackathonPrizes prizes={prizes} />}

      {/* Registration Modal */}
      {hackathonId && (
        <RegisterHackathonModal
          open={showRegisterModal}
          onOpenChange={setShowRegisterModal}
          hackathonSlugOrId={hackathonId}
          organizationId={orgId}
          onSuccess={handleRegisterSuccess}
        />
      )}
    </div>
  );
}
