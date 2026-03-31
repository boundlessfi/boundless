'use client';

import { PartyPopper, ArrowRight } from 'lucide-react';
import { BoundlessButton } from '@/components/buttons';

interface WelcomeStepProps {
  userName: string;
  roles: string[];
  onFinish: () => void;
  isSubmitting: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  organizer: 'Organizer',
  participant: 'Participant',
  backer: 'Backer',
};

export default function WelcomeStep({
  userName,
  roles,
  onFinish,
  isSubmitting,
}: WelcomeStepProps) {
  const firstName = userName?.split(' ')[0] || 'there';

  return (
    <div className='flex flex-col items-center text-center'>
      {/* Celebration icon */}
      <div className='bg-primary/10 mb-6 flex h-20 w-20 items-center justify-center rounded-full'>
        <PartyPopper className='text-primary h-10 w-10' />
      </div>

      <h2 className='mb-2 text-2xl font-semibold text-white'>
        You&apos;re all set, {firstName}!
      </h2>
      <p className='mb-8 max-w-sm text-sm leading-relaxed text-[#B5B5B5]'>
        Your account is ready. Start exploring what Boundless has to offer.
      </p>

      {/* Role badges */}
      {roles.length > 0 && (
        <div className='mb-8 flex flex-wrap justify-center gap-2'>
          {roles.map(role => (
            <span
              key={role}
              className='border-primary/20 bg-primary/5 text-primary rounded-full border px-4 py-1.5 text-sm font-medium'
            >
              {ROLE_LABELS[role] || role}
            </span>
          ))}
        </div>
      )}

      {/* Quick start cards */}
      <div className='mb-8 grid w-full max-w-md grid-cols-1 gap-3 text-left sm:grid-cols-2'>
        {roles.includes('participant') && (
          <div className='rounded-xl border border-[#2B2B2B] bg-[#1C1C1C] p-4'>
            <p className='text-sm font-medium text-white'>Browse bounties</p>
            <p className='mt-1 text-xs text-[#B5B5B5]'>
              Find work that matches your skills
            </p>
          </div>
        )}
        {roles.includes('organizer') && (
          <div className='rounded-xl border border-[#2B2B2B] bg-[#1C1C1C] p-4'>
            <p className='text-sm font-medium text-white'>Create a project</p>
            <p className='mt-1 text-xs text-[#B5B5B5]'>
              Set up your first bounty or hackathon
            </p>
          </div>
        )}
        {roles.includes('backer') && (
          <div className='rounded-xl border border-[#2B2B2B] bg-[#1C1C1C] p-4'>
            <p className='text-sm font-medium text-white'>Fund a campaign</p>
            <p className='mt-1 text-xs text-[#B5B5B5]'>
              Support projects you believe in
            </p>
          </div>
        )}
        <div className='rounded-xl border border-[#2B2B2B] bg-[#1C1C1C] p-4'>
          <p className='text-sm font-medium text-white'>Complete profile</p>
          <p className='mt-1 text-xs text-[#B5B5B5]'>
            Add a photo and bio to stand out
          </p>
        </div>
      </div>

      <div className='w-full max-w-md'>
        <BoundlessButton
          fullWidth
          onClick={onFinish}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Go to Dashboard
          <ArrowRight className='ml-2 h-4 w-4' />
        </BoundlessButton>
      </div>
    </div>
  );
}
