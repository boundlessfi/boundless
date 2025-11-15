import { useMemo } from 'react';
import type { Participant as ParticipantType } from '@/lib/api/hackathons';

interface SubmissionData {
  id: string;
  projectName: string;
  category: string;
  description: string;
  votes: number;
  comments: number;
  submissionDate: string;
  videoUrl?: string;
  introduction?: string;
  logo?: string;
  teamMembers?: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
    username?: string;
  }>;
  links?: Array<{ type: string; url: string }>;
  voters?: Array<{
    id: string;
    name: string;
    username: string;
    avatar?: string;
    votedAt?: string;
    voteType: 'positive' | 'negative';
  }>;
  commentsList?: Array<{
    id: string;
    content: string;
    author: {
      name: string;
      username: string;
      avatar?: string;
    };
    createdAt: string;
    reactions?: {
      thumbsUp?: number;
      heart?: number;
    };
  }>;
}

export const useParticipantSubmission = (
  participant: ParticipantType
): SubmissionData | undefined => {
  return useMemo(() => {
    if (!participant.submission) return undefined;

    const votesCount = Array.isArray(participant.submission.votes)
      ? participant.submission.votes.length
      : participant.submission.votes;
    const commentsCount = Array.isArray(participant.submission.comments)
      ? participant.submission.comments.length
      : participant.submission.comments || 0;

    const voters = Array.isArray(participant.submission.votes)
      ? participant.submission.votes.map(vote => ({
          id: vote._id,
          name: `${vote.user.profile.firstName} ${vote.user.profile.lastName}`,
          username: vote.user.profile.username,
          avatar: vote.user.profile.avatar,
          votedAt: vote.createdAt,
          voteType:
            vote.value > 0 ? ('positive' as const) : ('negative' as const),
        }))
      : undefined;

    const commentsList = Array.isArray(participant.submission.comments)
      ? participant.submission.comments.map(comment => ({
          id: comment._id,
          content: comment.content,
          author: {
            name: `${comment.user.profile.firstName} ${comment.user.profile.lastName}`,
            username: comment.user.profile.username,
            avatar: comment.user.profile.avatar,
          },
          createdAt: comment.createdAt,
          reactions: comment.reactionCounts
            ? {
                thumbsUp: comment.reactionCounts.LIKE || 0,
                heart: comment.reactionCounts.HELPFUL || 0,
              }
            : undefined,
        }))
      : undefined;

    return {
      id: participant.submission._id,
      projectName: participant.submission.projectName,
      category: participant.submission.category,
      description: participant.submission.description,
      votes: votesCount,
      comments: commentsCount,
      submissionDate: participant.submission.submissionDate,
      videoUrl: participant.submission.videoUrl,
      introduction: participant.submission.introduction,
      logo: participant.submission.logo,
      teamMembers: participant.teamMembers?.map(member => ({
        id: member.userId,
        name: member.name,
        role: member.role,
        avatar: member.avatar,
        username: member.username,
      })),
      links: participant.submission.links,
      voters,
      commentsList,
    };
  }, [participant]);
};
