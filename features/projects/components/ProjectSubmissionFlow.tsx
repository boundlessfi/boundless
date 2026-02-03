'use client';

import React, { useState } from 'react';

import ProjectSubmissionForm from './ProjectSubmissionForm';
import ProjectSubmissionSuccess from './ProjectSubmissionSuccess';
import ProjectSubmissionLoading from './ProjectSubmissionLoading';
import BoundlessSheet from '@/components/sheet/boundless-sheet';
import { Stepper } from '@/components/stepper';

type StepState = 'active' | 'pending' | 'completed';

type Step = {
  title: string;
  description: string;
  state: StepState;
};

const steps: Step[] = [
  {
    title: 'Initialize',
    description: 'Submit your project idea to kickstart your campaign journey.',
    state: 'active',
  },
  {
    title: 'Validate',
    description: 'Get admin approval and gather public support through voting.',
    state: 'pending',
  },
  {
    title: 'Launch Campaign',
    description: 'Set milestones, activate escrow, and start receiving funds.',
    state: 'pending',
  },
];

function ProjectSubmissionFlow() {
  const [open, setOpen] = useState(false);
  const [stepperState] = useState<Step[]>(steps);
  const [submissionStatus, setSubmissionStatus] = useState('idle');

  const handleSuccess = () => {
    setSubmissionStatus('success');
  };

  const renderContent = () => {
    switch (submissionStatus) {
      case 'submitting':
        return <ProjectSubmissionLoading />;
      case 'success':
        return <ProjectSubmissionSuccess />;
      default:
        return <ProjectSubmissionForm onComplete={() => handleSuccess()} />;
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className='bg-primary text-background rounded p-2'
      >
        Submit Project
      </button>
      <BoundlessSheet open={open} setOpen={setOpen} title=''>
        <div className='flex'>
          <Stepper steps={stepperState} />
          <div className='flex-1'>{renderContent()}</div>
        </div>
      </BoundlessSheet>
    </div>
  );
}

export default ProjectSubmissionFlow;
