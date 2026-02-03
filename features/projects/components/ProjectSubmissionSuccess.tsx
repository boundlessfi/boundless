import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface ProjectSubmissionSuccessProps {
  title?: string;
  description?: string;
  linkSection?: string;
  linkName?: string;
  url?: string;
  continueAction?: () => void;
}

function ProjectSubmissionSuccess({
  title = 'Project Submitted!',
  description = 'Your project has been submitted and is now under admin review. You’ll receive an update within 72 hours. Once approved, your project will proceed to public validation.',
  linkSection = 'You can track the status of your submission anytime on the',
  linkName = 'Projects page.',
  url = '/projects',
  continueAction,
}: ProjectSubmissionSuccessProps) {
  return (
    <main className='flex w-[600px] flex-col items-center justify-center gap-6'>
      <h5 className='text-card text-xl font-medium'>{title}</h5>
      <div>
        <Image width={150} height={150} src='/done-check.svg' alt='done' />
      </div>
      <article className='space-y-3'>
        <p className='text-card/60 text-center text-base font-normal'>
          {description}
        </p>
        <p className='text-card/60 text-center text-base font-normal'>
          {linkSection}{' '}
          <Link href={url} className='text-primary cursor-pointer underline'>
            {linkName}
          </Link>
        </p>
      </article>

      <button
        onClick={continueAction}
        className='text-background bg-primary mt-4 w-[198px] rounded-[10px] px-16 py-2 text-base font-medium'
      >
        Continue
      </button>
    </main>
  );
}

export default ProjectSubmissionSuccess;
