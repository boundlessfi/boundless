'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  getSubmissionDetails,
  upvoteSubmission,
  removeVote,
  type ParticipantSubmission,
  type VoteSubmissionRequest,
} from '@/lib/api/hackathons';
import { useAuthStatus } from '@/hooks/use-auth';
import { toast } from 'sonner';
import {
  ArrowUp,
  ThumbsUp,
  MessageCircle,
  ExternalLink,
  Loader2,
  Calendar,
} from 'lucide-react';
import Image from 'next/image';

interface SubmissionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hackathonSlugOrId: string;
  submissionId: string;
  organizationId?: string;
  onVoteChange?: () => void;
}

export function SubmissionDetailModal({
  open,
  onOpenChange,
  hackathonSlugOrId,
  submissionId,
  organizationId,
  onVoteChange,
}: SubmissionDetailModalProps) {
  const { isAuthenticated } = useAuthStatus();
  const [submission, setSubmission] = useState<ParticipantSubmission | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [hasUserVoted, setHasUserVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);

  useEffect(() => {
    if (open && submissionId) {
      fetchSubmissionDetails();
    }
  }, [open, submissionId]);

  const fetchSubmissionDetails = async () => {
    setIsLoading(true);
    try {
      const response = await getSubmissionDetails(
        hackathonSlugOrId,
        submissionId,
        organizationId
      );
      if (response.success && response.data) {
        setSubmission(response.data);
        // Check if user has voted
        if (Array.isArray(response.data.votes)) {
          // If votes is an array, check if current user has voted
          // This would need user ID from auth context
          setHasUserVoted(false); // TODO: Check against current user
        } else {
          setHasUserVoted(false);
        }
        setVoteCount(
          typeof response.data.votes === 'number'
            ? response.data.votes
            : Array.isArray(response.data.votes)
              ? response.data.votes.length
              : 0
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load submission';
      toast.error('Error', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to vote');
      return;
    }

    setIsVoting(true);
    try {
      if (hasUserVoted) {
        // Remove vote
        await removeVote(hackathonSlugOrId, submissionId, organizationId);
        setHasUserVoted(false);
        setVoteCount(prev => Math.max(0, prev - 1));
        toast.success('Vote removed');
      } else {
        // Add vote
        const voteData: VoteSubmissionRequest = {
          value: 1,
        };
        await upvoteSubmission(
          hackathonSlugOrId,
          submissionId,
          voteData,
          organizationId
        );
        setHasUserVoted(true);
        setVoteCount(prev => prev + 1);
        toast.success('Vote added');
      }
      onVoteChange?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to vote';
      toast.error('Error', { description: errorMessage });
    } finally {
      setIsVoting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!submission && !isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto bg-[#030303] text-white'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            {isLoading ? 'Loading...' : submission?.projectName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className='flex min-h-[400px] items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-[#a7f950]' />
          </div>
        ) : submission ? (
          <div className='space-y-6'>
            {/* Header Info */}
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-4'>
                <Badge
                  className={`${
                    submission.status === 'shortlisted'
                      ? 'border-[#A7F950] bg-[#E5FFE5] text-[#4E9E00]'
                      : submission.status === 'disqualified'
                        ? 'border-[#FF5757] bg-[#FFEAEA] text-[#D33]'
                        : 'border-[#645D5D] bg-[#E4DBDB] text-[#645D5D]'
                  }`}
                >
                  {submission.status === 'shortlisted'
                    ? 'Shortlisted'
                    : submission.status === 'disqualified'
                      ? 'Disqualified'
                      : 'Submitted'}
                </Badge>
                <Badge className='border-[#645D5D] bg-[#E4DBDB] text-[#645D5D]'>
                  {submission.category}
                </Badge>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  onClick={handleVote}
                  disabled={isVoting || !isAuthenticated}
                  className={`${
                    hasUserVoted
                      ? 'border-primary/20 bg-primary/10 text-primary border'
                      : 'bg-[#A7F950] text-black hover:bg-[#8fd93f]'
                  }`}
                >
                  {isVoting ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : hasUserVoted ? (
                    <ThumbsUp className='mr-2 h-4 w-4' fill='currentColor' />
                  ) : (
                    <ArrowUp className='mr-2 h-4 w-4' />
                  )}
                  {hasUserVoted ? 'Upvoted' : 'Upvote'} {voteCount}
                </Button>
              </div>
            </div>

            {/* Logo and Main Content */}
            {submission.logo && (
              <div className='relative h-64 w-full overflow-hidden rounded-lg'>
                <Image
                  src={submission.logo}
                  alt={submission.projectName}
                  fill
                  className='object-cover'
                />
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className='mb-2 text-lg font-semibold'>Description</h3>
              <p className='text-gray-300'>{submission.description}</p>
            </div>

            {/* Introduction */}
            {submission.introduction && (
              <div>
                <h3 className='mb-2 text-lg font-semibold'>Introduction</h3>
                <p className='text-gray-300'>{submission.introduction}</p>
              </div>
            )}

            {/* Video */}
            {submission.videoUrl && (
              <div>
                <h3 className='mb-2 text-lg font-semibold'>Demo Video</h3>
                <a
                  href={submission.videoUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 text-[#a7f950] hover:underline'
                >
                  <ExternalLink className='h-4 w-4' />
                  Watch Demo Video
                </a>
              </div>
            )}

            {/* Links */}
            {submission.links && submission.links.length > 0 && (
              <div>
                <h3 className='mb-2 text-lg font-semibold'>Project Links</h3>
                <div className='space-y-2'>
                  {submission.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2 text-[#a7f950] hover:underline'
                    >
                      <ExternalLink className='h-4 w-4' />
                      {link.type}: {link.url}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <Separator className='bg-gray-700' />

            {/* Footer Info */}
            <div className='flex items-center gap-6 text-sm text-gray-400'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                <span>Submitted: {formatDate(submission.submissionDate)}</span>
              </div>
              <div className='flex items-center gap-2'>
                <MessageCircle className='h-4 w-4' />
                <span>
                  {typeof submission.comments === 'number'
                    ? submission.comments
                    : Array.isArray(submission.comments)
                      ? submission.comments.length
                      : 0}{' '}
                  comments
                </span>
              </div>
            </div>

            {/* Disqualification Reason */}
            {submission.status === 'disqualified' &&
              submission.disqualificationReason && (
                <div className='rounded-lg border border-red-500/50 bg-red-500/10 p-4'>
                  <h4 className='mb-2 font-semibold text-red-400'>
                    Disqualification Reason
                  </h4>
                  <p className='text-sm text-red-300'>
                    {submission.disqualificationReason}
                  </p>
                </div>
              )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
