/**
 * DEV-ONLY: Prefill button for project creation form.
 * Delete this entire file to remove the feature.
 */
'use client';

import { Bug } from 'lucide-react';
import type { ProjectDraft } from '@/features/projects/hooks/use-project-creation';

const NAMES = [
  'StellarBridge',
  'NovaPay',
  'LumenVault',
  'AstroSwap',
  'OrbitDAO',
  'NebulaFi',
  'CosmicIndex',
  'HelioStake',
  'PulsarNet',
  'ZenithWallet',
];

const TAGLINES = [
  'Bridging the gap between Web2 and Web3',
  'Fast, secure payments on Stellar',
  'Decentralized asset management for everyone',
  'Swap any token with minimal slippage',
  'Community-first governance on-chain',
  'Next-gen DeFi infrastructure',
  'Real-time on-chain analytics',
  'Liquid staking made simple',
  'Peer-to-peer mesh networking',
  'Your keys, your crypto, simplified',
];

const CATEGORIES = [
  'dex-amm',
  'lending-borrowing',
  'payment-gateways',
  'wallets',
  'dev-tools',
  'analytics',
  'daos',
  'ai-agents',
  'social-impact',
  'gaming',
];

const DESCRIPTIONS = [
  'A cutting-edge platform designed to simplify blockchain interactions for everyday users. We leverage the Stellar network to provide fast, low-cost transactions with an intuitive interface.',
  'Our project aims to democratize access to decentralized finance by building tools that are accessible, secure, and transparent. Built on Stellar for speed and reliability.',
  'We are building the infrastructure layer that connects traditional financial systems with blockchain technology, enabling seamless value transfer across borders.',
];

const VISIONS = [
  'To become the leading platform for decentralized finance on Stellar, empowering millions of users worldwide with accessible financial tools.',
  'We envision a world where financial services are open, transparent, and accessible to everyone regardless of geography or economic status.',
  'Our vision is to create an ecosystem of interconnected DeFi tools that make blockchain technology invisible to end users while maximizing its benefits.',
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const id = () => Math.random().toString(36).slice(2, 9);

export function generatePrefillData(): Partial<ProjectDraft> {
  const name = pick(NAMES);
  const isCampaign = Math.random() > 0.5;

  return {
    projectName: name,
    title: name,
    tagline: pick(TAGLINES),
    category: pick(CATEGORIES),
    description: pick(DESCRIPTIONS),
    vision: pick(VISIONS),
    details: `## How it works\n\n${name} uses a novel approach to solve common pain points in the ecosystem. Our smart contract architecture ensures security while maintaining composability.\n\n## Technical Stack\n\n- Stellar SDK\n- Soroban Smart Contracts\n- Next.js Frontend\n- Rust Backend Services`,
    summary: `${name} is an innovative project built on Stellar that aims to push the boundaries of what's possible in decentralized technology.`,
    githubUrl: `https://github.com/example/${name.toLowerCase()}`,
    websiteUrl: `https://${name.toLowerCase()}.io`,
    projectWebsite: `https://${name.toLowerCase()}.io`,
    demoVideoUrl: '',
    tags: ['stellar', 'defi', 'web3'].slice(
      0,
      2 + Math.floor(Math.random() * 2)
    ),
    isCampaign,
    fundingAmount: isCampaign
      ? [5000, 10000, 25000, 50000][Math.floor(Math.random() * 4)]
      : 0,
    milestones: isCampaign
      ? [
          {
            id: id(),
            title: 'MVP Development',
            description:
              'Build and ship the minimum viable product with core features.',
            deliverable: 'Working prototype deployed to testnet',
            successCriteria: 'All core user flows functional on testnet',
            fundingPercentage: 40,
            startDate: '2026-05-01',
            endDate: '2026-07-01',
          },
          {
            id: id(),
            title: 'Mainnet Launch',
            description: 'Deploy to Stellar mainnet with full feature set.',
            deliverable: 'Production deployment on mainnet',
            successCriteria: '100+ active users in first month',
            fundingPercentage: 60,
            startDate: '2026-07-15',
            endDate: '2026-09-15',
          },
        ]
      : [],
    team: [
      {
        id: id(),
        name: 'Alex Chen',
        role: 'Lead Developer',
        email: 'alex@example.com',
        linkedin: 'https://linkedin.com/in/alexchen',
        twitter: 'https://twitter.com/alexchen',
      },
      {
        id: id(),
        name: 'Jordan Taylor',
        role: 'Product Designer',
        email: 'jordan@example.com',
      },
    ],
    contact: {
      email: 'team@example.com',
      telegram: '@example_project',
      discord: 'https://discord.gg/example',
    },
    socialLinks: [
      'https://twitter.com/example_project',
      'https://discord.gg/example',
    ],
  };
}

interface DevPrefillButtonProps {
  onPrefill: (data: Partial<ProjectDraft>) => void;
}

export default function DevPrefillButton({ onPrefill }: DevPrefillButtonProps) {
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <button
      type='button'
      onClick={() => onPrefill(generatePrefillData())}
      className='flex h-8 w-8 items-center justify-center rounded-lg border border-yellow-500/30 text-yellow-500/60 transition-colors hover:border-yellow-500/60 hover:text-yellow-500'
      title='Dev: Prefill with random data'
    >
      <Bug className='h-3.5 w-3.5' />
    </button>
  );
}
