'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CrowdfundingProject } from '@/features/projects/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  ThumbsUp,
  MessageCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Calendar,
  Coins,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import TimelineStepper from './TimelineStepper';
import { useWalletProtection } from '@/hooks/use-wallet-protection';
import WalletRequiredModal from '@/components/wallet/WalletRequiredModal';
import CommentModal from '@/components/comment/modal';

interface ValidationFlowProps {
  project: CrowdfundingProject;
  onVote?: (projectId: string) => void;
  onComment?: (projectId: string, comment: string) => void;
  onReact?: (commentId: string, reaction: string) => void;
  onSuccess?: () => void;
}

const ValidationFlow: React.FC<ValidationFlowProps> = ({ project, onVote }) => {
  const [voteCount, setVoteCount] = useState(12);
  const [commentCount] = useState(4);
  const [hasVoted, setHasVoted] = useState(false);
  const [daysLeft] = useState(12);
  const [expandedMilestones, setExpandedMilestones] = useState<number[]>([]);

  const {
    requireWallet,
    showWalletModal,
    handleWalletConnected,
    closeWalletModal,
  } = useWalletProtection({
    actionName: 'vote on project',
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'under_review':
        return 'bg-[#865503] text-[#FEF6E7]';
      case 'approved':
        return 'bg-[#04326B] text-[#E3EFFC]';
      case 'rejected':
        return 'bg-[#F2BCBA] text-[#BA110B]';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'under_review':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const handleVote = () => {
    requireWallet(() => {
      if (hasVoted) {
        setVoteCount(prev => prev - 1);
        setHasVoted(false);
      } else {
        setVoteCount(prev => prev + 1);
        setHasVoted(true);
      }
      onVote?.(project.id);
    });
  };

  const toggleMilestone = (milestoneIndex: number) => {
    setExpandedMilestones(prev =>
      prev.includes(milestoneIndex)
        ? prev.filter(i => i !== milestoneIndex)
        : [...prev, milestoneIndex]
    );
  };

  const milestones = [
    {
      title: 'Milestone 1',
      name: 'Prototype & Smart Contract Setup',
      description:
        'Develop a functional UI prototype for the crowdfunding and grant flow. Simultaneously, implement and test Soroban smart contracts for escrow logic, milestone validation, and secure fund handling.',
      date: 'October 10, 2025',
      amount: '$29,000.00',
    },
    {
      title: 'Milestone 2',
      name: 'Campaign & Grant Builder Integration',
      description:
        'Integrate campaign creation tools and grant builder functionality into the platform with advanced features and user management.',
      date: 'November 15, 2025',
      amount: '$45,000.00',
    },
    {
      title: 'Milestone 3',
      name: 'Platform Launch & Community Building',
      description:
        'Launch the platform to the public and build a strong community of users and contributors with marketing and partnership initiatives.',
      date: 'December 20, 2025',
      amount: '$49,000.00',
    },
  ];

  return (
    <div>
      <div className='flex w-[500px] flex-col gap-3 space-y-6 pt-3 pb-6'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center space-x-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#2A2A2A]'>
              <svg
                className='h-6 w-6 text-[#B5B5B5]'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div>
              <h3 className='font-medium text-[#F5F5F5]'>Collins Odumeje</h3>
              <h1 className='flex items-center text-2xl font-bold text-[#F5F5F5]'>
                {project.title}
                <div className='w-4' />
                <Badge
                  className={cn(
                    'px-3 py-1 text-sm font-medium',
                    getStatusColor(project.status)
                  )}
                >
                  {getStatusText(project.status)}
                </Badge>
              </h1>
            </div>
          </div>
        </div>

        <div>
          <h2 className='mb-2 text-3xl font-bold'>
            <span className='text-[#F5F5F5]'>
              ${project.funding?.goal.toLocaleString()}
            </span>
            <span className='text-[#B5B5B5]'>.00</span>
          </h2>
        </div>

        <div>
          <p className='text-base leading-relaxed text-[#F5F5F5]'>
            {project.description}
          </p>
        </div>

        <div className='flex justify-center'>
          <Image
            src='https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png'
            alt='Boundless Logo'
            width={500}
            height={280}
            className='rounded-xl'
          />
        </div>

        <div>
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='font-medium text-[#F5F5F5]'>Vote count</h3>
            <span className='text-sm text-[#F5F5F5]'>
              {voteCount} <span className='text-[#B5B5B5]'>of</span> 100 votes
            </span>
          </div>
          <Progress value={(voteCount / 100) * 100} className='mb-4 h-2' />

          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Button
                variant='outline'
                onClick={handleVote}
                className='flex items-center space-x-2 border-[#2B2B2B] bg-[#212121] text-[#F5F5F5] hover:bg-[#2A2A2A]'
              >
                <ThumbsUp
                  className={cn(
                    'h-4 w-4',
                    hasVoted ? 'fill-white' : 'fill-transparent'
                  )}
                />
                <span className='font-semibold'>{voteCount}</span>
              </Button>

              <CommentModal
                onCommentSubmit={() => {
                  // TODO: Handle comment submission
                }}
              >
                <Button
                  variant='outline'
                  className='flex items-center space-x-2 border-[#2B2B2B] bg-[#212121] text-[#F5F5F5] hover:bg-[#2A2A2A]'
                >
                  <MessageCircle className='h-4 w-4 fill-transparent' />
                  <span className='font-semibold'>{commentCount}</span>
                </Button>
              </CommentModal>
            </div>

            <div className='flex items-center space-x-2 text-sm text-[#B5B5B5]'>
              <Clock className='h-4 w-4' />
              <span>{daysLeft} days left</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className='mb-4 text-base font-semibold text-[#F5F5F5]'>
            Milestones
          </h3>

          <div className='space-y-3'>
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className='overflow-hidden rounded-xl border border-[#2B2B2B]'
              >
                <button
                  onClick={() => toggleMilestone(index)}
                  className='flex w-full items-center justify-between bg-[#2A2A2A] p-4 text-[#F5F5F5] transition-colors hover:bg-[#2A2A2A]/80'
                >
                  <div className='text-left'>
                    <h4 className='mb-1 text-xs font-medium text-[#B5B5B5]'>
                      {milestone.title}
                    </h4>
                    <span className='text-sm font-medium'>
                      {milestone.name}
                    </span>
                  </div>
                  {expandedMilestones.includes(index) ? (
                    <ChevronUp className='h-4 w-4' />
                  ) : (
                    <ChevronDown className='h-4 w-4' />
                  )}
                </button>

                {expandedMilestones.includes(index) && (
                  <div className='border-t border-[#2B2B2B] bg-[#1A1A1A] p-4'>
                    <p className='mb-4 text-sm text-[#B5B5B5]'>
                      {milestone.description}
                    </p>
                    <div className='flex items-center justify-between text-sm text-[#B5B5B5]'>
                      <div className='flex items-center space-x-2'>
                        <Calendar className='h-4 w-4' />
                        <span>{milestone.date}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Coins className='h-4 w-4' />
                        <span>{milestone.amount}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className='mb-4 font-medium text-[#F5F5F5]'>Timeline</h3>
          <TimelineStepper project={project} />
        </div>
      </div>

      <WalletRequiredModal
        open={showWalletModal}
        onOpenChange={closeWalletModal}
        actionName='vote on project'
        onWalletConnected={handleWalletConnected}
      />
    </div>
  );
};

export default ValidationFlow;
