import React, { useState, useMemo } from 'react';
import { BoundlessButton } from '@/components/buttons';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  rewardsSchema,
  RewardsFormData,
  PrizeTier,
} from './schemas/rewardsSchema';
import { cn } from '@/lib/utils';
import type { Control } from 'react-hook-form';
import {
  Plus,
  GripVertical,
  Trophy,
  Info,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RewardsTabProps {
  onContinue?: () => void;
  onSave?: (data: RewardsFormData) => Promise<void>;
  initialData?: RewardsFormData;
  isLoading?: boolean;
}

const PRIZE_PRESETS = {
  standard: { name: 'Standard', tiers: [50, 30, 20] },
  topHeavy: { name: 'Winner Takes Most', tiers: [70, 20, 10] },
  even: { name: 'Equal Split', tiers: [33.33, 33.33, 33.34] },
  fiveWay: { name: 'Top 5', tiers: [40, 25, 20, 10, 5] },
};

const RANK_EMOJIS = ['🥇', '🥈', '🥉', '🏅', '🏅'];

interface PrizeTierProps {
  tier: Omit<PrizeTier, 'currency'> & { id: string; currency?: string };
  index: number;
  onRemove: (id: string) => void;
  canRemove: boolean;
  control: Control<RewardsFormData>;
  totalTiers: number;
}

// Sortable Prize Tier Component
const PrizeTierComponent = ({
  tier,
  index,
  onRemove,
  canRemove,
  control,
  totalTiers,
}: PrizeTierProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tier.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('group', isDragging && 'opacity-50')}
    >
      <div className='flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4'>
        {/* Drag Handle */}
        {totalTiers > 1 && (
          <div
            {...attributes}
            {...listeners}
            className='cursor-grab pt-2 active:cursor-grabbing'
          >
            <GripVertical className='h-5 w-5 text-zinc-600 transition-colors hover:text-zinc-400' />
          </div>
        )}

        {/* Rank Badge */}
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-2xl'>
          {RANK_EMOJIS[index] || '🏅'}
        </div>

        {/* Form Fields */}
        <div className='flex-1 space-y-3'>
          <div className='grid gap-3 md:grid-cols-2'>
            {/* Place Name */}
            <FormField
              control={control}
              name={`prizeTiers.${index}.place`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='1st Place'
                      className='h-11 border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
                    />
                  </FormControl>
                  <FormMessage className='text-xs text-red-500' />
                </FormItem>
              )}
            />

            {/* Prize Amount */}
            <FormField
              control={control}
              name={`prizeTiers.${index}.prizeAmount`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className='relative'>
                      <div className='absolute top-1/2 left-3 -translate-y-1/2 text-sm text-zinc-500'>
                        $
                      </div>
                      <Input
                        {...field}
                        type='number'
                        placeholder='0'
                        className='h-11 border-zinc-800 bg-zinc-900/50 pr-16 pl-7 text-right font-medium text-white placeholder:text-zinc-600'
                      />
                      <div className='absolute top-1/2 right-3 -translate-y-1/2 text-xs text-zinc-500'>
                        USDC
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs text-red-500' />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <FormField
            control={control}
            name={`prizeTiers.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ''}
                    placeholder='Optional: Add prize description'
                    className='min-h-20 resize-none border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600'
                  />
                </FormControl>
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />
        </div>

        {/* Delete Button */}
        {canRemove && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => onRemove(tier.id)}
            className='shrink-0 text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  );
};

interface PrizeSummaryProps {
  totalPool: number;
  platformFee: number;
  totalFunds: number;
}

// Summary Card Component
const PrizeSummary = ({
  totalPool,
  platformFee,
  totalFunds,
}: PrizeSummaryProps) => {
  const formatCurrency = (amount: number) =>
    amount.toLocaleString('en-US', { minimumFractionDigits: 0 });

  return (
    <div className='border-primary/20 from-primary/10 to-primary/5 rounded-xl border bg-gradient-to-br p-4'>
      <div className='text-primary mb-3 flex items-center gap-2'>
        <Trophy className='h-4 w-4' />
        <span className='text-xs font-semibold tracking-wide uppercase'>
          Prize Pool Summary
        </span>
      </div>

      <div className='space-y-3'>
        <div className='flex items-baseline justify-between'>
          <span className='text-sm text-zinc-400'>Total Prizes</span>
          <span className='text-2xl font-bold text-white'>
            ${formatCurrency(totalPool)}
          </span>
        </div>

        <div className='flex items-center justify-between text-xs'>
          <span className='text-zinc-500'>Platform Fee (2%)</span>
          <span className='text-zinc-400'>${formatCurrency(platformFee)}</span>
        </div>

        <div className='bg-primary/20 h-px' />

        <div className='flex items-baseline justify-between'>
          <span className='text-sm font-medium text-zinc-300'>You'll Pay</span>
          <span className='text-primary text-xl font-bold'>
            ${formatCurrency(totalFunds)}
          </span>
        </div>

        <div className='border-primary/10 flex items-start gap-2 border-t pt-3'>
          <Info className='text-primary mt-0.5 h-4 w-4 shrink-0' />
          <p className='text-xs text-zinc-400'>
            Funds locked in escrow until winners announced
          </p>
        </div>
      </div>
    </div>
  );
};

// Validation Alert Component
const ValidationAlert = ({ totalPool }: { totalPool: number }) => {
  const minPool = 1000;
  const isValid = totalPool >= minPool;

  if (totalPool === 0) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        isValid
          ? 'border-green-900/50 bg-green-500/5 text-green-400'
          : 'border-amber-900/50 bg-amber-500/5 text-amber-400'
      )}
    >
      {isValid ? (
        <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0' />
      ) : (
        <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />
      )}
      <div>
        <p className='text-sm font-medium'>
          {isValid
            ? 'Prize pool looks good!'
            : 'Minimum prize pool recommended'}
        </p>
        <p className='mt-1 text-xs opacity-80'>
          {isValid
            ? 'Your prize pool meets the minimum threshold.'
            : `We recommend at least $${minPool.toLocaleString()} to attract quality participants.`}
        </p>
      </div>
    </div>
  );
};

export default function RewardsTab({
  onSave,
  initialData,
  isLoading = false,
}: RewardsTabProps) {
  const [showPresets, setShowPresets] = useState(false);

  const form = useForm<RewardsFormData>({
    resolver: zodResolver(rewardsSchema),
    mode: 'onChange',
    defaultValues: initialData || {
      prizeTiers: [
        {
          id: `tier-${Date.now()}-1`,
          place: '1st Place',
          prizeAmount: '10000',
          description: '',
          currency: 'USDC',
          passMark: 80,
        },
        {
          id: `tier-${Date.now()}-2`,
          place: '2nd Place',
          prizeAmount: '5000',
          description: '',
          currency: 'USDC',
          passMark: 70,
        },
        {
          id: `tier-${Date.now()}-3`,
          place: '3rd Place',
          prizeAmount: '2500',
          description: '',
          currency: 'USDC',
          passMark: 50,
        },
      ],
    },
  });

  const { fields, append, remove, move, replace } = useFieldArray({
    control: form.control,
    name: 'prizeTiers',
  });
  const prizeTiers = form.watch('prizeTiers');

  // Calculate totals
  const totalPool = useMemo(() => {
    return prizeTiers.reduce((sum, tier) => {
      const amount = parseFloat(
        String(tier.prizeAmount).replace(/[^\d.-]/g, '')
      );
      return sum + (isNaN(amount) || amount < 0 ? 0 : amount);
    }, 0);
  }, [prizeTiers]);

  const platformFee = useMemo(
    () => Math.round(totalPool * 0.02 * 100) / 100,
    [totalPool]
  );
  const totalFunds = useMemo(
    () => totalPool + platformFee,
    [totalPool, platformFee]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const applyPreset = (presetKey: keyof typeof PRIZE_PRESETS) => {
    const preset = PRIZE_PRESETS[presetKey];
    const baseAmount = totalPool || 10000;
    const newTiers = preset.tiers.map((percentage, idx) => ({
      id: `tier-${Date.now()}-${idx}`,
      place: `${['1st', '2nd', '3rd', '4th', '5th'][idx]} Place`,
      prizeAmount: String(Math.round((baseAmount * percentage) / 100)),
      description: '',
      currency: 'USDC',
      passMark: 80 - idx * 10,
    }));
    replace(newTiers);
    toast.success(`Applied ${preset.name} preset`);
    setShowPresets(false);
  };

  const handleRemove = (id: string) => {
    const index = fields.findIndex(tier => tier.id === id);
    if (index !== -1 && fields.length > 1) {
      remove(index);
      toast.success('Prize tier removed');
    }
  };

  const handleAdd = () => {
    const placeLabels = ['1st', '2nd', '3rd', '4th', '5th'];
    const nextPlace = `${placeLabels[fields.length] || `${fields.length + 1}th`} Place`;
    append({
      id: `tier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      place: nextPlace,
      prizeAmount: '0',
      description: '',
      currency: 'USDC',
      passMark: 0,
    });
    toast.success('Prize tier added');
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex(tier => tier.id === active.id);
      const newIndex = fields.findIndex(tier => tier.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) move(oldIndex, newIndex);
    }
  };

  const onSubmit = async (data: RewardsFormData) => {
    try {
      if (onSave) {
        await onSave(data);
        toast.success('Rewards saved successfully');
      }
    } catch {
      toast.error('Failed to save rewards. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Header */}
        <div>
          <h3 className='text-lg font-medium text-white'>Prize Distribution</h3>
          <p className='mt-1 text-sm text-zinc-500'>
            Set up prizes and drag to reorder winners
          </p>
        </div>

        {/* Summary Card */}
        <PrizeSummary
          totalPool={totalPool}
          platformFee={platformFee}
          totalFunds={totalFunds}
        />

        {/* Validation */}
        <ValidationAlert totalPool={totalPool} />

        {/* Presets */}
        <div className='space-y-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() => setShowPresets(!showPresets)}
            className='w-full border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'
          >
            <Sparkles className='mr-2 h-4 w-4' />
            {showPresets ? 'Hide' : 'Use'} Prize Presets
            <ChevronDown
              className={cn(
                'ml-2 h-4 w-4 transition-transform',
                showPresets && 'rotate-180'
              )}
            />
          </Button>

          {showPresets && (
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              {Object.entries(PRIZE_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type='button'
                  onClick={() => applyPreset(key as keyof typeof PRIZE_PRESETS)}
                  className='group hover:border-primary/50 hover:bg-primary/5 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 text-left transition-all'
                >
                  <p className='group-hover:text-primary font-medium text-white transition-colors'>
                    {preset.name}
                  </p>
                  <p className='mt-1 text-xs text-zinc-500'>
                    {preset.tiers.join('/')}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Prize Tiers */}
        <div className='space-y-3'>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={fields.map(tier => tier.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((tier, index) => (
                <PrizeTierComponent
                  key={tier.id}
                  tier={tier}
                  index={index}
                  onRemove={handleRemove}
                  canRemove={fields.length > 1}
                  control={form.control}
                  totalTiers={fields.length}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Add Button */}
          <Button
            type='button'
            variant='outline'
            onClick={handleAdd}
            className='hover:border-primary hover:bg-primary/5 hover:text-primary h-11 w-full border-dashed border-zinc-700 text-zinc-400'
          >
            <Plus className='mr-2 h-4 w-4' />
            Add Prize Tier
          </Button>

          {form.formState.errors.prizeTiers && (
            <p className='flex items-center gap-2 text-sm text-red-400'>
              <AlertCircle className='h-4 w-4' />
              {form.formState.errors.prizeTiers.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className='flex items-center justify-between border-t border-zinc-800 pt-6'>
          <p className='text-sm text-zinc-500'>
            {fields.length} prize tier{fields.length !== 1 ? 's' : ''}{' '}
            configured
          </p>
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
