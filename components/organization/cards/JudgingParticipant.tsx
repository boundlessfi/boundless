'use client';

import { useState, useCallback, useMemo, useEffect, memo } from 'react';
import {
  ArrowUpRight,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  Trophy,
} from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TeamModal from './TeamModal';
import GradeSubmissionModal from './GradeSubmissionModal';
import {
  getJudgingCriteria,
  getSubmissionScores,
  type JudgingSubmission,
  type JudgingCriterion,
} from '@/lib/api/hackathons/judging';
import Link from 'next/link';
import { reportError } from '@/lib/error-reporting';
import IndividualScoresBreakdown from './JudgingParticipant/IndividualScoresBreakdown';

import { authClient } from '@/lib/auth-client';
import BasicAvatar from '@/components/avatars/BasicAvatar';

interface JudgingParticipantProps {
  submission: JudgingSubmission;
  organizationId: string;
  hackathonId: string;
  hasCriteria?: boolean;
  judges?: any[];
  isJudgesLoading?: boolean;
  currentUserId?: string;
  canOverrideScores?: boolean;
  onSuccess?: () => void;
  variant?: 'detailed' | 'compact';
  criteria?: JudgingCriterion[];
}

const JudgingParticipant = ({
  submission,
  organizationId,
  hackathonId,
  hasCriteria = false,
  judges = [],
  isJudgesLoading = false,
  currentUserId,
  canOverrideScores = false,
  onSuccess,
  variant = 'detailed',
  criteria: passedCriteria = [],
}: JudgingParticipantProps) => {
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [scoreMode, setScoreMode] = useState<'judge' | 'organizer-override'>(
    'judge'
  );

  const isAssignedJudge = useMemo(() => {
    if (!currentUserId || !judges.length) return false;
    return judges.some(
      j => j.userId === currentUserId || j.id === currentUserId
    );
  }, [currentUserId, judges]);
  const [criteria, setCriteria] = useState<
    Array<{ title: string; weight: number; description?: string }>
  >([]);
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);
  const sub = submission;
  const participant = sub.participant;
  const submissionData = sub.submission || sub;

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [localAverageScore, setLocalAverageScore] = useState<number | null>(
    sub.averageScore !== undefined && sub.averageScore !== null
      ? Number(sub.averageScore)
      : null
  );

  const handleScoresLoaded = (avg: number | null) => {
    if (avg !== null) {
      setLocalAverageScore(avg);
    }
  };

  useEffect(() => {
    if (sub.averageScore !== undefined && sub.averageScore !== null) {
      setLocalAverageScore(Number(sub.averageScore));
    } else if (hasCriteria) {
      // Proactively fetch scores if backend aggregation is missing
      const fetchScores = async () => {
        try {
          const res = await getSubmissionScores(
            organizationId,
            hackathonId,
            sub.submission.id
          );
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const scores = res.data;
            const avg =
              scores.reduce(
                (sum: number, s: any) =>
                  sum +
                  (s.totalScore ??
                    s.criteriaScores?.reduce(
                      (cSum: number, c: any) => cSum + (c.score || 0),
                      0
                    ) ??
                    0),
                0
              ) / scores.length;
            setLocalAverageScore(avg);
          }
        } catch (err) {
          // Silent fail for proactive fetch
        }
      };
      fetchScores();
    }
  }, [
    sub.averageScore,
    hasCriteria,
    organizationId,
    hackathonId,
    participant.id,
  ]);

  // New API response provides name/image/username directly on participant
  const userName = participant.user?.name || 'Unknown User';
  const userAvatar = participant.user?.image || '';
  const username = participant.user?.username || 'anonymous';
  const userEmail = participant.user?.email || '';

  // Determine participation type for TeamModal
  const participationType = useMemo(() => {
    const type = participant.participationType?.toLowerCase();
    return type === 'team' ? 'team' : 'individual';
  }, [participant.participationType]);

  // Fetch criteria when opening judge modal
  const handleOpenScoreModal = async (mode: 'judge' | 'organizer-override') => {
    if (!hasCriteria) return; // Guard clause
    setIsLoadingCriteria(true);
    try {
      let criteriaList = passedCriteria;
      if (criteriaList.length === 0) {
        const response = await getJudgingCriteria(hackathonId);
        criteriaList = Array.isArray(response) ? response : [];
      }

      if (criteriaList.length > 0) {
        const validCriteria = criteriaList
          .filter(
            (
              criterion
            ): criterion is JudgingCriterion & {
              title: string;
              weight: number;
            } =>
              (!!criterion.name || !!criterion.title) &&
              typeof criterion.weight === 'number'
          )
          .map(c => ({
            ...c,
            title: c.name || c.title || '',
          }));
        setCriteria(validCriteria);
        setScoreMode(mode);
        setIsScoreModalOpen(true);
      } else {
        setCriteria([]);
        // Optional: Show toast that no criteria are set
      }
    } catch (error) {
      reportError(error, {
        context: 'JudgingParticipant-fetchCriteria',
        hackathonId,
      });
      setCriteria([]);
    } finally {
      setIsLoadingCriteria(false);
    }
  };

  // Detailed View (Current)
  if (variant === 'detailed') {
    return (
      <div className='bg-background/8 flex flex-col overflow-hidden rounded-lg border border-gray-900 md:flex-row md:items-center'>
        {/* Project Image - Fixed square */}
        <div className='relative h-48 w-full shrink-0 border-b border-gray-900 bg-black md:h-24 md:w-24 md:border-r md:border-b-0'>
          <Image
            src={submissionData.logo || '/bitmed.png'}
            alt={submissionData.projectName || 'Project'}
            fill
            className='object-cover'
          />
        </div>

        {/* Content Area */}
        <div className='flex flex-1 flex-col justify-between gap-4 p-4 md:flex-row md:items-center'>
          {/* Project Info */}
          <div className='min-w-0 flex-1 space-y-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <h5 className='truncate font-medium text-white'>
                {submissionData.projectName || 'Untitled Project'}
              </h5>
              <Badge className='bg-primary/10 text-primary border-primary/20 shrink-0 rounded px-1.5 py-0 text-[10px] font-medium'>
                {submissionData.category || 'General'}
              </Badge>
              {submissionData.rank && (
                <div className='flex items-center gap-1 text-[10px] font-bold text-amber-500'>
                  <Trophy className='h-3 w-3' />
                  <span>#{submissionData.rank}</span>
                </div>
              )}
              {sub.myScore && (
                <Badge className='rounded border-green-500/20 bg-green-500/10 px-1.5 py-0 text-[10px] font-medium text-green-400'>
                  You graded
                </Badge>
              )}
            </div>
            <p className='line-clamp-1 text-sm text-gray-400'>
              {submissionData.description || 'No description provided.'}
            </p>
            <div className='flex items-center gap-3 text-xs text-gray-500'>
              <span>
                Submitted{' '}
                {new Date(
                  submissionData.submissionDate || Date.now()
                ).toLocaleDateString()}
              </span>
              <div className='flex items-center gap-2'>
                <span className='h-1 w-1 rounded-full bg-gray-700' />
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className='hover:text-primary text-primary flex items-center gap-1 text-xs transition-colors'
                >
                  {localAverageScore !== null ? (
                    <>Score: {Number(localAverageScore).toFixed(1)}</>
                  ) : (
                    <span className='text-gray-500'>Not Graded</span>
                  )}
                  {showBreakdown ? (
                    <ChevronUp className='h-3 w-3 text-gray-400' />
                  ) : (
                    <ChevronDown className='h-3 w-3 text-gray-400' />
                  )}
                </button>
              </div>
              {submissionData.id && (
                <>
                  <span className='h-1 w-1 rounded-full bg-gray-700' />
                  <Link
                    href={`/projects/${submissionData.id}?type=submission`}
                    className='flex items-center gap-1 transition-colors hover:text-white'
                  >
                    View Details <ExternalLink className='h-3 w-3' />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* User Info & Actions */}
          <div className='flex shrink-0 items-center justify-between gap-6 border-t border-gray-800 pt-3 md:justify-end md:border-t-0 md:border-l md:border-gray-800 md:pt-0 md:pl-6'>
            <div className='flex min-w-[140px] items-center gap-3'>
              <BasicAvatar
                name={userName}
                image={userAvatar}
                username={username}
              />
            </div>

            {/* Grade Button */}
            <div className='flex items-center gap-2'>
              {isJudgesLoading ? (
                <Loader2 className='h-4 w-4 animate-spin text-gray-500' />
              ) : (
                <>
                  {hasCriteria && isAssignedJudge && (
                    <Button
                      size='sm'
                      onClick={() => handleOpenScoreModal('judge')}
                      disabled={isLoadingCriteria}
                      className='bg-primary text-primary-foreground hover:bg-primary/90 h-8 shrink-0 gap-1.5 px-3 text-xs'
                    >
                      <span>Grade</span>
                      <ArrowUpRight className='h-3.5 w-3.5' />
                    </Button>
                  )}
                  {hasCriteria && canOverrideScores && (
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleOpenScoreModal('organizer-override')}
                      disabled={isLoadingCriteria}
                      className='h-8 shrink-0 border-amber-500/40 px-3 text-xs text-amber-300 hover:bg-amber-500/10 hover:text-amber-200'
                    >
                      Override
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Breakdown & Modals */}
        {showBreakdown && (
          <div className='bg-black/40 px-4 pb-4'>
            <IndividualScoresBreakdown
              organizationId={organizationId}
              hackathonId={hackathonId}
              submissionId={sub.submission.id}
              onScoresLoaded={handleScoresLoaded}
            />
          </div>
        )}

        <SharedModals
          {...{
            isTeamModalOpen,
            setIsTeamModalOpen,
            isScoreModalOpen,
            setIsScoreModalOpen,
            criteria,
            scoreMode,
            judges,
            organizationId,
            hackathonId,
            sub,
            participant,
            submissionData,
            participationType,
            onSuccess,
          }}
        />
      </div>
    );
  }

  // Compact View (New)
  return (
    <div className='bg-background/8 group relative flex items-center justify-between gap-4 rounded-lg border border-gray-900 p-2 pl-3 transition-colors hover:bg-white/5'>
      <div className='flex min-w-0 flex-1 items-center gap-3'>
        <div className='relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-black'>
          <Image
            src={submissionData.logo || '/bitmed.png'}
            alt=''
            fill
            className='object-cover opacity-70'
          />
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <h5 className='truncate text-sm font-medium text-white'>
              {submissionData.projectName || 'Untitled'}
            </h5>
            <span className='text-[10px] text-gray-500'>•</span>
            <span className='truncate text-[10px] text-gray-400'>
              {userName}
            </span>
          </div>
          <div className='flex items-center gap-2 text-[10px]'>
            <span className='text-gray-500'>
              {submissionData.category || 'General'}
            </span>
            {sub.myScore && (
              <span className='text-[9px] font-medium text-green-500/80'>
                (You graded)
              </span>
            )}
            <span className='text-gray-600'>|</span>
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className='hover:text-primary text-gray-400 transition-colors'
            >
              {localAverageScore !== null ? (
                <span className='text-primary flex items-center gap-1 font-mono'>
                  Score: {Number(localAverageScore).toFixed(1)}
                  {showBreakdown ? (
                    <ChevronUp className='h-2.5 w-2.5' />
                  ) : (
                    <ChevronDown className='h-2.5 w-2.5' />
                  )}
                </span>
              ) : (
                'Not Graded'
              )}
            </button>
          </div>
        </div>
      </div>

      <div className='flex shrink-0 items-center gap-2'>
        {submissionData.rank && (
          <div className='mr-2 flex items-center gap-1 text-[10px] font-bold text-amber-500/80'>
            <Trophy className='h-3 w-3' />
            <span>#{submissionData.rank}</span>
          </div>
        )}

        {isJudgesLoading ? (
          <Loader2 className='h-3 w-3 animate-spin text-gray-500' />
        ) : (
          <div className='flex items-center gap-1.5'>
            {hasCriteria && isAssignedJudge && (
              <Button
                size='sm'
                onClick={() => handleOpenScoreModal('judge')}
                disabled={isLoadingCriteria}
                className='bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2 text-[10px]'
              >
                Grade
              </Button>
            )}
            {hasCriteria && canOverrideScores && (
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleOpenScoreModal('organizer-override')}
                disabled={isLoadingCriteria}
                className='h-7 border-amber-500/40 px-2 text-[10px] text-amber-300'
              >
                Override
              </Button>
            )}
            <Link
              href={`/projects/${submissionData.id}?type=submission`}
              className='flex h-7 w-7 items-center justify-center rounded-md border border-gray-800 text-gray-500 hover:bg-white/5 hover:text-white'
            >
              <ExternalLink className='h-3 w-3' />
            </Link>
          </div>
        )}
      </div>

      {/* Breakdown Overlay */}
      {showBreakdown && (
        <div className='absolute top-full left-0 z-20 w-full rounded-b-lg border-x border-b border-gray-800 bg-zinc-950 p-4 shadow-xl'>
          <IndividualScoresBreakdown
            organizationId={organizationId}
            hackathonId={hackathonId}
            submissionId={sub.submission.id}
            onScoresLoaded={handleScoresLoaded}
          />
        </div>
      )}

      <SharedModals
        {...{
          isTeamModalOpen,
          setIsTeamModalOpen,
          isScoreModalOpen,
          setIsScoreModalOpen,
          criteria,
          scoreMode,
          judges,
          organizationId,
          hackathonId,
          sub,
          participant,
          submissionData,
          participationType,
          onSuccess,
        }}
      />
    </div>
  );
};

// Helper component to avoid duplication
const SharedModals = ({
  isTeamModalOpen,
  setIsTeamModalOpen,
  isScoreModalOpen,
  setIsScoreModalOpen,
  criteria,
  scoreMode,
  judges,
  organizationId,
  hackathonId,
  sub,
  participant,
  submissionData,
  participationType,
  onSuccess,
}: any) => (
  <>
    <TeamModal
      open={isTeamModalOpen}
      onOpenChange={setIsTeamModalOpen}
      participationType={participationType}
      teamName={participant.teamName}
      submissionDate={new Date(
        submissionData.submissionDate || Date.now()
      ).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}
      members={participant.teamMembers || []}
      teamId={participant.teamId}
      organizationId={organizationId}
      hackathonId={hackathonId}
      onTeamClick={() => {}}
    />

    <GradeSubmissionModal
      open={isScoreModalOpen}
      onOpenChange={setIsScoreModalOpen}
      organizationId={organizationId}
      hackathonId={hackathonId}
      submissionId={submissionData.id}
      participantId={participant.id}
      judgingCriteria={criteria}
      mode={scoreMode}
      judges={judges}
      submission={{
        id: submissionData.id,
        projectName: submissionData.projectName,
        category: submissionData.category,
        description: submissionData.description,
        votes: 0,
        comments: 0,
        logo: submissionData.logo,
      }}
      initialScore={sub.myScore}
      onSuccess={onSuccess}
    />
  </>
);

export default memo(JudgingParticipant);
