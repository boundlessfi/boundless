import React, { useState } from 'react';
import ProjectSubmissionForm, {
  ProjectSubmissionData,
} from './ProjectSubmissionForm';
import { Button } from '@/components/ui/button';
import { initProject } from '@/features/projects/api';
import type { ProjectInitRequest } from '@/lib/api/types';
import { toast } from 'sonner';
import type { Milestone } from './MilestoneForm';
import MilestoneManager from './MilestoneManager';
import MilestoneReview from './MilestoneReview';
import ProjectSubmissionSuccess from './ProjectSubmissionSuccess';
import Loading from '@/components/loading/Loading';
import { useWalletProtection } from '@/hooks/use-wallet-protection';
import WalletRequiredModal from '@/components/wallet/WalletRequiredModal';

type StepState = 'pending' | 'active' | 'completed';

export type Step = {
  title: string;
  state: StepState;
  description?: string;
};

interface InitializeProps {
  onSuccess: (projectId: string) => void;
}

const Initialize: React.FC<InitializeProps> = ({ onSuccess }) => {
  const [phase, setPhase] = useState<
    'form' | 'milestones' | 'review' | 'success'
  >('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProjectSubmissionData | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      title: '',
      description: '',
      deliveryDate: '',
      fundPercentage: '',
      isExpanded: true,
    },
  ]);

  // Wallet protection hook
  const {
    requireWallet,
    showWalletModal,
    handleWalletConnected,
    closeWalletModal,
  } = useWalletProtection({
    actionName: 'initialize project',
  });

  const localSteps: Step[] = [
    {
      title: 'Submit your project Details',
      state: phase === 'form' ? 'active' : 'completed',
    },
    {
      title: 'Set Milestones',
      description: 'You must set 3 to 6 milestones per project.',
      state: phase === 'form' ? 'pending' : 'active',
    },
  ];

  const handleFormComplete = (data: ProjectSubmissionData) => {
    setFormData(data);
    setPhase('milestones');
  };
  const handleFormChange = (data: ProjectSubmissionData) => {
    // Avoid tight feedback loops by shallow comparing key primitives
    setFormData(prev => {
      const next = { ...(prev ?? {}), ...data } as ProjectSubmissionData;
      if (
        prev &&
        prev.title === next.title &&
        prev.tagline === next.tagline &&
        prev.description === next.description &&
        prev.category === next.category &&
        prev.fundAmount === next.fundAmount &&
        JSON.stringify(prev.tags) === JSON.stringify(next.tags)
      ) {
        return prev;
      }
      return next;
    });
  };

  const handleMilestonesCompleted = (ms: Milestone[]) => {
    setMilestones(ms);
    setPhase('review');
  };

  // When entering review and coming back, keep the last computed validity to control the button

  const submitInit = async () => {
    if (!formData) return;
    requireWallet(async () => {
      try {
        setIsSubmitting(true);
        toast.loading('Initializing project...');

        // Validate milestone distribution
        const totalPercentage = milestones.reduce(
          (sum, m) => sum + (parseFloat(m.fundPercentage) || 0),
          0
        );
        if (totalPercentage !== 100) {
          toast.dismiss();
          toast.error('Total milestone fund percentage must equal 100%');
          setIsSubmitting(false);
          return;
        }

        const milestonesPayload = milestones.map(m => {
          const pct = parseFloat(m.fundPercentage) || 0;
          const amt = (formData.fundAmount * pct) / 100;
          return {
            title: m.title,
            description: m.description,
            deliveryDate: m.deliveryDate,
            fundPercentage: pct,
            amount: amt,
          };
        });

        const payload: ProjectInitRequest = {
          title: formData.title,
          description: formData.description,
          tagline: formData.tagline,
          type: 'crowdfund',
          category: formData.category,
          amount: formData.fundAmount,
          tags: formData.tags,
          milestones: milestonesPayload,
          thumbnail: 'https://placehold.co/600x400',
          whitepaperUrl: 'https://placehold.co/600x400',
          // Optional placeholders until uploads are wired
          // ...(formData.thumbnailFile ? { thumbnail: '' } : {}),
          // ...(formData.whitepaperFile ? { whitepaperUrl: '' } : {}),
        };

        const response = await initProject(payload);
        const responseData = response as { data: { projectId: string } };

        toast.dismiss();
        toast.success('Project initialized!');
        setPhase('success');
        onSuccess(responseData.data.projectId);
      } catch {
        toast.dismiss();
        toast.error('Failed to initialize project');
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <>
      <div className='w-[500px] space-y-6'>
        {isSubmitting && <Loading />}
        <InitialSteps steps={localSteps} />

        {phase === 'form' && (
          <ProjectSubmissionForm
            onComplete={handleFormComplete}
            initialData={formData ?? undefined}
            onChange={handleFormChange}
          />
        )}

        {phase === 'milestones' && (
          <MilestonesPhase
            milestones={milestones}
            onChange={ms => setMilestones(ms)}
            onBack={() => setPhase('form')}
            onNext={handleMilestonesCompleted}
          />
        )}

        {phase === 'review' && (
          <div className='space-y-4'>
            <MilestoneReview
              milestones={milestones}
              totalFundAmount={formData?.fundAmount ?? 0}
              onBack={() => setPhase('milestones')}
              onSubmit={submitInit}
              submitting={isSubmitting}
            />
          </div>
        )}

        {phase === 'success' && <ProjectSubmissionSuccess />}
      </div>

      {/* Wallet Required Modal */}
      <WalletRequiredModal
        open={showWalletModal}
        onOpenChange={closeWalletModal}
        actionName='initialize project'
        onWalletConnected={handleWalletConnected}
      />
    </>
  );
};

export default Initialize;

const MilestonesPhase = ({
  milestones,
  onChange,
  onBack,
  onNext,
}: {
  milestones: Milestone[];
  onChange: (ms: Milestone[]) => void;
  onBack: () => void;
  onNext: (ms: Milestone[]) => void;
}) => {
  const [isValid, setIsValid] = useState(false);
  const [current, setCurrent] = useState<Milestone[]>(milestones);

  return (
    <div className='space-y-4'>
      <MilestoneManager
        milestones={current}
        onChange={(ms, valid) => {
          setCurrent(ms);
          setIsValid(valid);
          onChange(ms);
        }}
      />
      <div className='flex gap-3'>
        <Button
          type='button'
          variant='outline'
          className='border-[#484848] bg-[rgba(255,255,255,0.30)] text-white'
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type='button'
          className='bg-primary text-background'
          disabled={!isValid}
          onClick={() => onNext(current)}
        >
          Review & Submit
        </Button>
      </div>
    </div>
  );
};

export const InitialSteps = ({ steps }: { steps: Step[] }) => {
  return (
    <div className='w-full'>
      <div className='mb-3 max-w-fit text-center text-lg leading-[120%] font-medium tracking-[-0.4px] text-white'>
        {steps.find(step => step.state === 'active')?.title}
      </div>
      <div className='flex gap-1'>
        {steps.map((step, index) => (
          <div key={index} className='flex-1'>
            <div className='h-2 w-full rounded-full bg-[#2B2B2B]'>
              <div
                className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
                  step.state === 'completed'
                    ? 'bg-primary'
                    : step.state === 'active'
                      ? 'bg-primary'
                      : 'bg-[#2B2B2B]'
                }`}
                style={{
                  width:
                    step.state === 'completed' || step.state === 'active'
                      ? '100%'
                      : '0%',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {steps.find(step => step.state === 'active') && (
        <div className='mt-3'>
          <p className='text-sm text-[#F5B546]'>
            {steps.find(step => step.state === 'active')?.description}
          </p>
        </div>
      )}
    </div>
  );
};
