'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { BoundlessButton } from '@/components/buttons';

const SKILL_CATEGORIES = [
  {
    label: 'Development',
    skills: [
      'Solidity',
      'Rust',
      'TypeScript',
      'React',
      'Node.js',
      'Python',
      'Smart Contracts',
      'Backend',
      'Frontend',
      'Full Stack',
    ],
  },
  {
    label: 'Design',
    skills: ['UI/UX', 'Graphic Design', 'Branding', 'Prototyping', 'Motion'],
  },
  {
    label: 'Other',
    skills: [
      'Marketing',
      'Community',
      'Content Writing',
      'Security',
      'DevOps',
      'Data Science',
      'Product',
      'Research',
    ],
  },
];

interface SkillsStepProps {
  initialSkills?: string[];
  onComplete: (skills: string[]) => void;
  onSkip: () => void;
}

export default function SkillsStep({
  initialSkills = [],
  onComplete,
  onSkip,
}: SkillsStepProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSkills));

  const toggle = (skill: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else if (next.size < 10) {
        next.add(skill);
      }
      return next;
    });
  };

  return (
    <div className='flex flex-col items-center text-center'>
      <h2 className='mb-2 text-2xl font-semibold text-white'>
        What are you good at?
      </h2>
      <p className='mb-8 max-w-sm text-sm leading-relaxed text-[#B5B5B5]'>
        Select up to 10 skills so we can match you with the right opportunities.
      </p>

      <div className='mb-8 w-full max-w-lg space-y-6'>
        {SKILL_CATEGORIES.map(category => (
          <div key={category.label}>
            <p className='mb-3 text-left text-xs font-medium tracking-wider text-[#B5B5B5] uppercase'>
              {category.label}
            </p>
            <div className='flex flex-wrap gap-2'>
              {category.skills.map(skill => {
                const isSelected = selected.has(skill);
                return (
                  <button
                    key={skill}
                    type='button'
                    onClick={() => toggle(skill)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-all duration-150 ${
                      isSelected
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-[#2B2B2B] bg-[#1C1C1C] text-[#D9D9D9] hover:border-[#3B3B3B] hover:bg-[#222222]'
                    }`}
                  >
                    {isSelected && (
                      <Check className='h-3.5 w-3.5' strokeWidth={3} />
                    )}
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selected.size > 0 && (
        <p className='mb-4 text-xs text-[#B5B5B5]'>
          {selected.size}/10 selected
        </p>
      )}

      <div className='flex w-full max-w-md flex-col gap-3'>
        <BoundlessButton
          fullWidth
          onClick={() => onComplete(Array.from(selected))}
          disabled={selected.size === 0}
        >
          Continue
        </BoundlessButton>

        <button
          onClick={onSkip}
          className='text-sm text-[#B5B5B5] transition-colors hover:text-white'
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
