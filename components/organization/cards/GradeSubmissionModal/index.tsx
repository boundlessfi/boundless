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
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

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
  mode?: 'judge' | 'organizer-override';
  overrideJudgeId?: string;
  judges?: Array<{
    id?: string;
    userId?: string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
  }>;
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
  mode = 'judge',
  overrideJudgeId,
  judges = [],
  onSuccess,
}: GradeSubmissionModalProps) {
  const isOverride = mode === 'organizer-override';
  const [creditJudge, setCreditJudge] = useState(false);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string | undefined>(
    overrideJudgeId
  );

  const availableJudges = judges
    .map(j => ({
      id: j.userId || j.id,
      name: j.name || j.email || 'Unknown Judge',
      email: j.email,
      image: j.image,
      role: j.role,
    }))
    .filter(j => !!j.id) as Array<{
    id: string;
    name: string;
    email?: string;
    image?: string;
    role?: string;
  }>;

  const handleToggleCredit = (value: boolean) => {
    setCreditJudge(value);
    if (value && !selectedJudgeId && availableJudges.length > 0) {
      setSelectedJudgeId(availableJudges[0].id);
    }
    if (!value) {
      setSelectedJudgeId(undefined);
    }
  };
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
    mode,
    overrideJudgeId: creditJudge ? selectedJudgeId : undefined,
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
      title={isOverride ? 'Override Submission Score' : 'Grade Submission'}
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
              {isOverride && (
                <div className='mb-6 space-y-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-300'>
                  <div>
                    Organizer override: this action directly assigns scores and
                    bypasses judge assignment checks.
                  </div>
                  <div className='flex flex-wrap items-center gap-3 text-[11px] text-amber-200'>
                    <div className='flex items-center gap-2'>
                      <Switch
                        checked={creditJudge}
                        onCheckedChange={handleToggleCredit}
                        className='data-[state=checked]:bg-amber-500'
                      />
                      <span>Credit judge</span>
                    </div>
                    {creditJudge && (
                      <div className='min-w-[220px]'>
                        <Select
                          value={selectedJudgeId}
                          onValueChange={value => setSelectedJudgeId(value)}
                        >
                          <SelectTrigger className='h-8 border-amber-500/30 bg-black/20 text-amber-100'>
                            <SelectValue placeholder='Select judge' />
                          </SelectTrigger>
                          <SelectContent className='border-amber-500/20 bg-black text-amber-100'>
                            {availableJudges.length === 0 && (
                              <SelectItem value='no-judges' disabled>
                                No judges available
                              </SelectItem>
                            )}
                            {availableJudges.map(judge => (
                              <SelectItem key={judge.id} value={judge.id}>
                                <div className='flex items-center gap-2'>
                                  <Avatar className='h-5 w-5 border border-amber-500/20'>
                                    <AvatarImage src={judge.image} />
                                    <AvatarFallback className='bg-amber-500/10 text-[9px] text-amber-200'>
                                      {judge.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className='min-w-0'>
                                    <div className='truncate text-xs text-amber-100'>
                                      {judge.name}
                                    </div>
                                    <div className='flex items-center gap-1 text-[10px] text-amber-300/80'>
                                      {judge.email && (
                                        <span className='truncate'>
                                          {judge.email}
                                        </span>
                                      )}
                                      {judge.role && (
                                        <Badge
                                          variant='outline'
                                          className='border-amber-500/30 bg-amber-500/10 px-1.5 py-0 text-[9px] text-amber-200'
                                        >
                                          {judge.role}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                    showComments={!isOverride}
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
              mode={mode}
              onCancel={() => onOpenChange(false)}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </BoundlessSheet>
  );
}
