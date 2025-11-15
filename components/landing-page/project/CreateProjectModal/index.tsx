import BoundlessSheet from '@/components/sheet/boundless-sheet';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Basic, { BasicFormData } from './Basic';
import Details, { DetailsFormData } from './Details';
import Milestones, { MilestonesFormData } from './Milestones';
import Team, { TeamFormData } from './Team';
import Contact, { ContactFormData } from './Contact';
import LoadingScreen from './LoadingScreen';
import SuccessScreen from './SuccessScreen';
import TransactionSigningScreen from './TransactionSigningScreen';
import { z } from 'zod';
import { createCrowdfundingProject } from '@/lib/api/project';
import { CreateCrowdfundingProjectRequest } from '@/lib/api/types';
import { useWalletProtection } from '@/hooks/use-wallet-protection';
import { cn } from '@/lib/utils';
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

type StepHandle = { validate: () => boolean; markSubmitted?: () => void };

interface CreateProjectModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export interface ProjectFormData {
  basic: Partial<BasicFormData>;
  details: Partial<DetailsFormData>;
  milestones: Partial<MilestonesFormData>;
  team: Partial<TeamFormData>;
  contact: Partial<ContactFormData>;
}

const CreateProjectModal = ({ open, setOpen }: CreateProjectModalProps) => {
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

  // Flow state
  const [flowStep, setFlowStep] = useState<
    'form' | 'initializing' | 'signing' | 'confirming' | 'success'
  >('form');

  const { walletAddress } = useWalletContext() || {
    walletAddress: '',
    walletName: '',
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
    return stepRef?.current?.validate() ?? true;
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

  const handleContinue = async () => {
    // Mark the step as submitted so untouched fields can show errors
    const key = getStepKey(currentStep);
    stepRefs[key].current?.markSubmitted?.();
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Handle final submission (show loader then success)
    await handleSubmit();
  };

  // Function to map form data to API request format
  const mapFormDataToApiRequest = (
    data: ProjectFormData
  ): CreateCrowdfundingProjectRequest => {
    const basic = data.basic || {};
    const details = data.details || {};
    const milestones = data.milestones || {
      fundingAmount: '0',
      milestones: [],
    };
    const team = data.team || { members: [] };
    const contact = data.contact || {
      telegram: '',
      backupType: 'whatsapp',
      backupContact: '',
    };

    // Convert milestones to API format
    const apiMilestones = (milestones.milestones || []).map(milestone => ({
      name: milestone.title,
      description: milestone.description,
      startDate: milestone.startDate,
      endDate: milestone.endDate,
      amount:
        parseFloat(milestones.fundingAmount || '0') /
        (milestones.milestones?.length || 1), // Distribute funding equally
    }));

    // Convert team members to API format
    const apiTeam = (team.members || []).map(member => ({
      name: member.email.split('@')[0], // Extract name from email
      role: 'MEMBER', // Default role for all members
      email: member.email,
    }));

    // Convert social links to API format
    const socialLinks = basic.socialLinks?.filter(link => link.trim()) || [];
    const apiSocialLinks = socialLinks.map(link => ({
      platform: link.startsWith('https://twitter.com/')
        ? 'twitter'
        : link.startsWith('https://discord.gg/')
          ? 'discord'
          : link.startsWith('https://t.me/')
            ? 'telegram'
            : 'other', // Default platform
      url: link,
    }));

    return {
      title: basic.projectName || '',
      logo: basic.logoUrl || '',
      vision: basic.vision || '',
      category: basic.category || '',
      details: details.vision || '',
      fundingAmount: parseFloat(milestones.fundingAmount || '0') || 0,
      githubUrl: basic.githubUrl || undefined,
      gitlabUrl: undefined,
      bitbucketUrl: undefined,
      projectWebsite: basic.websiteUrl || undefined,
      demoVideo: basic.demoVideoUrl || undefined,
      milestones: apiMilestones,
      team: apiTeam,
      contact: {
        primary: `@${contact.telegram || ''}`,
        backup: contact.backupContact || '',
      },
      socialLinks: apiSocialLinks,
      contractId: '',
      escrowAddress: '',
      transactionHash: '',
      escrowDetails: {},
    };
  };

  const handleRetry = () => {
    setSubmitErrors([]);
    setFlowStep('signing');
  };

  const handleSignTransaction = async () => {
    if (!unsignedTransaction) {
      setSubmitErrors(['No transaction to sign']);
      return;
    }

    const walletValid = await requireWallet(async () => {
      setIsSigningTransaction(true);
      setFlowStep('confirming');

      try {
        // Step 3: Sign transaction with wallet
        const signedXdr = await signTransaction({
          unsignedTransaction,
          address: walletAddress || '',
        });

        // Step 4: Send transaction
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

        // Extract contractId and transaction hash from response
        if (!('contractId' in sendResponse)) {
          throw new Error('Response does not contain contractId');
        }

        const responseData =
          sendResponse as InitializeMultiReleaseEscrowResponse;
        const contractId = responseData.contractId;

        // Extract transaction hash
        // Note: The actual transaction hash will be available after the transaction is submitted
        // For now, we use the contractId as the transaction identifier
        // The backend may accept this or we can update it with the actual hash later
        const transactionHash = contractId;

        // Now create the project with escrow data
        await handleCreateProject(contractId, transactionHash);
      } catch (error) {
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

  const handleCreateProject = async (
    contractId: string,
    transactionHash: string
  ) => {
    try {
      // Map form data to API request format
      const apiRequest = mapFormDataToApiRequest(formData);

      // Add escrow data
      const projectRequest: CreateCrowdfundingProjectRequest = {
        ...apiRequest,
        contractId,
        escrowAddress: contractId, // In Stellar, contractId is the escrow address
        transactionHash,
        escrowDetails: {}, // Optional escrow details
      };

      // Create the project
      const response = await createCrowdfundingProject(projectRequest);

      if (response.success) {
        // Project created successfully
        setFlowStep('success');
        setShowSuccess(true);
        setIsSigningTransaction(false);
        setIsSubmitting(false);
      } else {
        throw new Error(response.message || 'Failed to create project');
      }
    } catch (error) {
      let errorMessage = 'Failed to create project. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setSubmitErrors([errorMessage]);
      setIsSigningTransaction(false);
      setFlowStep('signing');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setIsLoading(true);

    try {
      const milestoneSchema = z
        .object({
          id: z.string().optional(),
          title: z.string().trim().min(1),
          description: z.string().trim().min(1),
          startDate: z.string().min(1),
          endDate: z.string().min(1),
        })
        .superRefine((val, ctx) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const startDate = new Date(val.startDate);
          const endDate = new Date(val.endDate);

          // Check if start date is in the future (at least tomorrow)
          if (startDate <= today) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['startDate'],
              message: 'Start date must be at least tomorrow',
            });
          }

          // Check if end date is after start date
          if (endDate <= startDate) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['endDate'],
              message: 'End date must be after start date',
            });
          }

          // Check if milestone has reasonable duration (at least 1 week)
          const durationInDays = Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (durationInDays < 7) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['endDate'],
              message: 'Milestone duration must be at least 1 week',
            });
          }

          // Check if milestone is not too far in the future (max 2 years)
          const maxFutureDate = new Date();
          maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 2);
          if (startDate > maxFutureDate) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['startDate'],
              message: 'Start date cannot be more than 2 years in the future',
            });
          }
        });

      const projectSchema = z.object({
        basic: z.object({
          projectName: z.string().trim().min(1),
          logo: z.any().optional(),
          vision: z.string().trim().min(1).max(300),
          category: z.string().trim().min(1),
          githubUrl: z
            .string()
            .trim()
            .optional()
            .or(z.literal(''))
            .refine(
              v =>
                !v ||
                /^https?:\/\/.+/i.test(v) ||
                /^[\w.-]+\.[a-z]{2,}$/i.test(v),
              {
                message:
                  'Please enter a valid URL (with or without https), e.g., https://github.com or github.com',
              }
            )
            .optional(),
          websiteUrl: z
            .string()
            .trim()
            .optional()
            .or(z.literal(''))
            .refine(
              v =>
                !v ||
                /^https?:\/\/.+/i.test(v) ||
                /^[\w.-]+\.[a-z]{2,}$/i.test(v),
              {
                message:
                  'Please enter a valid URL (with or without https), e.g., https://boundlessfi.xyz or boundlessfi.xyz',
              }
            )
            .optional(),
          demoVideoUrl: z
            .string()
            .trim()
            .optional()
            .or(z.literal(''))
            .refine(
              v =>
                !v ||
                /^https?:\/\/.+/i.test(v) ||
                /^[\w.-]+\.[a-z]{2,}$/i.test(v),
              {
                message:
                  'Please enter a valid URL (with or without https), e.g., https://demo.com or demo.com',
              }
            )
            .optional(),
          socialLinks: z.array(z.string()).min(1),
        }),
        details: z.object({
          vision: z.string().trim().min(1),
        }),
        milestones: z.object({
          fundingAmount: z
            .string()
            .refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0),
          milestones: z
            .array(milestoneSchema)
            .min(1)
            .superRefine((milestones, ctx) => {
              // Check that milestones are in chronological order
              for (let i = 0; i < milestones.length - 1; i++) {
                const currentEndDate = new Date(milestones[i].endDate);
                const nextStartDate = new Date(milestones[i + 1].startDate);

                // Allow some overlap (up to 1 day) but not significant overlap
                const daysBetween = Math.ceil(
                  (nextStartDate.getTime() - currentEndDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                if (daysBetween < -1) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: [i + 1, 'startDate'],
                    message: `Milestone ${i + 2} start date should be after milestone ${i + 1} end date`,
                  });
                }
              }

              // Check that total project timeline is reasonable (max 3 years)
              if (milestones.length > 0) {
                const firstStartDate = new Date(milestones[0].startDate);
                const lastEndDate = new Date(
                  milestones[milestones.length - 1].endDate
                );
                const totalDurationInDays = Math.ceil(
                  (lastEndDate.getTime() - firstStartDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                if (totalDurationInDays > 1095) {
                  // 3 years
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['milestones'],
                    message: 'Total project timeline cannot exceed 3 years',
                  });
                }
              }
            }),
        }),
        team: z
          .object({
            members: z
              .array(
                z.object({
                  id: z.string(),
                  email: z.string().email(),
                  role: z.string().optional(),
                })
              )
              .optional()
              .default([]),
          })
          .optional()
          .default({ members: [] }),
        contact: z.object({
          telegram: z.string().trim().min(1),
          backupType: z.enum(['discord', 'whatsapp']),
          backupContact: z.string().trim().min(1),
          agreeToTerms: z.literal(true),
          agreeToPrivacy: z.literal(true),
        }),
      });

      // Clicking submit implies agreement to Terms and Privacy
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

      setSubmitErrors([]);

      if (!walletAddress) {
        throw new Error(
          'Wallet not connected. Please connect your wallet first.'
        );
      }

      // Map form data to escrow payload
      const milestones = payload.milestones || {
        milestones: [],
        fundingAmount: '0',
      };
      const totalFunding = parseFloat(milestones.fundingAmount || '0');
      const milestoneCount = milestones.milestones?.length || 1;
      const amountPerMilestone = Math.floor(totalFunding / milestoneCount);

      // Step 1: Initialize escrow with Trustless Work
      const escrowPayload: InitializeMultiReleaseEscrowPayload = {
        signer: walletAddress,
        engagementId: `project-${Date.now()}`, // Generate unique engagement ID
        title: payload.basic?.projectName || 'Crowdfunding Project',
        description: payload.basic?.vision || payload.details?.vision || '',
        platformFee: 4, // 4% platform fee
        trustline: {
          address: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA', // USDC trustline
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
          receiver: walletAddress, // Funds go to project creator
        })),
      };

      setFlowStep('initializing');

      // Step 2: Execute function from Trustless Work
      const escrowResponse: EscrowRequestResponse = await deployEscrow(
        escrowPayload,
        'multi-release' as EscrowType
      );

      // Type guard: Check if response is successful
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
      setFlowStep('signing');
      setIsLoading(false);
    } catch (error) {
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

  // Lightweight enable/disable for Continue button without firing validation side-effects
  const isStepValid = (() => {
    if (currentStep === 2) {
      // Details step: require non-empty vision to enable Continue
      const v = (formData.details?.vision || '').trim();
      return v.length > 0;
    }
    if (currentStep === 5) {
      // Contact step: enable when core fields are filled
      // Terms/Privacy will be enforced on submit via schema
      const contact = formData.contact || {};
      return !!(
        contact.telegram?.trim() &&
        contact.backupType &&
        contact.backupContact?.trim()
      );
    }
    // For other steps, allow Continue (validation will run on click)
    return true;
  })();

  const handleReset = () => {
    // Reset form and close modal
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

  // Function to populate test data for easy testing
  const handleTestData = () => {
    const testData: ProjectFormData = {
      basic: {
        projectName: 'Nebula Finance',
        logo: 'https://res.cloudinary.com/danuy5rqb/image/upload/v1759431246/boundless/projects/logos/jfc5v0l6xec0bdhmliet.png',
        logoUrl:
          'https://res.cloudinary.com/danuy5rqb/image/upload/v1759431246/boundless/projects/logos/jfc5v0l6xec0bdhmliet.png',
        vision:
          'Nebula Finance is redefining decentralized finance with real-time, cross-chain yield aggregation and AI-driven investment strategies for both retail and institutional users.',
        category: 'DeFi & Finance',
        githubUrl: 'https://github.com/nebula-finance/nebula-protocol',
        websiteUrl: 'https://nebula.finance',
        demoVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        socialLinks: [
          'https://twitter.com/nebula_defi',
          'https://discord.gg/nebula-finance',
          'https://t.me/nebula_defi',
          'https://linkedin.com/company/nebula-finance',
        ],
      },
      details: {
        vision: `# Nebula Finance Vision
  
  ## Overview
  Nebula Finance is a next-generation DeFi protocol that enables users to earn optimized yields across multiple blockchains without needing to actively manage assets.
  
  ## Core Features
  - **AI Yield Optimization**: Machine-learning models analyze yield opportunities in real-time to rebalance portfolios.
  - **Cross-Chain Aggregation**: Unified interface and smart routing across Ethereum, Arbitrum, Optimism, and BNB Chain.
  - **Decentralized Governance**: Token holders influence strategy, emissions, and protocol upgrades.
  - **Institutional Features**: Compliance-ready APIs, whitelisting options, and secure custody integrations.
  
  ## Technology Stack
  - Smart Contracts: Solidity + Vyper
  - Frontend: React + TypeScript + Wagmi
  - Backend: Node.js, PostgreSQL
  - Data Indexing: The Graph
  - Storage: IPFS & Arweave
  
  ## Roadmap
  - **Q1 2026**: Smart contract audit and testnet launch
  - **Q2 2026**: Mainnet launch with ETH, ARB, and OP integrations
  - **Q3 2026**: Cross-chain dashboard and partner integrations
  - **Q4 2026**: Governance activation and community treasury`,
      },
      milestones: {
        fundingAmount: '250000', // More realistic for a serious DeFi project
        milestones: [
          {
            id: 'milestone-1',
            title: 'Protocol Architecture & Smart Contracts',
            description:
              'Design core protocol architecture and write smart contracts for vaults, rebalancing, and governance. Engage auditors from Certik or OpenZeppelin.',
            startDate: '2026-01-10',
            endDate: '2026-03-30',
          },
          {
            id: 'milestone-2',
            title: 'UI/UX Development',
            description:
              'Design and develop the frontend interface with wallet integrations (MetaMask, WalletConnect) and support for multi-chain data display.',
            startDate: '2026-04-01',
            endDate: '2026-05-31',
          },
          {
            id: 'milestone-3',
            title: 'Security Audits & Launch',
            description:
              'Conduct security audits, final integration tests, and launch the protocol on Ethereum and Arbitrum. Begin initial liquidity mining campaign.',
            startDate: '2026-06-01',
            endDate: '2026-07-31',
          },
        ],
      },
      team: {
        members: [
          {
            id: 'member-1',
            email: 'alice@nebula.finance',
          },
          {
            id: 'member-2',
            email: 'michael@nebula.finance',
          },
          {
            id: 'member-3',
            email: 'linda@nebula.finance',
          },
        ],
      },
      contact: {
        telegram: 'nebula_support',
        backupType: 'discord',
        backupContact: 'nebula_admin#0420',
        agreeToTerms: true,
        agreeToPrivacy: true,
      },
    };

    setFormData(testData);
  };

  const renderStepContent = () => {
    // Handle the flow states
    if (flowStep === 'initializing' || (isLoading && flowStep !== 'signing')) {
      return <LoadingScreen />;
    }
    if (flowStep === 'success' || showSuccess) {
      return <SuccessScreen onContinue={handleReset} />;
    }
    if (
      flowStep === 'signing' &&
      unsignedTransaction &&
      !isSigningTransaction
    ) {
      return (
        <TransactionSigningScreen
          onSign={handleSignTransaction}
          flowStep='signing'
          onRetry={handleRetry}
          hasError={submitErrors.length > 0}
          errorMessage={submitErrors[0]}
        />
      );
    }
    if (flowStep === 'confirming' || isSigningTransaction) {
      return (
        <TransactionSigningScreen
          onSign={handleSignTransaction}
          isSigning={true}
          flowStep='confirming'
        />
      );
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
          // flowStep === 'confirming' ||
          //   isSigningTransaction ||
          //   (flowStep === 'signing' &&
          //     unsignedTransaction &&
          //     !isSigningTransaction),
          // 'flex h-full items-center justify-center'
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
  );
};

export default CreateProjectModal;
