'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import MilestoneForm, { Milestone } from './MilestoneForm';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface MilestoneManagerProps {
  milestones: Milestone[];
  onNext?: (milestones: Milestone[]) => void;
  onChange?: (milestones: Milestone[], isValid: boolean) => void;
}

const MilestoneManager: React.FC<MilestoneManagerProps> = ({
  milestones,
  onChange,
}) => {
  const isValid = (ms: Milestone[]) =>
    ms.length >= 3 &&
    ms.length <= 6 &&
    ms.every(m => m.title.trim() && m.description.trim() && m.deliveryDate);

  const allocateFundPercentages = (ms: Milestone[]): Milestone[] => {
    const count = ms.length;
    if (count === 0) return ms;

    const growthFactor = 1.35;
    const weights = Array.from({ length: count }, (_, i) =>
      Math.pow(growthFactor, i)
    );
    const sumWeights = weights.reduce((a, b) => a + b, 0);
    const rawPercents = weights.map(w => (w / sumWeights) * 100);

    const MIN_FIRST = 8;
    if (rawPercents[0] < MIN_FIRST) {
      const delta = MIN_FIRST - rawPercents[0];
      rawPercents[0] = MIN_FIRST;
      rawPercents[count - 1] = Math.max(0, rawPercents[count - 1] - delta);
    }

    const floors = rawPercents.map(p => Math.floor(p));
    const remainder = 100 - floors.reduce((a, b) => a + b, 0);
    const remainders = rawPercents.map((p, i) => ({ i, frac: p - floors[i] }));
    remainders.sort((a, b) => b.frac - a.frac);
    for (let k = 0; k < remainder; k += 1) {
      floors[remainders[k % remainders.length].i] += 1;
    }

    return ms.map((m, i) => ({ ...m, fundPercentage: String(floors[i]) }));
  };

  const handleAddMilestone = () => {
    if (milestones.length >= 6) {
      toast.error('Maximum 6 milestones allowed');
      return;
    }

    const newMilestone: Milestone = {
      id: (milestones.length + 1).toString(),
      title: '',
      description: '',
      deliveryDate: '',
      fundPercentage: '',
      isExpanded: true,
    };

    let updated = [
      ...milestones.map(m => ({ ...m, isExpanded: false })),
      newMilestone,
    ];
    updated = allocateFundPercentages(updated);
    onChange?.(updated, isValid(updated));
  };

  const handleUpdateMilestone = (updatedMilestone: Milestone) => {
    if (updatedMilestone.isExpanded) {
      const updated = milestones.map(m =>
        m.id === updatedMilestone.id
          ? { ...updatedMilestone, isExpanded: true }
          : { ...m, isExpanded: false }
      );
      onChange?.(updated, isValid(updated));
      return;
    }

    const updated = milestones.map(m =>
      m.id === updatedMilestone.id ? updatedMilestone : m
    );
    onChange?.(updated, isValid(updated));
  };

  const handleDeleteMilestone = (id: string) => {
    let remaining = milestones.filter(m => m.id !== id);
    if (remaining.length === 0) {
      onChange?.(remaining, isValid(remaining));
      return;
    }

    const anyExpanded = remaining.some(m => m.isExpanded);
    if (!anyExpanded) {
      remaining[0] = { ...remaining[0], isExpanded: true };
    }
    remaining = allocateFundPercentages(remaining);
    onChange?.(remaining, isValid(remaining));
  };

  return (
    <div className='mx-auto w-full space-y-6'>
      <div className='space-y-4'>
        {milestones.map(milestone => (
          <MilestoneForm
            key={milestone.id}
            milestone={milestone}
            onUpdate={handleUpdateMilestone}
            onDelete={handleDeleteMilestone}
            totalMilestones={milestones.length}
          />
        ))}
      </div>

      {milestones.length < 6 && (
        <div className=''>
          <Label className='mb-3 flex items-center justify-between text-xs font-medium text-white'>
            Milestone {milestones.length + 1}
          </Label>
          <Button
            onClick={handleAddMilestone}
            className='flex !w-full items-center justify-between rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-5 text-[#787878]'
          >
            <span>Add Milestone</span>
            <Plus className='h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MilestoneManager;
