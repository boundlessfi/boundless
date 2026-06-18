'use client';

import { use } from 'react';
import { uploadMilestoneDocuments } from '@/lib/api/upload';
import {
  useCampaign,
  useSubmitMilestoneEvidence,
  useClaimMilestone,
} from '@/features/crowdfunding';
import { MilestoneDetailHeader } from '@/components/crowdfunding/milestone-detail-header';
import { MilestoneDetailInfo } from '@/components/crowdfunding/milestone-detail-info';
import { MilestoneDetailDescription } from '@/components/crowdfunding/milestone-detail-description';
import { MilestoneDetailLinks } from '@/components/crowdfunding/milestone-detail-links';
import { MilestoneSubmitForm } from '@/components/crowdfunding/MilestoneSubmitForm';
import { Button } from '@/components/ui/button';
import { AlertTriangle, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ slug: string; milestoneIndex: string }>;
}

export default function MilestoneDetailPage({ params }: PageProps) {
  const { slug, milestoneIndex: milestoneParam } = use(params);

  const { data: campaign, isLoading, error } = useCampaign(slug);

  // Milestone cards link by milestone id; fall back to array index for any
  // legacy numeric links.
  const milestones = campaign?.milestones ?? [];
  let milestone = milestones.find(m => m.id === milestoneParam) ?? null;
  let milestoneIndex = milestones.findIndex(m => m.id === milestoneParam);
  if (!milestone && /^\d+$/.test(milestoneParam)) {
    milestoneIndex = Number(milestoneParam);
    milestone = milestones[milestoneIndex] ?? null;
  }
  const campaignId = campaign?.id ?? '';

  const submitEvidence = useSubmitMilestoneEvidence(campaignId);
  const claimMilestone = useClaimMilestone(campaignId);

  const handleSubmitEvidence = async (formData: {
    submissionNotes: string;
    proofOfWorkLinks: string[];
    documents: File[];
  }) => {
    if (!campaign || !milestone?.id) return;

    let documentUrls: string[] = [];
    if (formData.documents.length > 0) {
      toast.loading(`Uploading ${formData.documents.length} file(s)...`);
      const uploadResult = await uploadMilestoneDocuments(
        formData.documents,
        campaign.slug,
        milestoneIndex
      );
      if (uploadResult.success) {
        documentUrls = uploadResult.data.map(
          (f: { secure_url: string }) => f.secure_url
        );
        toast.success('Files uploaded');
      } else {
        toast.error('Failed to upload documents');
        return;
      }
    }

    submitEvidence.mutate(
      {
        milestoneId: milestone.id,
        submissionNotes: formData.submissionNotes,
        proofOfWorkLinks: formData.proofOfWorkLinks,
        proofOfWorkFiles: documentUrls,
      },
      {
        onSuccess: () => {
          toast.success(
            'Evidence submitted. The team will review your submission.'
          );
        },
        onError: err => {
          toast.error(
            err instanceof Error ? err.message : 'Failed to submit evidence'
          );
        },
      }
    );
  };

  const handleClaimPayout = () => {
    if (!milestone?.id) return;
    claimMilestone.mutate(
      { builderAddress: '', crowdfundingMilestoneId: milestone.id },
      {
        onSuccess: () => toast.success('Payout claimed successfully!'),
        onError: err => {
          toast.error(
            err instanceof Error ? err.message : 'Failed to claim payout'
          );
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className='text-muted-foreground py-12 text-center'>Loading...</div>
    );
  }

  if (error || !campaign || !milestone) {
    return (
      <div className='text-muted-foreground py-12 text-center'>
        Milestone not found
      </div>
    );
  }

  const reviewStatus = milestone.reviewStatus?.toLowerCase();
  const canSubmit =
    reviewStatus === 'pending' || reviewStatus === 'resubmission_required';
  const isRejected =
    reviewStatus === 'rejected' || reviewStatus === 'resubmission_required';
  const canClaim =
    reviewStatus === 'approved' && campaign.v2Status === 'FUNDING';

  return (
    <div className='mx-auto max-w-4xl space-y-8'>
      <MilestoneDetailHeader
        title={campaign.project.title}
        milestone={milestone}
        campaignSlug={campaign.slug}
        backLink={`/me/crowdfunding/${campaign.slug}/milestones`}
      />

      <MilestoneDetailInfo milestone={milestone} campaign={campaign} />

      <MilestoneDetailDescription
        content={milestone.description || ''}
        title='Description'
      />

      <MilestoneDetailLinks campaign={campaign} />

      {/* Review feedback */}
      {isRejected && (
        <div className='flex items-start gap-3 rounded-xl border border-amber-800/50 bg-amber-950/20 p-4'>
          <AlertTriangle className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400' />
          <div>
            <p className='text-sm font-medium text-amber-300'>
              {reviewStatus === 'resubmission_required'
                ? 'Resubmission required'
                : 'Submission not accepted'}
            </p>
            <p className='mt-1 text-sm text-amber-200/70'>
              The review team has requested changes to your submission. Update
              your evidence below and resubmit.
            </p>
          </div>
        </div>
      )}

      {/* Inline evidence submission */}
      {canSubmit && (
        <MilestoneSubmitForm
          milestoneName={milestone.title || milestone.name}
          isSubmitting={submitEvidence.isPending}
          onSubmit={handleSubmitEvidence}
        />
      )}

      {/* Claim payout */}
      {canClaim && (
        <div className='rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-6'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h3 className='text-base font-semibold text-emerald-300'>
                Payout available
              </h3>
              <p className='mt-1 text-sm text-emerald-200/70'>
                This milestone has been approved. Claim your share of the escrow
                funds.
              </p>
              {milestone.amount != null && (
                <p className='mt-2 text-lg font-bold text-white'>
                  ${milestone.amount.toLocaleString()} USDC
                </p>
              )}
            </div>
            <Button
              onClick={handleClaimPayout}
              disabled={claimMilestone.isPending}
              className='flex-shrink-0 gap-2 bg-emerald-600 text-white hover:bg-emerald-500'
            >
              {claimMilestone.isPending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <DollarSign className='h-4 w-4' />
              )}
              {claimMilestone.isPending ? 'Claiming...' : 'Claim payout'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
