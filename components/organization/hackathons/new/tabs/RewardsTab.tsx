import React, { useState } from 'react';
import { BoundlessButton } from '@/components/buttons';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useForm, useFieldArray, Control, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { rewardsSchema, RewardsFormData } from './schemas/rewardsSchema';
import { cn } from '@/lib/utils';
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
  ChevronUp,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';

interface RewardsTabProps {
  onContinue?: () => void;
  onSave?: (data: RewardsFormData) => Promise<void>;
  initialData?: RewardsFormData;
  isLoading?: boolean;
}

// Prize Structure Presets
const PRIZE_PRESETS = {
  standard: {
    name: 'Standard Split',
    description: '50/30/20 distribution',
    tiers: [
      { place: '1st Place', percentage: 50 },
      { place: '2nd Place', percentage: 30 },
      { place: '3rd Place', percentage: 20 },
    ],
  },
  topHeavy: {
    name: 'Winner Takes Most',
    description: '70/20/10 distribution',
    tiers: [
      { place: '1st Place', percentage: 70 },
      { place: '2nd Place', percentage: 20 },
      { place: '3rd Place', percentage: 10 },
    ],
  },
  even: {
    name: 'Equal Split',
    description: 'Equal prizes for all',
    tiers: [
      { place: '1st Place', percentage: 33.33 },
      { place: '2nd Place', percentage: 33.33 },
      { place: '3rd Place', percentage: 33.34 },
    ],
  },
  fiveWay: {
    name: 'Top 5 Split',
    description: '40/25/20/10/5 distribution',
    tiers: [
      { place: '1st Place', percentage: 40 },
      { place: '2nd Place', percentage: 25 },
      { place: '3rd Place', percentage: 20 },
      { place: '4th Place', percentage: 10 },
      { place: '5th Place', percentage: 5 },
    ],
  },
};

// Enhanced Sortable Prize Tier Item with Description
const SortablePrizeTierItem = ({
  tier,
  index,
  onTierChange,
  onRemoveTier,
  canRemove,
  control,
  totalTiers,
}: {
  tier: {
    id: string;
    place: string;
    prizeAmount: string;
    description?: string;
    passMark: number;
    currency?: string;
  };
  index: number;
  onTierChange: (id: string, field: string, value: string | number) => void;
  onRemoveTier: (id: string) => void;
  canRemove: boolean;
  control: Control<RewardsFormData>;
  totalTiers: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tier.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getRankEmoji = (idx: number) => {
    const emojis = ['🥇', '🥈', '🥉', '🏅', '🏅'];
    return emojis[idx] || '🏅';
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative mx-5 transition-all duration-200',
        isDragging && 'z-50 opacity-50'
      )}
    >
      <div className={cn('flex flex-col gap-3 rounded-xl transition-all')}>
        {/* Main Row */}
        <div className='flex items-center gap-3'>
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className={cn(
              'flex cursor-grab items-center justify-center active:cursor-grabbing',
              'rounded-lg p-2 transition-colors hover:bg-gray-800',
              totalTiers === 1 && 'invisible'
            )}
          >
            <GripVertical className='h-5 w-5 text-gray-500' />
          </div>

          {/* Rank Badge */}
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-800 text-2xl'>
            {getRankEmoji(index)}
          </div>

          {/* Prize Details */}
          <div className='grid flex-1 grid-cols-1 gap-3 md:grid-cols-2'>
            {/* Place Name */}
            <FormField
              control={control}
              name={`prizeTiers.${index}.place`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder='1st Place'
                      value={field.value}
                      onChange={e => {
                        field.onChange(e.target.value);
                        onTierChange(tier.id, 'place', e.target.value);
                      }}
                      className='focus-visible:border-primary h-12 border-gray-900 text-white placeholder:text-gray-600'
                    />
                  </FormControl>
                  <FormMessage className='text-xs text-red-400' />
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
                      <div className='absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-gray-500'>
                        $
                      </div>
                      <Input
                        type='number'
                        placeholder='0'
                        value={field.value}
                        onChange={e => {
                          field.onChange(e.target.value);
                          onTierChange(tier.id, 'prizeAmount', e.target.value);
                        }}
                        className='focus-visible:border-primary h-12 border-gray-900 pr-16 pl-7 text-right font-medium text-white placeholder:text-gray-600'
                      />
                      <div className='absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-gray-500'>
                        USDC
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs text-red-400' />
                </FormItem>
              )}
            />
          </div>

          {/* Actions */}
          <div className='flex shrink-0 items-center gap-1'>
            {/* Expand Button - Mobile Only */}
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={() => setIsExpanded(!isExpanded)}
              className='hover:text-primary text-gray-500 md:hidden'
            >
              {isExpanded ? (
                <ChevronUp className='h-4 w-4' />
              ) : (
                <ChevronDown className='h-4 w-4' />
              )}
            </Button>

            {/* Delete Button */}
            {canRemove && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => onRemoveTier(tier.id)}
                      className={cn(
                        'text-gray-500 transition-all hover:bg-red-500/10 hover:text-red-400',
                        'opacity-0 group-hover:opacity-100'
                      )}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove tier</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Expandable Description - Always visible on desktop, collapsible on mobile */}
        <div className={cn('md:block', isExpanded ? 'block' : 'hidden')}>
          <FormField
            control={control}
            name={`prizeTiers.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder='Optional: Add prize description (e.g., "Grand prize includes mentorship, swag, and demo day slot")'
                    value={field.value || ''}
                    onChange={e => {
                      field.onChange(e.target.value);
                      onTierChange(tier.id, 'description', e.target.value);
                    }}
                    className='focus-visible:border-primary min-h-[80px] resize-none border-gray-900 text-white placeholder:text-gray-600'
                  />
                </FormControl>
                <FormMessage className='text-xs text-red-400' />
              </FormItem>
            )}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Validation Alert Component
const ValidationAlert = ({ totalPool }: { totalPool: number }) => {
  const minPool = 1000;
  const isValid = totalPool >= minPool;

  if (totalPool === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4',
        isValid
          ? 'border-green-500/20 bg-green-500/10 text-green-400'
          : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
      )}
    >
      {isValid ? (
        <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0' />
      ) : (
        <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />
      )}
      <div className='space-y-1'>
        <p className='text-sm font-medium'>
          {isValid
            ? 'Prize pool looks good!'
            : 'Minimum prize pool recommended'}
        </p>
        <p className='text-xs opacity-80'>
          {isValid
            ? 'Your prize pool meets the minimum threshold for a quality hackathon.'
            : `We recommend at least $${minPool.toLocaleString()} to attract quality participants.`}
        </p>
      </div>
    </motion.div>
  );
};

export default function RewardsTab({
  onContinue,
  onSave,
  initialData,
  isLoading = false,
}: RewardsTabProps) {
  const [showPresets, setShowPresets] = useState(false);

  const form = useForm<RewardsFormData>({
    resolver: zodResolver(rewardsSchema),
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
  const totalPool = React.useMemo(() => {
    if (!prizeTiers || prizeTiers.length === 0) return 0;
    return prizeTiers.reduce((sum, tier) => {
      if (!tier || !tier.prizeAmount) return sum;
      const amount = parseFloat(
        String(tier.prizeAmount).replace(/[^\d.-]/g, '')
      );
      return sum + (isNaN(amount) || amount < 0 ? 0 : amount);
    }, 0);
  }, [prizeTiers]);

  const platformFeePercentage = 2;
  const platformFee = React.useMemo(() => {
    return Math.round(totalPool * (platformFeePercentage / 100) * 100) / 100;
  }, [totalPool]);

  const totalFunds = React.useMemo(() => {
    return totalPool + platformFee;
  }, [totalPool, platformFee]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Apply preset prize structure
  const applyPreset = (presetKey: keyof typeof PRIZE_PRESETS) => {
    const preset = PRIZE_PRESETS[presetKey];
    const baseAmount = totalPool || 10000; // Use existing total or default

    const newTiers = preset.tiers.map((tier, idx) => ({
      id: `tier-${Date.now()}-${idx}`,
      place: tier.place,
      prizeAmount: String(Math.round((baseAmount * tier.percentage) / 100)),
      description: '',
      currency: 'USDC',
      passMark: 80 - idx * 10,
    }));

    replace(newTiers);
    toast.success(`Applied ${preset.name} preset`);
    setShowPresets(false);
  };

  const handleTierChange = (
    id: string,
    field: string,
    value: string | number
  ) => {
    const index = fields.findIndex(tier => tier.id === id);
    if (index !== -1) {
      const path = `prizeTiers.${index}.${field}` as Path<RewardsFormData>;
      form.setValue(path, value as never, { shouldValidate: true });
      form.trigger('prizeTiers');
    }
  };

  const handleRemoveTier = (id: string) => {
    const index = fields.findIndex(tier => tier.id === id);
    if (index !== -1 && fields.length > 1) {
      remove(index);
      toast.success('Prize tier removed');
      form.trigger('prizeTiers');
    }
  };

  const handleAddTier = () => {
    const placeLabels = [
      '1st Place',
      '2nd Place',
      '3rd Place',
      '4th Place',
      '5th Place',
    ];
    const nextPlace =
      placeLabels[fields.length] || `${fields.length + 1}th Place`;
    append({
      id: `tier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      place: nextPlace,
      prizeAmount: '0',
      description: '',
      currency: 'USDC',
      passMark: 0,
    });
    toast.success('Prize tier added');
    form.trigger('prizeTiers');
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex(tier => tier.id === active.id);
      const newIndex = fields.findIndex(tier => tier.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
        form.trigger('prizeTiers');
      }
    }
  };

  const onSubmit = async (data: RewardsFormData) => {
    try {
      if (onSave) {
        await onSave(data);
        toast.success('Rewards saved successfully!');
      }
      if (onContinue) {
        onContinue();
      }
    } catch {
      toast.error('Failed to save rewards. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Header with Live Summary */}
        <div className='flex flex-col items-start justify-between gap-6'>
          <div className='w-full flex-1 lg:w-auto'>
            <h3 className='text-lg font-semibold text-white'>
              Prize Distribution
            </h3>
            <p className='mt-1 text-sm text-gray-400'>
              Set up your hackathon prizes. Drag to reorder winners.
            </p>
          </div>

          {/* Live Summary Card - Sticky on Desktop */}
          <div className='lgs:sw-80 from-primary/10 to-primary/5 border-primary/20 w-full space-y-3 rounded-xl border bg-gradient-to-br p-4 lg:sticky lg:top-4'>
            <div className='text-primary flex items-center gap-2'>
              <Trophy className='h-4 w-4' />
              <span className='text-xs font-semibold tracking-wide uppercase'>
                Prize Pool Summary
              </span>
            </div>

            <div className='space-y-2'>
              <div className='flex items-baseline justify-between'>
                <span className='text-sm text-gray-400'>Total Prizes</span>
                <span className='text-2xl font-bold text-white'>
                  ${formatCurrency(totalPool)}
                </span>
              </div>

              <div className='flex items-center justify-between text-xs'>
                <span className='text-gray-500'>
                  Platform Fee ({platformFeePercentage}%)
                </span>
                <span className='text-gray-400'>
                  ${formatCurrency(platformFee)}
                </span>
              </div>

              <Separator className='bg-primary/20' />

              <div className='flex items-baseline justify-between'>
                <span className='text-sm font-medium text-gray-300'>
                  You'll Pay
                </span>
                <span className='text-primary text-xl font-bold'>
                  ${formatCurrency(totalFunds)}
                </span>
              </div>
            </div>

            <div className='border-primary/10 flex items-start gap-2 border-t pt-2'>
              <Info className='text-primary mt-0.5 h-4 w-4 flex-shrink-0' />
              <p className='text-xs text-gray-400'>
                Funds locked in escrow until winners are announced
              </p>
            </div>
          </div>
        </div>

        {/* Validation Alert */}
        <ValidationAlert totalPool={totalPool} />

        {/* Preset Buttons */}
        <Collapsible open={showPresets} onOpenChange={setShowPresets}>
          <CollapsibleTrigger asChild>
            <Button
              type='button'
              variant='outline'
              className='hover:border-primary hover:bg-primary/5 w-full border-gray-800 transition-all'
            >
              <Sparkles className='mr-2 h-4 w-4' />
              {showPresets ? 'Hide' : 'Use'} Prize Structure Presets
              {showPresets ? (
                <ChevronUp className='ml-2 h-4 w-4' />
              ) : (
                <ChevronDown className='ml-2 h-4 w-4' />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'
            >
              {Object.entries(PRIZE_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type='button'
                  onClick={() => applyPreset(key as keyof typeof PRIZE_PRESETS)}
                  className='hover:border-primary hover:bg-primary/5 group rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-left transition-all'
                >
                  <p className='group-hover:text-primary font-medium text-white transition-colors'>
                    {preset.name}
                  </p>
                  <p className='mt-1 text-xs text-gray-500'>
                    {preset.description}
                  </p>
                </button>
              ))}
            </motion.div>
          </CollapsibleContent>
        </Collapsible>

        {/* Prize Tiers */}
        <div className='bg-background-card space-y-3 rounded-[12px] border border-gray-900 py-5'>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={fields.map(tier => tier.id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence>
                {fields.map((tier, index) => (
                  <div key={tier.id}>
                    <SortablePrizeTierItem
                      tier={tier}
                      index={index}
                      onTierChange={handleTierChange}
                      onRemoveTier={handleRemoveTier}
                      canRemove={fields.length > 1}
                      control={form.control}
                      totalTiers={fields.length}
                    />

                    <Separator className='mt-3 bg-gray-900' />
                  </div>
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>

          {/* Add Prize Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='mx-5'
          >
            <Button
              type='button'
              variant='outline'
              onClick={handleAddTier}
              className='hover:border-primary hover:bg-primary/5 hover:text-primary h-11 w-full border-dashed border-gray-700 text-gray-400 transition-all'
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Another Prize Tier
            </Button>
          </motion.div>

          {form.formState.errors.prizeTiers && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='flex items-center gap-2 text-sm text-red-400'
            >
              <AlertCircle className='h-4 w-4' />
              {form.formState.errors.prizeTiers.message}
            </motion.p>
          )}
        </div>

        {/* Submit Button */}
        <div className='flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-6 sm:flex-row'>
          <p className='text-sm text-gray-500'>
            {fields.length} prize tier{fields.length !== 1 ? 's' : ''}{' '}
            configured
          </p>
          <BoundlessButton
            type='submit'
            size='xl'
            disabled={isLoading}
            className='w-full sm:w-auto'
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className='mr-2'
                >
                  <Sparkles className='h-4 w-4' />
                </motion.div>
                Saving...
              </>
            ) : (
              'Continue to Review'
            )}
          </BoundlessButton>
        </div>
      </form>
    </Form>
  );
}
