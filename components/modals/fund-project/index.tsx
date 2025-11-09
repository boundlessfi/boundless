'use client';

import BoundlessSheet from '@/components/sheet/boundless-sheet';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Amount, { AmountFormData, AmountHandle } from './Amount';
import Confirm, { ConfirmHandle, ConfirmFormData } from './Confirm';
import Success from '../Success';
import Loading from '../Loading';
import { fundCrowdfundingProject } from '@/lib/api/project';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { useWalletProtection } from '@/hooks/use-wallet-protection';
import { signTransaction } from '@/lib/config/wallet-kit';
import {
  useFundEscrow,
  useSendTransaction,
  useGetEscrowFromIndexerByContractIds,
} from '@trustless-work/escrow';
import {
  FundEscrowPayload,
  EscrowType,
  EscrowRequestResponse,
  Status,
  MultiReleaseEscrow,
  GetEscrowFromIndexerByContractIdsParams,
} from '@trustless-work/escrow';
import * as StellarSdk from '@stellar/stellar-sdk';

interface FundProjectProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  project?: {
    _id: string;
    title: string;
    logo?: string;
    description?: string;
    contractId?: string; // Escrow contract ID
    creator?: {
      profile?: {
        firstName?: string;
        lastName?: string;
        avatar?: string;
      };
    };
    milestones?: Array<{
      title: string;
      description: string;
      dueDate: string;
      amount: number;
      status: string;
    }>;
    funding?: {
      goal: number;
      raised: number;
    };
  };
}

export interface FundProjectFormData {
  amount: Partial<AmountFormData>;
  confirm: Partial<ConfirmFormData>;
}

const FundProject = ({ open, setOpen, project }: FundProjectProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [flowStep, setFlowStep] = useState<
    'form' | 'fetching' | 'signing' | 'confirming' | 'success'
  >('form');
  const [error, setError] = useState<string | null>(null);
  const [escrow, setEscrow] = useState<MultiReleaseEscrow | null>(null);
  const [isFetchingEscrow, setIsFetchingEscrow] = useState(false);

  // Escrow hooks
  const { fundEscrow } = useFundEscrow();
  const { sendTransaction } = useSendTransaction();
  const { getEscrowByContractIds } = useGetEscrowFromIndexerByContractIds();

  // Wallet hooks
  const { walletAddress } = useWalletContext();
  const { requireWallet } = useWalletProtection({
    actionName: 'fund project',
  });
  // Form data state
  const [formData, setFormData] = useState<FundProjectFormData>({
    amount: {},
    confirm: {},
  });

  // Refs for step components to access validation methods
  const stepRefs = {
    amount: useRef<AmountHandle>(null),
    confirm: useRef<ConfirmHandle>(null),
  };

  // Ref for the scrollable content container
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset scroll position when step changes with smooth transition
  useEffect(() => {
    if (currentStep === 1) return; // Skip for initial load

    // Reset scroll position immediately (while content is hidden)
    const resetScroll = () => {
      // Reset window scroll first
      window.scrollTo(0, 0);

      if (contentRef.current) {
        // Try to find the scrollable parent container
        const scrollableParent =
          contentRef.current.closest('[data-radix-scroll-area-viewport]') ||
          contentRef.current.closest('.overflow-y-auto') ||
          contentRef.current.parentElement?.querySelector('.overflow-y-auto');

        if (scrollableParent) {
          scrollableParent.scrollTop = 0;
        } else {
          // Fallback to scrolling the content ref itself
          contentRef.current.scrollTop = 0;
        }

        // Also try to find any element with overflow-y-auto in the document
        const allScrollableElements =
          document.querySelectorAll('.overflow-y-auto');
        allScrollableElements.forEach(element => {
          if (element.contains(contentRef.current)) {
            element.scrollTop = 0;
          }
        });
      }
    };

    // Reset scroll immediately
    resetScroll();

    return () => {};
  }, [currentStep]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = (): boolean => {
    const stepRef = stepRefs[getStepKey(currentStep)];
    return stepRef?.current?.validate?.() ?? true;
  };

  const getStepKey = (step: number): keyof typeof stepRefs => {
    switch (step) {
      case 1:
        return 'amount';
      case 2:
        return 'confirm';
      default:
        return 'amount';
    }
  };

  const handleContinue = async () => {
    // Mark the step as submitted so untouched fields can show errors
    const key = getStepKey(currentStep);
    stepRefs[key].current?.markSubmitted?.();

    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Handle final submission
    await handleSubmit();
  };

  // Fetch escrow data when modal opens and contractId is available
  useEffect(() => {
    const fetchEscrowData = async () => {
      if (!project?.contractId || escrow) {
        return;
      }

      setIsFetchingEscrow(true);
      try {
        const params: GetEscrowFromIndexerByContractIdsParams = {
          contractIds: [project.contractId],
        };

        const response = await getEscrowByContractIds(params);

        // Handle both array response and object with escrows property
        let escrows: MultiReleaseEscrow[] = [];

        if (Array.isArray(response)) {
          escrows = response as MultiReleaseEscrow[];
        } else if (
          response &&
          typeof response === 'object' &&
          'escrows' in response
        ) {
          escrows =
            (response as { escrows: MultiReleaseEscrow[] }).escrows || [];
        }

        if (escrows.length > 0) {
          const escrowData = escrows[0] as MultiReleaseEscrow;
          setEscrow(escrowData);
          setError(null); // Clear any previous errors
        } else {
          setError(
            'Escrow not found for this project. The escrow contract may not be deployed yet, or the contract ID may be incorrect. Please contact support if this issue persists.'
          );
        }
      } catch {
        setError('Failed to fetch escrow data');
      } finally {
        setIsFetchingEscrow(false);
      }
    };

    if (open && project?.contractId) {
      fetchEscrowData();
    }

    // Reset escrow when modal closes
    if (!open) {
      setEscrow(null);
      setError(null);
    }
  }, [open, project?.contractId, escrow, getEscrowByContractIds]);

  const handleSubmit = async () => {
    if (!project?._id) {
      setError('Project ID is required');
      return;
    }

    if (!project?.contractId) {
      setError(
        'This project does not have an escrow contract set up. Please contact the project creator or support if you believe this is an error.'
      );
      return;
    }

    if (!walletAddress) {
      setError('Wallet address is required');
      return;
    }

    if (!escrow) {
      setError('Escrow data not found. Please try again.');
      return;
    }

    // Get the amount entered by the user
    const userAmount = parseFloat(formData.amount?.amount || '0');

    if (!userAmount || userAmount <= 0) {
      setError('Please enter a valid funding amount');
      return;
    }

    // Check if amount exceeds remaining funding goal
    if (project.funding) {
      const remainingGoal = Math.max(
        0,
        project.funding.goal - project.funding.raised
      );
      if (userAmount > remainingGoal) {
        setError(
          `Amount cannot exceed remaining goal of $${remainingGoal.toLocaleString()}`
        );
        return;
      }
    }

    // Use the user's entered amount (in dollars, no decimal conversion needed)
    const fundingAmount = userAmount;

    setIsSubmitting(true);
    setIsLoading(true);
    setFlowStep('signing');
    setSubmitErrors([]);
    setError(null);

    const walletValid = await requireWallet(async () => {
      if (!walletAddress) {
        setError('Wallet address is required');
        setFlowStep('form');
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }

      if (!project.contractId) {
        setError(
          'This project does not have an escrow contract set up. Please contact the project creator or support if you believe this is an error.'
        );
        setFlowStep('form');
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }

      try {
        // Step 1: Prepare the payload according to FundEscrowPayload type
        const payload: FundEscrowPayload = {
          contractId: project.contractId,
          signer: walletAddress,
          amount: fundingAmount,
        };

        // Step 2: Execute function from Trustless Work
        const fundResponse: EscrowRequestResponse = await fundEscrow(
          payload,
          'multi-release' as EscrowType
        );

        // Type guard: Check if response is successful
        if (
          fundResponse.status !== ('SUCCESS' as Status) ||
          !fundResponse.unsignedTransaction
        ) {
          const errorMessage =
            'message' in fundResponse &&
            typeof fundResponse.message === 'string'
              ? fundResponse.message
              : 'Failed to fund escrow';
          throw new Error(errorMessage);
        }

        const { unsignedTransaction } = fundResponse;

        // Step 3: Sign transaction with wallet
        const signedXdr = await signTransaction({
          unsignedTransaction,
          address: walletAddress,
        });

        // Extract transaction hash from signed XDR
        let transactionHash = project.contractId || ''; // Fallback to contractId

        try {
          // Get network passphrase based on environment
          const networkPassphrase =
            process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'public'
              ? 'Public Global Stellar Network ; September 2015'
              : 'Test SDF Network ; September 2015';

          // Parse the signed XDR and extract transaction hash
          const tx = new StellarSdk.Transaction(signedXdr, networkPassphrase);
          const hash = tx.hash();
          transactionHash = hash.toString('hex');
        } catch {
          // Continue with contractId as fallback
        }

        // Step 4: Send transaction
        setFlowStep('confirming');
        const sendResponse = await sendTransaction(signedXdr);

        // Type guard: Check if response is successful
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

        // Notify backend about the funding
        await fundCrowdfundingProject(project._id, {
          amount: fundingAmount,
          transactionHash,
        });

        // Success - move to success state
        setFlowStep('success');
        setShowSuccess(true);
        setIsLoading(false);
        setIsSubmitting(false);

        // Refresh page to show updated funding amounts
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }, 2000); // Give user time to see success message
      } catch {
        setError('An error occurred');
        setSubmitErrors(['An error occurred']);
        setFlowStep('form');
        setIsLoading(false);
        setIsSubmitting(false);
      }
    });

    if (!walletValid) {
      setFlowStep('form');
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleDataChange = useCallback(
    <K extends keyof FundProjectFormData>(
      step: K,
      data: FundProjectFormData[K]
    ) => {
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

  // Lightweight enable/disable for Continue button without firing validation side-effects
  const isStepValid = (() => {
    if (currentStep === 1) {
      // Amount step: require amount to enable Continue
      const amount = (formData.amount?.amount || '').trim();
      return (
        amount.length > 0 &&
        !isNaN(parseFloat(amount)) &&
        parseFloat(amount) > 0
      );
    }
    if (currentStep === 2) {
      // Confirm step: require both agreements to enable Continue
      const confirm = formData.confirm || {};
      return !!(confirm.agreeToTerms && confirm.agreeToPrivacy);
    }
    return true;
  })();

  const handleReset = () => {
    // Reset form and close modal
    setFormData({
      amount: {},
      confirm: {},
    });
    setCurrentStep(1);
    setShowSuccess(false);
    setIsLoading(false);
    setSubmitErrors([]);
    setFlowStep('form');
    setError(null);
    setEscrow(null); // Reset escrow state for fresh fetch on reopen
    setOpen(false);
  };

  // Function to populate test data for easy testing
  const handleTestData = () => {
    const testData: FundProjectFormData = {
      amount: {
        amount: '100',
        currency: 'USD',
        message: 'Great project! Looking forward to seeing the results.',
      },
      confirm: {
        agreeToTerms: true,
        agreeToPrivacy: true,
      },
    };

    setFormData(testData);
  };

  const renderStepContent = () => {
    // Handle the flow states
    if (
      flowStep === 'fetching' ||
      isFetchingEscrow ||
      (isLoading && flowStep !== 'signing' && flowStep !== 'confirming')
    ) {
      return <Loading />;
    }
    if (flowStep === 'success' || showSuccess) {
      const userAmount = formData.amount?.amount || '0';
      const amountDisplay = `$${userAmount} USDC`;

      return (
        <Success
          onContinue={handleReset}
          title='Contribution Successful!'
          description={`You have backed [${project?.title || 'this project'}](${typeof window !== 'undefined' ? window.location.pathname : ''}) with ${amountDisplay}. Funds are securely held in escrow.`}
          buttonText='Continue'
        />
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <Amount
            ref={stepRefs.amount}
            onDataChange={data => handleDataChange('amount', data)}
            initialData={formData.amount}
            project={project}
          />
        );
      case 2:
        return (
          <Confirm
            ref={stepRefs.confirm}
            onDataChange={data => handleDataChange('confirm', data)}
            initialData={formData.confirm}
            fundingData={formData.amount as AmountFormData}
            project={project}
          />
        );
      default:
        return (
          <Amount
            ref={stepRefs.amount}
            onDataChange={data => handleDataChange('amount', data)}
            initialData={formData.amount}
            project={project}
          />
        );
    }
  };

  return (
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
          project={project}
        />
      )}
      <div
        ref={contentRef}
        className={`min-h-[calc(55vh)] px-4 transition-opacity duration-100 md:px-[50px] lg:px-[75px] xl:px-[150px]`}
      >
        {flowStep !== 'form' ? (
          <div className='flex h-full items-center justify-center'>
            {renderStepContent()}
          </div>
        ) : (
          <>
            {(submitErrors.length > 0 || error) && (
              <div className='mb-4 rounded-md border border-red-500/40 bg-red-500/10 p-4 text-red-200'>
                <p className='mb-2 font-medium text-red-300'>
                  {submitErrors.length > 0
                    ? 'Please fix the following errors before submitting:'
                    : 'An error occurred:'}
                </p>
                {submitErrors.length > 0 ? (
                  <ul className='list-disc space-y-1 pl-5'>
                    {submitErrors.map((e, idx) => (
                      <li key={idx} className='text-sm'>
                        {e}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-sm'>{error}</p>
                )}
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
  );
};

export default FundProject;
