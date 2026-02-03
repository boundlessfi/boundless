import { BoundlessButton } from '@/components/buttons';
import Link from 'next/link';

interface FooterProps {
  currentStep: number;
  onContinue: () => void;
  isStepValid?: boolean;
  isSubmitting?: boolean;
}

const Footer = ({
  currentStep,
  onContinue,
  isStepValid = true,
  isSubmitting = false,
}: FooterProps) => {
  const isLastStep = currentStep === 5;
  const buttonText = isLastStep ? 'Submit for review' : 'Continue';

  return (
    <div className='relative mt-[20px] overflow-x-hidden px-4 py-10 md:px-[50px] lg:mt-[40px] lg:px-[75px] xl:px-[150px]'>
      <div className='absolute top-0 left-1/2 h-[0.5px] w-screen -translate-x-1/2 bg-[#484848]' />
      {isLastStep && (
        <p className='pb-8 text-sm leading-[160%] text-[#B5B5B5]'>
          By continuing, you agree to our{' '}
          <Link
            href='/terms'
            className='hover:text-primary text-white underline'
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href='/privacy'
            className='hover:text-primary text-white underline'
          >
            Privacy Policy
          </Link>
        </p>
      )}
      <BoundlessButton
        size='xl'
        onClick={onContinue}
        disabled={!isStepValid || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : buttonText}
      </BoundlessButton>
    </div>
  );
};

export default Footer;
