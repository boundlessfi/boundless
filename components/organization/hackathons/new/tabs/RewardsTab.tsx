import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { BoundlessButton } from '@/components/buttons';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { rewardsSchema, RewardsFormData } from './schemas/rewardsSchema';
import {
  getFeeEstimate,
  getFinancialPreview,
  type FeeEstimateData,
  type FinancialPreviewData,
} from '@/lib/api/hackathons/rewards';
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
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  TriangleAlert,
  X,
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
import { listOrganizerTracks } from '@/lib/api/hackathons/tracks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import TracksSettingsTab from '@/components/organization/hackathons/settings/TracksSettingsTab';

interface RewardsTabProps {
  onContinue?: () => void;
  onSave?: (data: RewardsFormData) => Promise<void>;
  initialData?: RewardsFormData;
  isLoading?: boolean;
  /** Required to call the financial preview dry-run endpoint */
  organizationId?: string;
  hackathonId?: string;
  /** Tracks the organizer has created. Passed in so the parent can keep
   *  ownership of the fetch + react-query / refresh logic.
   *  Defaults to [] which collapses the track UI back to overall-only. */
  availableTracks?: TrackOption[];
}

const PRIZE_PRESETS = {
  standard: {
    name: 'Standard',
    description: 'Classic podium split',
    tiers: [50, 30, 20],
  },
  topHeavy: {
    name: 'Winner Takes Most',
    description: 'Heavily rewards 1st place',
    tiers: [70, 20, 10],
  },
  even: {
    name: 'Equal Split',
    description: 'Fair distribution for all',
    tiers: [33.33, 33.33, 33.34],
  },
  fiveWay: {
    name: 'Top 5',
    description: 'Rewards top 5 finishers',
    tiers: [40, 25, 20, 10, 5],
  },
};

const PLACE_LABELS = [
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th',
  '6th',
  '7th',
  '8th',
  '9th',
  '10th',
];
const RANK_EMOJIS = [
  '🥇',
  '🥈',
  '🥉',
  '🏅',
  '🏅',
  '🏅',
  '🏅',
  '🏅',
  '🏅',
  '🏅',
];

/** Build the initial funded amount from initialData so we can compute the top-up delta */
function computeInitialFundedAmount(initialData?: RewardsFormData): number {
  if (!initialData?.prizeTiers) return 0;
  return initialData.prizeTiers.reduce((sum, tier) => {
    const amount = parseFloat(String(tier.prizeAmount || '0'));
    return sum + (isNaN(amount) || amount < 0 ? 0 : amount);
  }, 0);
}

interface PrizeTierProps {
  tier: any;
  index: number;
  onRemove: (id: string) => void;
  canRemove: boolean;
  control: Control<RewardsFormData>;
  totalTiers: number;
  /** Tracks the organizer has created on this hackathon. */
  availableTracks: TrackOption[];
  /** When true, tier kind picker + track binding UI is visible. */
  tracksEnabled: boolean;
}

export interface TrackOption {
  id: string;
  name: string;
  slug: string;
  isArchived: boolean;
}

// ─── Sortable Prize Tier ─────────────────────────────────────────────────────
const PrizeTierComponent = ({
  tier,
  index,
  onRemove,
  canRemove,
  control,
  totalTiers,
  availableTracks,
  tracksEnabled,
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
                      placeholder={`${PLACE_LABELS[index] || `${index + 1}th`} Place`}
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
                        min='0'
                        value={field.value || '0'}
                        onChange={e => {
                          const raw = e.target.value;
                          // Block negatives — clamp to 0
                          const value =
                            raw === ''
                              ? '0'
                              : String(Math.max(0, parseFloat(raw) || 0));
                          field.onChange(value);
                        }}
                        onBlur={field.onBlur}
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

          {/* Tier kind + track binding (only when structure includes tracks) */}
          {tracksEnabled && (
            <div className='grid gap-3 rounded-md border border-zinc-800 bg-zinc-950/40 p-3 md:grid-cols-2'>
              <FormField
                control={control}
                name={`prizeTiers.${index}.kind`}
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <label className='text-xs font-medium text-zinc-400'>
                      Tier kind
                    </label>
                    <FormControl>
                      <select
                        value={field.value ?? 'OVERALL'}
                        onChange={e => {
                          const next = e.target.value as 'OVERALL' | 'TRACK';
                          field.onChange(next);
                        }}
                        className='h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-2 text-sm text-white'
                      >
                        <option value='OVERALL'>Overall placement</option>
                        <option value='TRACK'>Track</option>
                      </select>
                    </FormControl>
                    <FormMessage className='text-xs text-red-500' />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`prizeTiers.${index}.trackId`}
                render={({ field }) => {
                  const isTrack =
                    (tier?.kind as string | undefined) === 'TRACK';
                  return (
                    <FormItem className='space-y-1'>
                      <label className='text-xs font-medium text-zinc-400'>
                        Track
                      </label>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={e =>
                            field.onChange(e.target.value || undefined)
                          }
                          disabled={!isTrack}
                          className='h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-2 text-sm text-white disabled:opacity-50'
                        >
                          <option value=''>
                            {isTrack ? 'Select a track…' : '—'}
                          </option>
                          {availableTracks
                            .filter(t => !t.isArchived || t.id === field.value)
                            .map(t => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                                {t.isArchived ? ' (archived)' : ''}
                              </option>
                            ))}
                        </select>
                      </FormControl>
                      <FormMessage className='text-xs text-red-500' />
                    </FormItem>
                  );
                }}
              />
            </div>
          )}
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

// ─── Prize Summary (with top-up delta) ───────────────────────────────────────
interface PrizeSummaryProps {
  totalPool: number;
  initialFundedAmount: number;
  feeEstimate: FeeEstimateData | null;
  feeEstimateLoading: boolean;
}

const PrizeSummary = ({
  totalPool,
  initialFundedAmount,
  feeEstimate,
  feeEstimateLoading,
}: PrizeSummaryProps) => {
  const formatCurrency = (amount: number) =>
    amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

  const delta = totalPool - initialFundedAmount;
  const hasExistingFunds = initialFundedAmount > 0;

  return (
    <div className='border-primary/20 from-primary/10 to-primary/5 rounded-xl border bg-linear-to-br p-4'>
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

        {/* Existing funds row */}
        {hasExistingFunds && (
          <div className='flex items-center justify-between text-xs'>
            <span className='text-zinc-500'>Currently Funded</span>
            <span className='text-zinc-400'>
              ${formatCurrency(initialFundedAmount)}
            </span>
          </div>
        )}

        <div className='flex items-center justify-between text-xs'>
          <span className='text-zinc-500'>
            {feeEstimateLoading
              ? 'Calculating...'
              : (feeEstimate?.feeLabel ?? 'Platform Fee')}
          </span>
          <span className='text-zinc-400'>
            {feeEstimateLoading ? (
              <Loader2 className='inline h-3.5 w-3.5 animate-spin' />
            ) : feeEstimate ? (
              `$${formatCurrency(feeEstimate.feeAmount)}`
            ) : totalPool > 0 && totalPool < 5 ? (
              'Min. $5 for estimate'
            ) : null}
          </span>
        </div>

        <div className='bg-primary/20 h-px' />

        <div className='flex items-baseline justify-between'>
          <span className='text-sm font-medium text-zinc-300'>You'll Pay</span>
          <span className='text-primary text-xl font-bold'>
            {feeEstimateLoading ? (
              <Loader2 className='inline h-5 w-5 animate-spin' />
            ) : feeEstimate ? (
              `$${formatCurrency(feeEstimate.totalFunds)}`
            ) : (
              `$${formatCurrency(totalPool)}`
            )}
          </span>
        </div>

        {/* ── Top-Up / Refund Delta ── */}
        {hasExistingFunds && delta !== 0 && (
          <div
            className={cn(
              'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold',
              delta > 0
                ? 'border border-amber-500/20 bg-amber-500/10 text-amber-400'
                : 'border border-blue-500/20 bg-blue-500/10 text-blue-400'
            )}
          >
            <span className='flex items-center gap-1.5'>
              {delta > 0 ? (
                <ArrowUpCircle className='h-4 w-4' />
              ) : (
                <ArrowDownCircle className='h-4 w-4' />
              )}
              {delta > 0 ? 'Top-Up Required' : 'Reduction'}
            </span>
            <span>
              {delta > 0 ? '+' : ''}${formatCurrency(Math.abs(delta))} USDC
            </span>
          </div>
        )}

        {/* New hackathon — show full amount going to escrow */}
        {!hasExistingFunds && totalPool > 0 && (
          <div className='flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-400'>
            <span className='flex items-center gap-1.5'>
              <ArrowUpCircle className='h-4 w-4' />
              Sending to Escrow
            </span>
            <span>
              ${formatCurrency(feeEstimate?.totalFunds ?? totalPool)} USDC
            </span>
          </div>
        )}

        <div className='border-primary/10 flex items-start gap-2 border-t pt-3'>
          <Info className='text-primary mt-0.5 h-4 w-4 shrink-0' />
          <p className='text-xs text-zinc-400'>
            Funds are locked in escrow until winners are announced
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Validation Alert ─────────────────────────────────────────────────────────
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
            ? 'Your prize pool meets the recommended threshold.'
            : `We recommend at least $${minPool.toLocaleString()} to attract quality participants.`}
        </p>
      </div>
    </div>
  );
};

// ─── Wallet Debit Warning ─────────────────────────────────────────────────────
// Shows only the NEW funds leaving the wallet:
//   • New hackathon  → full fee-adjusted total
//   • Existing hackathon top-up → delta only (totalPool - initialFundedAmount)
//   • Reduction / unchanged → hidden (no new funds leaving)
const WalletWarningAlert = ({
  totalPool,
  initialFundedAmount,
  feeEstimate,
}: {
  totalPool: number;
  initialFundedAmount: number;
  feeEstimate: FeeEstimateData | null;
}) => {
  const formatAmt = (n: number) =>
    n.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

  const hasExistingFunds = initialFundedAmount > 0;
  const delta = totalPool - initialFundedAmount;

  // Nothing new is leaving the wallet — hide the warning
  if (hasExistingFunds && delta <= 0) return null;
  if (!hasExistingFunds && totalPool <= 0) return null;

  // For a top-up on an existing hackathon, only the delta leaves the wallet.
  // For a new hackathon, the full fee-adjusted amount leaves.
  const outgoingAmount = hasExistingFunds
    ? formatAmt(delta) // just the extra being added
    : feeEstimate
      ? formatAmt(feeEstimate.totalFunds)
      : formatAmt(totalPool);

  const isTopUp = hasExistingFunds;

  return (
    <div className='flex items-start gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4'>
      <Wallet className='mt-0.5 h-5 w-5 shrink-0 text-orange-400' />
      <div className='flex-1 space-y-1'>
        <p className='text-sm font-semibold text-orange-300'>
          ⚠️{' '}
          {isTopUp
            ? 'Additional funds will be moved from your wallet'
            : 'Funds will be moved from your wallet'}
        </p>
        <p className='text-xs leading-relaxed text-orange-400/90'>
          By clicking <strong>{isTopUp ? 'Save Rewards' : 'Continue'}</strong>,{' '}
          {isTopUp ? (
            <>
              an additional{' '}
              <strong className='text-orange-300'>
                ${outgoingAmount} USDC
              </strong>{' '}
              (the top-up amount) will be transferred
            </>
          ) : (
            <>
              exactly{' '}
              <strong className='text-orange-300'>
                ${outgoingAmount} USDC
              </strong>{' '}
              will be transferred
            </>
          )}{' '}
          from your connected wallet into a secure escrow smart contract. This
          action is <strong>irreversible</strong> without contacting support.
          Please ensure your wallet has sufficient balance before proceeding.
        </p>
      </div>
    </div>
  );
};

// ─── Preset Confirmation Banner ───────────────────────────────────────────────
interface PresetConfirmBannerProps {
  presetKey: keyof typeof PRIZE_PRESETS;
  totalPool: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const PresetConfirmBanner = ({
  presetKey,
  totalPool,
  onConfirm,
  onCancel,
}: PresetConfirmBannerProps) => {
  const preset = PRIZE_PRESETS[presetKey];
  const formatCurrency = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 0 });

  return (
    <div className='flex flex-col gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-start gap-2'>
          <TriangleAlert className='mt-0.5 h-5 w-5 shrink-0 text-yellow-400' />
          <div>
            <p className='text-sm font-semibold text-yellow-300'>
              Apply "{preset.name}" Preset?
            </p>
            <p className='mt-1 text-xs text-yellow-400/90'>
              This will replace your current prize tiers with{' '}
              <strong>{preset.tiers.length} new tiers</strong> using the{' '}
              <strong>{preset.tiers.join(' / ')}%</strong> split.
              {totalPool > 0 && (
                <>
                  {' '}
                  Your current total of{' '}
                  <strong>${formatCurrency(totalPool)}</strong> will be
                  redistributed proportionally across the new tiers.
                </>
              )}
            </p>
          </div>
        </div>
        <button
          type='button'
          onClick={onCancel}
          className='text-yellow-400/60 transition-colors hover:text-yellow-300'
        >
          <X className='h-4 w-4' />
        </button>
      </div>
      <div className='flex items-center gap-2'>
        <Button
          type='button'
          size='sm'
          onClick={onConfirm}
          className='border border-yellow-500/30 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
        >
          Yes, apply preset
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={onCancel}
          className='text-zinc-400 hover:text-white'
        >
          Keep current setup
        </Button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RewardsTab({
  onSave,
  onContinue,
  initialData,
  isLoading = false,
  organizationId,
  hackathonId,
  availableTracks: availableTracksProp,
}: RewardsTabProps) {
  // Tracks state. When the parent passes `availableTracks` we honor it
  // and skip the internal fetch (settings page already maintains its own
  // list). Otherwise we fetch + manage tracks ourselves so the new-
  // hackathon wizard works without parent plumbing.
  const [internalTracks, setInternalTracks] = useState<TrackOption[]>([]);
  const availableTracks = availableTracksProp ?? internalTracks;
  const refetchTracks = useCallback(async () => {
    if (availableTracksProp) return; // parent owns this state
    if (!organizationId || !hackathonId) return;
    try {
      const rows = await listOrganizerTracks(organizationId, hackathonId);
      setInternalTracks(
        rows.map(r => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          isArchived: r.isArchived,
        }))
      );
    } catch {
      // Best-effort: track UI degrades gracefully if the call fails.
      setInternalTracks([]);
    }
  }, [availableTracksProp, organizationId, hackathonId]);
  useEffect(() => {
    refetchTracks();
  }, [refetchTracks]);
  const [manageTracksOpen, setManageTracksOpen] = useState(false);

  const [showPresets, setShowPresets] = useState(false);
  const [pendingPreset, setPendingPreset] = useState<
    keyof typeof PRIZE_PRESETS | null
  >(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewData, setPreviewData] = useState<FinancialPreviewData | null>(
    null
  );
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  /** The amount that was already funded when this form was opened (for top-up delta). */
  const initialFundedAmount = useMemo(
    () => computeInitialFundedAmount(initialData),
    // intentionally only computed once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /**
   * Normalize initialData from the API into the shapes that Zod and the form expect:
   *  - prizeAmount  → always a string  (API returns numbers like 30)
   *  - rank         → always a number
   *  - passMark     → always a number (default 0 if absent)
   *  - id           → always present  (generate if the API tier lacks one)
   */
  const normalizedDefaultValues = useMemo<RewardsFormData>(() => {
    if (initialData?.prizeTiers?.length) {
      return {
        ...initialData,
        prizeTiers: initialData.prizeTiers.map((tier, idx) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const raw = tier as any;
          return {
            id: raw.id || `tier-init-${idx}-${Date.now()}`,
            place: tier.place || `${PLACE_LABELS[idx] || `${idx + 1}th`} Place`,
            prizeAmount: String(tier.prizeAmount ?? '0'),
            description: tier.description || '',
            currency: tier.currency || 'USDC',
            rank: Number(tier.rank ?? idx + 1),
            passMark: Number(raw.passMark ?? 0),
            // Preserve track-binding fields when reloading a saved
            // draft — without these the per-tier track picker shows
            // blank even though the structure picker remembers the
            // organizer's choice.
            ...(raw.kind !== undefined && { kind: raw.kind }),
            ...(raw.trackId !== undefined && { trackId: raw.trackId }),
          };
        }),
      };
    }
    return {
      prizeTiers: [
        {
          id: `tier-${Date.now()}-1`,
          place: '1st Place',
          prizeAmount: '0',
          description: '',
          currency: 'USDC',
          rank: 1,
          passMark: 80,
        },
        {
          id: `tier-${Date.now()}-2`,
          place: '2nd Place',
          prizeAmount: '0',
          description: '',
          currency: 'USDC',
          rank: 2,
          passMark: 70,
        },
        {
          id: `tier-${Date.now()}-3`,
          place: '3rd Place',
          prizeAmount: '0',
          description: '',
          currency: 'USDC',
          rank: 3,
          passMark: 50,
        },
      ],
    };
    // Intentionally run only once on mount — initialData reference may change on
    // parent re-renders but we don't want to reset the user's in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm<RewardsFormData>({
    resolver: zodResolver(rewardsSchema),
    mode: 'onChange',
    defaultValues: normalizedDefaultValues,
  });

  const { fields, append, remove, move, replace } = useFieldArray({
    control: form.control,
    name: 'prizeTiers',
  });

  const prizeTiers = useWatch({
    control: form.control,
    name: 'prizeTiers',
    defaultValue: form.getValues('prizeTiers') || [],
  });

  const totalPool = useMemo(() => {
    return prizeTiers.reduce((sum, tier) => {
      const amount = parseFloat(
        String(tier.prizeAmount || '0').replace(/[^\d.-]/g, '')
      );
      return sum + (isNaN(amount) || amount < 0 ? 0 : amount);
    }, 0);
  }, [prizeTiers]);

  const [feeEstimate, setFeeEstimate] = useState<FeeEstimateData | null>(null);
  const [feeEstimateLoading, setFeeEstimateLoading] = useState(false);
  const feeEstimateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    if (totalPool < 5) {
      setFeeEstimate(null);
      setFeeEstimateLoading(false);
      if (feeEstimateTimeoutRef.current) {
        clearTimeout(feeEstimateTimeoutRef.current);
        feeEstimateTimeoutRef.current = null;
      }
      return;
    }

    feeEstimateTimeoutRef.current = setTimeout(() => {
      setFeeEstimateLoading(true);
      getFeeEstimate(totalPool)
        .then(data => {
          setFeeEstimate(data);
        })
        .catch(() => {
          setFeeEstimate(null);
        })
        .finally(() => {
          setFeeEstimateLoading(false);
        });
    }, 400);

    return () => {
      if (feeEstimateTimeoutRef.current) {
        clearTimeout(feeEstimateTimeoutRef.current);
        feeEstimateTimeoutRef.current = null;
      }
    };
  }, [totalPool]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  /** Step 1: User clicks a preset card → show the confirmation banner */
  const handlePresetClick = (presetKey: keyof typeof PRIZE_PRESETS) => {
    setPendingPreset(presetKey);
    setShowPresets(false); // collapse the grid while confirming
  };

  /** Step 2: User confirms → actually apply the preset */
  const confirmApplyPreset = () => {
    if (!pendingPreset) return;
    const preset = PRIZE_PRESETS[pendingPreset];
    const baseAmount = totalPool || 0;

    // Preserve descriptions from existing tiers where possible
    const existingTiers = form.getValues('prizeTiers');

    const newTiers = preset.tiers.map((percentage, idx) => ({
      id: `tier-${Date.now()}-${idx}`,
      place: `${PLACE_LABELS[idx] || `${idx + 1}th`} Place`,
      prizeAmount: String(Math.round((baseAmount * percentage) / 100)),
      // preserve description if same index existed
      description: existingTiers[idx]?.description || '',
      currency: 'USDC',
      rank: idx + 1,
      passMark: Math.max(0, 80 - idx * 10),
    }));

    replace(newTiers);
    toast.success(`Applied "${preset.name}" preset`);
    setPendingPreset(null);
  };

  const cancelPreset = () => {
    setPendingPreset(null);
    setShowPresets(true); // re-open grid so user can pick another
  };

  const handleRemove = (id: string) => {
    const index = fields.findIndex(tier => tier.id === id);
    if (index !== -1 && fields.length > 1) {
      remove(index);
      toast.success('Prize tier removed');
    }
  };

  const handleAdd = () => {
    const nextIdx = fields.length;
    const nextPlace = `${PLACE_LABELS[nextIdx] || `${nextIdx + 1}th`} Place`;
    append({
      id: `tier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      place: nextPlace,
      prizeAmount: '0',
      description: '',
      currency: 'USDC',
      rank: nextIdx + 1,
      passMark: 0,
    });
    toast.success('Prize tier added');
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex(tier => tier.id === active.id);
      const newIndex = fields.findIndex(tier => tier.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
        // Re-sync rank values after reorder so the backend receives correct positions
        // setTimeout allows useFieldArray to settle before we read the new order
        setTimeout(() => {
          const current = form.getValues('prizeTiers');
          current.forEach((_, idx) => {
            form.setValue(`prizeTiers.${idx}.rank`, idx + 1, {
              shouldDirty: true,
            });
          });
        }, 0);
      }
    }
  };

  const onSubmit = async (data: RewardsFormData) => {
    try {
      if (onSave) {
        await onSave(data);
      }
      if (onContinue) {
        onContinue();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      const errorMessage = Array.isArray(message) ? message[0] : message;
      toast.error(
        errorMessage || 'Failed to save rewards settings. Please try again.'
      );
    }
  };

  /**
   * Called when the action button is clicked.
   * 1. Runs Zod validation — shows inline errors if invalid.
   * 2. If valid and org/hackathon IDs are present, calls the dry-run preview endpoint.
   * 3. Opens the confirm dialog (with live preview data if available).
   */
  const handleContinueClick = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    // Reset preview state for this dialog open
    setPreviewData(null);
    setPreviewError(null);
    setConfirmOpen(true);

    if (organizationId && hackathonId) {
      setPreviewLoading(true);
      try {
        const tiers = form.getValues('prizeTiers');
        const data = await getFinancialPreview(organizationId, hackathonId, {
          prizeTiers: tiers,
        });
        setPreviewData(data);
      } catch (err: any) {
        setPreviewError(
          err?.response?.data?.message ||
            err?.message ||
            'Could not load cost preview. You can still proceed.'
        );
      } finally {
        setPreviewLoading(false);
      }
    }
  };

  /** Called only when the user clicks "Yes, lock funds" inside the AlertDialog. */
  const handleConfirmedSubmit = form.handleSubmit(onSubmit);

  // Derive root-level tier array error message (true schema failures only)
  const tierArrayError =
    form.formState.errors.prizeTiers?.message ||
    (form.formState.errors.prizeTiers?.root as any)?.message;

  // Live structure picker value drives:
  // - Whether per-tier kind/track UI is shown.
  // - Whether the schema's superRefine rejects mismatched tiers.
  const prizeStructure = useWatch({
    control: form.control,
    name: 'prizeStructure',
    defaultValue: 'OVERALL_ONLY',
  });
  const tracksEnabled =
    prizeStructure === 'OVERALL_AND_TRACKS' || prizeStructure === 'TRACKS_ONLY';
  const hasTracks = availableTracks.some(t => !t.isArchived);

  // Detect "tracks created but no tier is bound to them" — the most
  // common reason the public page shows zero track prizes. Surfaces a
  // banner with a direct CTA so organizers don't have to guess what
  // step they missed.
  const watchedTiers = useWatch({
    control: form.control,
    name: 'prizeTiers',
    defaultValue: form.getValues('prizeTiers') || [],
  });
  const hasAnyTrackTier = (watchedTiers ?? []).some(t => t?.kind === 'TRACK');
  const showTracksUnboundBanner =
    tracksEnabled && hasTracks && !hasAnyTrackTier;
  const boundTrackIds = new Set(
    (watchedTiers ?? [])
      .filter(t => t?.kind === 'TRACK' && t?.trackId)
      .map(t => t!.trackId as string)
  );
  const unboundActiveTracks = availableTracks.filter(
    t => !t.isArchived && !boundTrackIds.has(t.id)
  );

  return (
    <Form {...form}>
      {/* onSubmit is intentionally preventDefault — submission goes through handleContinueClick → AlertDialog confirm */}
      <form onSubmit={e => e.preventDefault()} className='space-y-6'>
        {/* Header */}
        <div>
          <h3 className='text-lg font-medium text-white'>Prize Distribution</h3>
          <p className='mt-1 text-sm text-zinc-500'>
            Set up prizes and drag to reorder winners
          </p>
        </div>

        {/* Prize structure picker */}
        <FormField
          control={form.control}
          name='prizeStructure'
          render={({ field }) => (
            <FormItem>
              <div className='flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-medium text-white'>
                      Prize structure
                    </p>
                    <p className='mt-0.5 text-xs text-zinc-500'>
                      Overall only is the legacy default. Switch to Overall +
                      Tracks for things like Best UI/UX alongside 1st/2nd/3rd.
                    </p>
                  </div>
                  {organizationId && hackathonId && tracksEnabled && (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setManageTracksOpen(true)}
                      className='shrink-0'
                    >
                      <Plus className='h-3.5 w-3.5' />
                      {hasTracks ? 'Manage tracks' : 'Add tracks'}
                    </Button>
                  )}
                </div>
                <div className='grid gap-2 md:grid-cols-3'>
                  {(
                    [
                      {
                        value: 'OVERALL_ONLY',
                        title: 'Overall only',
                        hint: '1st, 2nd, 3rd. No tracks.',
                      },
                      {
                        value: 'OVERALL_AND_TRACKS',
                        title: 'Overall + Tracks',
                        hint: 'Top placements + category prizes.',
                      },
                      {
                        value: 'TRACKS_ONLY',
                        title: 'Tracks only',
                        hint: 'Every prize is a track.',
                      },
                    ] as const
                  ).map(opt => {
                    const active =
                      (field.value ?? 'OVERALL_ONLY') === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type='button'
                        onClick={() => field.onChange(opt.value)}
                        className={cn(
                          'rounded-lg border p-3 text-left transition-colors',
                          active
                            ? 'border-primary bg-primary/10'
                            : 'border-zinc-800 bg-zinc-950/30 hover:border-zinc-700'
                        )}
                      >
                        <p
                          className={cn(
                            'text-sm font-medium',
                            active ? 'text-primary' : 'text-white'
                          )}
                        >
                          {opt.title}
                        </p>
                        <p className='mt-0.5 text-xs text-zinc-500'>
                          {opt.hint}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {tracksEnabled && !hasTracks && (
                  <p className='flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300'>
                    <Info className='h-3.5 w-3.5' />
                    {organizationId && hackathonId
                      ? 'No tracks created yet. Click "Add tracks" to create them, then bind tiers to each one below.'
                      : 'No tracks created yet. Create tracks in the Tracks tab first, then come back here to bind tiers to them.'}
                  </p>
                )}
                {tracksEnabled && hasTracks && (
                  <p className='text-xs text-zinc-500'>
                    {availableTracks.filter(t => !t.isArchived).length} active
                    track
                    {availableTracks.filter(t => !t.isArchived).length === 1
                      ? ''
                      : 's'}{' '}
                    available. Mark a tier&apos;s kind as &ldquo;Track&rdquo;
                    below to bind it.
                  </p>
                )}
                <FormMessage className='text-xs text-red-500' />
              </div>
            </FormItem>
          )}
        />

        {/* Tracks-unbound warning. Common case: organizer set the
            structure + created tracks, but forgot to mark any tier's
            kind as TRACK. Without this banner the public page shows
            zero track prizes and the cause isn't obvious. */}
        {showTracksUnboundBanner && (
          <div className='flex flex-col gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4'>
            <div className='flex items-start gap-3'>
              <Info className='mt-0.5 h-5 w-5 shrink-0 text-amber-400' />
              <div className='space-y-1'>
                <p className='text-sm font-medium text-amber-200'>
                  Tracks created but no prize is bound to them
                </p>
                <p className='text-xs text-amber-300/80'>
                  You have{' '}
                  <span className='font-semibold'>
                    {availableTracks.filter(t => !t.isArchived).length} track
                    {availableTracks.filter(t => !t.isArchived).length === 1
                      ? ''
                      : 's'}
                  </span>{' '}
                  set up, but none of your prize tiers below is marked as a
                  Track. The public hackathon page will show only your overall
                  placements. To award a track prize:
                </p>
                <ol className='list-decimal pl-4 text-xs text-amber-300/80'>
                  <li>
                    Pick a prize tier you want to be a track prize (or click
                    &ldquo;Add Prize Tier&rdquo; for a new one).
                  </li>
                  <li>
                    Change its <strong>Tier kind</strong> dropdown to{' '}
                    <strong>Track</strong>.
                  </li>
                  <li>
                    Pick the track from the dropdown next to it. Save when done.
                  </li>
                </ol>
                <p className='pt-1 text-[11px] text-amber-300/60'>
                  Tracks still waiting for a tier:{' '}
                  {unboundActiveTracks.map(t => t.name).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Card */}
        <PrizeSummary
          totalPool={totalPool}
          initialFundedAmount={initialFundedAmount}
          feeEstimate={feeEstimate}
          feeEstimateLoading={feeEstimateLoading}
        />

        {/* Validation */}
        <ValidationAlert totalPool={totalPool} />

        {/* Presets */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setPendingPreset(null); // clear any pending confirm
                setShowPresets(!showPresets);
              }}
              className='flex-1 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'
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
          </div>

          {/* Info callout about what presets do */}
          {showPresets && (
            <div className='flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-400'>
              <Info className='mt-0.5 h-4 w-4 shrink-0 text-zinc-500' />
              <p>
                Presets redistribute your current total prize pool (
                <strong className='text-zinc-300'>
                  ${totalPool.toLocaleString()}
                </strong>
                ) across tiers using a percentage split. You can still adjust
                individual amounts after applying.{' '}
                {totalPool === 0 && (
                  <span className='text-amber-400'>
                    Tip: enter prize amounts first so the preset can split them
                    correctly.
                  </span>
                )}
              </p>
            </div>
          )}

          {showPresets && (
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              {Object.entries(PRIZE_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type='button'
                  onClick={() =>
                    handlePresetClick(key as keyof typeof PRIZE_PRESETS)
                  }
                  className='group hover:border-primary/50 hover:bg-primary/5 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 text-left transition-all'
                >
                  <p className='group-hover:text-primary font-medium text-white transition-colors'>
                    {preset.name}
                  </p>
                  <p className='mt-0.5 text-xs text-zinc-500'>
                    {preset.description}
                  </p>
                  <p className='mt-1.5 font-mono text-xs text-zinc-400'>
                    {preset.tiers.map(t => `${t}%`).join(' / ')}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Preset confirmation banner */}
          {pendingPreset && (
            <PresetConfirmBanner
              presetKey={pendingPreset}
              totalPool={totalPool}
              onConfirm={confirmApplyPreset}
              onCancel={cancelPreset}
            />
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
                  tier={prizeTiers[index] ?? tier}
                  index={index}
                  onRemove={handleRemove}
                  canRemove={fields.length > 1}
                  control={form.control}
                  totalTiers={fields.length}
                  availableTracks={availableTracks}
                  tracksEnabled={tracksEnabled}
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

          {/* Generic schema validation error (not a "must use preset" message) */}
          {tierArrayError && (
            <div className='rounded-lg border border-red-500/20 bg-red-500/10 p-3'>
              <p className='flex items-center gap-2 text-sm font-medium text-red-400'>
                <AlertCircle className='h-4 w-4' />
                {tierArrayError}
              </p>
            </div>
          )}
        </div>

        {/* ── Wallet Debit Warning – shown before submit ── */}
        <WalletWarningAlert
          totalPool={totalPool}
          initialFundedAmount={initialFundedAmount}
          feeEstimate={feeEstimate}
        />

        {/* Submit */}
        <div className='flex items-center justify-between border-t border-zinc-800 pt-6'>
          <p className='text-sm text-zinc-500'>
            {fields.length} prize tier{fields.length !== 1 ? 's' : ''}{' '}
            configured
          </p>

          <BoundlessButton
            type='button'
            size='lg'
            disabled={isLoading}
            className='min-w-32'
            onClick={handleContinueClick}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : onContinue ? (
              'Continue'
            ) : (
              'Save Rewards'
            )}
          </BoundlessButton>
        </div>
      </form>

      {/* Inline tracks management. Renders the same CRUD UX as the
          settings-page Tracks tab inside a dialog so organizers can
          create tracks from the new-hackathon wizard or from the
          Rewards step without leaving context. */}
      {organizationId && hackathonId && (
        <Dialog
          open={manageTracksOpen}
          onOpenChange={open => {
            setManageTracksOpen(open);
            if (!open) {
              // Re-fetch on close so the structure picker / per-tier
              // dropdown reflects whatever the organizer did inside.
              refetchTracks();
            }
          }}
        >
          <DialogContent className='max-w-3xl border-zinc-800 bg-zinc-950 p-0 text-white'>
            <DialogHeader className='px-6 pt-6'>
              <DialogTitle>Manage tracks</DialogTitle>
              <DialogDescription>
                Create, rename, or archive the tracks this hackathon awards
                prizes for. Tier bindings below update automatically.
              </DialogDescription>
            </DialogHeader>
            <div className='max-h-[70vh] overflow-y-auto px-6 pb-6'>
              <TracksSettingsTab
                organizationId={organizationId}
                hackathonId={hackathonId}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Confirmation AlertDialog ── */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className='border-zinc-800 bg-zinc-950 text-white sm:max-w-lg'>
          <AlertDialogHeader>
            <div className='mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/15'>
              <Wallet className='h-6 w-6 text-orange-400' />
            </div>
            <AlertDialogTitle className='text-white'>
              Confirm Fund Transfer
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className='space-y-3 text-zinc-400'>
                {/* Loading state */}
                {previewLoading && (
                  <div className='flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400'>
                    <Loader2 className='h-4 w-4 animate-spin text-zinc-500' />
                    Calculating exact cost…
                  </div>
                )}

                {/* Error fallback — still lets user proceed */}
                {previewError && !previewLoading && (
                  <div className='rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-300'>
                    <p className='font-semibold'>Preview unavailable</p>
                    <p className='mt-0.5 text-xs text-amber-400/80'>
                      {previewError}
                    </p>
                  </div>
                )}

                {/* Rich preview from dry-run endpoint */}
                {previewData &&
                  !previewLoading &&
                  (() => {
                    const fmt = (n: number) =>
                      n.toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      });
                    return (
                      <>
                        <p>
                          You are about to{' '}
                          {previewData.additionalFundingRequired > 0
                            ? 'top up'
                            : 'update'}{' '}
                          your escrow by{' '}
                          <strong className='text-white'>
                            ${fmt(previewData.additionalFundingRequired)} USDC
                          </strong>
                          .
                        </p>

                        {/* Wallet sufficiency */}
                        <div
                          className={cn(
                            'rounded-lg border p-3 text-sm',
                            previewData.sufficient
                              ? 'border-green-500/20 bg-green-500/10 text-green-300'
                              : 'border-red-500/20 bg-red-500/10 text-red-300'
                          )}
                        >
                          <div className='flex items-center justify-between'>
                            <span>Wallet balance</span>
                            <span className='font-semibold'>
                              ${fmt(previewData.walletBalance)} USDC
                            </span>
                          </div>
                          {!previewData.sufficient && (
                            <p className='mt-1 text-xs text-red-400'>
                              ⚠️ Shortfall of ${fmt(previewData.shortfall)} USDC
                              — please top up your wallet before proceeding.
                            </p>
                          )}
                        </div>

                        {/* Irreversibility warning */}
                        <div className='rounded-lg border border-orange-500/20 bg-orange-500/10 p-3 text-sm text-orange-300'>
                          <p className='font-semibold'>
                            ⚠️ This action is irreversible
                          </p>
                          <p className='mt-1 text-xs text-orange-400/80'>
                            Once confirmed, funds move on-chain into escrow and
                            cannot be withdrawn without contacting support.
                          </p>
                        </div>

                        {/* Cost summary */}
                        <div className='space-y-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-sm'>
                          <div className='flex justify-between'>
                            <span className='text-zinc-500'>Current pool</span>
                            <span className='text-zinc-300'>
                              ${fmt(previewData.currentPrizePool)} USDC
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-zinc-500'>New pool</span>
                            <span className='text-zinc-300'>
                              ${fmt(previewData.newPrizePool)} USDC
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-zinc-500'>
                              New platform fee
                            </span>
                            <span className='text-zinc-300'>
                              ${fmt(previewData.newPlatformFee)} USDC
                            </span>
                          </div>
                          <div className='flex justify-between border-t border-zinc-800 pt-1.5 font-semibold'>
                            <span className='text-zinc-400'>
                              You'll pay now
                            </span>
                            <span className='text-white'>
                              ${fmt(previewData.additionalFundingRequired)} USDC
                            </span>
                          </div>
                        </div>

                        {/* Per-tier breakdown */}
                        {previewData.breakdown.length > 0 && (
                          <div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-sm'>
                            <p className='mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase'>
                              Per-tier breakdown
                            </p>
                            <div className='space-y-1'>
                              {previewData.breakdown.map((tier, i) => (
                                <div
                                  key={i}
                                  className='flex items-center justify-between text-xs'
                                >
                                  <span className='text-zinc-400'>
                                    {tier.place}
                                  </span>
                                  <span className='text-zinc-300'>
                                    ${fmt(tier.amount)} + ${fmt(tier.fee)} fee ={' '}
                                    <strong>${fmt(tier.total)}</strong>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}

                {/* Fallback when no org/hackathon IDs (creation flow) */}
                {!organizationId && !previewLoading && !previewData && (
                  <>
                    <p>
                      You are about to lock{' '}
                      <strong className='text-white'>
                        {(() => {
                          const hasExisting = initialFundedAmount > 0;
                          const delta = totalPool - initialFundedAmount;
                          const amt = hasExisting
                            ? delta
                            : (feeEstimate?.totalFunds ?? totalPool);
                          return `$${amt.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} USDC`;
                        })()}
                      </strong>{' '}
                      {initialFundedAmount > 0 ? '(top-up) ' : ''}into escrow.
                    </p>
                    <div className='rounded-lg border border-orange-500/20 bg-orange-500/10 p-3 text-sm text-orange-300'>
                      <p className='font-semibold'>
                        ⚠️ This action is irreversible
                      </p>
                      <p className='mt-1 text-xs text-orange-400/80'>
                        Once confirmed, funds move on-chain and cannot be
                        withdrawn without contacting support. Ensure your wallet
                        has sufficient balance.
                      </p>
                    </div>
                    <div className='space-y-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-zinc-500'>Prize tiers</span>
                        <span className='text-zinc-300'>{fields.length}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-zinc-500'>Total prize pool</span>
                        <span className='text-zinc-300'>
                          $
                          {totalPool.toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}{' '}
                          USDC
                        </span>
                      </div>
                      {feeEstimate && (
                        <div className='flex justify-between'>
                          <span className='text-zinc-500'>
                            {feeEstimate.feeLabel ?? 'Platform fee'}
                          </span>
                          <span className='text-zinc-300'>
                            $
                            {feeEstimate.feeAmount.toLocaleString('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}{' '}
                            USDC
                          </span>
                        </div>
                      )}
                      {initialFundedAmount > 0 && (
                        <div className='flex justify-between border-t border-zinc-800 pt-1.5'>
                          <span className='text-zinc-500'>
                            Already in escrow
                          </span>
                          <span className='text-zinc-300'>
                            $
                            {initialFundedAmount.toLocaleString('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}{' '}
                            USDC
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white'>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={previewData ? !previewData.sufficient : false}
              onClick={e => {
                e.preventDefault();
                setConfirmOpen(false);
                handleConfirmedSubmit();
              }}
              className={cn(
                'text-white',
                previewData && !previewData.sufficient
                  ? 'cursor-not-allowed bg-zinc-600 opacity-50'
                  : 'bg-orange-500 hover:bg-orange-600'
              )}
            >
              {previewData && !previewData.sufficient
                ? 'Insufficient balance'
                : 'Yes, lock funds'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
