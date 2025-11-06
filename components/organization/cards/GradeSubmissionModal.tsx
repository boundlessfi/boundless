'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Minus,
  Plus,
} from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BoundlessButton } from '@/components/buttons';
import { cn } from '@/lib/utils';

interface GradingCriterion {
  id: string;
  name: string;
  score: number;
  maxScore: number;
}

interface Submission {
  id: string;
  projectName: string;
  category: string;
  description: string;
  votes: number;
  comments: number;
  logo?: string;
}

interface GradeSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission?: Submission;
  submissions?: Submission[];
  currentIndex?: number;
  criteria?: GradingCriterion[];
  onGrade?: (submissionId: string, scores: Record<string, number>) => void;
}

export default function GradeSubmissionModal({
  open,
  onOpenChange,
  submission,
  submissions = [
    {
      id: '1',
      projectName: 'Binance',
      category: 'Category',
      description:
        'To build a secure, transparent, and trusted digital health ecosystem powered by Sonic blockchain for 280M lives in Indonesia.',
      votes: 200,
      comments: 1000,
      logo: '/bitmed.png',
    },
  ],
  currentIndex = 0,
  criteria = [
    { id: 'innovation', name: 'Innovation', score: 1, maxScore: 5 },
    { id: 'impact', name: 'Impact', score: 3, maxScore: 5 },
    { id: 'technical', name: 'Technical Quality', score: 2, maxScore: 5 },
    { id: 'usability', name: 'Usability', score: 1, maxScore: 5 },
    { id: 'presentation', name: 'Presentation', score: 4, maxScore: 5 },
  ],
  onGrade,
}: GradeSubmissionModalProps) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [currentSubmissionIndex, setCurrentSubmissionIndex] =
    useState(currentIndex);
  const initializedRef = useRef<string>('');

  const currentSubmission = submission || submissions[currentSubmissionIndex];

  // Memoize criteria to prevent unnecessary re-renders
  const criteriaKey = useMemo(
    () => criteria.map(c => `${c.id}-${c.maxScore}-${c.score}`).join(','),
    [criteria]
  );

  // Initialize scores from criteria (only when submission or criteria changes)
  useEffect(() => {
    if (!currentSubmission) return;

    const submissionKey = `${currentSubmission.id}-${criteriaKey}`;
    // Only initialize if this is a different submission or criteria changed
    if (initializedRef.current !== submissionKey) {
      const initialScores: Record<string, number> = {};
      criteria.forEach(criterion => {
        initialScores[criterion.id] = criterion.score;
      });
      setScores(initialScores);
      initializedRef.current = submissionKey;
    }
  }, [currentSubmission, criteria, criteriaKey]);

  const canGoPrev = currentSubmissionIndex > 0;
  const canGoNext = currentSubmissionIndex < submissions.length - 1;

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentSubmissionIndex(currentSubmissionIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentSubmissionIndex(currentSubmissionIndex + 1);
    }
  };

  const handleScoreChange = (criterionId: string, delta: number) => {
    setScores(prev => {
      const currentScore = prev[criterionId] || 0;
      const criterion = criteria.find(c => c.id === criterionId);
      const maxScore = criterion?.maxScore || 5;
      const newScore = Math.max(0, Math.min(maxScore, currentScore + delta));
      return { ...prev, [criterionId]: newScore };
    });
  };

  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0
  );
  const maxTotalScore = criteria.reduce((sum, c) => sum + c.maxScore, 0);
  const percentage =
    maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0;

  const handleSubmit = () => {
    if (currentSubmission && onGrade) {
      onGrade(currentSubmission.id, scores);
      onOpenChange(false);
    }
  };

  if (!currentSubmission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='bg-background-card flex max-h-[90vh] w-full !max-w-2xl flex-col overflow-hidden border-gray-900 p-0'
        showCloseButton={false}
      >
        <DialogTitle className='sr-only'>Grade Submission</DialogTitle>

        {/* Left Navigation Arrow */}
        {submissions.length > 1 && (
          <Button
            variant='ghost'
            size='icon'
            onClick={handlePrev}
            disabled={!canGoPrev}
            className='fixed top-1/2 -left-4 z-[60] h-10 w-10 -translate-y-1/2 rounded-full border border-gray-800 bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50'
          >
            <ChevronLeft className='h-5 w-5' />
          </Button>
        )}

        {/* Right Navigation Arrow */}
        {submissions.length > 1 && (
          <Button
            variant='ghost'
            size='icon'
            onClick={handleNext}
            disabled={!canGoNext}
            className='fixed top-1/2 -right-4 z-[60] h-10 w-10 -translate-y-1/2 rounded-full border border-gray-800 bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50'
          >
            <ChevronRight className='h-5 w-5' />
          </Button>
        )}

        {/* Header */}
        <DialogHeader className='flex flex-shrink-0 flex-row items-center justify-between border-b border-gray-900 p-6 pb-4'>
          <div className='flex items-center gap-3'>
            <DialogClose asChild>
              <Button
                variant='ghost'
                size='icon'
                className='border border-gray-800 text-gray-500 hover:bg-gray-800'
              >
                <X className='h-5 w-5' />
              </Button>
            </DialogClose>
            {/* Project Navigation Icons */}
            <div className='flex items-center gap-2'>
              {submissions.slice(0, 5).map((sub, index) => (
                <div
                  key={sub.id}
                  onClick={() => setCurrentSubmissionIndex(index)}
                  className={cn(
                    'flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded border-2 transition-all',
                    index === currentSubmissionIndex
                      ? 'border-primary'
                      : 'border-gray-800'
                  )}
                >
                  <Image
                    src={sub.logo || '/bitmed.png'}
                    alt={sub.projectName}
                    width={32}
                    height={32}
                    className='h-full w-full object-cover'
                  />
                </div>
              ))}
              {submissions.length > 5 && (
                <div className='flex h-8 w-8 items-center justify-center rounded border-2 border-gray-800 bg-gray-900 text-xs text-gray-400'>
                  +{submissions.length - 5}
                </div>
              )}
            </div>
            <div className='bg-office-brown flex h-6 w-6 items-center justify-center rounded text-xs font-medium text-white'>
              1K+
            </div>
          </div>

          <Button
            variant='outline'
            className='gap-2 border-gray-800 text-gray-500 hover:bg-gray-800'
          >
            Open
            <ArrowUpRight className='h-4 w-4' />
          </Button>
        </DialogHeader>

        {/* Content */}
        <div className='min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-6'>
          {/* Project Information */}
          <div className='mb-6 flex items-start gap-3'>
            <div className='h-16 w-16 flex-shrink-0'>
              <Image
                src={currentSubmission.logo || '/bitmed.png'}
                alt={currentSubmission.projectName}
                width={64}
                height={64}
                className='h-full w-full rounded-lg object-cover'
              />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='mb-1 flex items-center gap-2'>
                <h3 className='text-lg font-semibold text-white'>
                  {currentSubmission.projectName}
                </h3>
                <Badge className='rounded-[4px] border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-400'>
                  {currentSubmission.category}
                </Badge>
              </div>
              <div className='mb-2 flex items-center gap-2 text-sm text-gray-500'>
                <span>{currentSubmission.votes} Votes</span>
                <div className='h-4 w-px bg-gray-900' />
                <span>
                  {currentSubmission.comments.toLocaleString()}+ Comments
                </span>
              </div>
              <p className='text-sm leading-relaxed text-gray-500'>
                {currentSubmission.description}
              </p>
            </div>
          </div>

          {/* Grade Submission Section */}
          <div className='mb-6'>
            <h4 className='mb-4 text-base font-medium text-white'>
              Grade Submission
            </h4>
            <div className='space-y-3'>
              {criteria.map(criterion => {
                const score = scores[criterion.id] || 0;
                return (
                  <div key={criterion.id} className='flex items-center gap-3'>
                    <span className='w-32 flex-shrink-0 text-sm font-medium text-white'>
                      {criterion.name}
                    </span>
                    <div className='flex flex-1 items-center gap-2 rounded-lg bg-gray-800 px-3 py-2'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleScoreChange(criterion.id, -1)}
                        disabled={score <= 0}
                        className='h-8 w-8 p-0 text-white hover:bg-gray-700 disabled:opacity-50'
                      >
                        <Minus className='h-4 w-4' />
                      </Button>
                      <div className='flex-1 text-center'>
                        <span className='text-sm font-medium text-white'>
                          {score}/{criterion.maxScore}
                        </span>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleScoreChange(criterion.id, 1)}
                        disabled={score >= criterion.maxScore}
                        className='h-8 w-8 p-0 text-white hover:bg-gray-700 disabled:opacity-50'
                      >
                        <Plus className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Score */}
          <div className='mb-6 flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-white'>
                Total Score
              </span>
              <span className='text-sm font-bold text-white'>
                {totalScore}/{maxTotalScore}
              </span>
            </div>
            <div className='flex flex-1 items-center gap-3'>
              <div className='h-2 flex-1 overflow-hidden rounded-full bg-gray-800'>
                <div
                  className='h-full rounded-full bg-red-500 transition-all'
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className='text-sm whitespace-nowrap text-gray-400'>
                ({percentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className='flex flex-shrink-0 justify-end gap-3 border-t border-gray-900 p-6'>
          <BoundlessButton
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='border-gray-700 bg-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-300'
          >
            Cancel
          </BoundlessButton>
          <BoundlessButton
            variant='default'
            onClick={handleSubmit}
            className='bg-green-500 text-white hover:bg-green-600'
          >
            Submit
          </BoundlessButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
