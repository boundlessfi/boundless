'use client';

import { use, useEffect, useState } from 'react';
import { getCrowdfundingProject } from '@/features/projects/api';
import type { Crowdfunding } from '@/features/projects/types';
import {
  normalizeCampaignStatus,
  CampaignStatus,
} from '@/features/projects/types';
import { ContributionsDataTable } from './contributions-data-table';
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { ContributionsMetrics } from '@/components/crowdfunding/contributions-metrics';
import { RefundStatusBadge } from '@/components/crowdfunding/refund-status-badge';
import { getTransactionExplorerUrl } from '@/lib/wallet-utils';

function RefundBanner({ project }: { project: Crowdfunding }) {
  const status = normalizeCampaignStatus(project.project.status);
  const isFailed = status === CampaignStatus.FAILED;
  const isCancelled = status === CampaignStatus.CANCELLED;
  if (!isFailed && !isCancelled) return null;

  const contributors = project.contributors ?? [];
  const refundedCount = contributors.filter(
    c => c.refundStatus === 'PROCESSED'
  ).length;
  const totalCount = contributors.length;
  const refundProgress =
    totalCount > 0 ? (refundedCount / totalCount) * 100 : 0;

  return (
    <div
      className={`mb-6 rounded-xl border p-5 ${
        isFailed
          ? 'border-red-500/30 bg-red-500/10'
          : 'border-white/10 bg-white/5'
      }`}
    >
      <div className='flex items-start gap-3'>
        {isFailed ? (
          <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-red-400' />
        ) : (
          <Ban className='mt-0.5 h-5 w-5 shrink-0 text-white/40' />
        )}
        <div className='flex-1 space-y-4'>
          <div>
            <h3
              className={`font-semibold ${isFailed ? 'text-red-400' : 'text-white/70'}`}
            >
              Campaign {isFailed ? 'Failed' : 'Cancelled'} — Refunds
            </h3>
            <p className='mt-1 text-sm text-white/60'>
              {isFailed
                ? 'This campaign did not reach its funding goal.'
                : 'This campaign was cancelled by the creator.'}{' '}
              All backers are eligible for a full refund.
            </p>
          </div>

          {totalCount > 0 && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='flex items-center gap-1.5 text-white/60'>
                  <RefreshCw className='h-3.5 w-3.5' />
                  Refund progress
                </span>
                <span className='font-medium text-white'>
                  {refundedCount}/{totalCount} backers refunded
                </span>
              </div>
              <Progress value={refundProgress} className='h-2' />
            </div>
          )}

          {/* Per-backer summary for processed refunds */}
          {refundedCount > 0 && (
            <div className='space-y-1.5'>
              <p className='text-xs font-medium text-white/50'>
                Processed refunds
              </p>
              {contributors
                .filter(c => c.refundStatus === 'PROCESSED')
                .slice(0, 5)
                .map((c, i) => (
                  <div
                    key={i}
                    className='flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2'
                  >
                    <span className='text-sm text-white/80'>
                      {c.name || c.username || 'Anonymous'}
                    </span>
                    <div className='flex items-center gap-2'>
                      <RefundStatusBadge status='PROCESSED' />
                      {c.refundTransactionHash && (
                        <a
                          href={getTransactionExplorerUrl(
                            c.refundTransactionHash
                          )}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-400 hover:opacity-70'
                        >
                          <ExternalLink className='h-3.5 w-3.5' />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              {refundedCount > 5 && (
                <p className='text-xs text-white/40'>
                  +{refundedCount - 5} more in the table below
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ContributionsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ContributionsPage({ params }: ContributionsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [project, setProject] = useState<Crowdfunding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await getCrowdfundingProject(slug);
        setProject(data);
      } catch {
        // Error handled by UI state
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  return (
    <div className='flex min-h-screen flex-col px-5 py-8'>
      {/* Header */}
      <div className='mb-8 space-y-4'>
        <Button
          variant='ghost'
          onClick={() => router.push(`/me/crowdfunding/${slug}`)}
          className='-ml-2 text-[#B5B5B5] hover:bg-[#1A1A1A] hover:text-white'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Campaign
        </Button>

        <div className='space-y-2'>
          <h1 className='text-3xl font-bold text-white'>Contributions</h1>
          {project && (
            <div className='flex items-center gap-3'>
              <p className='text-[#B5B5B5]'>
                Project:{' '}
                <span className='font-medium text-white'>
                  {project.project.title}
                </span>
              </p>
              <span className='text-[#484848]'>•</span>
              <p className='text-[#B5B5B5]'>
                {project.contributors.length}{' '}
                {project.contributors.length === 1
                  ? 'Contributor'
                  : 'Contributors'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className='flex-1'>
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent' />
          </div>
        ) : project ? (
          <div>
            <RefundBanner project={project} />
            <ContributionsMetrics
              contributors={project.contributors}
              currencySymbol={'USDC'}
            />
            <ContributionsDataTable
              data={project.contributors}
              loading={false}
              campaignStatus={project.project.status}
            />
          </div>
        ) : (
          <div className='flex items-center justify-center py-20'>
            <p className='text-[#919191]'>Failed to load contributions</p>
          </div>
        )}
      </div>
    </div>
  );
}
