import { useState, useRef, useEffect, useCallback } from 'react';
import { createCrowdfundingProject } from '@/features/projects/api';
import { CreateCrowdfundingProjectRequest } from '@/lib/api/types';
import { projectSchema } from './schema';
import { mapFormDataToApiRequest } from './utils';
import { ProjectFormData } from './types';

export type StepHandle = {
  validate: () => boolean;
  markSubmitted?: () => void;
};

export const useCreateProject = (
  open: boolean,
  setOpen: (open: boolean) => void
) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Flow state
  const [flowStep, setFlowStep] = useState<'form' | 'initializing' | 'success'>(
    'form'
  );

  // Form data state
  const [formData, setFormData] = useState<ProjectFormData>({
    basic: {},
    details: {},
    milestones: {},
    team: {},
    contact: {},
  });

  // Refs for step components to access validation methods
  const stepRefs = {
    basic: useRef<StepHandle>(null),
    details: useRef<StepHandle>(null),
    milestones: useRef<StepHandle>(null),
    team: useRef<StepHandle>(null),
    contact: useRef<StepHandle>(null),
  };

  // Ref for the scrollable content container
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset scroll position when step changes with smooth transition
  useEffect(() => {
    if (currentStep === 1) return; // Skip for initial load

    const resetScroll = () => {
      window.scrollTo(0, 0);

      if (contentRef.current) {
        const scrollableParent =
          contentRef.current.closest('[data-radix-scroll-area-viewport]') ||
          contentRef.current.closest('.overflow-y-auto') ||
          contentRef.current.parentElement?.querySelector('.overflow-y-auto');

        if (scrollableParent) {
          scrollableParent.scrollTop = 0;
        } else {
          contentRef.current.scrollTop = 0;
        }

        const allScrollableElements =
          document.querySelectorAll('.overflow-y-auto');
        allScrollableElements.forEach(element => {
          if (element.contains(contentRef.current)) {
            element.scrollTop = 0;
          }
        });
      }
    };

    resetScroll();
  }, [currentStep]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepKey = (step: number): keyof typeof stepRefs => {
    switch (step) {
      case 1:
        return 'basic';
      case 2:
        return 'details';
      case 3:
        return 'milestones';
      case 4:
        return 'team';
      case 5:
        return 'contact';
      default:
        return 'basic';
    }
  };

  const validateCurrentStep = (): boolean => {
    const stepRef = stepRefs[getStepKey(currentStep)];
    return stepRef?.current?.validate() ?? true;
  };

  const handleContinue = async () => {
    const key = getStepKey(currentStep);
    stepRefs[key].current?.markSubmitted?.();

    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      return;
    }

    await handleSubmit();
  };

  const handleCreateProject = async () => {
    try {
      setLoadingStateIndex(1); // Creating Project
      const apiRequest = mapFormDataToApiRequest(formData);

      const projectRequest: CreateCrowdfundingProjectRequest = {
        ...apiRequest,
        escrowId: '', // Handled by backend
        transactionHash: '', // Handled by backend
      };

      await createCrowdfundingProject(projectRequest);

      setFlowStep('success');
      setShowSuccess(true);
      setIsSubmitting(false);
      setLoaderActive(false);
    } catch (error) {
      let errorMessage = 'Failed to create project. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setSubmitErrors([errorMessage]);
      setFlowStep('form');
      setLoaderActive(false);
      setIsSubmitting(false);
    }
  };

  // Loader state
  const [loaderActive, setLoaderActive] = useState(false);
  const [loadingStates] = useState([
    { text: 'Validating Project Details' },
    { text: 'Creating Project' },
    { text: 'Finalizing' },
  ]);
  const [loadingStateIndex, setLoadingStateIndex] = useState(0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitErrors([]);

    try {
      const payload: ProjectFormData = {
        ...formData,
        contact: {
          ...(formData.contact || {}),
          agreeToTerms: true,
          agreeToPrivacy: true,
        },
      } as ProjectFormData;

      const parsed = projectSchema.safeParse(payload);
      if (!parsed.success) {
        setSubmitErrors(
          parsed.error.issues.map(i => `${i.path.join('.')} - ${i.message}`)
        );
        setIsSubmitting(false);
        setFlowStep('form');
        return;
      }

      const apiRequest = mapFormDataToApiRequest(formData);

      // Step 1: Validate Project Data
      setLoaderActive(true);
      setLoadingStateIndex(0); // Validating Project Details
      setFlowStep('initializing');

      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const {
          validateCrowdfundingProject,
        } = require('@/features/projects/api');
        await validateCrowdfundingProject(apiRequest);
      } catch (error: any) {
        setLoaderActive(false);
        const errorMessage =
          error.response?.data?.message || error.message || 'Validation failed';
        setSubmitErrors([errorMessage]);
        setIsSubmitting(false);
        setFlowStep('form');
        return;
      }

      // Step 2: Create Project (Backend handles escrow and signing)
      await handleCreateProject();
    } catch (error) {
      setLoaderActive(false);
      let errorMessage = 'Error preparing project. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setSubmitErrors([errorMessage]);
      setIsSubmitting(false);
      setFlowStep('form');
    }
  };

  const handleDataChange = useCallback(
    <K extends keyof ProjectFormData>(step: K, data: ProjectFormData[K]) => {
      setFormData(prev => ({
        ...prev,
        [step]: {
          ...(prev[step] as Record<string, unknown>),
          ...(data as Record<string, unknown>),
        },
      }));
    },
    []
  );

  const isStepValid = (() => {
    if (currentStep === 2) {
      const v = (formData.details?.vision || '').trim();
      return v.length > 0;
    }
    if (currentStep === 5) {
      const contact = formData.contact || {};
      return !!(
        contact.telegram?.trim() &&
        contact.backupType &&
        contact.backupContact?.trim()
      );
    }
    return true;
  })();

  const handleReset = () => {
    setFormData({
      basic: {},
      details: {},
      milestones: {},
      team: {},
      contact: {},
    });
    setCurrentStep(1);
    setShowSuccess(false);
    setIsLoading(false);
    setSubmitErrors([]);
    setFlowStep('form');
    setOpen(false);
  };

  const handleTestData = (templateKey: string = 'defi') => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { TEST_PROJECT_TEMPLATES } = require('./test-data');
    const template = TEST_PROJECT_TEMPLATES[templateKey];

    if (template) {
      setFormData(template);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    isSubmitting,
    submitErrors,
    showSuccess,
    isLoading,
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
  };
};
