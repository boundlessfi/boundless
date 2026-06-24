import { useState } from 'react';
import { toast } from 'sonner';
import { assignRanks } from '@/lib/api/hackathons';
import { Submission } from '@/components/organization/hackathons/rewards/types';

interface UseRankAssignmentReturn {
  isAssigningRanks: boolean;
  handleRankChange: (
    submissions: Submission[],
    setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>,
    submissionId: string,
    newRank: number | null,
    maxRank: number,
    organizationId: string,
    hackathonId: string
  ) => Promise<void>;
}

export const useRankAssignment = (): UseRankAssignmentReturn => {
  const [isAssigningRanks, setIsAssigningRanks] = useState(false);

  const handleRankChange = async (
    submissions: Submission[],
    setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>,
    submissionId: string,
    newRank: number | null,
    maxRank: number,
    organizationId: string,
    hackathonId: string
  ) => {
    const previousSubmissions = [...submissions];
    setSubmissions(prev =>
      prev.map(sub => {
        if (sub.id === submissionId) {
          return { ...sub, rank: newRank || undefined };
        }
        if (
          newRank &&
          newRank <= maxRank &&
          sub.rank === newRank &&
          sub.id !== submissionId
        ) {
          return { ...sub, rank: undefined };
        }
        return sub;
      })
    );

    setIsAssigningRanks(true);
    try {
      const updatedSubmissions = submissions.map(sub => {
        if (sub.id === submissionId) {
          return { ...sub, rank: newRank || undefined };
        }
        if (
          newRank &&
          newRank <= maxRank &&
          sub.rank === newRank &&
          sub.id !== submissionId
        ) {
          return { ...sub, rank: undefined };
        }
        return sub;
      });

      const ranks = updatedSubmissions
        .filter(sub => sub.rank !== undefined && sub.rank !== null)
        .map(sub => ({
          participantId: sub.participantId || sub.id,
          rank: sub.rank!,
        }));

      const response = await assignRanks(organizationId, hackathonId, {
        ranks,
      });

      if (response.success) {
        toast.success('Ranks updated successfully');
      } else {
        throw new Error(response.message || 'Failed to update ranks');
      }
    } catch (err) {
      setSubmissions(previousSubmissions);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update ranks';
      toast.error(errorMessage);
    } finally {
      setIsAssigningRanks(false);
    }
  };

  return {
    isAssigningRanks,
    handleRankChange,
  };
};
