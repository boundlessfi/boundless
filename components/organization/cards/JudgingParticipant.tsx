'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpRight, Mail, Award } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TeamModal from './TeamModal';
import GradeSubmissionModal from './GradeSubmissionModal';
import { getHackathon, type JudgingSubmission } from '@/lib/api/hackathons';

interface JudgingParticipantProps {
  submission: JudgingSubmission;
  organizationId: string;
  hackathonId: string;
  onSuccess?: () => void;
}

const JudgingParticipant = ({
  submission,
  organizationId,
  hackathonId,
  onSuccess,
}: JudgingParticipantProps) => {
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);
  const [criteria, setCriteria] = useState<
    Array<{ title: string; weight: number; description?: string }>
  >([]);
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);

  const participant = submission.participant;
  const submissionData = submission.submission;
  const userName = `${participant.user.profile.firstName} ${participant.user.profile.lastName}`;
  const userAvatar = participant.user.profile.avatar;
  const username = participant.user.profile.username;

  // Determine participation type for TeamModal
  const participationType = useMemo(() => {
    return participant.participationType === 'team' ? 'team' : 'individual';
  }, [participant.participationType]);

  // Fetch criteria when opening judge modal
  const handleOpenJudgeModal = async () => {
    setIsLoadingCriteria(true);
    try {
      const response = await getHackathon(organizationId, hackathonId);
      if (response.success && response.data.judging?.criteria) {
        setCriteria(response.data.judging.criteria);
        setIsJudgeModalOpen(true);
      } else {
        setCriteria([]);
        setIsJudgeModalOpen(true);
      }
    } catch {
      setCriteria([]);
      setIsJudgeModalOpen(true);
    } finally {
      setIsLoadingCriteria(false);
    }
  };
  return (
    <div className='bg-background/8 grid grid-cols-2 rounded-[8px] border border-gray-900'>
      <div className='flex flex-row items-center justify-start p-5'>
        <div className='flex-1'>
          <Avatar className='h-10.5 w-10.5'>
            <AvatarImage src={userAvatar} />
            <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h4 className='text-sm text-white'>{userName}</h4>
          <p className='text-xs text-gray-400'>@{username}</p>
        </div>
        <div className='flex-1'>
          <div className='flex items-center gap-5'>
            {participant.user.profile.avatar && (
              <a
                href={`mailto:${participant.user.email}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Mail className='h-4 w-4 text-gray-400' />
              </a>
            )}
          </div>
          <div className='flex gap-6'>
            {(participant.participationType === 'team' ||
              participant.teamName) && (
              <Button
                variant='link'
                className='p-0 text-sm text-white underline'
                onClick={() => setIsTeamModalOpen(true)}
              >
                Team
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className='bg-background-card flex flex-col gap-4 rounded-r-[8px] border-l border-gray-900 p-5'>
        <div className='flex items-center gap-3'>
          <div className='h-12.75 w-12.75'>
            <Image
              src={submissionData.logo || '/bitmed.png'}
              alt={submissionData.projectName}
              width={50}
              height={50}
              className='h-auto w-full object-cover'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <h5 className='text-sm text-white'>
                {submissionData.projectName}
              </h5>
              <Badge className='bg-office-brown text-office-brown-darker border-office-brown-darker rounded-[4px] border px-1 py-0.5 text-xs font-medium'>
                {submissionData.category}
              </Badge>
            </div>
            <div className='flex items-center gap-2'>
              {submission.averageScore !== null && (
                <>
                  <span className='text-xs text-gray-500'>
                    Avg Score: {submission.averageScore.toFixed(2)}
                  </span>
                  <div className='h-4 w-px bg-gray-900' />
                </>
              )}
              <span className='text-xs text-gray-500'>
                {submission.judgeCount} Judge
                {submission.judgeCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        <p className='line-clamp-3 text-sm text-white'>
          {submissionData.description}
        </p>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-sm text-gray-500'>
            {new Date(submissionData.submissionDate).toLocaleDateString(
              'en-US',
              {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }
            )}
          </span>
          <Button
            variant='link'
            className='text-primary p-0 text-sm'
            onClick={handleOpenJudgeModal}
            disabled={isLoadingCriteria}
          >
            <Award className='mr-1 h-4 w-4' />
            Grade Submission <ArrowUpRight />
          </Button>
        </div>
      </div>

      {/* Team Modal */}
      <TeamModal
        open={isTeamModalOpen}
        onOpenChange={setIsTeamModalOpen}
        participationType={participationType}
        teamName={participant.teamName}
        submissionDate={new Date(
          submissionData.submissionDate
        ).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
        members={[]}
        teamId={participant.teamId}
        organizationId={organizationId}
        hackathonId={hackathonId}
        onTeamClick={() => {
          // TODO: Navigate to team details page or show team information
        }}
      />

      {/* Grade Submission Modal */}
      <GradeSubmissionModal
        open={isJudgeModalOpen}
        onOpenChange={setIsJudgeModalOpen}
        organizationId={organizationId}
        hackathonId={hackathonId}
        participantId={participant._id}
        judgingCriteria={criteria}
        submission={{
          id: participant._id,
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
