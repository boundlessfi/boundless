'use client';

import React from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { BoundlessButton } from '@/components/buttons';

interface MilestoneSubmissionSuccessProps {
  onContinue?: () => void;
}

const MilestoneSubmissionSuccess: React.FC<MilestoneSubmissionSuccessProps> = ({
  onContinue,
}) => {
  return (
    <div className='flex min-h-screen items-center justify-center bg-black p-4'>
      <div className='w-full max-w-md space-y-8 text-center'>
        <h1 className='text-3xl font-bold text-white'>Proof Submitted!</h1>

        <div className='flex justify-center'>
          <div className='flex h-20 w-20 items-center justify-center rounded-full bg-[#A7F950]'>
            <Check className='h-10 w-10 text-white' />
          </div>
        </div>

        <div className='space-y-4'>
          <p className='text-base leading-relaxed text-white'>
            Your project has been submitted and is now under admin review.
            You'll receive an update within 72 hours. Once approved, your
            project will proceed to public validation.
          </p>

          <p className='text-base text-white'>
            You can track the status of your submission anytime on the{' '}
            <Link
              href='/user/projects'
              className='font-medium text-[#A7F950] underline transition-colors hover:text-[#8BE03A]'
            >
              Projects page.
            </Link>
          </p>
        </div>

        <div className='pt-4'>
          <BoundlessButton
            onClick={onContinue}
            className='min-w-[200px] rounded-lg bg-[#A7F950] px-8 py-3 text-base font-medium text-black transition-colors hover:bg-[#8BE03A]'
          >
            Continue
          </BoundlessButton>
        </div>
      </div>
    </div>
  );
};

export default MilestoneSubmissionSuccess;
