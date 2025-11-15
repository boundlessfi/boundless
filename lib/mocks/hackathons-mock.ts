import type { Hackathon } from '@/lib/api/hackathons';
import {
  HackathonCategory,
  ParticipantType,
  VenueType,
} from '@/lib/api/hackathons';

export const mockHackathons: (Hackathon & {
  _organizationName: string;
  featured?: boolean;
  categories?: string[];
})[] = [
  {
    _id: '1',
    organizationId: 'org1',
    _organizationName: 'scaffoldstellar',
    status: 'published',
    featured: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Stellar DeFi Innovation Challenge',
    information: {
      title: 'Stellar DeFi Innovation Challenge',
      banner: '/banner.png',
      description:
        'Build the next generation of DeFi applications on Stellar. Create innovative solutions for lending, borrowing, and yield farming.',
      category: HackathonCategory.DEFI,
      venue: {
        type: VenueType.VIRTUAL,
      },
    },
    categories: [
      HackathonCategory.DEFI,
      HackathonCategory.INFRASTRUCTURE,
      HackathonCategory.CROSS_CHAIN,
    ],
    timeline: {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      submissionDeadline: new Date(
        Date.now() + 20 * 24 * 60 * 60 * 1000
      ).toISOString(),
      judgingDate: new Date(
        Date.now() + 25 * 24 * 60 * 60 * 1000
      ).toISOString(),
      winnerAnnouncementDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      timezone: 'UTC',
    },
    participation: {
      participantType: ParticipantType.TEAM_OR_INDIVIDUAL,
      teamMin: 1,
      teamMax: 5,
    },
    rewards: {
      prizeTiers: [
        {
          position: '1st',
          amount: 500000,
          currency: 'USDC',
          description: 'Grand Prize',
        },
        {
          position: '2nd',
          amount: 250000,
          currency: 'USDC',
          description: 'Second Place',
        },
        {
          position: '3rd',
          amount: 1000000,
          currency: 'USDC',
          description: 'Third Place',
        },
      ],
    },
    judging: {
      criteria: [
        {
          title: 'Innovation',
          weight: 30,
          description: 'Novelty and creativity of the solution',
        },
        {
          title: 'Technical Excellence',
          weight: 40,
          description: 'Code quality and architecture',
        },
        {
          title: 'Impact',
          weight: 30,
          description: 'Potential impact on the ecosystem',
        },
      ],
    },
    collaboration: {
      contactEmail: 'contact@scaffoldstellar.com',
      telegram: 'https://t.me/scaffoldstellar',
      discord: 'https://discord.gg/scaffoldstellar',
    },
  },
  {
    _id: '2',
    organizationId: 'org2',
    _organizationName: 'stellarfoundation',
    status: 'ongoing',
    featured: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'NFT Marketplace Builder',
    information: {
      title: 'NFT Marketplace Builder',
      banner: '/blog1.png',
      description:
        'Create a fully-featured NFT marketplace on Stellar with minting, trading, and auction capabilities.',
      category: HackathonCategory.NFTS,
      venue: {
        type: VenueType.PHYSICAL,
        country: 'United States',
        city: 'San Francisco',
        venueName: 'Stellar HQ',
      },
    },
    categories: [HackathonCategory.NFTS, HackathonCategory.WEB3_GAMING],
    timeline: {
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      submissionDeadline: new Date(
        Date.now() + 10 * 24 * 60 * 60 * 1000
      ).toISOString(),
      judgingDate: new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
      ).toISOString(),
      winnerAnnouncementDate: new Date(
        Date.now() + 20 * 24 * 60 * 60 * 1000
      ).toISOString(),
      timezone: 'America/Los_Angeles',
    },
    participation: {
      participantType: ParticipantType.TEAM,
      teamMin: 2,
      teamMax: 4,
    },
    rewards: {
      prizeTiers: [
        {
          position: '1st',
          amount: 75000,
          currency: 'USDC',
          description: 'Grand Prize',
        },
        {
          position: '2nd',
          amount: 35000,
          currency: 'USDC',
          description: 'Second Place',
        },
        {
          position: '3rd',
          amount: 15000,
          currency: 'USDC',
          description: 'Third Place',
        },
      ],
    },
    judging: {
      criteria: [
        {
          title: 'User Experience',
          weight: 35,
          description: 'Ease of use and design quality',
        },
        {
          title: 'Functionality',
          weight: 40,
          description: 'Feature completeness',
        },
        {
          title: 'Scalability',
          weight: 25,
          description: 'Ability to handle growth',
        },
      ],
    },
    collaboration: {
      contactEmail: 'hackathon@stellar.org',
    },
  },
  {
    _id: '3',
    organizationId: 'org3',
    _organizationName: 'web3builders',
    status: 'published',
    featured: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Cross-Chain Bridge Protocol',
    information: {
      title: 'Cross-Chain Bridge Protocol',
      banner: '/blog2.jpg',
      description:
        'Develop a secure and efficient bridge protocol connecting Stellar with other blockchain networks.',
      category: HackathonCategory.CROSS_CHAIN,
      venue: {
        type: VenueType.VIRTUAL,
      },
    },
    categories: [
      HackathonCategory.CROSS_CHAIN,
      HackathonCategory.INFRASTRUCTURE,
      HackathonCategory.PRIVACY,
      HackathonCategory.DEFI,
    ],
    timeline: {
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      submissionDeadline: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      judgingDate: new Date(
        Date.now() + 35 * 24 * 60 * 60 * 1000
      ).toISOString(),
      winnerAnnouncementDate: new Date(
        Date.now() + 40 * 24 * 60 * 60 * 1000
      ).toISOString(),
      timezone: 'UTC',
    },
    participation: {
      participantType: ParticipantType.TEAM_OR_INDIVIDUAL,
      teamMin: 1,
      teamMax: 6,
    },
    rewards: {
      prizeTiers: [
        {
          position: '1st',
          amount: 100000,
          currency: 'USDC',
          description: 'Grand Prize',
        },
        {
          position: '2nd',
          amount: 50000,
          currency: 'USDC',
          description: 'Second Place',
        },
        {
          position: '3rd',
          amount: 25000,
          currency: 'USDC',
          description: 'Third Place',
        },
      ],
    },
    judging: {
      criteria: [
        {
          title: 'Security',
          weight: 50,
          description: 'Security and audit readiness',
        },
        {
          title: 'Performance',
          weight: 30,
          description: 'Speed and efficiency',
        },
        {
          title: 'Innovation',
          weight: 20,
          description: 'Novel approach to bridging',
        },
      ],
    },
    collaboration: {
      contactEmail: 'bridge@web3builders.io',
      discord: 'https://discord.gg/web3builders',
    },
  },
  {
    _id: '4',
    organizationId: 'org1',
    _organizationName: 'scaffoldstellar',
    status: 'published',
    featured: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Layer 2 Scaling Solutions',
    information: {
      title: 'Layer 2 Scaling Solutions',
      banner: '/blog3.jpg',
      description:
        'Build Layer 2 solutions to improve Stellar network throughput and reduce transaction costs.',
      category: HackathonCategory.LAYER_2,
      venue: {
        type: VenueType.VIRTUAL,
      },
    },
    timeline: {
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      submissionDeadline: new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
      ).toISOString(),
      judgingDate: new Date(
        Date.now() + 20 * 24 * 60 * 60 * 1000
      ).toISOString(),
      winnerAnnouncementDate: new Date(
        Date.now() + 25 * 24 * 60 * 60 * 1000
      ).toISOString(),
      timezone: 'UTC',
    },
    participation: {
      participantType: ParticipantType.TEAM,
      teamMin: 2,
      teamMax: 5,
    },
    rewards: {
      prizeTiers: [
        {
          position: '1st',
          amount: 40000,
          currency: 'USDC',
          description: 'Grand Prize',
        },
        {
          position: '2nd',
          amount: 20000,
          currency: 'USDC',
          description: 'Second Place',
        },
      ],
    },
    judging: {
      criteria: [
        {
          title: 'Technical Merit',
          weight: 50,
          description: 'Technical quality and innovation',
        },
        {
          title: 'Scalability',
          weight: 30,
          description: 'Ability to scale effectively',
        },
        {
          title: 'Documentation',
          weight: 20,
          description: 'Quality of documentation',
        },
      ],
    },
    collaboration: {
      contactEmail: 'layer2@scaffoldstellar.com',
    },
  },
  {
    _id: '5',
    organizationId: 'org4',
    _organizationName: 'gaminglab',
    status: 'ongoing',
    featured: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Web3 Gaming Platform',
    information: {
      title: 'Web3 Gaming Platform',
      banner: '/blog4.jpg',
      description:
        'Create a Web3 gaming platform with NFT integration, play-to-earn mechanics, and Stellar-based transactions.',
      category: HackathonCategory.WEB3_GAMING,
      venue: {
        type: VenueType.PHYSICAL,
        country: 'United Kingdom',
        city: 'London',
        venueName: 'Gaming Lab HQ',
      },
    },
    categories: [
      HackathonCategory.WEB3_GAMING,
      HackathonCategory.NFTS,
      HackathonCategory.SOCIAL_TOKENS,
    ],
    timeline: {
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      submissionDeadline: new Date(
        Date.now() + 25 * 24 * 60 * 60 * 1000
      ).toISOString(),
      judgingDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      winnerAnnouncementDate: new Date(
        Date.now() + 35 * 24 * 60 * 60 * 1000
      ).toISOString(),
      timezone: 'Europe/London',
    },
    participation: {
      participantType: ParticipantType.TEAM_OR_INDIVIDUAL,
      teamMin: 1,
      teamMax: 4,
    },
    rewards: {
      prizeTiers: [
        {
          position: '1st',
          amount: 60000,
          currency: 'USDC',
          description: 'Grand Prize',
        },
        {
          position: '2nd',
          amount: 30000,
          currency: 'USDC',
          description: 'Second Place',
        },
        {
          position: '3rd',
          amount: 15000,
          currency: 'USDC',
          description: 'Third Place',
        },
      ],
    },
    judging: {
      criteria: [
        {
          title: 'Gameplay',
          weight: 40,
          description: 'Fun and engaging gameplay',
        },
        {
          title: 'Web3 Integration',
          weight: 35,
          description: 'Quality of blockchain integration',
        },
        {
          title: 'Graphics',
          weight: 25,
          description: 'Visual quality and design',
        },
      ],
    },
    collaboration: {
      contactEmail: 'gaming@gaminglab.io',
      telegram: 'https://t.me/gaminglab',
    },
  },
  {
    _id: '6',
    organizationId: 'org5',
    _organizationName: 'daocollective',
    status: 'published',
    featured: false,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'DAO Governance Platform',
    information: {
      title: 'DAO Governance Platform',
      banner: '/blog5.jpg',
      description:
        'Build a comprehensive DAO governance platform with voting, proposals, and treasury management on Stellar.',
      category: HackathonCategory.DAOS,
      venue: {
        type: VenueType.VIRTUAL,
      },
    },
    timeline: {
      startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      submissionDeadline: new Date(
        Date.now() + 5 * 24 * 60 * 60 * 1000
      ).toISOString(),
      judgingDate: new Date(
        Date.now() + 10 * 24 * 60 * 60 * 1000
      ).toISOString(),
      winnerAnnouncementDate: new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
      ).toISOString(),
      timezone: 'UTC',
    },
    participation: {
      participantType: ParticipantType.TEAM,
      teamMin: 3,
      teamMax: 6,
    },
    rewards: {
      prizeTiers: [
        {
          position: '1st',
          amount: 45000,
          currency: 'USDC',
          description: 'Grand Prize',
        },
        {
          position: '2nd',
          amount: 22500,
          currency: 'USDC',
          description: 'Second Place',
        },
        {
          position: '3rd',
          amount: 10000,
          currency: 'USDC',
          description: 'Third Place',
        },
      ],
    },
    judging: {
      criteria: [
        {
          title: 'Governance Features',
          weight: 40,
          description: 'Completeness of governance features',
        },
        {
          title: 'Security',
          weight: 35,
          description: 'Security and audit readiness',
        },
        {
          title: 'User Experience',
          weight: 25,
          description: 'Ease of use and interface quality',
        },
      ],
    },
    collaboration: {
      contactEmail: 'dao@daocollective.org',
      discord: 'https://discord.gg/daocollective',
    },
  },
  {
    _id: '7',
    organizationId: 'org6',
    _organizationName: 'infrastructurehub',
    status: 'completed',
    featured: false,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Stellar Infrastructure Tools',
    information: {
      title: 'Stellar Infrastructure Tools',
      banner: '/blog6.jpg',
      description:
        'Develop essential infrastructure tools and SDKs to make building on Stellar easier for developers.',
      category: HackathonCategory.INFRASTRUCTURE,
      venue: {
        type: VenueType.VIRTUAL,
      },
    },
    timeline: {
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      submissionDeadline: new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000
      ).toISOString(),
      judgingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      winnerAnnouncementDate: new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000
      ).toISOString(),
      timezone: 'UTC',
    },
    participation: {
      participantType: ParticipantType.TEAM_OR_INDIVIDUAL,
      teamMin: 1,
      teamMax: 4,
    },
    rewards: {
      prizeTiers: [
        {
          position: '1st',
          amount: 35000,
          currency: 'USDC',
          description: 'Grand Prize',
        },
        {
          position: '2nd',
          amount: 17500,
          currency: 'USDC',
          description: 'Second Place',
        },
      ],
    },
    judging: {
      criteria: [
        {
          title: 'Developer Experience',
          weight: 45,
          description: 'Ease of use for developers',
        },
        {
          title: 'Documentation',
          weight: 30,
          description: 'Quality and completeness of docs',
        },
        {
          title: 'Code Quality',
          weight: 25,
          description: 'Code quality and best practices',
        },
      ],
    },
    collaboration: {
      contactEmail: 'tools@infrastructurehub.io',
    },
  },
  {
    _id: '8',
    organizationId: 'org7',
    _organizationName: 'privacyfirst',
    status: 'published',
    featured: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Privacy-Preserving Solutions',
    information: {
      title: 'Privacy-Preserving Solutions',
      banner: '/landing/explore/project-placeholder-1.png',
      description:
        'Build privacy-preserving solutions using zero-knowledge proofs and other cryptographic techniques on Stellar.',
      category: HackathonCategory.PRIVACY,
      venue: {
        type: VenueType.VIRTUAL,
      },
    },
    timeline: {
      startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      submissionDeadline: new Date(
        Date.now() + 40 * 24 * 60 * 60 * 1000
      ).toISOString(),
      judgingDate: new Date(
        Date.now() + 45 * 24 * 60 * 60 * 1000
      ).toISOString(),
      winnerAnnouncementDate: new Date(
        Date.now() + 50 * 24 * 60 * 60 * 1000
      ).toISOString(),
      timezone: 'UTC',
    },
    participation: {
      participantType: ParticipantType.TEAM_OR_INDIVIDUAL,
      teamMin: 1,
      teamMax: 5,
    },
    rewards: {
      prizeTiers: [
        {
          position: '1st',
          amount: 55000,
          currency: 'USDC',
          description: 'Grand Prize',
        },
        {
          position: '2nd',
          amount: 27500,
          currency: 'USDC',
          description: 'Second Place',
        },
        {
          position: '3rd',
          amount: 12500,
          currency: 'USDC',
          description: 'Third Place',
        },
      ],
    },
    judging: {
      criteria: [
        {
          title: 'Privacy Technology',
          weight: 50,
          description: 'Quality of privacy-preserving tech',
        },
        {
          title: 'Security',
          weight: 30,
          description: 'Security and audit readiness',
        },
        {
          title: 'Practicality',
          weight: 20,
          description: 'Real-world applicability',
        },
      ],
    },
    collaboration: {
      contactEmail: 'privacy@privacyfirst.org',
    },
  },
];
