import BoundlessSheet from '@/components/sheet/boundless-sheet';
import type { JudgingCriterion } from '@/lib/api/hackathons/judging';
import { ProjectHeader } from './ProjectHeader';
import { ScoringSection } from './ScoringSection';
import { TotalScoreCard } from './TotalScoreCard';
import { SuccessOverlay } from './SuccessOverlay';
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

  const {
    scores,
    setScores,
    comments,
    setComments,
    isFetching,
    existingScore,
    overallComment,
    setOverallComment,
  } = useSubmissionScores({
    open,
    organizationId,
    hackathonId,
    participantId: submission.id,
    criteria,
  });

  const {
    focusedInput,
    setFocusedInput,
    showSuccess,
    validationErrors,
    isLoading: isSubmitting,
    handleScoreChange,
    handleCommentChange,
    handleInputBlur,
    handleKeyDown,
    handleSubmit,
  } = useScoreForm({
    scores,
    setScores,
    comments,
    setComments,
    overallComment,
    setOverallComment,
    criteria,
    organizationId,
    hackathonId,
    participantId: submission.id,
    existingScore,
    onSuccess,
    onClose: () => onOpenChange(false),
  });

  const { totalScore, percentage, getScoreColor } = useScoreCalculation({
    criteria,
    scores,
  });

  return (
    <BoundlessSheet
      open={open}
      setOpen={onOpenChange}
      title='Grade Submission'
      size='xl'
    >
      <div className='relative flex flex-col'>
        <SuccessOverlay show={showSuccess} />

        <div className='flex-1 p-4 pb-32 md:px-8'>
          {isFetching || isFetchingCriteria ? (
            <LoadingState />
          ) : criteria.length === 0 ? (
            <EmptyCriteriaState />
          ) : (
            <div className='mx-auto max-w-6xl'>
              <ProjectHeader submission={submission} />

              <div className='mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3'>
                <div className='lg:col-span-2'>
                  <ScoringSection
                    criteria={criteria}
                    scores={scores}
                    comments={comments}
                    validationErrors={validationErrors}
                    focusedInput={focusedInput}
                    onScoreChange={handleScoreChange}
                    onCommentChange={handleCommentChange}
                    onInputFocus={setFocusedInput}
                    onInputBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    getScoreColor={getScoreColor}
                    overallComment={overallComment}
                    onOverallCommentChange={setOverallComment}
                  />
                </div>

                <div className='lg:col-span-1'>
                  <div className='sticky top-4 space-y-6'>
                    <TotalScoreCard
                      totalScore={totalScore}
                      percentage={percentage}
                      getScoreColor={getScoreColor}
                    />

                    <div className='rounded-xl border border-gray-800 bg-[#0A0A0A] p-6'>
                      <h5 className='mb-4 text-sm font-semibold text-white'>
                        Grading Summary
                      </h5>
                      <div className='space-y-4'>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-400'>Criteria Scored</span>
                          <span className='font-medium text-white'>
                            {
                              Object.values(scores).filter(
                                s => typeof s === 'number' && s > 0
                              ).length
                            }{' '}
                            / {criteria.length}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-400'>Comments Added</span>
                          <span className='font-medium text-white'>
                            {
                              Object.values(comments).filter(
                                c => c.trim().length > 0
                              ).length
                            }
                          </span>
                        </div>

                        <div className='border-t border-gray-800 pt-4'>
                          <p className='text-[11px] leading-relaxed text-gray-500 italic'>
                            Your scores and comments are saved automatically
                            when you submit. You can return later to update
                            them.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='bg-background-main-bg/80 fixed right-0 bottom-0 left-0 z-50 border-t border-white/5 p-4 backdrop-blur-md'>
          <div className='mx-auto max-w-6xl'>
            <ModalFooter
              isLoading={isSubmitting}
              isFetching={isFetching}
              isFetchingCriteria={isFetchingCriteria}
              hasCriteria={criteria.length > 0}
              existingScore={existingScore}
              onCancel={() => onOpenChange(false)}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </BoundlessSheet>
  );
}
