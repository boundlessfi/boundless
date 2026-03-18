'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

export type CreationStep =
  | 'basic'
  | 'details'
  | 'team'
  | 'social'
  | 'funding'
  | 'review';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface TeamMember {
  name: string;
  role: string;
  email: string;
  linkedin?: string;
  twitter?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface ProjectDraft {
  // Common Fields
  projectName: string; // matches Basic.tsx's primary name field
  title: string;
  tagline: string;
  category: string;
  description: string;
  vision: string;
  details: string;
  summary: string;
  logo: string | File | null;
  logoUrl: string;
  banner: string | File | null;
  bannerUrl: string;
  githubUrl: string;
  gitlabUrl: string;
  bitbucketUrl: string;
  websiteUrl: string; // maps to Basic.tsx websiteUrl
  projectWebsite: string;
  demoVideoUrl: string; // maps to Basic.tsx demoVideoUrl
  demoVideo: string;

  // Project-specific
  creatorId: string;
  organizationId?: string;
  thumbnail?: string;
  whitepaperUrl?: string;
  pitchVideoUrl?: string;
  contact: {
    email: string;
    telegram?: string;
    discord?: string;
    primary?: string;
    backup?: string;
  };
  tags: string[];

  // Campaign-specific
  isCampaign: boolean;
  fundingAmount: number;
  milestones: Milestone[];
  team: TeamMember[] | { id: string; email: string; role: string }[];
  socialLinks: string[]; // Basic.tsx uses string[] (URLs), not SocialLink objects
  escrowId?: string;
  transactionHash?: string;

  updatedAt: number;
  id?: string;
}

export const useProjectCreation = () => {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'campaign';

  const [currentStep, setCurrentStep] = useState<CreationStep>('basic');
  const [isCampaign, setIsCampaign] = useState(initialMode);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  const [formData, setFormData] = useState<Partial<ProjectDraft>>({
    projectName: '',
    title: '',
    tagline: '',
    category: '',
    description: '',
    vision: '',
    details: '',
    summary: '',
    logo: '',
    logoUrl: '',
    banner: '',
    bannerUrl: '',
    githubUrl: '',
    websiteUrl: '',
    demoVideoUrl: '',
    projectWebsite: '',
    contact: { email: '', telegram: '', discord: '', primary: '', backup: '' },
    tags: [],
    isCampaign: initialMode,
    fundingAmount: 0,
    milestones: [],
    team: [],
    socialLinks: ['', '', ''], // string[] to match Basic.tsx
  });

  // Simulated drafts for the sidebar
  const [recentDrafts] = useState<Partial<ProjectDraft>[]>([
    {
      title: 'DeFi Lending Protocol',
      tagline: 'Scalable liquidity',
      category: 'DeFi',
      isCampaign: true,
      updatedAt: Date.now() - 3600000,
    },
    {
      title: 'NFT Marketplace',
      tagline: 'Creator focused',
      category: 'NFT',
      isCampaign: false,
      updatedAt: Date.now() - 86400000,
    },
  ]);

  const steps: { key: CreationStep; label: string; hidden?: boolean }[] = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'details', label: 'Project Details' },
    { key: 'team', label: 'Team Info' },
    { key: 'social', label: 'Contact Info' },
    { key: 'funding', label: 'Funding & Milestones', hidden: !isCampaign },
    { key: 'review', label: 'Review & Submit' },
  ];

  const activeSteps = steps.filter(s => !s.hidden);

  const updateFormData = useCallback((updates: Partial<ProjectDraft>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const goToStep = (step: CreationStep) => setCurrentStep(step);

  const nextStep = () => {
    const currentIndex = activeSteps.findIndex(s => s.key === currentStep);
    if (currentIndex < activeSteps.length - 1) {
      setCurrentStep(activeSteps[currentIndex + 1].key);
    }
  };

  const prevStep = () => {
    const currentIndex = activeSteps.findIndex(s => s.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(activeSteps[currentIndex - 1].key);
    }
  };

  // Simulated Auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Simulated Auto-save:', formData);
      setLastSaved(Date.now());
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [formData]);

  return {
    currentStep,
    steps: activeSteps,
    formData,
    isCampaign,
    setIsCampaign: (val: boolean) => {
      setIsCampaign(val);
      updateFormData({ isCampaign: val });
    },
    updateFormData,
    goToStep,
    nextStep,
    prevStep,
    lastSaved,
    recentDrafts,
  };
};
