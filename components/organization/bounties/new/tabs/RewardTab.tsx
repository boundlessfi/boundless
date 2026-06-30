import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { BoundlessButton } from '@/components/buttons';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AssetIcon } from '@/components/wallet/AssetIcon';
import {
  PLATFORM_FEE,
  getBountyPlatformFee,
  getBountyPrizePool,
  getBountyTotalFunding,
} from '@/lib/utils/bounty-escrow';
import { MAX_PRIZE_TIERS, type BountyClaimType } from './schemas/modeSchema';
import { makeRewardSchema, type RewardFormData } from './schemas/rewardSchema';
import RegenerateBountySectionButton from '../RegenerateBountySectionButton';

interface RewardTabProps {
  /** The claim type + winner count chosen in ModeTab; drives the tier count. */
  mode?: { claimType: BountyClaimType; winnerCount?: number };
  onContinue?: () => void;
  onBack?: () => void;
  onSave?: (data: RewardFormData) => Promise<void>;
  initialData?: Partial<RewardFormData>;
  isLoading?: boolean;
}

/** Supported reward currencies. Only USDC is live today; XLM is coming soon. */
const REWARD_CURRENCIES = [
  { code: 'USDC', label: 'USDC', disabled: false },
  { code: 'XLM', label: 'XLM', disabled: true },
] as const;

const ordinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
};

export default function RewardTab({
  mode,
  onContinue,
  onBack,
  onSave,
  initialData,
  isLoading = false,
}: RewardTabProps) {
  const claimType: BountyClaimType = mode?.claimType ?? 'SINGLE_CLAIM';
  const targetCount =
    claimType === 'SINGLE_CLAIM'
      ? 1
      : Math.min(Math.max(mode?.winnerCount ?? 1, 1), MAX_PRIZE_TIERS);

  const form = useForm<RewardFormData>({
    resolver: zodResolver(makeRewardSchema(claimType)),
    defaultValues: {
      rewardCurrency: initialData?.rewardCurrency ?? 'USDC',
      prizeTiers:
        initialData?.prizeTiers && initialData.prizeTiers.length > 0
          ? initialData.prizeTiers
          : [{ position: 1, amount: '', passMark: null }],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'prizeTiers',
  });

  // Keep the tier rows in sync with the mode's winner count, preserving any
  // amounts already entered.
  React.useEffect(() => {
    const current = form.getValues('prizeTiers') ?? [];
    if (current.length === targetCount) return;
    const next = Array.from({ length: targetCount }, (_, i) => ({
      position: i + 1,
      amount: current[i]?.amount ?? '',
      passMark: current[i]?.passMark ?? null,
    }));
    replace(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetCount]);

  const watched = form.watch();
  const prizePool = getBountyPrizePool(watched);
  const platformFee = getBountyPlatformFee(watched);
  const totalFunding = getBountyTotalFunding(watched);
  const currency = watched.rewardCurrency || 'USDC';

  const onSubmit = async (data: RewardFormData) => {
    try {
      if (onSave) await onSave(data);
      if (onContinue) onContinue();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      const message = err.response?.data?.message || err.message;
      const errorMessage = Array.isArray(message) ? message[0] : message;
      toast.error(errorMessage || 'Failed to save reward. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div className='flex justify-end'>
          <RegenerateBountySectionButton
            section='reward'
            onApply={data => {
              if (typeof data.rewardCurrency === 'string') {
                form.setValue('rewardCurrency', data.rewardCurrency, {
                  shouldDirty: true,
                });
              }
              if (Array.isArray(data.prizeTiers)) {
                replace(
                  (
                    data.prizeTiers as Array<{
                      position: number;
                      amount: string;
                      passMark?: number | null;
                    }>
                  ).map(t => ({
                    position: t.position,
                    amount: String(t.amount),
                    passMark: t.passMark ?? null,
                  }))
                );
              }
            }}
          />
        </div>
        <FormField
          control={form.control}
          name='rewardCurrency'
          render={({ field }) => (
            <FormItem className='max-w-xs'>
              <FormLabel className='text-sm font-medium text-white'>
                Reward currency<span className='text-red-500'>*</span>
              </FormLabel>
              <Select
                value={field.value ?? 'USDC'}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className='h-10 rounded-lg border-zinc-800 bg-zinc-900/50 text-white'>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='border-zinc-800 bg-zinc-950 text-white'>
                  {REWARD_CURRENCIES.map(c => (
                    <SelectItem
                      key={c.code}
                      value={c.code}
                      disabled={c.disabled}
                    >
                      <span className='flex items-center gap-2'>
                        <AssetIcon assetCode={c.code} size={18} />
                        {c.label}
                        {c.disabled && (
                          <span className='text-xs text-zinc-500'>
                            (coming soon)
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className='text-xs text-red-500' />
            </FormItem>
          )}
        />

        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium text-white'>
              Prize tiers<span className='text-red-500'>*</span>
            </h3>
            <p className='mt-1 text-sm text-zinc-500'>
              {claimType === 'SINGLE_CLAIM'
                ? 'A single-claim bounty pays one winner.'
                : `This competition pays ${targetCount} winner${targetCount > 1 ? 's' : ''}. Adjust the winner count in the Mode step.`}
            </p>
          </div>

          <div className='space-y-3'>
            {fields.map((fieldRow, index) => (
              <FormField
                key={fieldRow.id}
                control={form.control}
                name={`prizeTiers.${index}.amount`}
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4'>
                      <div className='w-24 text-sm font-medium text-zinc-400'>
                        {ordinal(index + 1)} place
                      </div>
                      <FormControl>
                        <div className='relative flex-1'>
                          <Input
                            type='number'
                            min={0}
                            step='any'
                            placeholder='0.00'
                            className='h-10 rounded-lg border-zinc-800 bg-zinc-900/50 pr-16 text-white'
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value)}
                          />
                          <span className='absolute top-1/2 right-3 -translate-y-1/2 text-xs text-zinc-500'>
                            {currency}
                          </span>
                        </div>
                      </FormControl>
                    </div>
                    <FormMessage className='text-xs text-red-500' />
                  </FormItem>
                )}
              />
            ))}
          </div>
          {form.formState.errors.prizeTiers?.message && (
            <p className='text-xs text-red-500'>
              {form.formState.errors.prizeTiers.message}
            </p>
          )}
        </div>

        {/* Funding preview */}
        <div className='space-y-2 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-zinc-400'>Prize pool</span>
            <span className='text-white'>
              {prizePool.toLocaleString()} {currency}
            </span>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-zinc-400'>
              Platform fee ({PLATFORM_FEE}%)
            </span>
            <span className='text-white'>
              {platformFee.toLocaleString()} {currency}
            </span>
          </div>
          <div className='flex items-center justify-between border-t border-zinc-800 pt-2 text-sm font-medium'>
            <span className='text-white'>Total to fund</span>
            <span className='text-primary'>
              {totalFunding.toLocaleString()} {currency}
            </span>
          </div>
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
