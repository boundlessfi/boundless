'use client';

import Image from 'next/image';
import { Globe, Github } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CampaignStatus,
  getProjectStatus,
  type CampaignStatusValue,
} from './utils';
import type { ProjectViewModel } from '@/features/projects/types/view-model';
import { ProjectActions } from './project-actions';

interface ProjectDetailsCardProps {
  vm: ProjectViewModel;
  isSubmission?: boolean;
  onRefresh?: () => void;
}

const STATUS_LABELS: Record<CampaignStatusValue, string> = {
  IDEA: 'Idea',
  REVIEWING: 'Reviewing',
  VOTING: 'Voting',
  CAMPAIGNING: 'Funding',
  FUNDED: 'Funded',
  EXECUTING: 'Executing',
  LIVE: 'Live',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
  DRAFT: 'Draft',
};

const NEUTRAL_STATUSES: CampaignStatusValue[] = [
  CampaignStatus.FAILED,
  CampaignStatus.CANCELLED,
  CampaignStatus.DRAFT,
  CampaignStatus.REVIEWING,
];

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

export function ProjectDetailsCard({
  vm,
  isSubmission,
  onRefresh,
}: ProjectDetailsCardProps) {
  const projectStatus = getProjectStatus(vm);
  const statusLabel = STATUS_LABELS[projectStatus] ?? vm.status ?? 'Active';
  const isNeutralStatus = NEUTRAL_STATUSES.includes(projectStatus);

  const raised = vm.campaign?.fundingRaised ?? 0;
  const goal = vm.campaign?.fundingGoal ?? 0;
  const currency = vm.campaign?.fundingCurrency ?? 'USD';
  const percent =
    goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  const tagline = vm.tagline ?? vm.summary ?? '';

  return (
    <div className='border-stepper-border bg-background-card flex h-full w-full flex-col gap-4 rounded-2xl border p-4 sm:p-5'>
      {/* Header — logo + title + status */}
      <div className='flex items-start gap-4'>
        <div className='border-stepper-border bg-primary/15 relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border sm:h-20 sm:w-20'>
          {vm.logo ? (
            <Image
              src={vm.logo}
              alt={`${vm.title} logo`}
              fill
              className='object-cover'
              sizes='80px'
            />
          ) : (
            <span className='text-primary font-display text-2xl font-bold'>
              {vm.title.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className='flex min-w-0 flex-col gap-2 pt-1'>
          <h1 className='text-xl leading-tight font-bold text-white sm:text-2xl'>
            {vm.title}
          </h1>
          <span
            className={cn(
              'inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
              isNeutralStatus
                ? 'border-stepper-border bg-inactive text-gray-400'
                : 'border-primary/30 bg-primary/10 text-primary'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                isNeutralStatus ? 'bg-gray-500' : 'bg-primary'
              )}
            />
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Tagline */}
      {tagline && (
        <div className='border-stepper-border bg-inactive/60 rounded-xl border p-4'>
          <p className='text-sm leading-relaxed text-gray-400'>{tagline}</p>
        </div>
      )}

      {/* Funding progress (campaign only) */}
      {vm.campaign && goal > 0 && (
        <div className='border-stepper-border bg-inactive/60 space-y-3 rounded-xl border p-4'>
          <div className='flex items-baseline justify-between gap-2'>
            <span className='text-primary text-base font-semibold'>
              {formatCurrency(raised, currency)} raised
            </span>
            <span className='text-sm text-gray-500'>{percent}%</span>
          </div>
          <div className='bg-stepper-border relative h-2 w-full overflow-hidden rounded-full'>
            <div
              className='bg-primary absolute inset-y-0 left-0 rounded-full transition-all duration-500'
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className='text-xs text-gray-500'>
            Target: {formatCurrency(goal, currency)}
          </p>
        </div>
      )}

      {/* Actions — Back Project / Follow / Share */}
      <ProjectActions
        vm={vm}
        isSubmission={isSubmission}
        onRefresh={onRefresh}
      />

      <div className='border-stepper-border border-t' />

      {/* Owner row */}
      <div className='flex items-center justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-3'>
          <div className='border-stepper-border bg-inactive relative h-10 w-10 shrink-0 overflow-hidden rounded-full border'>
            {vm.creator.image ? (
              <Image
                src={vm.creator.image}
                alt={vm.creator.name}
                fill
                className='object-cover'
                sizes='40px'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center text-sm font-semibold text-gray-500'>
                {vm.creator.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className='min-w-0'>
            <p className='truncate text-sm font-semibold text-white'>
              {vm.creator.name}
            </p>
            {vm.creator.username && (
              <p className='truncate text-xs text-gray-500'>
                @{vm.creator.username}
              </p>
            )}
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          {vm.projectWebsite && (
            <a
              href={vm.projectWebsite}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Website'
              className='border-stepper-border bg-inactive/40 hover:border-primary/40 hover:text-primary flex h-9 w-9 items-center justify-center rounded-full border text-gray-400 transition-colors'
            >
              <Globe className='h-4 w-4' />
            </a>
          )}
          {vm.githubUrl && (
            <a
              href={vm.githubUrl}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='GitHub'
              className='border-stepper-border bg-inactive/40 hover:border-primary/40 hover:text-primary flex h-9 w-9 items-center justify-center rounded-full border text-gray-400 transition-colors'
            >
              <Github className='h-4 w-4' />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
