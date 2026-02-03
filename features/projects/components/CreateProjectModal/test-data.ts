import { ProjectFormData } from './types';

export const TEST_PROJECT_TEMPLATES: Record<string, ProjectFormData> = {
  defi: {
    basic: {
      projectName: 'Nebula Finance',
      logo: 'https://res.cloudinary.com/danuy5rqb/image/upload/v1759431246/boundless/projects/logos/jfc5v0l6xec0bdhmliet.png',
      logoUrl:
        'https://res.cloudinary.com/danuy5rqb/image/upload/v1759431246/boundless/projects/logos/jfc5v0l6xec0bdhmliet.png',
      banner:
        'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2832&ixlib=rb-4.0.3',
      bannerUrl:
        'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2832&ixlib=rb-4.0.3',
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
      ],
    },
    details: {
      vision: `# Nebula Finance Vision

## Overview
Nebula Finance is a next-generation DeFi protocol that enables users to earn optimized yields across multiple blockchains without needing to actively manage assets.

## Core Features
- **AI Yield Optimization**: Machine-learning models analyze yield opportunities in real-time.
- **Cross-Chain Aggregation**: Unified interface across Ethereum, Arbitrum, and Optimism.
- **Decentralized Governance**: Token holders influence strategy and emissions.

## Roadmap
- **Q1 2026**: Smart contract audit and testnet launch
- **Q2 2026**: Mainnet launch with ETH, ARB, integrations
- **Q3 2026**: Cross-chain dashboard`,
    },
    milestones: {
      fundingAmount: '250000',
      milestones: [
        {
          id: 'milestone-1',
          title: 'Protocol Architecture & Smart Contracts',
          description:
            'Design core protocol architecture and write smart contracts for vaults, rebalancing, and governance.',
          startDate: '2026-06-01',
          endDate: '2026-08-30',
        },
        {
          id: 'milestone-2',
          title: 'UI/UX Development',
          description:
            'Design and develop the frontend interface with wallet integrations (MetaMask, WalletConnect).',
          startDate: '2026-09-01',
          endDate: '2026-10-31',
        },
        {
          id: 'milestone-3',
          title: 'Security Audits & Launch',
          description:
            'Conduct security audits, final integration tests, and launch the protocol on mainnet.',
          startDate: '2026-11-01',
          endDate: '2026-12-31',
        },
      ],
    },
    team: {
      members: [
        { id: 'm1', email: 'alice@nebula.finance' },
        { id: 'm2', email: 'bob@nebula.finance' },
      ],
    },
    contact: {
      telegram: 'nebula_support',
      backupType: 'discord',
      backupContact: 'nebula_admin#0420',
      agreeToTerms: true,
      agreeToPrivacy: true,
    },
  },
  rwa: {
    basic: {
      projectName: 'RealEstate Tokenizer',
      logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000',
      logoUrl:
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000',
      banner:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070',
      bannerUrl:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070',
      vision:
        'Democratizing access to premium real estate investments through fractionalized NFT ownership and compliant security tokens.',
      category: 'Real World Assets',
      websiteUrl: 'https://retokenizer.io',
      socialLinks: ['https://twitter.com/retokenizer'],
    },
    details: {
      vision: `# RealEstate Tokenizer

## Problem
High barrier to entry for real estate investment.

## Solution
Fractionalized ownership via blockchain.

## Legal
Fully compliant with REG D/S.`,
    },
    milestones: {
      fundingAmount: '500000',
      milestones: [
        {
          id: 'm1',
          title: 'Legal Framework & Entity Setup',
          description: 'Establish SPVs and legal opinions for tokenization.',
          startDate: '2026-03-01',
          endDate: '2026-05-01',
        },
        {
          id: 'm2',
          title: 'Platform MVP',
          description: 'Develop the marketplace for trading property tokens.',
          startDate: '2026-05-02',
          endDate: '2026-08-01',
        },
      ],
    },
    team: { members: [] },
    contact: {
      telegram: 're_support',
      backupType: 'whatsapp',
      backupContact: '+15550199',
      agreeToTerms: true,
      agreeToPrivacy: true,
    },
  },
  devtool: {
    basic: {
      projectName: 'Solidity Linter Pro',
      logo: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80&w=1000',
      logoUrl:
        'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80&w=1000',
      banner:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2070',
      bannerUrl:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2070',
      vision:
        'An advanced static analysis tool for Solidity smart contracts that detects vulnerabilities and gas optimizations in real-time.',
      category: 'Developer Tools',
      githubUrl: 'https://github.com/sol-linter/pro',
    },
    details: {
      vision: `# Solidity Linter Pro
      
Focuses on security and gas efficiency.`,
    },
    milestones: {
      fundingAmount: '50000',
      milestones: [
        {
          id: 'm1',
          title: 'Core Analyzer Engine',
          description: 'Implement AST parsing and basic rule set.',
          startDate: '2026-02-01',
          endDate: '2026-04-01',
        },
      ],
    },
    team: { members: [] },
    contact: {
      telegram: 'sollinter',
      backupType: 'discord',
      backupContact: 'dev#1234',
      agreeToTerms: true,
      agreeToPrivacy: true,
    },
  },
  amm: {
    basic: {
      projectName: 'LiquidSwap AMM',
      logo: 'https://images.unsplash.com/photo-1622630998477-20aa696fab05?auto=format&fit=crop&q=80&w=1000',
      logoUrl:
        'https://images.unsplash.com/photo-1622630998477-20aa696fab05?auto=format&fit=crop&q=80&w=1000',
      banner:
        'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&q=80&w=2832',
      bannerUrl:
        'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&q=80&w=2832',
      vision:
        'A next-gen AMM with concentrated liquidity and impermanent loss protection mechanisms.',
      category: 'DeFi & Finance',
    },
    details: {
      vision: 'Concentrated liquidity AMM.',
    },
    milestones: {
      fundingAmount: '150000',
      milestones: [
        {
          id: 'm1',
          title: 'Smart Contracts',
          description: 'Swap router and liquidity pools.',
          startDate: '2026-07-01',
          endDate: '2026-09-01',
        },
      ],
    },
    team: { members: [] },
    contact: {
      telegram: 'liquidswap',
      backupType: 'discord',
      backupContact: 'admin#9999',
      agreeToTerms: true,
      agreeToPrivacy: true,
    },
  },
};
