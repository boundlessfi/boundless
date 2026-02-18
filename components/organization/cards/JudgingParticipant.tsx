'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TeamModal from './TeamModal';
import GradeSubmissionModal from './GradeSubmissionModal';
import {
  getJudgingCriteria,
  type JudgingSubmission,
  type JudgingCriterion,
} from '@/lib/api/hackathons/judging';
import Link from 'next/link';
import IndividualScoresBreakdown from './JudgingParticipant/IndividualScoresBreakdown';

import { authClient } from '@/lib/auth-client';

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
  const [showBreakdown, setShowBreakdown] = useState(false);

  const sub = submission as any;
  const participant = sub.participant || sub;
  const submissionData = sub.submission || sub;
  const userProfile =
    participant.user?.profile || participant.submitterProfile || {};
  let userName = 'Unknown User';
  if (participant.name) {
    userName = participant.name;
  } else if (participant.user?.name) {
    userName = participant.user.name;
  } else if (userProfile.firstName || userProfile.lastName) {
    userName =
      `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
  } else if (participant.submitterName) {
    userName = participant.submitterName;
  }

  const userAvatar =
    participant.image ||
    participant.user?.image ||
    userProfile.avatar ||
    userProfile.image ||
    participant.submitterAvatar ||
    '';

  const username =
    participant.username ||
    participant.user?.username ||
    userProfile.username ||
    participant.submitterUsername ||
    'anonymous';

  // Try to find the email
  const userEmail =
    participant.email ||
    participant.user?.email ||
    participant.submitterEmail ||
    '';

  // Determine participation type for TeamModal
  const participationType = useMemo(() => {
    const type =
      participant.participationType?.toLowerCase() || sub.type?.toLowerCase();
    return type === 'team' ? 'team' : 'individual';
  }, [participant.participationType, sub.type]);

  // Fetch criteria when opening judge modal
  const handleOpenScoreModal = async (mode: 'judge' | 'organizer-override') => {
    if (!hasCriteria) return; // Guard clause
    setIsLoadingCriteria(true);
    try {
      const response = await getJudgingCriteria(hackathonId);
      const criteriaList = Array.isArray(response) ? response : [];

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
      console.error('Failed to fetch judging criteria:', error);
      setCriteria([]);
    } finally {
      setIsLoadingCriteria(false);
    }
  };

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
          </div>
          <p className='line-clamp-1 text-sm text-gray-400'>
            {submissionData.description || 'No description provided.'}
          </p>
          <div className='flex items-center gap-3 text-xs text-gray-500'>
            <span>
              Submitted{' '}
              {new Date(
                submissionData.submissionDate || participant.registeredAt
              ).toLocaleDateString()}
            </span>
            <div className='flex items-center gap-2'>
              <span className='h-1 w-1 rounded-full bg-gray-700' />
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className='hover:text-primary flex items-center gap-1 text-xs text-white transition-colors'
              >
                {sub.averageScore !== undefined && sub.averageScore !== null ? (
                  <>Score: {Number(sub.averageScore).toFixed(1)}</>
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
            {/* Link */}
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
            <Avatar className='h-8 w-8 border border-gray-800'>
              <AvatarImage src={userAvatar} />
              <AvatarFallback>
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
              <h4 className='max-w-[120px] truncate text-sm font-medium text-white'>
                {userName}
              </h4>
              <p className='max-w-[120px] truncate text-xs text-gray-400'>
                @{username}
              </p>
            </div>
          </div>

          {/* Grade Button - Only for assigned judges */}
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

      {/* Expanded Breakdown */}
      {showBreakdown && (
        <div className='bg-black/40 px-4 pb-4'>
          <IndividualScoresBreakdown
            organizationId={organizationId}
            hackathonId={hackathonId}
            participantId={sub.id || participant.id}
          />
        </div>
      )}

      {/* Team Modal */}
      <TeamModal
        open={isTeamModalOpen}
        onOpenChange={setIsTeamModalOpen}
        participationType={participationType}
        teamName={participant.teamName}
        submissionDate={new Date(
          submissionData.submissionDate ||
            participant.registeredAt ||
            Date.now()
        ).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
        members={participant.teamMembers || []}
        teamId={participant.teamId}
        organizationId={organizationId}
        hackathonId={hackathonId}
        onTeamClick={() => {
          // TODO: Navigate to team details page or show team information
        }}
      />

      {/* Grade Submission Modal */}
      <GradeSubmissionModal
        open={isScoreModalOpen}
        onOpenChange={setIsScoreModalOpen}
        organizationId={organizationId}
        hackathonId={hackathonId}
        participantId={sub.id || participant.id}
        judgingCriteria={criteria}
        mode={scoreMode}
        judges={judges}
        submission={{
          id: submissionData.id || participant.id,
          projectName: submissionData.projectName,
          category: submissionData.category,
          description: submissionData.description,
          votes: 0,
          comments: 0,
          logo: submissionData.logo,
        }}
        onSuccess={() => {
          if (onSuccess) {
            onSuccess();
          }
        }}
      />
    </div>
  );
};

export default JudgingParticipant;
