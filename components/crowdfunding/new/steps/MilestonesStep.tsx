'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Lock,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CampaignWizardData, WizardMilestone } from '../NewCampaignWizard';
import { feeBreakdown, money } from '../fee';
import {
  MILESTONE_TEMPLATES,
  instantiateTemplate,
  type MilestoneTemplate,
} from '../milestone-templates';

interface Props {
  data: CampaignWizardData;
  onChange: (patch: Partial<CampaignWizardData>) => void;
}

const EMPTY_MILESTONE: WizardMilestone = {
  title: '',
  description: '',
  deliverable: '',
  expectedDeliveryDate: '',
  successCriteria: '',
};

const MAX_MILESTONES = 10;

function formatShare(n: number): string {
  if (n <= 0) return '0';
  const pct = 100 / n;
  return Number.isInteger(pct) ? String(pct) : pct.toFixed(1);
}

export default function MilestonesStep({ data, onChange }: Props) {
  const milestones = data.milestones;
  const n = milestones.length;
  const sharePct = formatShare(n);
  // Payouts are the post-fee amount the creator receives, split evenly.
  const { net } = feeBreakdown(data.fundingGoal);
  const shareAmount = n > 0 && net > 0 ? net / n : 0;

  const [pendingTemplate, setPendingTemplate] =
    useState<MilestoneTemplate | null>(null);

  const update = (idx: number, patch: Partial<WizardMilestone>) => {
    onChange({
      milestones: milestones.map((m, i) =>
        i === idx ? { ...m, ...patch } : m
      ),
    });
  };

  const add = () => {
    if (n >= MAX_MILESTONES) return;
    onChange({ milestones: [...milestones, { ...EMPTY_MILESTONE }] });
  };

  const remove = (idx: number) => {
    onChange({ milestones: milestones.filter((_, i) => i !== idx) });
  };

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= n) return;
    const next = [...milestones];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange({ milestones: next });
  };

  const applyTemplate = (template: MilestoneTemplate) => {
    if (n > 0) {
      setPendingTemplate(template);
      return;
    }
    onChange({ milestones: instantiateTemplate(template) });
  };

  const confirmApply = () => {
    if (pendingTemplate) {
      onChange({ milestones: instantiateTemplate(pendingTemplate) });
      setPendingTemplate(null);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Equal-split explainer */}
      <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-4 text-sm text-zinc-400'>
        Break your project into checkpoints. Funding releases{' '}
        <span className='font-medium text-zinc-200'>equally</span> across your
        milestones, one tranche at a time, after a reviewer approves each one.
        You can have between 1 and {MAX_MILESTONES} milestones.
      </div>

      {/* Template quick-start */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <Sparkles className='text-primary h-4 w-4' />
          <span className='text-sm font-medium text-zinc-300'>
            Quick start with a template
          </span>
          <span className='text-xs text-zinc-600'>
            built for Stellar projects
          </span>
        </div>
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
          {MILESTONE_TEMPLATES.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                type='button'
                onClick={() => applyTemplate(t)}
                className='group hover:border-primary/50 flex items-start gap-3 rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3 text-left transition hover:bg-zinc-900/50'
              >
                <div className='group-hover:bg-primary/15 group-hover:text-primary flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 transition'>
                  <Icon className='h-4 w-4' />
                </div>
                <div className='min-w-0'>
                  <p className='text-sm font-medium text-zinc-200'>{t.label}</p>
                  <p className='truncate text-xs text-zinc-500'>{t.summary}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {n === 0 && (
        <div className='rounded-xl border border-dashed border-zinc-800 py-10 text-center text-sm text-zinc-600'>
          No milestones yet. Pick a template above or add one manually.
        </div>
      )}

      {/* Milestone cards */}
      <div className='space-y-4'>
        {milestones.map((m, idx) => (
          <div
            key={idx}
            className='rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4'
          >
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <span className='bg-primary/15 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold'>
                  {idx + 1}
                </span>
                <Badge
                  variant='outline'
                  className='border-zinc-700 text-xs font-normal text-zinc-400'
                >
                  Releases {sharePct}%
                  {shareAmount > 0 && (
                    <span className='ml-1 text-zinc-300'>
                      · ${money(shareAmount)}
                    </span>
                  )}
                </Badge>
              </div>
              <div className='flex items-center gap-0.5'>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  disabled={idx === 0}
                  onClick={() => move(idx, -1)}
                  className='h-7 w-7 text-zinc-600 hover:text-white disabled:opacity-30'
                >
                  <ChevronUp className='h-4 w-4' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  disabled={idx === n - 1}
                  onClick={() => move(idx, 1)}
                  className='h-7 w-7 text-zinc-600 hover:text-white disabled:opacity-30'
                >
                  <ChevronDown className='h-4 w-4' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => remove(idx)}
                  className='h-7 w-7 text-zinc-600 hover:text-red-400'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium text-zinc-400'>
                  Title <span className='text-red-400'>*</span>
                </Label>
                <Input
                  placeholder='e.g. Testnet deployment and test suite'
                  value={m.title}
                  maxLength={100}
                  onChange={e => update(idx, { title: e.target.value })}
                  className='border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600'
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-medium text-zinc-400'>
                  Description <span className='text-red-400'>*</span>
                </Label>
                <Textarea
                  placeholder='What will you build for this milestone?'
                  value={m.description}
                  rows={3}
                  maxLength={500}
                  onChange={e => update(idx, { description: e.target.value })}
                  className='resize-none border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600'
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-medium text-zinc-400'>
                  Deliverable <span className='text-red-400'>*</span>
                </Label>
                <Textarea
                  placeholder='The concrete output backers and the reviewer can verify (e.g. a deployed contract ID, a demo URL).'
                  value={m.deliverable}
                  rows={2}
                  maxLength={500}
                  onChange={e => update(idx, { deliverable: e.target.value })}
                  className='resize-none border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label className='flex items-center gap-1 text-xs font-medium text-zinc-400'>
                    Funding share
                    <Lock className='h-3 w-3 text-zinc-600' />
                  </Label>
                  <div className='relative'>
                    <Input
                      readOnly
                      disabled
                      value={`${sharePct}%`}
                      className='cursor-not-allowed border-zinc-800 bg-zinc-900/50 text-zinc-400'
                    />
                  </div>
                  <p className='text-[11px] text-zinc-600'>Split evenly</p>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium text-zinc-400'>
                    Expected delivery <span className='text-red-400'>*</span>
                  </Label>
                  <Input
                    type='date'
                    value={m.expectedDeliveryDate}
                    onChange={e =>
                      update(idx, { expectedDeliveryDate: e.target.value })
                    }
                    className='border-zinc-800 bg-zinc-900 text-white'
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-medium text-zinc-400'>
                  Success criteria{' '}
                  <span className='font-normal text-zinc-600'>(optional)</span>
                </Label>
                <Input
                  placeholder='How will the reviewer know this is done?'
                  value={m.successCriteria || ''}
                  maxLength={500}
                  onChange={e =>
                    update(idx, { successCriteria: e.target.value })
                  }
                  className='border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600'
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className='flex items-center justify-between'>
        <Button
          type='button'
          variant='outline'
          onClick={add}
          disabled={n >= MAX_MILESTONES}
          className='gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
        >
          <Plus className='h-4 w-4' />
          Add milestone
        </Button>
        <span className='text-xs text-zinc-600'>
          {n} of {MAX_MILESTONES}
        </span>
      </div>

      {n > 0 && (
        <div className='flex items-center justify-between rounded-xl border border-zinc-800/40 bg-zinc-900/30 px-4 py-3 text-sm'>
          <span className='text-zinc-500'>
            {n} milestone{n !== 1 ? 's' : ''}, {sharePct}% each
          </span>
          <span className='font-medium text-zinc-200'>
            {net > 0
              ? `$${money(net)} to you`
              : 'Set a funding goal to see payouts'}
          </span>
        </div>
      )}

      {/* Replace-confirmation when a template is chosen over existing work */}
      <AlertDialog
        open={pendingTemplate !== null}
        onOpenChange={open => !open && setPendingTemplate(null)}
      >
        <AlertDialogContent className='border-zinc-800 bg-zinc-950 text-white'>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace your milestones?</AlertDialogTitle>
            <AlertDialogDescription className='text-zinc-400'>
              This clears your current {n} milestone{n !== 1 ? 's' : ''} and
              loads the {pendingTemplate?.label} template. You can edit
              everything afterward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white'>
              Keep mine
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApply}
              className='bg-primary hover:bg-primary/90'
            >
              Use template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
