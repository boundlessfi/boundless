import { useState, useRef, useEffect, useCallback } from 'react';
import { createCrowdfundingProject } from '@/features/projects/api';
import { CreateCrowdfundingProjectRequest } from '@/lib/api/types';
import { useWalletProtection } from '@/hooks/use-wallet-protection';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { signTransaction } from '@/lib/config/wallet-kit';
import {
  useInitializeEscrow,
  useSendTransaction,
} from '@trustless-work/escrow';
import {
  InitializeMultiReleaseEscrowPayload,
  EscrowType,
  EscrowRequestResponse,
  Status,
  InitializeMultiReleaseEscrowResponse,
} from '@trustless-work/escrow';
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
  const [unsignedTransaction, setUnsignedTransaction] = useState<string | null>(
    null
  );
  const [isSigningTransaction, setIsSigningTransaction] = useState(false);

  // Escrow hooks
  const { deployEscrow } = useInitializeEscrow();
  const { sendTransaction } = useSendTransaction();

  // Flow state // Extract these types to types.ts later if reused elsewhere
  const [flowStep, setFlowStep] = useState<
    'form' | 'initializing' | 'signing' | 'confirming' | 'success'
  >('form');

  const { walletAddress } = useWalletContext() || {
    walletAddress: '',
  };

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

  // Wallet signing hooks
  const { requireWallet } = useWalletProtection({
    actionName: 'sign project creation transaction',
  });

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

  // Auto-trigger transaction signing when we reach the signing state
  useEffect(() => {
    if (
      flowStep === 'signing' &&
      unsignedTransaction &&
      !isSigningTransaction &&
      submitErrors.length === 0
    ) {
      handleSignTransaction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    flowStep,
    unsignedTransaction,
    isSigningTransaction,
    submitErrors.length,
  ]);

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

  const handleRetry = () => {
    setSubmitErrors([]);
    setFlowStep('signing');
  };

  const handleCreateProject = async (
    contractId: string,
    transactionHash: string
  ) => {
    try {
      const apiRequest = mapFormDataToApiRequest(formData);

      const projectRequest: CreateCrowdfundingProjectRequest = {
        ...apiRequest,
        escrowId: contractId,
        transactionHash,
      };

      await createCrowdfundingProject(projectRequest);

      setFlowStep('success');
      setShowSuccess(true);
      setIsSigningTransaction(false);
      setIsSubmitting(false);
      setLoaderActive(false);
    } catch (error) {
      let errorMessage = 'Failed to create project. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setSubmitErrors([errorMessage]);
      setIsSigningTransaction(false);
      setFlowStep('signing');
      setLoaderActive(false);
    }
  };

  const handleSignTransaction = async () => {
    if (!unsignedTransaction) {
      setSubmitErrors(['No transaction to sign']);
      return;
    }

    const walletValid = await requireWallet(async () => {
      setIsSigningTransaction(true);
      setFlowStep('confirming');
      setLoaderActive(true); // Re-activate loader
      setLoadingStateIndex(3); // Deploying Escrow (Signing & Sending)

      try {
        const signedXdr = await signTransaction({
          unsignedTransaction,
          address: walletAddress || '',
        });

        const sendResponse = await sendTransaction(signedXdr);

        if (
          'status' in sendResponse &&
          sendResponse.status !== ('SUCCESS' as Status)
        ) {
          const errorMessage =
            'message' in sendResponse &&
            typeof sendResponse.message === 'string'
              ? sendResponse.message
              : 'Failed to send transaction';
          throw new Error(errorMessage);
        }

        if (!('contractId' in sendResponse)) {
          throw new Error('Response does not contain contractId');
        }

        const responseData =
          sendResponse as InitializeMultiReleaseEscrowResponse;
        const contractId = responseData.contractId;
        const transactionHash = contractId;

        setLoadingStateIndex(4); // Finalizing Project
        await handleCreateProject(contractId, transactionHash);
      } catch (error) {
        setLoaderActive(false);
        let errorMessage = 'Failed to sign transaction. Please try again.';

        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            errorMessage =
              'Transaction signing was cancelled. Please try again.';
          } else if (error.message.includes('Invalid transaction')) {
            errorMessage =
              'Invalid transaction format. Please contact support.';
          } else if (error.message.includes('Network')) {
            errorMessage =
              'Network error. Please check your connection and try again.';
          } else if (error.message.includes('Wallet not connected')) {
            errorMessage =
              'Wallet is not connected. Please reconnect your wallet.';
          } else {
            errorMessage = error.message;
          }
        }

        setSubmitErrors([errorMessage]);
        setIsSigningTransaction(false);
        setFlowStep('signing');
      }
    });

    if (!walletValid) {
      return;
    }
  };

  // Loader state
  const [loaderActive, setLoaderActive] = useState(false);
  const [loadingStates] = useState([
    { text: 'Validating Project Details' },
    { text: 'Preparing Smart Contract' },
    { text: 'Waiting for Signature' },
    { text: 'Deploying Escrow' },
    { text: 'Finalizing Project' },
  ]);
  const [loadingStateIndex, setLoadingStateIndex] = useState(0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // setIsLoading(true); // Handled by loaderActive now
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

      if (!walletAddress) {
        throw new Error(
          'Wallet not connected. Please connect your wallet first.'
        );
      }

      const apiRequest = mapFormDataToApiRequest(formData);

      // Step 1: Validate Project Data
      setLoaderActive(true);
      setLoadingStateIndex(0); // Validating Project Details

      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const {
          validateCrowdfundingProject,
        } = require('@/features/projects/api');
        await validateCrowdfundingProject(apiRequest);
      } catch (error: any) {
        // If validation fails, stop everything
        setLoaderActive(false);
        const errorMessage =
          error.response?.data?.message || error.message || 'Validation failed';
        setSubmitErrors([errorMessage]);
        setIsSubmitting(false);
        return;
      }

      setLoadingStateIndex(1); // Preparing Smart Contract

      const milestones = payload.milestones || {
        milestones: [],
        fundingAmount: '0',
      };
      const totalFunding = parseFloat(milestones.fundingAmount || '0');
      const milestoneCount = milestones.milestones?.length || 1;
      const amountPerMilestone = Math.floor(totalFunding / milestoneCount);

      const escrowPayload: InitializeMultiReleaseEscrowPayload = {
        signer: walletAddress,
        engagementId: `project-${Date.now()}`,
        title: payload.basic?.projectName || 'Crowdfunding Project',
        description: payload.basic?.vision || payload.details?.vision || '',
        platformFee: 4,
        trustline: {
          address: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
          symbol: 'USDC',
        },
        roles: {
          approver: walletAddress,
          serviceProvider: walletAddress,
          platformAddress: walletAddress,
          releaseSigner: walletAddress,
          disputeResolver: walletAddress,
        },
        milestones: (milestones.milestones || []).map(milestone => ({
          description: `${milestone.title}: ${milestone.description}`,
          amount: amountPerMilestone,
          receiver: walletAddress,
        })),
      };

      setFlowStep('initializing'); // This might be redundant if we just use loader, but keeping for compatibility

      setLoadingStateIndex(1); // Preparing Smart Contract (still)

      const escrowResponse: EscrowRequestResponse = await deployEscrow(
        escrowPayload,
        'multi-release' as EscrowType
      );

      if (
        escrowResponse.status !== ('SUCCESS' as Status) ||
        !escrowResponse.unsignedTransaction
      ) {
        const errorMessage =
          'message' in escrowResponse &&
          typeof escrowResponse.message === 'string'
            ? escrowResponse.message
            : 'Failed to initialize escrow';
        throw new Error(errorMessage);
      }

      const { unsignedTransaction } = escrowResponse;
      setUnsignedTransaction(unsignedTransaction);

      setLoadingStateIndex(2); // Waiting for Signature
      // At this point we need user signature.
      // We might want to pause the loader or update text?
      // The original flow stopped here for user to click "Sign".
      // But user wants "Cleanly written".
      // If we auto-trigger sign, we can keep loader up.
      // Let's rely on the useEffect that watches `flowStep === 'signing'`

      setFlowStep('signing');
      setLoaderActive(false); // Hide loader while waiting for user interaction/signature?
      // Or keep it but maybe with a different state?
      // User request implies a continuous flow.
      // If `requireWallet` pops up a modal, we might want to keep the loader in background or hide it.
      // Let's hide it for now because the signing step is manual in the current UI (button click or auto-trigger).
      // Actually, let's keep it consistent with the previous flow but just add the validation step.

      setIsLoading(false);
    } catch (error) {
      setLoaderActive(false);
      let errorMessage = 'Error preparing project. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('Network')) {
          errorMessage =
            'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Validation')) {
          errorMessage =
            'Project validation failed. Please check your project details.';
        } else if (error.message.includes('Unauthorized')) {
          errorMessage =
            'Authentication required. Please log in and try again.';
        } else if (error.message.includes('Server')) {
          errorMessage = 'Server error. Please try again in a few moments.';
        } else {
          errorMessage = error.message;
        }
      }

      setSubmitErrors([errorMessage]);
      setIsLoading(false);
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
    setUnsignedTransaction(null);
    setIsSigningTransaction(false);
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
    isSigningTransaction,
    handleBack,
    handleContinue,
    handleRetry,
    handleSignTransaction,
    handleReset,
    handleTestData,
    handleDataChange,
    isStepValid,
    loaderActive,
    loadingStates,
    loadingStateIndex,
  };
};
