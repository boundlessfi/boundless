'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

import { BoundlessButton } from '@/components/buttons';

export interface ClarifyQuestionOption {
  value: string;
  label: string;
}
export interface ClarifyQuestionItem {
  id: string;
  question: string;
  options: ClarifyQuestionOption[];
}

/** A picked answer, ready to fold into the brief. */
export interface ClarifyAnswer {
  question: string;
  label: string;
}

interface AiClarifyQuestionsProps {
  questions: ClarifyQuestionItem[];
  /** Continue to drafting with the chosen answers (skipped questions omitted). */
  onSubmit: (answers: ClarifyAnswer[]) => void;
  /** Draft now without answering (the AI picks sensible defaults). */
  onSkip: () => void;
  isSubmitting?: boolean;
}

/**
 * Adaptive clarify step shared by the bounty + hackathon generate dialogs.
 * Shows 1-3 chip questions when the brief was too thin; answers are folded back
 * into the brief before drafting. Answering is optional — Skip drafts straight
 * away.
 */
export default function AiClarifyQuestions({
  questions,
  onSubmit,
  onSkip,
  isSubmitting = false,
}: AiClarifyQuestionsProps) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  const handleContinue = () => {
    const answers: ClarifyAnswer[] = questions
      .filter(q => selected[q.id])
      .map(q => ({
        question: q.question,
        label:
          q.options.find(o => o.value === selected[q.id])?.label ??
          selected[q.id],
      }));
    onSubmit(answers);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-start gap-3'>
        <span className='bg-primary/15 text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg'>
          <Sparkles className='h-4 w-4' />
        </span>
        <p className='text-sm text-gray-300'>
          A couple of quick questions so the draft matches what you have in
          mind. Answer what you can — you can skip the rest.
        </p>
      </div>

      <div className='space-y-4'>
        {questions.map(q => (
          <div key={q.id} className='space-y-2'>
            <p className='text-sm font-medium text-white'>{q.question}</p>
            <div className='flex flex-wrap gap-2'>
              {q.options.map(o => {
                const on = selected[q.id] === o.value;
                return (
                  <button
                    key={o.value}
                    type='button'
                    onClick={() =>
                      setSelected(prev =>
                        prev[q.id] === o.value
                          ? (() => {
                              const next = { ...prev };
                              delete next[q.id];
                              return next;
                            })()
                          : { ...prev, [q.id]: o.value }
                      )
                    }
                    className={[
                      'rounded-full border px-3 py-1 text-xs transition-colors',
                      on
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200',
                    ].join(' ')}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className='flex justify-between gap-2 pt-2'>
        <BoundlessButton
          type='button'
          variant='outline'
          onClick={onSkip}
          disabled={isSubmitting}
        >
          Skip
        </BoundlessButton>
        <BoundlessButton
          type='button'
          loading={isSubmitting}
          icon={<Sparkles className='h-4 w-4' />}
          iconPosition='left'
          onClick={handleContinue}
        >
          Generate draft
        </BoundlessButton>
      </div>
    </div>
  );
}
