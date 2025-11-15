import { useState } from 'react';
import { toast } from 'sonner';
import {
  shortlistSubmission,
  disqualifySubmission,
} from '@/lib/api/hackathons';

interface UseSubmissionActionsProps {
  organizationId?: string;
  hackathonId?: string;
  participantId?: string;
  onSuccess?: () => void;
  onShortlist?: (submissionId: string) => void;
  onDisqualify?: (submissionId: string) => void;
}

export const useSubmissionActions = ({
  organizationId,
  hackathonId,
  participantId,
  onSuccess,
  onShortlist,
  onDisqualify,
}: UseSubmissionActionsProps) => {
  const [isDisqualifyModalOpen, setIsDisqualifyModalOpen] = useState(false);

  const handleShortlist = async (submissionId: string) => {
    if (organizationId && hackathonId && participantId) {
      try {
        const response = await shortlistSubmission(
          organizationId,
          hackathonId,
          participantId
        );

        if (response.success && response.data) {
          const newStatus = response.data.submission?.status;
          const isShortlisted = newStatus === 'shortlisted';

          toast.success(
            isShortlisted
              ? 'Submission added to shortlist'
              : 'Submission removed from shortlist',
            {
              duration: 1500,
            }
          );

          if (onSuccess) {
            onSuccess();
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to shortlist submission';
        toast.error(errorMessage);
      }
    } else if (onShortlist) {
      onShortlist(submissionId);
      toast.success('Submission added to shortlist', {
        duration: 1500,
      });
    }
  };

  const handleDisqualifyClick = () => {
    setIsDisqualifyModalOpen(true);
  };

  const handleDisqualifyConfirm = async (
    submissionId: string,
    comment?: string
  ) => {
    if (organizationId && hackathonId && participantId) {
      try {
        const response = await disqualifySubmission(
          organizationId,
          hackathonId,
          participantId,
          comment
        );

        if (response.success && response.data) {
          const newStatus = response.data.submission?.status;
          const isDisqualified = newStatus === 'disqualified';

          toast.success(
            isDisqualified
              ? 'Submission marked as disqualified'
              : 'Submission disqualification removed',
            {
              duration: 1500,
            }
          );

          setIsDisqualifyModalOpen(false);

          if (onSuccess) {
            onSuccess();
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to disqualify submission';
        toast.error(errorMessage);
      }
    } else if (onDisqualify) {
      onDisqualify(submissionId);
      toast.success('Submission marked as disqualified', {
        duration: 1500,
      });
      setIsDisqualifyModalOpen(false);
    }
  };

  return {
    isDisqualifyModalOpen,
    setIsDisqualifyModalOpen,
    handleShortlist,
    handleDisqualifyClick,
    handleDisqualifyConfirm,
  };
};
