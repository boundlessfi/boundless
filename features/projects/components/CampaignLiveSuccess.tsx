'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Share2,
  ThumbsUp,
  MessageCircle,
  Users,
  Clock,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

import { CampaignDetails } from '@/lib/api/types';
import { generateCampaignLink } from '@/features/projects/api';

import { toast } from 'sonner';
import ShareCampaignModal from './ShareCampaignModal';

interface CampaignLiveSuccessProps {
  campaignDetails: CampaignDetails;
  onBackToDashboard: () => void;
}

const CampaignLiveSuccess: React.FC<CampaignLiveSuccessProps> = ({
  campaignDetails,
  onBackToDashboard,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState<string>('');
  const [expandedMilestones, setExpandedMilestones] = useState<number[]>([]);

  const handleShare = async () => {
    try {
      const response = await generateCampaignLink(campaignDetails.id);
      const linkData = response as {
        success: boolean;
        data: { shareLink: string };
      };
      setShareLink(linkData.data.shareLink);
      setShowShareModal(true);
    } catch {
      toast.error('Failed to generate share link');
    }
  };

  return (
    <div className='mx-auto max-w-4xl space-y-6'>
      <div className='space-y-4 text-center'>
        <h1 className='mb-2 text-xl text-[#F5F5F5]'>Your Campaign is Live!</h1>
        <Image src='/check.png' alt='check' className='mx-auto h-20 w-20' />
        <p className='font-inter mx-auto max-w-2xl text-lg leading-relaxed text-[#B5B5B5]'>
          Your campaign has been successfully launched. Backers can now fund it,
          and your milestone progress will be tracked automatically.{' '}
          <span className='text-primary underline'>View Campaign</span>
        </p>
      </div>

      <div className='flex justify-center gap-4'>
        <Button
          onClick={onBackToDashboard}
          className='bg-primary text-background hover:bg-primary/90 px-6 font-medium md:font-semibold'
        >
          Back to Dashboard
        </Button>
        <Button
          onClick={handleShare}
          className='border-[#2B2B2B] bg-white/30 font-medium text-[#F5F5F5] hover:bg-[#2A2A2A] md:font-semibold'
        >
          Share
          <Share2 className='ml-2 h-4 w-4' />
        </Button>
      </div>

      <div className='p-6'>
        <div className='mb-6 flex items-center justify-between'>
          <h3 className='text-xl font-medium text-[#F5F5F5]'>Preview</h3>
          <ChevronUp className='h-5 w-5 text-[#B5B5B5]' />
        </div>

        <div className='relative mb-6 flex h-60 w-full items-center justify-center rounded-lg bg-gradient-to-br from-teal-800 to-teal-900'>
          <Image
            src={campaignDetails.thumbnail}
            alt={campaignDetails.title}
            fill
            className='rounded-lg object-cover'
          />
        </div>

        <div className='mb-4 flex items-center gap-4'>
          <h2 className='text-2xl font-bold text-[#F5F5F5]'>
            {campaignDetails.title}
          </h2>
          <Badge className='bg-red-500 px-2 py-1 text-sm text-white'>
            Live
          </Badge>
        </div>

        <div className='mb-6 flex items-center space-x-3'>
          <div className='relative'>
            <Image
              src='/profile.png'
              alt='profile'
              className='h-20 w-20 rounded-full'
            />
            <Image
              src='/verify.png'
              alt='verify'
              className='absolute -right-1 -bottom-1 h-8 w-8'
            />
          </div>
          <span className='text-lg text-[#B5B5B5]'>
            {campaignDetails.creator.name}
          </span>
        </div>

        <div className='mb-4 flex justify-between'>
          <div className='text-center'>
            <p className='mb-1 text-sm text-[#B5B5B5]'>Raised</p>
            <p className='text-xl font-bold text-[#F5F5F5]'>
              ${campaignDetails.raisedAmount.toLocaleString()}.00
            </p>
          </div>
          <div className='text-center'>
            <p className='mb-1 text-sm text-[#B5B5B5]'>Target</p>
            <p className='text-xl font-bold text-[#F5F5F5]'>
              ${campaignDetails.amount.toLocaleString()}.00
            </p>
          </div>
        </div>

        <div className='mb-6'>
          <div className='mb-4 h-2 w-full rounded-full bg-[#2A2A2A]'>
            <div
              className='bg-primary h-2 rounded-full transition-all duration-300'
              style={{
                width: `${Math.min((campaignDetails.raisedAmount / campaignDetails.amount) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className='flex w-full items-center justify-between font-semibold'>
          <div className='flex items-center space-x-3'>
            <div className='flex items-center space-x-2 rounded-lg bg-[#212121] p-2'>
              <ThumbsUp className='h-4 w-4 text-[#B5B5B5]' />
              <span className='text-sm text-[#F5F5F5]'>
                {campaignDetails.engagement.likes}
              </span>
            </div>
            <div className='flex items-center space-x-2 rounded-lg bg-[#212121] p-2'>
              <MessageCircle className='h-4 w-4 text-[#B5B5B5]' />
              <span className='text-sm text-[#F5F5F5]'>
                {campaignDetails.engagement.comments}
              </span>
            </div>
          </div>
          <div className='flex items-center space-x-2 border-x border-gray-900 px-6'>
            <Users className='h-4 w-4 text-[#B5B5B5]' />
            <span className='text-sm text-[#F5F5F5]'>
              {campaignDetails.engagement.backers} Backers
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <Clock className='h-4 w-4 text-[#B5B5B5]' />
            <span className='text-sm text-[#F5F5F5]'>
              {campaignDetails.engagement.daysLeft} days left
            </span>
          </div>
        </div>
      </div>

      <div className='mb-6'>
        <h4 className='mb-3 text-lg font-medium text-[#F5F5F5]'>
          Campaign Details
        </h4>
        <div className=''>
          <p className='text-lg leading-relaxed text-[#B5B5B5]'>
            {campaignDetails.description}
          </p>
        </div>
      </div>

      <div className='mb-6'>
        <h4 className='mb-3 text-lg font-medium text-[#F5F5F5]'>Tags</h4>
        <div className='flex space-x-2'>
          {campaignDetails.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className='text-sm text-[#B5B5B5]'>
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className='mb-6'>
        <h4 className='mb-3 text-lg font-medium text-[#F5F5F5]'>
          Campaign Photos
        </h4>
        <div className='flex space-x-3'>
          {[1, 2, 3, 4].map(index => (
            <Image
              key={index}
              src='/campaign-pics.png'
              alt={`Campaign photo ${index}`}
              width={64}
              height={64}
              className='h-40 w-40 object-cover'
            />
          ))}
        </div>
      </div>

      <div className='mb-6'>
        <h4 className='mb-3 text-lg font-medium text-[#F5F5F5]'>Milestones</h4>
        <div className='space-y-2'>
          {[
            {
              title: 'Prototype & Smart Contract Setup',
              description:
                'Initial development phase with smart contract implementation',
            },
            {
              title: 'Campaign & Grant Builder Integration',
              description:
                'Integration of campaign management and grant building features',
            },
            {
              title: 'Platform Launch & Community Building',
              description:
                'Final platform launch and community engagement phase',
            },
          ].map((milestone, index) => {
            const isExpanded = expandedMilestones.includes(index);
            return (
              <div
                key={index}
                className='overflow-hidden rounded-lg bg-[#2A2A2A]'
              >
                <div
                  className='flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-[#3A3A3A]'
                  onClick={() => {
                    setExpandedMilestones(prev =>
                      isExpanded
                        ? prev.filter(i => i !== index)
                        : [...prev, index]
                    );
                  }}
                >
                  <span className='text-sm font-medium text-[#F5F5F5]'>
                    Milestone {index + 1}: {milestone.title}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#B5B5B5] transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {isExpanded && (
                  <div className='px-3 pb-3'>
                    <p className='mt-2 text-sm text-[#B5B5B5]'>
                      {milestone.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className='mb-6'>
        <div className='mb-3 flex items-center justify-between border-t border-[#2A2A2A] pt-4'>
          <h4 className='text-lg font-medium text-[#F5F5F5]'>
            Funding History
          </h4>
          <span className='cursor-pointer text-sm text-[#B5B5B5]'>
            View all &gt;
          </span>
        </div>
        <div className='py-8 text-center'>
          <Image
            src='/nobackers.png'
            alt='no backers'
            className='mx-auto h-20 w-20'
          />
          <p className='mb-2 text-lg font-medium text-[#F5F5F5]'>
            No backers for now
          </p>
          <p className='mx-auto max-w-md text-sm text-[#B5B5B5]'>
            Get the word out and attract your first backers. Every share brings
            you closer to your funding goal.
          </p>
        </div>
      </div>

      <div className='flex justify-center gap-4'>
        <Button
          onClick={handleShare}
          className='bg-primary hover:bg-primary/90 px-6 font-medium text-black'
        >
          Share Campaign
        </Button>
      </div>

      <ShareCampaignModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        campaignLink={shareLink}
        campaignTitle={campaignDetails.title}
      />
    </div>
  );
};

export default CampaignLiveSuccess;
