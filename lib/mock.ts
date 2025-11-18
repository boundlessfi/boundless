import { Project } from '@/types/project';

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Boundless Platform',
    description:
      'A decentralized crowdfunding and grant funding platform built on the Stellar blockchain. Enables transparent, milestone-based funding for ambitious projects and public innovation.',
    image: '/banner.png',
    link: '/projects/boundless',
    tags: ['blockchain', 'crowdfunding', 'grants', 'stellar'],
    category: 'web3',
    type: 'crowdfunding',
    amount: 123000,
    status: 'under_review',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    name: 'DeFi Protocol Hub',
    description:
      'A comprehensive DeFi protocol aggregator that provides users with the best yields across multiple chains. Features automated portfolio rebalancing and risk management.',
    image: '/banner.png',
    link: '/projects/defi-hub',
    tags: ['defi', 'yield', 'aggregator', 'portfolio'],
    category: 'defi',
    type: 'crowdfunding',
    amount: 85000,
    status: 'funding',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
  },
  {
    id: '3',
    name: 'NFT Marketplace',
    description:
      'A decentralized NFT marketplace with zero gas fees, built on Layer 2 solutions. Supports multiple blockchains and provides tools for creators to monetize their digital art.',
    image: '/banner.png',
    link: '/projects/nft-marketplace',
    tags: ['nft', 'marketplace', 'layer2', 'creators'],
    category: 'nft',
    type: 'crowdfunding',
    amount: 67000,
    status: 'validated',
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-19T13:20:00Z',
  },
];

// Mock campaign details for testing
export const mockCampaignDetails = {
  id: 'campaign-123',
  title: 'Boundless',
  tagline: 'Trustless, decentralized crowdfunding platform',
  description:
    'Boundless is a trustless, decentralized application (dApp) that empowers changemakers and builders to raise funds transparently without intermediaries. Campaigns are structured around clearly defined milestones, with funds held in escrow and released only upon approval. Grant creators can launch programs with rule-based logic, and applicants can apply with confidence knowing their work will be fairly evaluated.',
  category: 'Technology',
  fundAmount: 123000,
  raisedAmount: 0,
  tags: ['web3', 'crowdfunding'],
  thumbnail:
    'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
  creator: {
    name: 'Collins Odumeje',
    avatar: 'https://github.com/shadcn.png',
    verified: true,
  },
  engagement: {
    likes: 0,
    comments: 0,
    backers: 325,
    daysLeft: 90,
  },
  photos: [
    'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
    'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
    'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
    'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
  ],
  milestones: [
    {
      id: 'milestone-1',
      title: 'Prototype & Smart Contract Setup',
      description:
        'Develop a functional UI prototype for the crowdfunding and grant flow. Simultaneously, implement and test Soroban smart contracts for escrow logic, milestone validation, and secure fund handling.',
      deliveryDate: 'October 10, 2025',
      fundPercentage: 25,
      fundAmount: 30750,
    },
    {
      id: 'milestone-2',
      title: 'Campaign & Grant Builder Integration',
      description:
        'Integrate campaign creation tools and grant builder functionality into the platform with advanced features and user management.',
      deliveryDate: 'November 15, 2025',
      fundPercentage: 35,
      fundAmount: 43050,
    },
    {
      id: 'milestone-3',
      title: 'Platform Launch & Community Building',
      description:
        'Launch the platform to the public and build a strong community of users and contributors with marketing and partnership initiatives.',
      deliveryDate: 'December 20, 2025',
      fundPercentage: 40,
      fundAmount: 49200,
    },
  ],
  status: 'validated',
};
