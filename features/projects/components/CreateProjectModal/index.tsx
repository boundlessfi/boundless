import BoundlessSheet from '@/components/sheet/boundless-sheet';
import { MultiStepLoader } from '@/components/ui/multi-step-loader';
import React from 'react';
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
import { useCreateProject } from './useCreateProject';

interface CreateProjectModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CreateProjectModal = ({ open, setOpen }: CreateProjectModalProps) => {
  const {
    currentStep,
    isSubmitting,
    submitErrors,
    showSuccess,
    flowStep,
    formData,
    stepRefs,
    contentRef,
    handleBack,
    handleContinue,
    handleReset,
    handleTestData,
    handleDataChange,
    isStepValid,
    loaderActive,
    loadingStates,
    loadingStateIndex,
  } = useCreateProject(open, setOpen);

  const renderStepContent = () => {
    // Handle the flow states
    if (flowStep === 'initializing') {
      return <LoadingScreen />;
    }
    if (flowStep === 'success' || showSuccess) {
      return <SuccessScreen onContinue={handleReset} />;
    }

    switch (currentStep) {
      case 1:
        return (
          <Basic
            ref={stepRefs.basic}
            onDataChange={data => handleDataChange('basic', data)}
            initialData={formData.basic}
          />
        );
      case 2:
        return (
          <Details
            ref={stepRefs.details}
            onDataChange={data => handleDataChange('details', data)}
            initialData={formData.details}
          />
        );
      case 3:
        return (
          <Milestones
            ref={stepRefs.milestones}
            onDataChange={data => handleDataChange('milestones', data)}
            initialData={formData.milestones}
          />
        );
      case 4:
        return (
          <Team
            ref={stepRefs.team}
            onDataChange={data => handleDataChange('team', data)}
            initialData={formData.team}
          />
        );
      case 5:
        return (
          <Contact
            ref={stepRefs.contact}
            onDataChange={data => handleDataChange('contact', data)}
            initialData={formData.contact}
          />
        );
      default:
        return (
          <Basic
            ref={stepRefs.basic}
            onDataChange={data => handleDataChange('basic', data)}
            initialData={formData.basic}
          />
        );
    }
  };

  return (
    <>
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={loaderActive}
        duration={1000}
        currentState={loadingStateIndex}
      />
      <BoundlessSheet
        contentClassName='h-[90vh] overflow-y-auto !overflow-x-hidden'
        open={open}
        setOpen={setOpen}
      >
        {flowStep === 'form' && (
          <Header
            currentStep={currentStep}
            onBack={handleBack}
            onTestData={handleTestData}
          />
        )}
        <div
          ref={contentRef}
          className={cn(
            'min-h-[calc(55vh)] px-4 transition-opacity duration-100 md:px-[50px] lg:px-[75px] xl:px-[150px]'
          )}
        >
          {flowStep !== 'form' ? (
            <div className='flex h-full items-center justify-center'>
              {renderStepContent()}
            </div>
          ) : (
            <>
              {submitErrors.length > 0 && (
                <div className='mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-4 text-red-200'>
                  <p className='mb-2 font-medium text-red-300'>
                    Please fix the following errors before submitting:
                  </p>
                  <ul className='list-disc space-y-1 pl-5'>
                    {submitErrors.map((e, idx) => (
                      <li key={idx} className='text-sm'>
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div key={currentStep}>{renderStepContent()}</div>
            </>
          )}
        </div>
        {flowStep === 'form' && (
          <Footer
            currentStep={currentStep}
            onContinue={handleContinue}
            isStepValid={isStepValid}
            isSubmitting={isSubmitting}
          />
        )}
      </BoundlessSheet>
    </>
  );
};

export default CreateProjectModal;
