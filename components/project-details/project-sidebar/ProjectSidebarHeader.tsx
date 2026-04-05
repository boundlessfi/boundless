'use client';

import { Calendar, Rocket, Trophy, Layers } from 'lucide-react';
import Image from 'next/image';
import { ProjectSidebarHeaderProps } from './types';
import { CampaignStatus } from './utils';
import type { ProjectOrigin } from '@/features/projects/types/view-model';

const ORIGIN_CONFIG: Record<
  ProjectOrigin,
  { label: string; className: string; icon: React.ReactNode }
> = {
  crowdfunding: {
    label: 'Crowdfunding',
    className: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    icon: <Rocket className='h-3 w-3' />,
  },
  hackathon: {
    label: 'Hackathon',
    className: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    icon: <Trophy className='h-3 w-3' />,
  },
  manual: {
    label: 'Project',
    className: 'bg-gray-500/10 border-gray-500/30 text-gray-400',
    icon: <Layers className='h-3 w-3' />,
  },
};

const STATUS_LABELS: Record<string, string> = {
  [CampaignStatus.IDEA]: 'Validation',
  [CampaignStatus.REVIEWING]: 'Reviewing',
  [CampaignStatus.VOTING]: 'Voting',
  [CampaignStatus.CAMPAIGNING]: 'Funding',
  [CampaignStatus.FUNDED]: 'Funded',
  [CampaignStatus.EXECUTING]: 'Executing',
  [CampaignStatus.LIVE]: 'Live',
  [CampaignStatus.COMPLETED]: 'Completed',
  [CampaignStatus.FAILED]: 'Failed',
  [CampaignStatus.CANCELLED]: 'Cancelled',
  [CampaignStatus.DRAFT]: 'Draft',
};

const STATUS_STYLES: Record<string, string> = {
  [CampaignStatus.CAMPAIGNING]:
    'bg-secondary-75 border-secondary-600 text-secondary-600',
  [CampaignStatus.FUNDED]: 'bg-active-bg border-primary text-primary',
  [CampaignStatus.COMPLETED]:
    'bg-success-75 border-success-600 text-success-600',
  [CampaignStatus.IDEA]: 'bg-warning-75 border-warning-600 text-warning-600',
  [CampaignStatus.VOTING]: 'bg-warning-75 border-warning-600 text-warning-600',
  [CampaignStatus.LIVE]: 'bg-active-bg border-primary text-primary',
  [CampaignStatus.REVIEWING]: 'bg-gray-800 border-gray-700 text-white',
  [CampaignStatus.DRAFT]: 'bg-gray-800 border-gray-700 text-white',
  [CampaignStatus.EXECUTING]: 'bg-active-bg border-primary text-primary',
  [CampaignStatus.FAILED]: 'bg-red-500/10 border-red-500/30 text-red-400',
  [CampaignStatus.CANCELLED]: 'bg-gray-800 border-gray-700 text-white/50',
};

export function ProjectSidebarHeader({
  vm,
  projectStatus,
}: ProjectSidebarHeaderProps) {
  const statusStyle =
    STATUS_STYLES[projectStatus] ?? 'text-white border-gray-700';
  const statusLabel = STATUS_LABELS[projectStatus] ?? projectStatus;
  const originCfg = ORIGIN_CONFIG[vm.origin];

  return (
    <div className='space-y-4'>
      <div className='flex gap-4'>
        <div className='relative shrink-0'>
          <div className='from-primary/20 absolute -inset-0.5 rounded-xl bg-gradient-to-br to-transparent opacity-50 blur-sm' />
          <Image
            src={vm.logo || '/placeholder.svg'}
            alt={vm.title}
            width={80}
            height={80}
            className='relative h-16 w-16 rounded-xl object-cover ring-2 ring-gray-800/50 sm:h-20 sm:w-20'
          />
        </div>

        <div className='min-w-0 flex-1 space-y-2'>
          <h1 className='line-clamp-2 text-lg leading-tight font-bold text-white sm:text-xl lg:text-2xl'>
            {vm.title}
          </h1>

          <div className='flex flex-wrap items-center gap-1.5 sm:gap-2'>
            <div
              className={`flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs ${originCfg.className}`}
            >
              {originCfg.icon}
              {originCfg.label}
            </div>
            <div className='rounded-lg border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-400 sm:px-2.5 sm:py-1 sm:text-xs'>
              {vm.category}
            </div>
            <div
              className={`rounded-lg border px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs ${statusStyle}`}
            >
              {statusLabel}
            </div>
          </div>
        </div>
      </div>

      <div className='flex items-center gap-2 rounded-lg border border-gray-800/50 bg-gray-900/30 px-3 py-2'>
        <Calendar className='h-4 w-4 text-gray-400' />
        <span className='text-sm text-gray-300'>
          {new Date(vm.createdAt).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
}
