'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import TeamModal from './TeamModal';
import ReviewSubmissionModal from './ReviewSubmissionModal';
import GradeSubmissionModal from './GradeSubmissionModal';
import { ParticipantInfo } from './ParticipantInfo';
import { ParticipantSubmission } from './ParticipantSubmission';
import { useParticipantSubmission } from '@/hooks/use-participant-submission';
import { getHackathon } from '@/lib/api/hackathons';
import type { Participant as ParticipantType } from '@/lib/api/hackathons';

interface ParticipantProps {
  participant: ParticipantType;
  organizationId?: string;
  hackathonId?: string;
  onReviewSuccess?: () => void;
}

const Participant = ({
  participant,
  organizationId,
  hackathonId,
  onReviewSuccess,
}: ParticipantProps) => {
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);
  const [criteria, setCriteria] = useState<
    Array<{ title: string; weight: number; description?: string }>
  >([]);
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);

  const isSubmitted = !!participant.submission;
  const submissionData = useParticipantSubmission(participant);

  // Determine participation type for TeamModal
  const participationType = useMemo(() => {
    if (isSubmitted) {
      return participant.participationType === 'team' ? 'team' : 'individual';
    }
    return 'no-submission';
  }, [isSubmitted, participant.participationType]);

  // Check if submission is shortlisted
  const isShortlisted = useMemo(() => {
    return participant.submission?.status === 'shortlisted';
  }, [participant.submission?.status]);

  // Fetch criteria when opening judge modal
  const handleOpenJudgeModal = async () => {
    if (!organizationId || !hackathonId) return;

    setIsLoadingCriteria(true);
    try {
      const response = await getHackathon(organizationId, hackathonId);
      if (response.success && response.data.judging?.criteria) {
        setCriteria(response.data.judging.criteria);
        setIsJudgeModalOpen(true);
      } else {
        // If no criteria, still open modal but with empty criteria
        setCriteria([]);
        setIsJudgeModalOpen(true);
      }
    } catch {
      // Open modal anyway, criteria will be fetched in the modal
      setCriteria([]);
      setIsJudgeModalOpen(true);
    } finally {
      setIsLoadingCriteria(false);
    }
  };
  return (
    <div
      className={cn(
        'bg-background/8 grid grid-cols-2 rounded-[8px] border border-gray-900',
        isSubmitted ? 'grid-cols-2' : 'grid-cols-1'
      )}
    >
      <ParticipantInfo
        participant={participant}
        onTeamClick={() => setIsTeamModalOpen(true)}
      />
      {isSubmitted && participant.submission && (
        <ParticipantSubmission
          participant={participant}
          isShortlisted={isShortlisted}
          organizationId={organizationId}
          hackathonId={hackathonId}
          isLoadingCriteria={isLoadingCriteria}
          onReviewClick={() => setIsReviewModalOpen(true)}
          onGradeClick={handleOpenJudgeModal}
        />
      )}

      {/* Team Modal */}
      <TeamModal
        open={isTeamModalOpen}
        onOpenChange={setIsTeamModalOpen}
        participationType={participationType}
        teamName={participant.teamName}
        submissionDate={
          participant.submission?.submissionDate
            ? new Date(
                participant.submission.submissionDate
              ).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : undefined
        }
        members={participant.teamMembers?.map(member => ({
          id: member.userId,
          name: member.name,
          role: member.role,
          avatar: member.avatar,
        }))}
        teamId={participant.teamId}
        organizationId={organizationId}
        hackathonId={hackathonId}
        onTeamClick={() => {
          // TODO: Navigate to team details page or show team information
        }}
      />

      {/* Review Submission Modal */}
      {submissionData && (
        <ReviewSubmissionModal
          open={isReviewModalOpen}
          onOpenChange={setIsReviewModalOpen}
          submissions={[submissionData]}
          currentIndex={0}
          organizationId={organizationId}
          hackathonId={hackathonId}
          participantId={participant._id}
          onSuccess={onReviewSuccess}
        />
      )}

      {/* Grade Submission Modal */}
      {isShortlisted &&
        organizationId &&
        hackathonId &&
        participant.submission && (
          <GradeSubmissionModal
            open={isJudgeModalOpen}
            onOpenChange={setIsJudgeModalOpen}
            organizationId={organizationId}
            hackathonId={hackathonId}
            participantId={participant._id}
            judgingCriteria={criteria}
            submission={{
              id: participant._id,
              projectName: participant.submission.projectName,
              category: participant.submission.category,
              description: participant.submission.description,
              votes: Array.isArray(participant.submission.votes)
                ? participant.submission.votes.length
                : participant.submission.votes,
              comments: Array.isArray(participant.submission.comments)
                ? participant.submission.comments.length
                : participant.submission.comments || 0,
              logo: participant.submission.logo,
            }}
            onSuccess={() => {
              if (onReviewSuccess) {
                onReviewSuccess();
              }
            }}
          />
        )}
    </div>
  );
};

export default Participant;
