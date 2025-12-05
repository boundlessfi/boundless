'use client';

import React, { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  X,
  Package,
  DollarSign,
  ImagePlus,
  ArrowLeft,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectItem,
  SelectContent,
  SelectValue,
  SelectTrigger,
} from '@/components/ui/select';
import { BoundlessButton } from '../buttons';
import { Checkbox } from '../ui/checkbox';
import { useWalletProtection } from '@/hooks/use-wallet-protection';
import WalletRequiredModal from '@/components/wallet/WalletRequiredModal';

interface LaunchCampaignFlowProps {
  onComplete: () => void;
}

interface CampaignFormData {
  title: string;
  description: string;
  fundingGoal: string;
  category: string;
  images: string[];
  duration: string;
}

interface EscrowData {
  network: string;
  transactionType: string;
  walletAddress: string;
  agreedToTerms: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  deliveryDate: string;
  fundAmount: number;
  isExpanded: boolean;
}

const LaunchCampaignFlow: React.FC<LaunchCampaignFlowProps> = ({
  onComplete,
}) => {
  const [currentPhase, setCurrentPhase] = useState<'details' | 'escrow'>(
    'details'
  );

  // Wallet protection hook
  const {
    requireWallet,
    showWalletModal,
    handleWalletConnected,
    closeWalletModal,
  } = useWalletProtection({
    actionName: 'launch campaign',
  });
  const [formData, setFormData] = useState({
    title: 'Boundless',
    description:
      'Boundless is a trustless, decentralized application (dApp) that empowers changemakers and builders to raise funds transparently without intermediaries. Campaigns are structured around clearly defined milestones, with funds held in escrow and released only upon approval. Grant creators can create campaigns with defined milestones and funding goals.',
    fundingGoal: '123,000.00',
    category: '',
    images: [] as string[],
    duration: '90 Days',
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Web3',
    'Crowdfunding',
  ]);
  const [escrowData, setEscrowData] = useState({
    network: 'Stella / Soroban',
    transactionType: 'On-chain, irreversible',
    walletAddress: '',
    agreedToTerms: false,
  });

  const milestones = [
    {
      id: '1',
      title: 'Prototype & Smart Contract Setup',
      description:
        'Develop a functional UI prototype for the crowdfunding and grant flow. Simultaneously, implement and test Soroban smart contracts for escrow logic, milestone validation, and secure fund handling.',
      deliveryDate: 'October 10, 2025',
      fundAmount: 29000,
      isExpanded: true,
    },
    {
      id: '2',
      title: 'Campaign & Grant Builder Integration',
      description:
        'Integrate campaign creation tools and grant builder functionality.',
      deliveryDate: 'November 15, 2025',
      fundAmount: 43050,
      isExpanded: false,
    },
    {
      id: '3',
      title: 'Platform Launch & Community Building',
      description:
        'Launch the platform to the public and build a strong community.',
      deliveryDate: 'December 20, 2025',
      fundAmount: 49200,
      isExpanded: false,
    },
  ];

  const escrowTerms = [
    {
      title: 'Smart Contract Control',
      description:
        'All funds contributed to your campaign will be held in a smart contract powered by Soroban.',
    },
    {
      title: 'Milestone-Based Release',
      description:
        'Funds will only be released upon successful completion and approval of individual milestones as defined in your campaign.',
    },
    {
      title: 'Immutable Fund Allocation',
      description:
        'Once the campaign is submitted to escrow, your milestone structure and fund percentages cannot be modified.',
    },
    {
      title: 'Non-custodial Holding',
      description:
        'Boundless does not hold your funds. Escrow is fully decentralized and governed by the smart contract.',
    },
    {
      title: 'Unmet Funding Goal',
      description:
        'If the campaign goal is not reached by the deadline, no funds will be released and contributors may be refunded (depending on platform policy).',
    },
    {
      title: 'KYC Compliance',
      description:
        'You must maintain a verified KYC status throughout the campaign to remain eligible for fund disbursement.',
    },
    {
      title: 'Transparent',
      description:
        'All fund flows and milestone reviews are publicly visible for accountability.',
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const validFiles = Array.from(files).filter(
        file => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
      );

      if (validFiles.length !== files.length) {
        // console.warn(
        //   'Some files were skipped - only images under 5MB are allowed'
        // );
      }

      const newImages = validFiles.map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 4), // Limit to 4 images
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const isFormValid = (): boolean => {
    return Boolean(
      formData.title &&
      formData.description &&
      formData.fundingGoal &&
      formData.images.length > 0 &&
      formData.duration
    );
  };

  const isEscrowValid = (): boolean => {
    return Boolean(escrowData.walletAddress && escrowData.agreedToTerms);
  };

  const handleNextPhase = () => {
    if (currentPhase === 'details') {
      setCurrentPhase('escrow');
    }
  };

  const handleBackPhase = () => {
    if (currentPhase === 'escrow') {
      setCurrentPhase('details');
    }
  };

  const phases = [
    {
      title: 'Campaign Details',
      state:
        currentPhase === 'details'
          ? ('active' as const)
          : ('completed' as const),
    },
    {
      title: 'Escrow Setup',
      state:
        currentPhase === 'escrow' ? ('active' as const) : ('pending' as const),
    },
  ];

  return (
    <div className='mx-auto max-w-[500px] space-y-6'>
      {/* Header with Progress Steps */}
      <div className='space-y-4'>
        <h2 className='text-2xl font-semibold text-white'>
          {currentPhase === 'details' ? 'Set Campaign Details' : 'Escrow Setup'}
        </h2>
        <div className='w-full'>
          <div className='flex gap-1'>
            {phases.map((phase, index) => (
              <div key={index} className='flex-1'>
                <div className='h-2 w-full rounded-full bg-[#2B2B2B]'>
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
                      phase.state === 'completed'
                        ? 'bg-primary'
                        : phase.state === 'active'
                          ? 'bg-primary'
                          : 'bg-[#2B2B2B]'
                    }`}
                    style={{
                      width:
                        phase.state === 'completed' || phase.state === 'active'
                          ? '100%'
                          : '0%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {currentPhase === 'details' ? (
        <CampaignDetailsForm
          formData={formData}
          selectedTags={selectedTags}
          onInputChange={handleInputChange}
          onTagToggle={handleTagToggle}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
          isFormValid={isFormValid}
          onNext={handleNextPhase}
        />
      ) : (
        <EscrowSetupForm
          escrowData={escrowData}
          setEscrowData={setEscrowData}
          milestones={milestones}
          escrowTerms={escrowTerms}
          isEscrowValid={isEscrowValid}
          onBack={handleBackPhase}
          onComplete={() => requireWallet(onComplete)}
        />
      )}

      {/* Wallet Required Modal */}
      <WalletRequiredModal
        open={showWalletModal}
        onOpenChange={closeWalletModal}
        actionName='launch campaign'
        onWalletConnected={handleWalletConnected}
      />
    </div>
  );
};

// Campaign Details Form Component
const CampaignDetailsForm: React.FC<{
  formData: CampaignFormData;
  selectedTags: string[];
  onInputChange: (field: string, value: string) => void;
  onTagToggle: (tag: string) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  isFormValid: () => boolean;
  onNext: () => void;
}> = ({
  formData,
  selectedTags,
  onInputChange,
  onTagToggle,
  onImageUpload,
  onRemoveImage,
  isFormValid,
  onNext,
}) => {
  const [tagQuery, setTagQuery] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const projectTags = [
    { value: 'web3', label: 'Web3' },
    { value: 'crowdfunding', label: 'Crowdfunding' },
    { value: 'defi', label: 'DeFi' },
    { value: 'nft', label: 'NFT' },
    { value: 'dao', label: 'DAO' },
    { value: 'blockchain', label: 'Blockchain' },
    { value: 'cryptocurrency', label: 'Cryptocurrency' },
    { value: 'smart-contracts', label: 'Smart Contracts' },
    { value: 'dapp', label: 'dApp' },
    { value: 'metaverse', label: 'Metaverse' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'social-impact', label: 'Social Impact' },
    { value: 'sustainability', label: 'Sustainability' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'art', label: 'Art' },
    { value: 'music', label: 'Music' },
    { value: 'sports', label: 'Sports' },
    { value: 'technology', label: 'Technology' },
  ];

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      onTagToggle(trimmedTag);
    }
    setTagQuery('');
    setIsSuggestionsOpen(false);
  };

  const handleRemoveTag = (tag: string) => {
    onTagToggle(tag);
  };
  return (
    <div className='space-y-6'>
      {/* Campaign Title */}
      <div className='flex flex-col gap-1'>
        <label className='text-card text-xs font-medium'>
          Campaign Title <span className='text-red-500'>*</span>
        </label>
        <div className='bg-stepper-foreground border-stepper-border flex h-12 w-full items-center gap-3 rounded-[12px] border p-4'>
          <Package className='text-card size-5' />
          <input
            value={formData.title}
            onChange={e => onInputChange('title', e.target.value)}
            type='text'
            className='text-placeholder w-full bg-transparent text-base font-normal focus:outline-none'
            placeholder='Enter campaign title'
          />
        </div>
      </div>

      <div className='flex flex-col gap-1'>
        <label className='text-card flex justify-between text-xs font-medium'>
          <span>
            Project Description (Rich Text Editor or Markdown supported)
            <span className='text-red-500'>*</span>
          </span>
          <span className='text-card/60'>
            {formData.description.length}/400
          </span>
        </label>
        <Textarea
          value={formData.description}
          onChange={e => onInputChange('description', e.target.value)}
          maxLength={400}
          className='text-placeholder bg-stepper-foreground border-stepper-border min-h-[120px] w-full resize-none rounded-[12px] border text-base font-normal focus-visible:ring-0'
          placeholder='Describe your campaign in a few words'
        />
      </div>

      <div className='flex flex-col gap-1'>
        <label className='text-card text-xs font-medium'>
          Funding Goal <span className='text-red-500'>*</span>
        </label>
        <div className='bg-stepper-foreground border-stepper-border flex h-12 w-full items-center gap-3 rounded-[12px] border p-4'>
          <DollarSign className='text-card size-5' />
          <Input
            value={formData.fundingGoal}
            onChange={e => onInputChange('fundingGoal', e.target.value)}
            type='number'
            className='text-placeholder w-full !border-none bg-transparent text-base font-normal focus:outline-none'
            placeholder='Enter the amount you need to fund this campaign'
            disabled
          />
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        <label className='text-card flex items-center justify-between text-xs font-medium'>
          Tags <span className='text-placeholder'>Optional</span>
        </label>
        <div className='relative'>
          <div className='bg-stepper-foreground border-stepper-border flex min-h-12 w-full flex-wrap items-center gap-2 rounded-[12px] border p-2'>
            {selectedTags.map(tag => (
              <Badge
                key={tag}
                className='bg-background text-card flex items-center gap-1'
              >
                {projectTags.find(t => t.value === tag)?.label || tag}
                <button
                  type='button'
                  className='hover:bg-destructive/20 ml-1 rounded-full outline-none'
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className='size-3' />
                </button>
              </Badge>
            ))}
            <input
              type='text'
              value={tagQuery}
              onChange={e => {
                setTagQuery(e.target.value);
                setIsSuggestionsOpen(true);
              }}
              onFocus={() => setIsSuggestionsOpen(true)}
              onBlur={() => {
                // Delay closing to allow click on suggestion
                setTimeout(() => setIsSuggestionsOpen(false), 120);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  handleAddTag(tagQuery);
                } else if (
                  e.key === 'Backspace' &&
                  tagQuery === '' &&
                  selectedTags.length > 0
                ) {
                  handleRemoveTag(selectedTags[selectedTags.length - 1]);
                }
              }}
              className='text-placeholder placeholder:text-placeholder/60 min-w-[140px] flex-1 bg-transparent text-base font-normal focus:outline-none'
              placeholder='Type and press Enter'
              aria-label='Add tag'
            />
          </div>

          {/* Suggestions dropdown */}
          {isSuggestionsOpen && tagQuery.trim().length > 0 && (
            <div className='bg-background border-stepper-border absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-md border shadow-md'>
              <ul className='py-1'>
                {projectTags
                  .filter(
                    t =>
                      !selectedTags.includes(t.value) &&
                      (t.label.toLowerCase().includes(tagQuery.toLowerCase()) ||
                        t.value.toLowerCase().includes(tagQuery.toLowerCase()))
                  )
                  .map(t => (
                    <li key={t.value}>
                      <button
                        type='button'
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => handleAddTag(t.value)}
                        className='hover:bg-stepper-foreground text-card w-full px-3 py-2 text-left'
                      >
                        {t.label}
                      </button>
                    </li>
                  ))}
                {/* Create custom tag */}
                {!projectTags.some(
                  t =>
                    t.value.toLowerCase() === tagQuery.toLowerCase() ||
                    t.label.toLowerCase() === tagQuery.toLowerCase()
                ) &&
                  !selectedTags.includes(tagQuery.trim()) && (
                    <li>
                      <button
                        type='button'
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => handleAddTag(tagQuery)}
                        className='hover:bg-stepper-foreground text-card/80 w-full px-3 py-2 text-left'
                      >
                        Create "{tagQuery.trim()}"
                      </button>
                    </li>
                  )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Upload Campaign Images */}
      <div className='flex flex-col gap-1'>
        <label className='text-card text-xs font-medium'>
          Upload Campaign Images <span className='text-red-500'>*</span>
        </label>
        <div className='mt-2 flex items-center justify-start gap-3 rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-4'>
          {formData.images.map((image: string, index: number) => (
            <div
              key={index}
              className='relative h-12 w-12 rounded-full border border-[#2A2A2A] bg-[#1A1A1A]'
            >
              <div className='h-full w-full overflow-hidden rounded-full'>
                <Image
                  src={image}
                  alt={`Campaign image ${index + 1}`}
                  fill
                  className='rounded-full object-cover'
                />
              </div>
              <button
                onClick={() => onRemoveImage(index)}
                className='absolute -top-1 -right-1 z-50 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 transition-colors hover:bg-red-600'
                style={{ zIndex: 50 }}
              >
                <X className='size-3 text-white' />
              </button>
            </div>
          ))}
          {formData.images.length < 4 && (
            <label className='relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white transition-colors hover:bg-white/80'>
              <div className='text-center'>
                <ImagePlus className='size-6 text-[#1B1B1B]' />
              </div>
              <input
                type='file'
                accept='image/*'
                onChange={onImageUpload}
                className='hidden'
                multiple
              />
            </label>
          )}
        </div>
      </div>

      {/* Campaign Duration */}
      <div className='flex flex-col gap-1'>
        <label className='text-card text-xs font-medium'>
          Campaign Duration <span className='text-red-500'>*</span>
        </label>
        <Select
          onValueChange={value => onInputChange('duration', value)}
          value={formData.duration}
        >
          <SelectTrigger className='flex !h-12 w-full items-center !gap-3 rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-4 text-white focus:ring-0'>
            <div className='flex items-center gap-2'>
              <Calendar className='text-card size-5' />
              <SelectValue placeholder='Select a duration' />
            </div>
          </SelectTrigger>
          <SelectContent className='text-placeholder max-h-[200px] overflow-y-auto rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] text-base font-normal text-white'>
            <SelectItem defaultValue={formData.duration} value='30 Days'>
              30 Days
            </SelectItem>
            <SelectItem value='60 Days'>60 Days</SelectItem>
            <SelectItem value='90 Days'>90 Days</SelectItem>
            <SelectItem value='180 Days'>180 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className=''>
        {/* <Button
          variant='outline'
          onClick={onBack}
          className='flex-1 border-[#2B2B2B] bg-transparent text-white hover:bg-[#2A2A2A]'
        >
          Back
        </Button> */}
        <BoundlessButton
          onClick={onNext}
          disabled={!isFormValid()}
          className={cn(
            'bg-primary hover:bg-primary/80',
            !isFormValid() && 'cursor-not-allowed opacity-50'
          )}
        >
          Review & Submit
        </BoundlessButton>
      </div>
    </div>
  );
};

// Escrow Setup Form Component
const EscrowSetupForm: React.FC<{
  escrowData: EscrowData;
  setEscrowData: (data: EscrowData) => void;
  milestones: Milestone[];
  escrowTerms: { title: string; description: string }[];
  isEscrowValid: () => boolean;
  onBack: () => void;
  onComplete: () => void;
}> = ({
  escrowData,
  setEscrowData,
  milestones,
  escrowTerms,
  isEscrowValid,
  onBack,
  onComplete,
}) => {
  const [expandedMilestones, setExpandedMilestones] = useState<number[]>([0]);

  const toggleMilestone = (index: number) => {
    setExpandedMilestones(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className='space-y-6'>
      {/* Milestone Summary */}
      <div className='space-y-3'>
        <h3 className='text-lg font-medium text-white'>Milestone Summary</h3>
        <div className='space-y-3'>
          {milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className='overflow-hidden rounded-xl border border-[#2B2B2B]'
            >
              <button
                onClick={() => toggleMilestone(index)}
                className='flex w-full items-center justify-between bg-[#2A2A2A] p-4 text-[#F5F5F5] transition-colors hover:bg-[#2A2A2A]/80'
              >
                <div className='text-left'>
                  <h4 className='mb-1 text-xs font-medium text-[#B5B5B5]'>
                    Milestone {index + 1}
                  </h4>
                  <span className='text-sm font-medium'>{milestone.title}</span>
                </div>
                {expandedMilestones.includes(index) ? (
                  <svg
                    className='h-4 w-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 15l7-7 7 7'
                    />
                  </svg>
                ) : (
                  <svg
                    className='h-4 w-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                )}
              </button>

              {expandedMilestones.includes(index) && (
                <div className='border-t border-[#2B2B2B] bg-[#1A1A1A] p-4'>
                  <p className='mb-4 text-sm text-[#B5B5B5]'>
                    {milestone.description}
                  </p>
                  <div className='flex items-center justify-between text-sm text-[#B5B5B5]'>
                    <div className='flex items-center space-x-2'>
                      <Calendar className='h-4 w-4' />
                      <span>{milestone.deliveryDate}</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span>$</span>
                      <span>${milestone.fundAmount.toLocaleString()}.00</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Escrow Terms */}
      <div className='space-y-3 rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-4'>
        <h3 className='font-semibold text-white'>Escrow Terms</h3>
        <div className='space-y-4'>
          {escrowTerms.map((term, index) => (
            <div
              key={index}
              className='flex flex-col items-start gap-1 text-white'
            >
              <h4 className='font-semibold'>{term.title}</h4>
              <p className='text-sm'>{term.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Agreement */}
      <div className='space-y-3'>
        <div className='flex items-center space-x-3'>
          <Checkbox
            id='agree-terms'
            checked={escrowData.agreedToTerms}
            onCheckedChange={() =>
              setEscrowData({
                ...escrowData,
                agreedToTerms: !escrowData.agreedToTerms,
              })
            }
          />
          <label htmlFor='agree-terms' className='text-sm text-white'>
            I understand and agree to the above{' '}
            <span className='text-primary cursor-pointer underline'>
              escrow terms.
            </span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-3'>
        <BoundlessButton
          variant='outline'
          onClick={onBack}
          className='flex-1 border-none border-[#2B2B2B] bg-transparent text-white hover:bg-[#2A2A2A]'
        >
          <ArrowLeft className='size-4' /> Back
        </BoundlessButton>
        <BoundlessButton
          onClick={onComplete}
          disabled={!isEscrowValid()}
          className={cn(
            'bg-primary hover:bg-primary/80 flex-1',
            !isEscrowValid() && 'cursor-not-allowed opacity-50'
          )}
        >
          Submit
        </BoundlessButton>
      </div>
    </div>
  );
};

export default LaunchCampaignFlow;
