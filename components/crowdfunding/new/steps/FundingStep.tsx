'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DollarSign, Info, Calendar } from 'lucide-react';
import { feeBreakdown, money } from '../fee';
import type { CampaignWizardData } from '../NewCampaignWizard';

interface Props {
  data: CampaignWizardData;
  onChange: (patch: Partial<CampaignWizardData>) => void;
}

export default function FundingStep({ data, onChange }: Props) {
  const goal = data.fundingGoal || 0;
  // The fee comes out of the goal: the creator absorbs it, backers pay no extra.
  const { fee, net, feePercent } = feeBreakdown(goal);

  return (
    <div className='space-y-8'>
      <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-4 text-sm text-zinc-400'>
        Set your funding goal in USDC. Backers support you directly; funds are
        held safely and released as you complete each milestone.
      </div>

      <div className='space-y-1.5'>
        <Label
          htmlFor='fundingGoal'
          className='text-sm font-medium text-zinc-300'
        >
          Funding goal (USDC) <span className='text-red-400'>*</span>
        </Label>
        <div className='relative'>
          <DollarSign className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
          <Input
            id='fundingGoal'
            type='number'
            min={1}
            step={1}
            placeholder='e.g. 10000'
            value={data.fundingGoal || ''}
            onChange={e =>
              onChange({ fundingGoal: parseFloat(e.target.value) || 0 })
            }
            className='border-zinc-800 bg-zinc-950 pl-9 text-white placeholder:text-zinc-600'
          />
        </div>
        <p className='text-xs text-zinc-600'>
          The total amount you aim to raise. Milestone payouts are calculated
          from this number.
        </p>
      </div>

      {/* Fee breakdown */}
      <div className='overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/40'>
        <div className='border-b border-zinc-800/60 px-4 py-3'>
          <p className='text-sm font-medium text-zinc-300'>What you receive</p>
        </div>
        <div className='divide-y divide-zinc-800/50'>
          <div className='flex items-center justify-between px-4 py-3'>
            <span className='text-sm text-zinc-400'>Funding goal</span>
            <span className='text-sm text-zinc-300'>
              {goal > 0 ? `$${money(goal)} USDC` : 'Set a goal above'}
            </span>
          </div>
          <div className='flex items-center justify-between px-4 py-3'>
            <span className='text-sm text-zinc-400'>
              Boundless fee ({feePercent}%)
            </span>
            <span className='text-sm text-zinc-300'>
              {goal > 0 ? `- $${money(fee)}` : `${feePercent}%`}
            </span>
          </div>
          <div className='flex items-center justify-between bg-zinc-900/30 px-4 py-3'>
            <span className='text-sm font-medium text-zinc-300'>
              You receive
            </span>
            <span className='text-sm font-semibold text-emerald-400'>
              {goal > 0 ? `$${money(net)} USDC` : `Goal minus ${feePercent}%`}
            </span>
          </div>
        </div>
        <div className='flex gap-2.5 bg-zinc-900/40 px-4 py-3'>
          <Info className='mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-500' />
          <p className='text-xs text-zinc-500'>
            Backers contribute toward your goal and pay no extra. The{' '}
            {feePercent}% Boundless fee comes out of the amount you raise, so
            you receive{' '}
            {goal > 0 ? `$${money(net)}` : 'your goal minus the fee'}, released
            equally across your milestones.
          </p>
        </div>
      </div>

      {/* Deadline is system-set after voting */}
      <div className='flex items-start gap-3 rounded-xl border border-zinc-800/40 bg-zinc-900/20 p-4 text-sm text-zinc-500'>
        <Calendar className='mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-600' />
        <p>
          The funding window opens automatically once your campaign passes
          community voting. Boundless sets the deadline at that point, so you do
          not pick a date here.
        </p>
      </div>
    </div>
  );
}
