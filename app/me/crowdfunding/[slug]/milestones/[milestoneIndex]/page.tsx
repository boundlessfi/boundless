'use client';

import { useState, useEffect, use } from 'react';
import {
  getCrowdfundingProject,
  getCrowdfundingMilestone,
  validateMilestoneSubmission,
  updateMilestone,
} from '@/features/projects/api';
import { uploadMilestoneDocuments } from '@/lib/api/upload';
import { Crowdfunding, Milestone } from '@/features/projects/types';
import { MilestoneDetailHeader } from '@/components/crowdfunding/milestone-detail-header';
import { MilestoneDetailInfo } from '@/components/crowdfunding/milestone-detail-info';
import { MilestoneDetailDescription } from '@/components/crowdfunding/milestone-detail-description';
import { MilestoneDetailLinks } from '@/components/crowdfunding/milestone-detail-links';
import { SubmitEvidenceModal } from '@/components/crowdfunding/submit-evidence-modal';
import WalletRequiredModal from '@/components/wallet/WalletRequiredModal';
import { useProtectedAction } from '@/hooks/use-protected-action';
import { toast } from 'sonner';
import {
  useChangeMilestoneStatus,
  useSendTransaction,
} from '@trustless-work/escrow';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { signTransaction } from '@/lib/config/wallet-kit';

interface PageProps {
  params: Promise<{
    slug: string;
    milestoneIndex: number;
  }>;
}

interface TransformedMilestone extends Milestone {
  _id: string;
  title: string;
  dueDate: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  evidence?: {
    text?: string;
    attachments?: Array<{
      type: 'image' | 'video' | 'document' | 'link';
      url: string;
      name?: string;
    }>;
  };
}

export default function MilestoneDetailPage({ params }: PageProps) {
  const [campaign, setCampaign] = useState<Crowdfunding | null>(null);
  const [milestone, setMilestone] = useState<TransformedMilestone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const milestoneIndex = use(params).milestoneIndex;
  const { changeMilestoneStatus } = useChangeMilestoneStatus();
  const { sendTransaction } = useSendTransaction();

  const { walletAddress } = useWalletContext();

  const {
    executeProtectedAction,
    showWalletModal,
    closeWalletModal,
    handleWalletConnected,
  } = useProtectedAction({
    actionName: 'submit evidence',
    onSuccess: () => setShowEvidenceModal(true),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { slug } = await params;

        const [campaignData, milestoneData] = await Promise.all([
          getCrowdfundingProject(slug),
          getCrowdfundingMilestone(slug, milestoneIndex.toString()),
        ]);

        setCampaign(campaignData);

        if (milestoneData) {
          setMilestone({
            _id: milestoneData.id || milestoneData.name,
            title: milestoneData.name,
            description: milestoneData.description,
            status: milestoneData.status,
            dueDate: milestoneData.endDate,
            amount: milestoneData.amount,
            submittedAt: milestoneData.submittedAt,
            approvedAt: milestoneData.approvedAt,
            rejectedAt: milestoneData.rejectedAt,
            evidence: milestoneData.evidence,
            votes: milestoneData.votes,
            userHasVoted: milestoneData.userHasVoted,
            userVote: milestoneData.userVote,
            ...milestoneData,
          });
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const handleSubmitEvidence = async (data: {
    status: string;
    submissionNotes: string;
    proofOfWorkLinks: string[];
    documents?: File[];
  }) => {
    if (!campaign || !milestone) return;

    setIsSubmitting(true);

    try {
      // Step 1: Upload documents to Cloudinary if provided
      let documentUrls: string[] = [];
      if (data.documents && data.documents.length > 0) {
        toast.loading(`Uploading ${data.documents.length} file(s)...`);

        const uploadResult = await uploadMilestoneDocuments(
          data.documents,
          campaign.slug,
          milestoneIndex
        );

        if (uploadResult.success) {
          documentUrls = uploadResult.data.map(file => file.secure_url);
          toast.success('Files uploaded successfully');
        } else {
          throw new Error('Failed to upload documents');
        }
      }

      // Step 2: Validate submission with backend
      toast('Validating submission...');

      const validationResult = await validateMilestoneSubmission(
        campaign.slug,
        milestoneIndex,
        {
          submissionNotes: data.submissionNotes,
          proofOfWorkLinks: data.proofOfWorkLinks,
          proofOfWorkFiles: documentUrls,
          status: data.status as 'completed' | 'in_review' | 'submitted',
        }
      );

      if (!validationResult.validated) {
        throw new Error(validationResult.error || 'Validation failed');
      }

      // Step 3: Perform blockchain transaction with Trustless Work SDK
      toast('Please confirm the transaction in your wallet');

      const { unsignedTransaction } = await changeMilestoneStatus(
        {
          contractId: campaign.escrowAddress,
          milestoneIndex: (milestone.orderIndex ?? milestoneIndex).toString(),
          newStatus: data.status === 'completed' ? 'completed' : 'in_progress',
          newEvidence: data.submissionNotes, // Use submission notes as evidence description
          serviceProvider: walletAddress || '',
        },
        'multi-release'
      );
      if (!unsignedTransaction) {
        throw new Error(
          'Unsigned transaction is missing from useChangeMilestoneStatusresponse.'
        );
      }

      const signedXdr = await signTransaction({
        unsignedTransaction,
        address: walletAddress || '',
      });

      const trxsent = await sendTransaction(signedXdr);
      if (trxsent.status === 'SUCCESS') {
        toast.success('Transaction confirmed on blockchain');
      }

      toast('Updating milestone...');

      await updateMilestone(campaign.slug, milestoneIndex, {
        status: data.status as
          | 'pending'
          | 'in_progress'
          | 'completed'
          | 'cancelled',
        submissionNotes: data.submissionNotes,
        proofOfWorkLinks: data.proofOfWorkLinks,
        proofOfWorkFiles: documentUrls,
        completedAt:
          data.status === 'completed' ? new Date().toISOString() : undefined,
        releaseTransactionHash: '',
      });

      // Step 5: Refetch milestone data
      const updatedMilestone = await getCrowdfundingMilestone(
        campaign.slug,
        milestoneIndex.toString()
      );

      if (updatedMilestone) {
        setMilestone({
          _id: updatedMilestone.id || updatedMilestone.name,
          title: updatedMilestone.name,
          description: updatedMilestone.description,
          status: updatedMilestone.status,
          dueDate: updatedMilestone.endDate,
          amount: updatedMilestone.amount,
          submittedAt: updatedMilestone.submittedAt,
          approvedAt: updatedMilestone.approvedAt,
          rejectedAt: updatedMilestone.rejectedAt,
          evidence: updatedMilestone.evidence,
          votes: updatedMilestone.votes,
          userHasVoted: updatedMilestone.userHasVoted,
          userVote: updatedMilestone.userVote,
          ...updatedMilestone,
        });
      }

      toast.success('Milestone evidence submitted successfully');

      setShowEvidenceModal(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to submit evidence'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='container mx-auto max-w-4xl px-4 py-12'>
        <div className='text-muted-foreground text-center'>Loading...</div>
      </div>
    );
  }

  if (error || !campaign || !milestone) {
    return (
      <div className='px-4 py-12'>
        <div className='text-muted-foreground text-center'>
          Milestone not found
        </div>
      </div>
    );
  }
  console.log(milestone.orderIndex);
  return (
    <div className='px-6 py-8'>
      <MilestoneDetailHeader
        title={campaign.project.title}
        milestone={milestone}
        campaignSlug={campaign.slug}
        backLink={`/me/crowdfunding/${campaign.slug}/milestones`}
        onSubmitEvidence={() =>
          executeProtectedAction(() => setShowEvidenceModal(true))
        }
      />

      <MilestoneDetailInfo milestone={milestone} campaign={campaign} />

      <MilestoneDetailDescription
        content={milestone.description || ''}
        title='Description'
      />

      <MilestoneDetailLinks campaign={campaign} />

      {/* Evidence Submission Modal */}
      <SubmitEvidenceModal
        open={showEvidenceModal}
        onOpenChange={setShowEvidenceModal}
        milestoneId={milestone._id}
        milestoneName={milestone.title}
        onSubmit={handleSubmitEvidence}
        isSubmitting={isSubmitting}
      />

      {/* Wallet Required Modal */}
      <WalletRequiredModal
        open={showWalletModal}
        onOpenChange={closeWalletModal}
        actionName='submit evidence'
        onWalletConnected={handleWalletConnected}
      />
    </div>
  );
}
