import { BoundlessButton } from '@/components/buttons/BoundlessButton';
import { HandHeart } from 'lucide-react';
import LottieAnimation from '@/components/LottieAnimation';
import { FundingModal } from '../funding-modal';
import { useSearchParams } from 'next/navigation';

const Empty = ({
  campaignId,
  escrowAddress,
  fundingGoal,
  fundingRaised,
  projectTitle,
}: {
  campaignId?: string;
  escrowAddress?: string;
  fundingGoal: number;
  fundingRaised: number;
  projectTitle: string;
}) => {
  const searchParams = useSearchParams();
  const isSubmission = searchParams.get('type') === 'submission';

  return (
    <div className='mx-auto w-full max-w-[300px] space-y-4 py-4 text-center sm:max-w-[400px] sm:space-y-5 sm:py-5'>
      <LottieAnimation width='100%' />

      <div className='space-y-1'>
        <h3 className='text-center text-base font-medium text-white md:text-lg'>
          {isSubmission
            ? 'No backers yet'
            : 'Be the first to back this project!'}
        </h3>
        {!isSubmission && (
          <p className='text-center text-gray-500'>
            Show your support by funding this project and help bring it to life.
          </p>
        )}
      </div>

      {!isSubmission && (
        <FundingModal
          campaignId={campaignId || ''}
          projectTitle={projectTitle}
          currentRaised={fundingRaised}
          fundingGoal={fundingGoal}
          escrowAddress={escrowAddress || ''}
        >
          <BoundlessButton iconPosition='right' size='lg' icon={<HandHeart />}>
            Back Project
          </BoundlessButton>
        </FundingModal>
      )}
    </div>
  );
};

export default Empty;
