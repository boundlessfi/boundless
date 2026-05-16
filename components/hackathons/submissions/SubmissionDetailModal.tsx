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
      const response = await getSubmissionDetails(submissionId);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
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
      <DialogContent className='bg-background-main-bg max-h-[90vh] max-w-4xl overflow-y-auto text-white'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            {isLoading ? 'Loading...' : submission?.projectName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className='flex min-h-[400px] items-center justify-center'>
            <Loader2 className='text-primary h-8 w-8 animate-spin' />
          </div>
        ) : submission ? (
          <div className='space-y-6'>
            {/* Header Info */}
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-4'>
                <Badge
                  className={`${
                    submission.status === 'SHORTLISTED'
                      ? 'border-primary bg-[#E5FFE5] text-[#4E9E00]'
                      : submission.status === 'DISQUALIFIED'
                        ? 'border-[#FF5757] bg-[#FFEAEA] text-[#D33]'
                        : 'border-[#645D5D] bg-[#E4DBDB] text-[#645D5D]'
                  }`}
                >
                  {submission.status === 'SHORTLISTED'
                    ? 'Shortlisted'
                    : submission.status === 'DISQUALIFIED'
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
                      : 'bg-primary text-black hover:bg-[#1ec78d]'
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

            {/* Tagline — short pitch shown above the long description. */}
            {(() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const tagline = (submission as any).tagline as string | undefined;
              return tagline ? (
                <p className='text-base text-gray-200 italic'>
                  &ldquo;{tagline}&rdquo;
                </p>
              ) : null;
            })()}

            {/* Screenshots gallery (up to 5). Renders as a horizontal
                scroll on mobile, a row of thumbnails on desktop. */}
            {(() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const screenshots = ((submission as any).screenshots ??
                []) as string[];
              return screenshots.length > 0 ? (
                <div>
                  <h3 className='mb-2 text-lg font-semibold'>Screenshots</h3>
                  <div className='flex gap-3 overflow-x-auto pb-2'>
                    {screenshots.map((src, i) => (
                      <a
                        key={`${src}-${i}`}
                        href={src}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='shrink-0'
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`Screenshot ${i + 1}`}
                          className='h-40 rounded-md border border-gray-700 object-cover transition-opacity hover:opacity-90'
                        />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Description */}
            <div>
              <h3 className='mb-2 text-lg font-semibold'>Description</h3>
              <p className='whitespace-pre-wrap text-gray-300'>
                {submission.description}
              </p>
            </div>

            {/* Per-track answers — only for tracks where the organizer
                set a prompt / custom questions / required artifacts and
                the submitter filled at least one in. We index by
                trackId so the section header gets the track name. */}
            {(() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const entries = ((submission as any).trackEntries ??
                []) as Array<{
                trackId: string;
                trackName: string;
                trackAnswers?: {
                  promptAnswer?: string;
                  customAnswers?: Record<string, string>;
                  artifacts?: Record<string, string>;
                };
              }>;
              const withAnswers = entries.filter(e => {
                const a = e.trackAnswers;
                if (!a) return false;
                return !!(
                  a.promptAnswer?.trim() ||
                  Object.values(a.customAnswers ?? {}).some(v => v?.trim?.()) ||
                  Object.values(a.artifacts ?? {}).some(v => v?.trim?.())
                );
              });
              if (withAnswers.length === 0) return null;
              return (
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold'>Track answers</h3>
                  {withAnswers.map(e => (
                    <div
                      key={e.trackId}
                      className='space-y-2 rounded-md border border-gray-700 bg-gray-900/40 p-3'
                    >
                      <p className='text-sm font-medium text-white'>
                        {e.trackName}
                      </p>
                      {e.trackAnswers?.promptAnswer && (
                        <p className='text-sm whitespace-pre-wrap text-gray-300'>
                          {e.trackAnswers.promptAnswer}
                        </p>
                      )}
                      {Object.entries(e.trackAnswers?.customAnswers ?? {})
                        .filter(([, v]) => v && v.trim().length > 0)
                        .map(([qid, value]) => (
                          <div key={qid} className='text-sm'>
                            <p className='text-xs text-gray-400'>{qid}</p>
                            <p className='whitespace-pre-wrap text-gray-200'>
                              {value}
                            </p>
                          </div>
                        ))}
                      {Object.entries(e.trackAnswers?.artifacts ?? {})
                        .filter(([, v]) => v && v.trim().length > 0)
                        .map(([aid, url]) => (
                          <div key={aid} className='text-sm'>
                            <p className='text-xs text-gray-400'>{aid}</p>
                            <a
                              href={url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-primary break-all hover:underline'
                            >
                              {url}
                            </a>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Built with — tech-stack chips, hidden when empty. */}
            {(() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const builtWith = ((submission as any).builtWith ??
                []) as string[];
              return builtWith.length > 0 ? (
                <div>
                  <h3 className='mb-2 text-lg font-semibold'>Built with</h3>
                  <div className='flex flex-wrap gap-2'>
                    {builtWith.map((tag, i) => (
                      <span
                        key={`${tag}-${i}`}
                        className='rounded-md border border-gray-700 bg-gray-900/40 px-2 py-1 text-xs text-gray-200'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Introduction (legacy field — keep for backward compat) */}
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
                  className='text-primary flex items-center gap-2 hover:underline'
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
                      className='text-primary flex items-center gap-2 hover:underline'
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
            <div className='flex flex-wrap items-center gap-6 text-sm text-gray-400'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                <span>
                  Submitted:{' '}
                  {formatDate(
                    submission.submissionDate ?? submission.submittedAt
                  )}
                </span>
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
              {(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const license = (submission as any).license as
                  | string
                  | undefined;
                return license ? (
                  <span className='rounded border border-gray-700 px-2 py-0.5 text-xs tracking-wide uppercase'>
                    License · {license}
                  </span>
                ) : null;
              })()}
            </div>

            {/* Disqualification Reason */}
            {submission.status === 'DISQUALIFIED' &&
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
