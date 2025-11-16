'use client';

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { JudgingCriterion } from '@/lib/api/hackathons';
import { ProjectHeader } from './ProjectHeader';
import { ScoringSection } from './ScoringSection';
import { TotalScoreCard } from './TotalScoreCard';
import { SuccessOverlay } from './SuccessOverlay';
import { ModalHeader } from './ModalHeader';
import { ModalFooter } from './ModalFooter';
import { LoadingState } from './LoadingState';
import { EmptyCriteriaState } from './EmptyCriteriaState';
import { useScoreCalculation } from './useScoreCalculation';
import { useJudgingCriteria } from './useJudgingCriteria';
import { useSubmissionScores } from './useSubmissionScores';
import { useScoreForm } from './useScoreForm';

interface SubmissionData {
  id: string;
  projectName: string;
  category: string;
  description?: string;
  votes: number;
  comments: number;
  logo?: string;
}

interface GradeSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  hackathonId: string;
  participantId: string;
  judgingCriteria?: JudgingCriterion[];
  submission: SubmissionData;
  onSuccess?: () => void;
}

export default function GradeSubmissionModal({
  open,
  onOpenChange,
  organizationId,
  hackathonId,
  participantId,
  judgingCriteria,
  submission,
  onSuccess,
}: GradeSubmissionModalProps) {
  const { criteria, isFetchingCriteria } = useJudgingCriteria({
    open,
    organizationId,
    hackathonId,
    initialCriteria: judgingCriteria,
  });

  const { scores, setScores, isFetching, existingScore } = useSubmissionScores({
    open,
    organizationId,
    hackathonId,
    participantId,
    criteria,
  });

  const {
    focusedInput,
    setFocusedInput,
    showSuccess,
    validationErrors,
    isLoading,
    handleScoreChange,
    handleInputBlur,
    handleKeyDown,
    handleSubmit,
  } = useScoreForm({
    scores,
    setScores,
    criteria,
    organizationId,
    hackathonId,
    participantId,
    existingScore,
    onSuccess,
    onClose: () => onOpenChange(false),
  });

  const { totalScore, percentage, getScoreColor } = useScoreCalculation({
    criteria,
    scores,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='bg-background-card flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-gray-900 shadow-2xl'
        showCloseButton={false}
      >
        <DialogTitle className='sr-only'>Grade Submission</DialogTitle>

        <SuccessOverlay show={showSuccess} />

        <ModalHeader existingScore={existingScore} />

        <div className='min-h-0 flex-1 overflow-y-auto'>
          {isFetching || isFetchingCriteria ? (
            <LoadingState />
          ) : criteria.length === 0 ? (
            <EmptyCriteriaState />
          ) : (
            <>
              <ProjectHeader submission={submission} />

              <ScoringSection
                criteria={criteria}
                scores={scores}
                validationErrors={validationErrors}
                focusedInput={focusedInput}
                onScoreChange={handleScoreChange}
                onInputFocus={setFocusedInput}
                onInputBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                getScoreColor={getScoreColor}
              />

              <TotalScoreCard
                totalScore={totalScore}
                percentage={percentage}
                getScoreColor={getScoreColor}
              />
            </>
          )}
        </div>

        <ModalFooter
          isLoading={isLoading}
          isFetching={isFetching}
          isFetchingCriteria={isFetchingCriteria}
          hasCriteria={criteria.length > 0}
          existingScore={existingScore}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
