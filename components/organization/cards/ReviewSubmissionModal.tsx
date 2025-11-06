'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  MessageSquare,
  ThumbsUp,
  Heart,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerPlayButton,
  VideoPlayerSeekBackwardButton,
  VideoPlayerSeekForwardButton,
  VideoPlayerTimeRange,
  VideoPlayerTimeDisplay,
  VideoPlayerMuteButton,
  VideoPlayerVolumeRange,
} from '@/components/ui/shadcn-io/video-player';
import SubmissionActionButtons from './SubmissionActionButtons';
import RejectSubmissionModal from './RejectSubmissionModal';
import Link from 'next/link';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  username?: string;
}

interface Voter {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  votedAt?: string;
  voteType?: 'positive' | 'negative';
}

interface Comment {
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
}

interface Submission {
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
  teamMembers?: TeamMember[];
  links?: Array<{ type: string; url: string }>;
  voters?: Voter[];
  commentsList?: Comment[];
}

interface ReviewSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissions?: Submission[];
  currentIndex?: number;
  onShortlist?: (submissionId: string) => void;
  onDisqualify?: (submissionId: string) => void;
}

export default function ReviewSubmissionModal({
  open,
  onOpenChange,
  submissions = [
    {
      id: '1',
      projectName: 'Binance',
      category: 'Category',
      description:
        'To build a secure, transparent, and trusted digital health ecosystem powered by Sonic blockchain for 280M lives in Indonesia.',
      votes: 200,
      comments: 1000,
      submissionDate: '12 Oct, 2025',
      videoUrl: 'https://www.youtube.com/watch?v=1kMn8EZCmXM',
      introduction:
        'Bitmed is redefining healthcare access and trust through blockchain technology. By leveraging the speed and scalability of Sonic blockchain, Bitmed ensures that health data, patient records, and transactions remain tamper-proof, accessible, and transparent for all stakeholders in the healthcare ecosystem.',
      logo: '/bitmed.png',
      teamMembers: [
        {
          id: '1',
          name: "Creator's Name",
          role: 'TEAM LEAD',
          avatar: 'https://github.com/shadcn.png',
          username: 'verydarkman',
        },
        {
          id: '2',
          name: "Creator's Name",
          role: 'Member',
          avatar: 'https://github.com/shadcn.png',
          username: 'verydarkman',
        },
        {
          id: '3',
          name: "Creator's Name",
          role: 'Member',
          avatar: 'https://github.com/shadcn.png',
          username: 'verydarkman',
        },
        {
          id: '4',
          name: "Creator's Name",
          role: 'Member',
          avatar: 'https://github.com/shadcn.png',
          username: 'verydarkman',
        },
        {
          id: '5',
          name: "Creator's Name",
          role: 'Member',
          avatar: 'https://github.com/shadcn.png',
          username: 'verydarkman',
        },
      ],
      links: [
        { type: 'github', url: 'https://github.com' },
        { type: 'website', url: 'https://example.com' },
      ],
      voters: [
        {
          id: '1',
          name: 'John Doe',
          username: 'johndoe',
          avatar: 'https://github.com/shadcn.png',
          votedAt: '2025-01-15T10:30:00Z',
          voteType: 'positive',
        },
        {
          id: '2',
          name: 'Jane Smith',
          username: 'janesmith',
          avatar: 'https://github.com/shadcn.png',
          votedAt: '2025-01-14T15:20:00Z',
          voteType: 'positive',
        },
        {
          id: '3',
          name: 'Bob Johnson',
          username: 'bobjohnson',
          avatar: 'https://github.com/shadcn.png',
          votedAt: '2025-01-13T09:15:00Z',
          voteType: 'negative',
        },
      ],
      commentsList: [
        {
          id: '1',
          content:
            'This is an amazing project! The blockchain integration looks solid and the use case is very relevant.',
          author: {
            name: 'Alice Williams',
            username: 'alicew',
            avatar: 'https://github.com/shadcn.png',
          },
          createdAt: '2025-01-15T11:00:00Z',
          reactions: {
            thumbsUp: 12,
            heart: 3,
          },
        },
        {
          id: '2',
          content:
            'I have some concerns about the scalability. How will this handle 280M users?',
          author: {
            name: 'Charlie Brown',
            username: 'charlieb',
            avatar: 'https://github.com/shadcn.png',
          },
          createdAt: '2025-01-14T16:30:00Z',
          reactions: {
            thumbsUp: 5,
          },
        },
        {
          id: '3',
          content:
            'Great presentation! The video was very informative. Looking forward to seeing this in action.',
          author: {
            name: 'Diana Prince',
            username: 'dianap',
            avatar: 'https://github.com/shadcn.png',
          },
          createdAt: '2025-01-13T14:20:00Z',
          reactions: {
            thumbsUp: 8,
            heart: 2,
          },
        },
      ],
    },
  ],
  currentIndex = 0,
  onShortlist,
  onDisqualify,
}: ReviewSubmissionModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [currentSubmissionIndex, setCurrentSubmissionIndex] =
    useState(currentIndex);
  const [isDisqualifyModalOpen, setIsDisqualifyModalOpen] = useState(false);

  // Update index when submissions array changes (e.g., after shortlisting/rejecting)
  useEffect(() => {
    // If current index is out of bounds, adjust it
    if (
      currentSubmissionIndex >= submissions.length &&
      submissions.length > 0
    ) {
      setCurrentSubmissionIndex(submissions.length - 1);
    } else if (submissions.length === 0) {
      onOpenChange(false);
    }
  }, [submissions.length, currentSubmissionIndex, onOpenChange]);

  // Reset to details tab when submission changes
  useEffect(() => {
    setActiveTab('details');
  }, [currentSubmissionIndex]);

  const currentSubmission = submissions[currentSubmissionIndex];
  const canGoPrev = currentSubmissionIndex > 0;
  const canGoNext = currentSubmissionIndex < submissions.length - 1;

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentSubmissionIndex(currentSubmissionIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentSubmissionIndex(currentSubmissionIndex + 1);
    }
  };

  const handleShortlist = () => {
    if (currentSubmission && onShortlist) {
      const submissionId = currentSubmission.id;

      // Call the shortlist callback (marks submission as SHORTLISTED for judging)
      onShortlist(submissionId);

      // Show success toast (non-intrusive, shorter duration)
      toast.success('Submission added to shortlist', {
        duration: 1500,
      });

      // Don't auto-navigate - let organizer decide when to move to next
      // They may want to review the shortlisted submission or reconsider
    }
  };

  const handleDisqualifyClick = () => {
    setIsDisqualifyModalOpen(true);
  };

  const handleDisqualifyConfirm = () => {
    if (currentSubmission && onDisqualify) {
      // Call the disqualify callback with optional comment
      // This should mark submission as DISQUALIFIED (soft delete, not permanent)
      onDisqualify(currentSubmission.id);

      // Show success toast
      toast.success('Submission marked as disqualified', {
        duration: 1500,
      });
    }
  };

  if (!currentSubmission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='bg-background-card max-h-[90vh] w-full !max-w-7xl overflow-hidden border-gray-900 p-0'
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className='flex flex-row items-center justify-between p-6 pb-0'>
          <div className='flex items-center gap-4'>
            <DialogClose asChild>
              <Button
                variant='ghost'
                size='icon'
                className='border border-gray-800 text-gray-500 hover:bg-gray-800'
              >
                <X className='h-5 w-5' />
              </Button>
            </DialogClose>
          </div>

          <div className='flex items-center gap-3'>
            {/* Carousel Navigation */}
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={handlePrev}
                disabled={!canGoPrev}
                className='text-white hover:bg-gray-800 disabled:opacity-50'
              >
                <ChevronLeft className='h-5 w-5' />
              </Button>
              <span className='text-sm text-gray-400'>
                {currentSubmissionIndex + 1} / {submissions.length}
              </span>
              <Button
                variant='ghost'
                size='icon'
                onClick={handleNext}
                disabled={!canGoNext}
                className='text-white hover:bg-gray-800 disabled:opacity-50'
              >
                <ChevronRight className='h-5 w-5' />
              </Button>
            </div>

            <Button
              variant='outline'
              className='gap-2 border-gray-800 text-gray-500 hover:bg-gray-800'
            >
              Open
              <ArrowUpRight className='h-4 w-4' />
            </Button>
          </div>
        </DialogHeader>

        <div className='flex flex-1 overflow-hidden'>
          {/* Left Column - Submission & Team Details */}
          <div className='w-1/2 overflow-y-auto px-4'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='h-16 w-16'>
                <Image
                  src={currentSubmission.logo || '/bitmed.png'}
                  alt={currentSubmission.projectName}
                  width={64}
                  height={64}
                  className='h-full w-full rounded-lg object-cover'
                />
              </div>
              <div className='flex-1'>
                <div className='mb-1 flex items-center gap-2'>
                  <h3 className='text-lg font-medium text-white'>
                    {currentSubmission.projectName}
                  </h3>
                  <Badge className='bg-office-brown text-office-brown-darker border-office-brown-darker rounded-[4px] border px-2 py-0.5 text-xs font-medium'>
                    {currentSubmission.category}
                  </Badge>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-400'>
                  <span>{currentSubmission.votes} Votes</span>
                  <div className='h-4 w-px bg-gray-900' />
                  <span>
                    {currentSubmission.comments.toLocaleString()}+ Comments
                  </span>
                </div>
              </div>
            </div>

            <p className='mb-6 text-sm text-gray-500'>
              {currentSubmission.description}
            </p>

            {/* Team Section */}
            {currentSubmission.teamMembers &&
              currentSubmission.teamMembers.length > 0 && (
                <div>
                  <h4 className='mb-4 text-sm font-semibold text-gray-500 uppercase'>
                    TEAM
                  </h4>
                  <ScrollArea className='h-[400px] pr-4'>
                    <div className='space-y-3'>
                      {currentSubmission.teamMembers.map(member => (
                        <div
                          key={member.id}
                          className='group flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-900/50'
                        >
                          <Avatar className='h-10 w-10 flex-shrink-0'>
                            <AvatarImage
                              src={member.avatar}
                              alt={member.name}
                            />
                            <AvatarFallback>
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className='min-w-0 flex-1'>
                            <p className='text-sm font-medium text-white'>
                              {member.name}
                            </p>
                            {member.username && (
                              <p className='text-xs text-gray-400'>
                                @{member.username}
                              </p>
                            )}
                            <p
                              className={cn(
                                'mt-1 text-xs',
                                member.role.toLowerCase() === 'team lead'
                                  ? 'text-warning-600 font-medium'
                                  : 'text-gray-500'
                              )}
                            >
                              {member.role}
                            </p>
                          </div>
                          <ChevronRight className='h-5 w-5 flex-shrink-0 text-white opacity-0 transition-opacity group-hover:opacity-100' />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
          </div>

          {/* Right Column - Project Content */}
          <div className='relative flex w-1/2 flex-col px-4'>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='flex min-h-0 w-full flex-1 flex-col'
            >
              <TabsList className='mb-6 h-auto w-full flex-shrink-0 rounded-none border-b border-gray-900 bg-transparent p-0'>
                <TabsTrigger
                  value='details'
                  className={cn(
                    'data-[state=active]:border-primary rounded-none border-0 border-b-2 border-transparent text-gray-400 data-[state=active]:bg-transparent data-[state=active]:text-white',
                    'px-0 py-2'
                  )}
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value='links'
                  className={cn(
                    'data-[state=active]:border-primary rounded-none border-0 border-b-2 border-transparent text-gray-400 data-[state=active]:bg-transparent data-[state=active]:text-white',
                    'px-4 py-2'
                  )}
                >
                  Links
                </TabsTrigger>
                <TabsTrigger
                  value='votes'
                  className={cn(
                    'data-[state=active]:border-primary rounded-none border-0 border-b-2 border-transparent text-gray-400 data-[state=active]:bg-transparent data-[state=active]:text-white',
                    'px-4 py-2'
                  )}
                >
                  Votes ({currentSubmission.votes})
                </TabsTrigger>
                <TabsTrigger
                  value='comments'
                  className={cn(
                    'data-[state=active]:border-primary rounded-none border-0 border-b-2 border-transparent text-gray-400 data-[state=active]:bg-transparent data-[state=active]:text-white',
                    'px-4 py-2'
                  )}
                >
                  Comments ({currentSubmission.comments.toLocaleString()}+)
                </TabsTrigger>
              </TabsList>

              {/* Scrollable Tabs Content Area */}
              <div className='min-h-0 flex-1 overflow-y-auto pb-24'>
                <TabsContent value='details' className='mt-0'>
                  <div className='space-y-6'>
                    {/* Video Section */}
                    <div>
                      <h4 className='mb-4 text-base font-medium text-white'>
                        How {currentSubmission.projectName} Works in 2 Minutes
                      </h4>
                      <div className='relative h-[250px] overflow-hidden rounded-lg border border-gray-800 bg-gray-900'>
                        {currentSubmission.videoUrl ? (
                          (() => {
                            // Check if it's a YouTube URL
                            const isYouTube =
                              /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/.test(
                                currentSubmission.videoUrl
                              );

                            if (isYouTube) {
                              // Convert YouTube URL to embed format
                              const getYouTubeEmbedUrl = (url: string) => {
                                const regExp =
                                  /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                const match = url.match(regExp);
                                const videoId =
                                  match && match[2].length === 11
                                    ? match[2]
                                    : null;
                                return videoId
                                  ? `https://www.youtube.com/embed/${videoId}`
                                  : url;
                              };

                              return (
                                <iframe
                                  src={getYouTubeEmbedUrl(
                                    currentSubmission.videoUrl
                                  )}
                                  className='h-full w-full rounded-lg'
                                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                  allowFullScreen
                                />
                              );
                            } else {
                              // Use VideoPlayer for direct video URLs
                              return (
                                <VideoPlayer className='relative h-full w-full rounded-lg'>
                                  <VideoPlayerContent
                                    src={currentSubmission.videoUrl}
                                    className='h-full w-full rounded-lg object-cover'
                                  />
                                  <VideoPlayerControlBar className='absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-2'>
                                    <VideoPlayerSeekBackwardButton />
                                    <VideoPlayerPlayButton />
                                    <VideoPlayerSeekForwardButton />
                                    <VideoPlayerTimeRange />
                                    <VideoPlayerTimeDisplay />
                                    <VideoPlayerMuteButton />
                                    <VideoPlayerVolumeRange />
                                  </VideoPlayerControlBar>
                                </VideoPlayer>
                              );
                            }
                          })()
                        ) : (
                          <div className='flex h-full w-full flex-col items-center justify-center p-8 text-center'>
                            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20'>
                              <X className='h-8 w-8 text-red-500' />
                            </div>
                            <p className='mb-2 text-sm text-white'>
                              Watch video on YouTube
                            </p>
                            <p className='text-xs text-gray-400'>Error 153</p>
                            <p className='mt-1 text-xs text-gray-500'>
                              Video player configuration error
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Introduction Section */}
                    <div>
                      <h4 className='mb-3 text-base font-medium text-white'>
                        Introduction
                      </h4>
                      <p className='text-sm leading-relaxed text-gray-400'>
                        {currentSubmission.introduction ||
                          currentSubmission.description}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='links' className='mt-0'>
                  <div className='space-y-3'>
                    {currentSubmission.links &&
                    currentSubmission.links.length > 0 ? (
                      currentSubmission.links.map((link, index) => (
                        <Link
                          key={index}
                          href={link.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center justify-between rounded-lg border border-gray-800 p-4 capitalize transition-colors hover:bg-gray-900/50'
                        >
                          <span className='flex items-center gap-2'>
                            {link.type === 'github' ? (
                              <Image
                                src='/footer/github.svg'
                                width={16}
                                height={16}
                                alt='GitHub'
                              />
                            ) : link.type === 'twitter' ? (
                              <Image
                                src='/footer/twitter.svg'
                                width={16}
                                height={16}
                                alt='Twitter'
                              />
                            ) : (
                              <Image
                                src='/globe.svg'
                                width={16}
                                height={16}
                                alt='Website'
                              />
                            )}
                            <span className='text-sm text-white'>
                              {link.type}
                            </span>
                          </span>
                          <ArrowUpRight className='h-4 w-4 text-gray-400' />
                        </Link>
                      ))
                    ) : (
                      <p className='text-sm text-gray-400'>
                        No links available
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value='votes' className='mt-0'>
                  <div className='space-y-3'>
                    {currentSubmission.voters &&
                    currentSubmission.voters.length > 0 ? (
                      currentSubmission.voters.map(voter => (
                        <div
                          key={voter.id}
                          className='group flex cursor-pointer items-center justify-between rounded-lg border border-gray-800 p-3 transition-colors hover:bg-gray-900/50'
                        >
                          <div className='flex min-w-0 flex-1 items-center gap-3'>
                            <Avatar className='h-10 w-10 flex-shrink-0'>
                              <AvatarImage
                                src={voter.avatar}
                                alt={voter.name}
                              />
                              <AvatarFallback>
                                {voter.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className='min-w-0 flex-1'>
                              <p className='truncate text-sm font-medium text-white'>
                                {voter.name}
                              </p>
                              <p className='truncate text-xs text-gray-400'>
                                @{voter.username}
                              </p>
                              {voter.votedAt && (
                                <p className='mt-0.5 text-xs text-gray-500'>
                                  {new Date(voter.votedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className='flex flex-shrink-0 items-center gap-2'>
                            {voter.voteType === 'positive' ? (
                              <ThumbsUp className='h-4 w-4 text-green-500' />
                            ) : (
                              <ThumbsUp className='h-4 w-4 rotate-180 text-red-500' />
                            )}
                            <ChevronRight className='h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100' />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className='py-12 text-center'>
                        <ThumbsUp className='mx-auto mb-4 h-12 w-12 text-gray-600' />
                        <p className='text-sm text-gray-400'>No votes yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value='comments' className='mt-0'>
                  <div className='space-y-4'>
                    {currentSubmission.commentsList &&
                    currentSubmission.commentsList.length > 0 ? (
                      currentSubmission.commentsList.map(comment => (
                        <div
                          key={comment.id}
                          className='flex gap-3 rounded-lg border border-gray-800 p-4 transition-colors hover:bg-gray-900/30'
                        >
                          <Avatar className='h-10 w-10 flex-shrink-0'>
                            <AvatarImage
                              src={comment.author.avatar}
                              alt={comment.author.name}
                            />
                            <AvatarFallback>
                              {comment.author.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className='min-w-0 flex-1'>
                            <div className='mb-1 flex items-center gap-2'>
                              <p className='text-sm font-medium text-white'>
                                {comment.author.name}
                              </p>
                              <p className='text-xs text-gray-400'>
                                @{comment.author.username}
                              </p>
                              <span className='text-xs text-gray-500'>
                                {new Date(
                                  comment.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className='text-sm break-words whitespace-pre-wrap text-gray-300'>
                              {comment.content}
                            </p>
                            {comment.reactions && (
                              <div className='mt-2 flex items-center gap-4'>
                                {comment.reactions.thumbsUp !== undefined &&
                                  comment.reactions.thumbsUp > 0 && (
                                    <div className='flex items-center gap-1 text-xs text-gray-400'>
                                      <ThumbsUp className='h-3 w-3' />
                                      <span>{comment.reactions.thumbsUp}</span>
                                    </div>
                                  )}
                                {comment.reactions.heart !== undefined &&
                                  comment.reactions.heart > 0 && (
                                    <div className='flex items-center gap-1 text-xs text-gray-400'>
                                      <Heart className='h-3 w-3' />
                                      <span>{comment.reactions.heart}</span>
                                    </div>
                                  )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className='py-12 text-center'>
                        <MessageSquare className='mx-auto mb-4 h-12 w-12 text-gray-600' />
                        <p className='text-sm text-gray-400'>No comments yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>

              {/* Fixed Action Buttons at Bottom */}
              <div className='bg-background-card absolute right-0 bottom-0 left-0 p-6'>
                <SubmissionActionButtons
                  onDisqualify={handleDisqualifyClick}
                  onShortlist={handleShortlist}
                />
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>

      {/* Disqualify Confirmation Modal */}
      <RejectSubmissionModal
        open={isDisqualifyModalOpen}
        onOpenChange={setIsDisqualifyModalOpen}
        submissionName={currentSubmission?.projectName}
        onConfirm={handleDisqualifyConfirm}
      />
    </Dialog>
  );
}
