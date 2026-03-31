import { useState, useEffect, useRef } from 'react';
import {
  getSubmissionScores,
  type CriterionScore,
  type JudgingCriterion,
  type IndividualJudgeScore,
} from '@/lib/api/hackathons/judging';
import { authClient } from '@/lib/auth-client';
import { reportError } from '@/lib/error-reporting';

interface UseSubmissionScoresProps {
  open: boolean;
  organizationId: string;
  hackathonId: string;
  submissionId: string;
  participantId: string;
  criteria: JudgingCriterion[];
  targetJudgeId?: string;
  initialScore?: IndividualJudgeScore;
}

interface ExistingScore {
  scores: CriterionScore[];
  notes?: string;
}

export const useSubmissionScores = ({
  open,
  organizationId,
  hackathonId,
  submissionId,
  participantId,
  criteria,
  targetJudgeId,
  initialScore,
}: UseSubmissionScoresProps) => {
  const [scores, setScores] = useState<Record<string, number | string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [overallComment, setOverallComment] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [existingScore, setExistingScore] = useState<ExistingScore | null>(
    null
  );

  // Track which submission we've successfully loaded to avoid resets
  const loadedSubmissionIdRef = useRef<string | null>(null);
  const loadedTargetJudgeIdRef = useRef<string | null>(null);

  const getCriterionKey = (criterion: JudgingCriterion) => {
    return criterion.id || criterion.name || (criterion as any).title;
  };

  const initializeForm = (criteriaList: JudgingCriterion[]) => {
    const initialScores: Record<string, number> = {};
    const initialComments: Record<string, string> = {};
    criteriaList.forEach(criterion => {
      const key = getCriterionKey(criterion);
      initialScores[key] = 0;
      initialComments[key] = '';
    });
    setScores(initialScores);
    setComments(initialComments);
    setOverallComment('');
  };

  useEffect(() => {
    let cancelled = false;

    if (
      !open ||
      !organizationId ||
      !hackathonId ||
      !participantId ||
      criteria.length === 0
    ) {
      if (!open) {
        setScores({});
        setComments({});
        setOverallComment('');
        setExistingScore(null);
        loadedSubmissionIdRef.current = null;
        loadedTargetJudgeIdRef.current = null;
      }
      return;
    }

    if (
      loadedSubmissionIdRef.current === submissionId &&
      loadedTargetJudgeIdRef.current === (targetJudgeId || 'session')
    ) {
      return;
    }

    // Optimization: If initialScore is provided and matches the target, use it
    // but only if we haven't already loaded something for this modal session
    if (initialScore && !loadedSubmissionIdRef.current) {
      const initialScores: Record<string, number> = {};
      const initialComments: Record<string, string> = {};

      // Initialize with 0
      criteria.forEach(c => {
        const key = getCriterionKey(c);
        initialScores[key] = 0;
        initialComments[key] = '';
      });

      // Map existing scores
      initialScore.criteriaScores.forEach(cs => {
        const matchingCriterion = criteria.find(
          c =>
            c.id === cs.criterionId ||
            c.name === cs.criterionId ||
            c.id === cs.criterionName ||
            c.name === cs.criterionName ||
            (c as any).title === cs.criterionName
        );

        const key = matchingCriterion
          ? getCriterionKey(matchingCriterion)
          : cs.criterionId;

        if (key) {
          initialScores[key] = cs.score;
          initialComments[key] = cs.comment || '';
        }
      });

      setExistingScore({
        scores: initialScore.criteriaScores,
        notes: initialScore.comment || '',
      });
      setScores(initialScores);
      setComments(initialComments);
      setOverallComment(initialScore.comment || '');
      loadedSubmissionIdRef.current = submissionId;
      loadedTargetJudgeIdRef.current = targetJudgeId || 'session';
      return;
    }

    const fetchData = async () => {
      setIsFetching(true);
      try {
        const [{ data: sessionData }, response] = await Promise.all([
          authClient.getSession(),
          getSubmissionScores(organizationId, hackathonId, submissionId),
        ]);

        if (cancelled) return;

        const user = sessionData?.user;
        if (!user) {
          initializeForm(criteria);
          return;
        }

        if (response.success && Array.isArray(response.data)) {
          // Identify the correct score based on targetJudgeId or current user
          const scoreData = response.data as IndividualJudgeScore[];
          const currentUserScore = targetJudgeId
            ? scoreData.find(s => s.judgeId === targetJudgeId)
            : scoreData.find(
                s =>
                  s.judgeId === user.id ||
                  s.judgeEmail === user.email ||
                  (s.judgeName === user.name &&
                    user.name !== undefined &&
                    user.name.trim() !== '')
              );

          if (currentUserScore) {
            setExistingScore({
              scores: currentUserScore.criteriaScores,
              notes: currentUserScore.comment || '',
            });

            const initialScores: Record<string, number> = {};
            const initialComments: Record<string, string> = {};

            // 1. Initialize all criteria with 0
            criteria.forEach(c => {
              const key = getCriterionKey(c);
              initialScores[key] = 0;
              initialComments[key] = '';
            });

            // 2. Map existing scores to form keys
            currentUserScore.criteriaScores.forEach(criterionScore => {
              const matchingCriterion = criteria.find(
                c =>
                  c.id === criterionScore.criterionId ||
                  c.name === criterionScore.criterionId ||
                  c.id === criterionScore.criterionName ||
                  c.name === criterionScore.criterionName ||
                  (c as any).title === criterionScore.criterionName ||
                  c.id === (criterionScore as any).criterionTitle ||
                  (c as any).name === (criterionScore as any).criterionTitle ||
                  (c as any).title === (criterionScore as any).criterionTitle
              );

              const key = matchingCriterion
                ? getCriterionKey(matchingCriterion)
                : criterionScore.criterionId ||
                  criterionScore.criterionName ||
                  (criterionScore as any).criterionTitle;

              if (key) {
                initialScores[key] = criterionScore.score;
                initialComments[key] = criterionScore.comment || '';
              }
            });

            if (!cancelled) {
              setScores(initialScores);
              setComments(initialComments);
              setOverallComment(currentUserScore.comment || '');
              loadedSubmissionIdRef.current = submissionId;
              loadedTargetJudgeIdRef.current = targetJudgeId || 'session';
            }
          } else {
            if (!cancelled) {
              initializeForm(criteria);
              loadedSubmissionIdRef.current = submissionId;
              loadedTargetJudgeIdRef.current = targetJudgeId || 'session';
            }
          }
        } else {
          if (!cancelled) initializeForm(criteria);
        }
      } catch (err) {
        reportError(err, {
          context: 'useSubmissionScores-fetch',
          submissionId,
        });
        if (!cancelled) initializeForm(criteria);
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    organizationId,
    hackathonId,
    submissionId,
    criteria,
    targetJudgeId,
  ]);

  return {
    scores,
    setScores,
    comments,
    setComments,
    overallComment,
    setOverallComment,
    isFetching,
    existingScore,
  };
};
