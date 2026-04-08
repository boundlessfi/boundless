'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Gem, Globe, Heart, Rocket, ShieldCheck, Users } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FundingModal } from '@/components/project-details/funding-modal';
import { BackerCard, type BackerTier } from './backer-card';
import {
  CampaignStatus,
  normalizeCampaignStatus,
  type Contributor,
} from '@/features/projects/types';
import type { ProjectViewModel } from '@/features/projects/types/view-model';

interface BackersTabProps {
  vm: ProjectViewModel;
}

interface RankedBacker {
  contributor: Contributor;
  tier: BackerTier;
}

function rankBackers(contributors: Contributor[]): RankedBacker[] {
  // Sort by amount desc; assign tiers to the top 3.
  const sorted = [...contributors].sort((a, b) => b.amount - a.amount);
  return sorted.map((contributor, index) => ({
    contributor,
    tier: index === 0 ? 'lead' : index <= 2 ? 'top' : null,
  }));
}

export function BackersTab({ vm }: BackersTabProps) {
  const searchParams = useSearchParams();
  const isSubmission = searchParams.get('type') === 'submission';

  const contributors = vm.campaign?.contributors ?? [];
  const ranked = useMemo(() => rankBackers(contributors), [contributors]);
  const currency = vm.campaign?.fundingCurrency;

  // Only show the funding CTA when the campaign is actually accepting funds.
  // Mirrors the gating used by ProjectActions in the hero card.
  const canBack =
    !isSubmission &&
    !!vm.campaign &&
    normalizeCampaignStatus(vm.status) === CampaignStatus.CAMPAIGNING;

  const handleBackerClick = (backer: Contributor) => {
    // Mirrors legacy ProjectBackers — uses userId for the profile path.
    if (backer.userId) {
      window.open(`/profile/${backer.userId}`, '_blank');
    }
  };

  if (contributors.length === 0) {
    return (
      <BackersEmptyState
        vm={vm}
        isSubmission={isSubmission}
        canBack={canBack}
      />
    );
  }

  return (
    <section className='space-y-8'>
      {/* Header */}
      <header className='space-y-1'>
        <h2 className='text-2xl font-bold text-white'>Project Backers</h2>
        <p className='inline-flex items-center gap-2 text-sm text-gray-500'>
          <Users className='h-4 w-4' />
          {contributors.length}{' '}
          {contributors.length === 1 ? 'backer' : 'backers'} supporting this
          vision
        </p>
      </header>

      {/* Backer cards grid */}
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {ranked.map(({ contributor, tier }) => (
          <BackerCard
            key={`${contributor.userId}-${contributor.transactionHash}`}
            backer={contributor}
            tier={tier}
            currency={currency}
            onClick={handleBackerClick}
          />
        ))}
      </div>

      {/* Join CTA — only when the campaign is actively accepting funds */}
      {canBack && (
        <JoinBackersCard
          vm={vm}
          totalBackers={contributors.length}
          previewBackers={ranked.slice(0, 3).map(r => r.contributor)}
        />
      )}
    </section>
  );
}

/* ─────────────────────── Join backers CTA ─────────────────────── */

function JoinBackersCard({
  vm,
  totalBackers,
  previewBackers,
}: {
  vm: ProjectViewModel;
  totalBackers: number;
  previewBackers: Contributor[];
}) {
  if (!vm.campaign) return null;
  const remaining = Math.max(0, totalBackers - previewBackers.length);

  return (
    <section className='border-primary/30 from-primary/10 via-primary/5 rounded-2xl border bg-linear-to-b to-transparent p-6 text-center sm:p-8'>
      {/* Avatar pile */}
      {previewBackers.length > 0 && (
        <div className='mb-4 flex items-center justify-center'>
          <div className='flex -space-x-3'>
            {previewBackers.map(b => (
              <div
                key={`${b.userId}-${b.transactionHash}`}
                className='border-background-card bg-inactive relative h-10 w-10 overflow-hidden rounded-full border-2'
              >
                <Image
                  src={b.image || '/avatar.png'}
                  alt={b.name || 'Backer'}
                  fill
                  className='object-cover'
                  sizes='40px'
                />
              </div>
            ))}
            {remaining > 0 && (
              <div className='border-background-card bg-inactive flex h-10 w-10 items-center justify-center rounded-full border-2 text-[11px] font-bold text-white'>
                +{remaining}
              </div>
            )}
          </div>
        </div>
      )}

      <h3 className='text-xl font-bold text-white sm:text-2xl'>
        Join {totalBackers} {totalBackers === 1 ? 'other' : 'others'} and back{' '}
        {vm.title}
      </h3>
      <p className='mx-auto mt-2 max-w-lg text-sm leading-relaxed text-gray-400'>
        Support this project and help bring this vision to life.
      </p>

      <div className='mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center'>
        <FundingModal
          campaignId={vm.campaign.campaignId}
          onChainId={vm.campaign.onChainId}
          projectTitle={vm.title}
          currentRaised={vm.campaign.fundingRaised}
          fundingGoal={vm.campaign.fundingGoal}
          escrowAddress={vm.campaign.escrowAddress}
        >
          <Button className='bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 text-sm font-semibold'>
            <Rocket className='mr-2 h-4 w-4' />
            Back this project
          </Button>
        </FundingModal>
      </div>
    </section>
  );
}

/* ───────────────────────── Empty state ────────────────────────── */

function BackersEmptyState({
  vm,
  isSubmission,
  canBack,
}: {
  vm: ProjectViewModel;
  isSubmission: boolean;
  canBack: boolean;
}) {
  return (
    <div className='flex flex-col items-center px-4 py-10 text-center sm:py-16'>
      {/* Decorative gem tile */}
      <div className='border-primary/30 bg-primary/10 shadow-primary/30 relative mb-7 flex h-28 w-28 items-center justify-center rounded-3xl border shadow-[0_0_80px_-10px]'>
        <Gem className='text-primary h-12 w-12' />
        <span className='border-background-main-bg bg-primary text-primary-foreground absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4'>
          <Heart className='h-4 w-4' fill='currentColor' />
        </span>
      </div>

      <h3 className='text-xl font-bold text-white sm:text-2xl'>
        {isSubmission ? 'No backers yet' : 'Be the first to back this project!'}
      </h3>
      <p className='mt-3 max-w-md text-sm leading-relaxed text-gray-500'>
        {isSubmission
          ? `Hackathon submissions don't accept contributions, but you can still vote and follow ${vm.title}.`
          : `Show your support by funding ${vm.title} and help bring this vision to life.`}
      </p>

      {canBack && vm.campaign && (
        <div className='mt-7'>
          <FundingModal
            campaignId={vm.campaign.campaignId}
            onChainId={vm.campaign.onChainId}
            projectTitle={vm.title}
            currentRaised={vm.campaign.fundingRaised}
            fundingGoal={vm.campaign.fundingGoal}
            escrowAddress={vm.campaign.escrowAddress}
          >
            <Button className='bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 text-sm font-semibold'>
              <Rocket className='mr-2 h-4 w-4' />
              Back Project
            </Button>
          </FundingModal>
        </div>
      )}

      {/* Trust footer */}
      <div className='border-stepper-border/60 mt-10 flex w-full max-w-sm flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t pt-5'>
        <span className='inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-gray-600 uppercase'>
          <ShieldCheck className='h-3.5 w-3.5' />
          Secure Escrow
        </span>
        <span className='inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-gray-600 uppercase'>
          <Globe className='h-3.5 w-3.5' />
          Web3 Native
        </span>
      </div>
    </div>
  );
}
