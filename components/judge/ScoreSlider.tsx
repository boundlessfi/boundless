'use client';

import { ChangeEvent, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ScoreSliderProps {
  value: number | '';
  onChange: (next: number | '') => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  weight?: number;
  description?: string;
  error?: string | null;
  isFocused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  inputId?: string;
  /** Optional comment box rendered below the slider. */
  comment?: string;
  onCommentChange?: (value: string) => void;
  commentPlaceholder?: string;
  onSubmitWithEnter?: () => void;
  onAdvance?: () => void;
}

export function ScoreSlider({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 0.1,
  label,
  weight,
  description,
  error,
  isFocused,
  onFocus,
  onBlur,
  inputId,
  comment,
  onCommentChange,
  commentPlaceholder,
  onSubmitWithEnter,
  onAdvance,
}: ScoreSliderProps) {
  const sliderRef = useRef<HTMLInputElement>(null);
  const numericValue = typeof value === 'number' ? value : 0;
  const pct = ((numericValue - min) / (max - min)) * 100;

  const handleSlider = (e: ChangeEvent<HTMLInputElement>) => {
    const next = parseFloat(e.target.value);
    if (Number.isNaN(next)) return;
    onChange(Math.round(next * 10) / 10);
  };

  const handleNumberInput = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange('');
      return;
    }
    const next = parseFloat(raw);
    if (Number.isNaN(next)) return;
    onChange(Math.min(max, Math.max(min, Math.round(next * 10) / 10)));
  };

  return (
    <div
      className={cn(
        'rounded-xl border bg-[#101010] p-5 transition-all',
        isFocused
          ? 'border-primary/40 shadow-[0_0_0_1px_rgba(46,237,170,0.2)]'
          : 'border-white/5 hover:border-white/10',
        error && 'border-red-500/40'
      )}
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <h4 className='text-sm font-medium text-white'>{label}</h4>
            {typeof weight === 'number' && (
              <span className='rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-400'>
                {weight}%
              </span>
            )}
          </div>
          {description && (
            <p className='mt-1 text-xs leading-relaxed text-gray-500'>
              {description}
            </p>
          )}
        </div>
        <div className='flex items-baseline gap-1 tabular-nums'>
          <input
            type='number'
            min={min}
            max={max}
            step={step}
            value={value === '' ? '' : numericValue}
            onChange={handleNumberInput}
            onFocus={onFocus}
            onBlur={onBlur}
            id={inputId}
            className={cn(
              'w-14 rounded border border-white/10 bg-black/40 px-2 py-1 text-right text-xl font-semibold text-white outline-none',
              'focus:border-primary/40 focus:ring-primary/30 focus:ring-1'
            )}
            placeholder='—'
          />
          <span className='text-xs text-gray-600'>/{max}</span>
        </div>
      </div>

      <div className='mt-4'>
        <input
          ref={sliderRef}
          type='range'
          min={min}
          max={max}
          step={step}
          value={numericValue}
          onChange={handleSlider}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (onAdvance) onAdvance();
              else if (onSubmitWithEnter) onSubmitWithEnter();
            }
          }}
          className='judge-slider w-full'
          style={
            {
              ['--judge-slider-pct' as string]: `${pct}%`,
            } as React.CSSProperties
          }
          aria-label={label}
        />
      </div>

      {onCommentChange && (
        <textarea
          value={comment ?? ''}
          onChange={e => onCommentChange(e.target.value)}
          placeholder={commentPlaceholder ?? 'Optional note for the team'}
          rows={2}
          className={cn(
            'mt-3 w-full resize-none rounded-lg border border-white/5 bg-black/40 p-2.5 text-sm text-gray-200 placeholder:text-gray-700',
            'focus:border-primary/40 focus:ring-primary/30 focus:ring-1 focus:outline-none'
          )}
        />
      )}

      {error && <p className='mt-2 text-xs text-red-400'>{error}</p>}
    </div>
  );
}
