'use client';

import { useState } from 'react';
import { Briefcase, Code, Heart, Check } from 'lucide-react';
import { BoundlessButton } from '@/components/buttons';

const ROLES = [
  {
    id: 'organizer',
    label: 'Organizer',
    description: 'Create bounties, hackathons, and campaigns',
    icon: Briefcase,
  },
  {
    id: 'participant',
    label: 'Participant',
    description: 'Contribute skills and earn rewards',
    icon: Code,
  },
  {
    id: 'backer',
    label: 'Backer',
    description: 'Fund projects and support builders',
    icon: Heart,
  },
] as const;

interface RoleSelectionStepProps {
  initialRoles?: string[];
  onComplete: (roles: string[]) => void;
}

export default function RoleSelectionStep({
  initialRoles = [],
  onComplete,
}: RoleSelectionStepProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialRoles));

  const toggle = (roleId: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(roleId)) {
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  };

  return (
    <div className='flex flex-col items-center text-center'>
      <h2 className='mb-2 text-2xl font-semibold text-white'>
        How will you use Boundless?
      </h2>
      <p className='mb-8 max-w-sm text-sm leading-relaxed text-[#B5B5B5]'>
        Pick one or more roles. You can always change this later.
      </p>

      <div className='mb-8 flex w-full max-w-md flex-col gap-3'>
        {ROLES.map(role => {
          const isSelected = selected.has(role.id);
          const Icon = role.icon;

          return (
            <button
              key={role.id}
              type='button'
              onClick={() => toggle(role.id)}
              className={`group relative flex items-center gap-4 rounded-xl border p-5 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-primary/40 bg-primary/5 shadow-[0_0_20px_rgba(46,237,170,0.06)]'
                  : 'border-[#2B2B2B] bg-[#1C1C1C] hover:border-[#3B3B3B] hover:bg-[#222222]'
              }`}
            >
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isSelected ? 'bg-primary/15' : 'bg-[#2B2B2B]'
                }`}
              >
                <Icon
                  className={`h-6 w-6 transition-colors ${
                    isSelected ? 'text-primary' : 'text-[#B5B5B5]'
                  }`}
                />
              </div>

              <div className='flex-1'>
                <p
                  className={`text-sm font-medium ${
                    isSelected ? 'text-white' : 'text-[#D9D9D9]'
                  }`}
                >
                  {role.label}
                </p>
                <p className='mt-0.5 text-xs text-[#B5B5B5]'>
                  {role.description}
                </p>
              </div>

              <div
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-all ${
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-[#484848] bg-transparent'
                }`}
              >
                {isSelected && (
                  <Check className='h-3.5 w-3.5 text-black' strokeWidth={3} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className='w-full max-w-md'>
        <BoundlessButton
          fullWidth
          onClick={() => onComplete(Array.from(selected))}
          disabled={selected.size === 0}
        >
          Continue
        </BoundlessButton>
      </div>
    </div>
  );
}
