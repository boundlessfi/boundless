import BoundlessSheet from '@/components/sheet/boundless-sheet';
import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Basic from './Basic';
import Details from './Details';
import Milestones from './Milestones';
import Team from './Team';
import Contact from './Contact';
import LoadingScreen from './LoadingScreen';
import SuccessScreen from './SuccessScreen';
import { cn } from '@/lib/utils';

const CreateProjectModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinue = () => {
    if (showSuccess) return; // prevent clicks when success is showing

    if (currentStep < 5) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsLoading(false);
      }, 1000);
    } else {
      // ✅ After final step, show success screen
      setShowSuccess(true);
    }
  };

  const handleReset = () => {
    // reset all states to start fresh
    setShowSuccess(false);
    setCurrentStep(1);
    setIsLoading(false);
  };

  const isStepValid = true;

  const renderStepContent = () => {
    if (isLoading) {
      return (
        <LoadingScreen
          isSizeFull={false}
          className='h-full max-h-full min-h-full w-full max-w-full min-w-full'
        />
      );
    }
    if (showSuccess) {
      return <SuccessScreen onContinue={handleReset} />;
    }

    switch (currentStep) {
      case 1:
        return <Basic />;
      case 2:
        return <Details />;
      case 3:
        return <Milestones />;
      case 4:
        return <Team />;
      case 5:
        return <Contact />;
      default:
        return <Basic />;
    }
  };

  return (
    <BoundlessSheet
      contentClassName='h-[80vh] overflow-y-auto !overflow-x-hidden'
      open={open}
      setOpen={setOpen}
    >
      {!showSuccess && <Header currentStep={currentStep} onBack={handleBack} />}

      <div
        className={cn(
          'min-h-[calc(55vh)] px-4 md:px-[50px] lg:px-[75px] xl:px-[150px]',
          isLoading && 'flex h-full w-full items-center justify-center'
        )}
      >
        {renderStepContent()}
      </div>

      {!showSuccess && (
        <Footer
          currentStep={currentStep}
          onContinue={handleContinue}
          isStepValid={isStepValid}
        />
      )}
    </BoundlessSheet>
  );
};

export default CreateProjectModal;
