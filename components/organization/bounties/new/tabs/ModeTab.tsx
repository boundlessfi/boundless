import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Globe,
  ClipboardList,
  FileText,
  Trophy,
  UserCheck,
  Loader2,
  Minus,
  Plus,
  ArrowLeft,
} from 'lucide-react';

import { BoundlessButton } from '@/components/buttons';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import {
  BountyClaimType,
  BountyEntryType,
  computeBountyModeLabel,
  isCompetition,
  MAX_PRIZE_TIERS,
  modeSchema,
  ModeFormData,
} from './schemas/modeSchema';

interface ModeTabProps {
  onContinue?: () => void;
  onBack?: () => void;
  onSave?: (data: ModeFormData) => Promise<void>;
  initialData?: Partial<ModeFormData>;
  isLoading?: boolean;
}

const entryOptions: Array<{
  value: BountyEntryType;
  label: string;
  description: string;
  icon: typeof Globe;
}> = [
  {
    value: 'OPEN',
    label: 'Open',
    description: 'Anyone can start working right away.',
    icon: Globe,
  },
  {
    value: 'APPLICATION_LIGHT',
    label: 'Application (light)',
    description: 'A short application before work begins.',
    icon: ClipboardList,
  },
  {
    value: 'APPLICATION_FULL',
    label: 'Application (full)',
    description: 'A full application and review before work begins.',
    icon: FileText,
  },
];

const claimOptions: Array<{
  value: BountyClaimType;
  label: string;
  description: string;
  icon: typeof Trophy;
}> = [
  {
    value: 'SINGLE_CLAIM',
    label: 'Single claim',
    description: 'One contributor works exclusively and is paid.',
    icon: UserCheck,
  },
  {
    value: 'COMPETITION',
    label: 'Competition',
    description: 'Several work in parallel; the best win.',
    icon: Trophy,
  },
];

const defaultValues: ModeFormData = {
  entryType: 'OPEN',
  claimType: 'SINGLE_CLAIM',
  winnerCount: 1,
};

export default function ModeTab({
  onContinue,
  onBack,
  onSave,
  initialData,
  isLoading = false,
}: ModeTabProps) {
  const form = useForm<ModeFormData>({
    resolver: zodResolver(modeSchema),
    defaultValues: { ...defaultValues, ...initialData },
  });

  const entryType = form.watch('entryType');
  const claimType = form.watch('claimType');
  const winnerCount = form.watch('winnerCount') ?? 1;

  const onSubmit = async (data: ModeFormData) => {
    try {
      // Single claim always pays exactly one winner.
      const normalized: ModeFormData =
        data.claimType === 'SINGLE_CLAIM' ? { ...data, winnerCount: 1 } : data;
      if (onSave) await onSave(normalized);
      if (onContinue) onContinue();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      const message = err.response?.data?.message || err.message;
      const errorMessage = Array.isArray(message) ? message[0] : message;
      toast.error(errorMessage || 'Failed to save mode. Please try again.');
    }
  };

  const setWinnerCount = (next: number) => {
    form.setValue('winnerCount', Math.min(Math.max(next, 1), MAX_PRIZE_TIERS), {
      shouldValidate: true,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {/* Entry type axis */}
        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium text-white'>
              How do contributors enter? <span className='text-red-500'>*</span>
            </h3>
            <p className='mt-1 text-sm text-zinc-500'>
              Controls whether contributors apply before working.
            </p>
          </div>

          <FormField
            control={form.control}
            name='entryType'
            render={({ field }) => (
              <FormItem>
                <div className='grid gap-3 sm:grid-cols-3'>
                  {entryOptions.map(
                    ({ value, label, description, icon: Icon }) => {
                      const isSelected = field.value === value;
                      return (
                        <button
                          key={value}
                          type='button'
                          onClick={() => field.onChange(value)}
                          className={cn(
                            'flex flex-col gap-2 rounded-lg border p-4 text-left transition-all',
                            isSelected
                              ? 'border-primary/50 bg-primary/10 shadow-primary/10 shadow-sm'
                              : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                              isSelected
                                ? 'bg-primary/20 text-primary'
                                : 'bg-zinc-800 text-zinc-500'
                            )}
                          >
                            <Icon className='h-5 w-5' />
                          </div>
                          <span
                            className={cn(
                              'text-sm font-medium',
                              isSelected ? 'text-primary' : 'text-white'
                            )}
                          >
                            {label}
                          </span>
                          <span className='text-xs text-zinc-500'>
                            {description}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />
        </div>

        {/* Claim type axis */}
        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium text-white'>
              How is the work claimed? <span className='text-red-500'>*</span>
            </h3>
            <p className='mt-1 text-sm text-zinc-500'>
              One exclusive contributor, or a competition of many.
            </p>
          </div>

          <FormField
            control={form.control}
            name='claimType'
            render={({ field }) => (
              <FormItem>
                <div className='grid gap-3 sm:grid-cols-2'>
                  {claimOptions.map(
                    ({ value, label, description, icon: Icon }) => {
                      const isSelected = field.value === value;
                      return (
                        <button
                          key={value}
                          type='button'
                          onClick={() => {
                            field.onChange(value);
                            if (value === 'SINGLE_CLAIM') setWinnerCount(1);
                          }}
                          className={cn(
                            'flex flex-col gap-2 rounded-lg border p-4 text-left transition-all',
                            isSelected
                              ? 'border-primary/50 bg-primary/10 shadow-primary/10 shadow-sm'
                              : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                              isSelected
                                ? 'bg-primary/20 text-primary'
                                : 'bg-zinc-800 text-zinc-500'
                            )}
                          >
                            <Icon className='h-5 w-5' />
                          </div>
                          <span
                            className={cn(
                              'text-sm font-medium',
                              isSelected ? 'text-primary' : 'text-white'
                            )}
                          >
                            {label}
                          </span>
                          <span className='text-xs text-zinc-500'>
                            {description}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />
        </div>

        {/* Winners (competition only) */}
        {isCompetition(claimType) && (
          <FormField
            control={form.control}
            name='winnerCount'
            render={() => (
              <FormItem>
                <div className='rounded-lg border border-zinc-800 bg-zinc-900/30 p-6'>
                  <h4 className='mb-1 text-sm font-medium text-white'>
                    Winners
                  </h4>
                  <p className='mb-4 text-sm text-zinc-500'>
                    A competition can pay a single winner or up to{' '}
                    {MAX_PRIZE_TIERS} prize positions.
                  </p>
                  <div className='flex items-center gap-4'>
                    <div className='w-28 text-sm font-medium text-zinc-400'>
                      Prize positions
                    </div>
                    <div className='flex items-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50'>
                      <div className='flex-1 px-4 py-2.5 text-sm font-medium text-white'>
                        {winnerCount}
                      </div>
                      <div className='flex border-l border-zinc-800'>
                        <button
                          type='button'
                          onClick={() => setWinnerCount(winnerCount - 1)}
                          className='flex items-center justify-center bg-zinc-900/50 px-3 py-2.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white'
                        >
                          <Minus className='h-4 w-4' />
                        </button>
                        <button
                          type='button'
                          onClick={() => setWinnerCount(winnerCount + 1)}
                          className='flex items-center justify-center border-l border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white'
                        >
                          <Plus className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />
        )}

        {/* Computed mode label */}
        <div className='border-primary/30 bg-primary/5 rounded-lg border p-4'>
          <p className='text-xs text-zinc-500'>Selected mode</p>
          <p className='text-primary mt-1 text-sm font-medium'>
            {computeBountyModeLabel(entryType, claimType, winnerCount)}
          </p>
        </div>

        <div className='flex items-center justify-between pt-4'>
          {onBack ? (
            <BoundlessButton
              type='button'
              variant='outline'
              size='lg'
              onClick={onBack}
              disabled={isLoading}
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back
            </BoundlessButton>
          ) : (
            <span />
          )}
          <BoundlessButton
            type='submit'
            size='lg'
            disabled={isLoading}
            className='min-w-32'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </BoundlessButton>
        </div>
      </form>
    </Form>
  );
}
