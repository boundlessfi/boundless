'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { HackathonBanner } from '@/components/hackathons/hackathonBanner';
import { HackathonNavTabs } from '@/components/hackathons/hackathonNavTabs';
import { HackathonOverview } from '@/components/hackathons/overview/hackathonOverview';
// import { JoinHackathonBanner } from '@/components/hackathons/overview/joinHackathon';
import { HackathonParticipants } from '@/components/hackathons/participants/hackathonParticipant';
import { HackathonResources } from '@/components/hackathons/resources/resources';
import SubmissionTab from '@/components/hackathons/submissions/submissionTab';
import { HackathonDiscussions } from '@/components/hackathons/discussion/comment';

// export const metadata: Metadata = generatePageMetadata("hackathons")

export interface Participant {
  id: string | number;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  joinedDate?: string;
  role?: string;
  description?: string;
  categories?: string[];
  projects?: number;
  followers?: number;
  following?: number;
  hasSubmitted?: boolean;
}

const hackathonTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'participants', label: 'Participants', badge: 48 },
  { id: 'resources', label: 'Resources' },
  // { id: 'rules', label: 'Rules' },
  { id: 'submission', label: 'Submissions' },
  // { id: 'updates', label: 'Updates' },
  { id: 'discussions', label: 'Discussions' },
];

const hackathonContent = `
# TechVision Hackathon 2025

## 🌐 Hackathon Theme
Build the future of web technologies

## Challenge Description
Create an innovative web application that solves real-world problems using modern web technologies.

## 📋 Requirements

### Portfolio Requirements
Your project should include:
- Clean, responsive design
- Working prototype/MVP
- GitHub repository with documentation
- Live demo or video walkthrough

### Submission Requirements
- Project code on GitHub
- README with setup instructions
- 2-3 minute demo video
- Team information

## 🎯 Why Participate?

- **Learn & Grow** - Work with cutting-edge technologies and improve your skills
- **Network** - Connect with developers, designers, and industry professionals
- **Recognition** - Get featured in our community and win prizes
- **Build Portfolio** - Showcase your project to potential employers
- **Prize Opportunities** - Win cash, swag, and internship opportunities

⚠️ **Note:** All hackathon participants must follow our code of conduct and guidelines.
`;

const timelineEvents = [
  { event: 'Hackathon Launch', date: 'September 9, 2025' },
  { event: 'First Workshop: Getting Started', date: 'September 10' },
  {
    event: 'Weekly Web Design & Deployment Sessions',
    date: 'Sept 11 – Sep 28',
  },
  { event: 'Submission Deadline', date: 'October 28, 2025 @ 11:59 PM UTC' },
  { event: 'Judging Period', date: 'November 9' },
  { event: 'Winners Announced', date: 'December 15, 2025' },
];

const prizes = [
  {
    title: 'Developer of the Year',
    rank: '1 winner',
    prize: '$500 in USDT',
    icon: '⭐',
    details: [
      'Prize: $500 USDT',
      'Premium Swag Box (Custom hoodie, T-shirt, Stickers)',
    ],
  },
  {
    title: 'UI Master',
    rank: '1 winner',
    prize: '$300 in USDT',
    icon: '⭐',
    details: [
      'Prize: $300 USDT',
      'Deluxe Swag Pack (T-shirt, tote bag, sticker set)',
    ],
  },
];

const bannerConfig = {
  title: 'TechVision Hackathon 2025',
  subtitle: 'Build the future of web technologies',
  deadline: 'October 28, 2025 @ 11:59 PM UTC',
  categories: ['Web Development', 'UI/UX', 'Innovation'],
  status: 'ongoing' as const,
  participants: 342,
  totalPrizePool: '1,000',
};
const participants = [
  {
    id: 1,
    name: 'Ole-Martin',
    username: 'enliven',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ole',
    role: 'Full Stack Developer',
    verified: true,
    hasSubmitted: true,
    joinedDate: 'Oct 27, 2020',
    description:
      'Web magician 🪄 Digital Janitor 🧹 Building cool stuff with React and Node.js',
    categories: ['React', 'Node.js', 'TypeScript', 'Web3'],
    projects: 42,
    followers: 1234,
    following: 567,
  },
  {
    id: 2,
    name: 'Sarah Chen',
    username: 'Dc',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'UI/UX Designer',
    verified: true,
    hasSubmitted: false,
    joinedDate: 'Jan 15, 2021',
    description:
      'Creating beautiful and intuitive user experiences. Design system enthusiast.',
    categories: ['UI/UX', 'Figma', 'Design Systems'],
    projects: 28,
    followers: 892,
    following: 234,
  },
  {
    id: 3,
    name: 'Alex Rodriguez',
    username: '8250',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    role: 'Backend Engineer',
    verified: false,
    joinedDate: 'Mar 8, 2021',
    description:
      'Scalable systems architect. Love working with distributed systems and APIs.',
    categories: ['Python', 'Go', 'Kubernetes', 'DevOps'],
    projects: 35,
    followers: 654,
    following: 412,
  },
  {
    id: 4,
    name: 'Maya Patel',
    username: 'Acuna',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
    role: 'Frontend Developer',
    verified: true,
    joinedDate: 'Jun 22, 2020',
    description:
      'React enthusiast. Building accessible and performant web applications.',
    categories: ['React', 'Next.js', 'Tailwind CSS'],
    projects: 51,
    followers: 1567,
    following: 789,
  },
  {
    id: 5,
    name: 'Chris Johnson',
    username: 'soni2005',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
    role: 'Mobile Developer',
    verified: false,
    joinedDate: 'Sep 3, 2021',
    description:
      'iOS and Android developer. Creating seamless mobile experiences.',
    categories: ['React Native', 'Swift', 'Kotlin'],
    projects: 19,
    followers: 423,
    following: 198,
  },
  {
    id: 6,
    name: 'Emily Zhang',
    username: 'thanhtx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    role: 'Data Scientist',
    verified: true,
    joinedDate: 'Nov 12, 2020',
    description: 'ML engineer passionate about AI and data visualization.',
    categories: ['Python', 'TensorFlow', 'Data Viz'],
    projects: 33,
    followers: 981,
    following: 345,
  },
  {
    id: 7,
    name: 'David Kim',
    username: 'ranax',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    role: 'DevOps Engineer',
    verified: false,
    joinedDate: 'Feb 28, 2021',
    description: 'Cloud infrastructure and CI/CD pipelines specialist.',
    categories: ['AWS', 'Docker', 'Terraform'],
    projects: 27,
    followers: 567,
    following: 234,
  },
  {
    id: 8,
    name: 'Lisa Anderson',
    username: 'rafix',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    role: 'Product Designer',
    verified: true,
    joinedDate: 'Aug 5, 2020',
    description:
      'Product designer with a focus on user research and prototyping.',
    categories: ['Product Design', 'Prototyping', 'User Research'],
    projects: 44,
    followers: 1123,
    following: 456,
  },
];

const submissions = [
  {
    title: 'AI-Powered Health Tracker',
    description:
      'An AI system that analyzes health data and predicts potential risks.',
    submitterName: 'Chris Johnson',
    submitterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
    category: 'AI & Health',
    score: 82,
    status: 'Approved' as const,
    daysLeft: 5,
    votes: { current: 120, total: 200 },
    image: '/project1.png',
  },
  {
    title: 'EcoChain',
    description:
      'A blockchain solution for tracking carbon footprints in supply chains.',
    submitterName: 'Amara Lee',
    submitterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amara',
    category: 'Blockchain',
    score: 67,
    status: 'Pending' as const,
    daysLeft: 8,
    votes: { current: 80, total: 150 },
    image: '/project2.png',
  },
  {
    title: 'Klyra Risk Analyzer',
    description:
      'An AI-powered wallet analyzer providing Stellar wallet risk scores.',
    submitterName: 'Benjamin',
    submitterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Benjamin',
    category: 'Security',
    score: 90,
    status: 'Approved' as const,
    daysLeft: 3,
    votes: { current: 140, total: 180 },
    image: '/project3.png',
  },
  {
    title: 'EduVerse',
    description:
      'A gamified learning platform that rewards students with tokens for achievements.',
    submitterName: 'Lara Mendes',
    submitterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lara',
    category: 'EdTech',
    score: 75,
    status: 'Approved' as const,
    daysLeft: 10,
    votes: { current: 95, total: 160 },
    image: '/project4.png',
  },
  {
    title: 'GreenPay',
    description:
      'A decentralized app that rewards users for eco-friendly purchases.',
    submitterName: 'Daniel Osei',
    submitterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel',
    category: 'FinTech',
    score: 62,
    status: 'Pending' as const,
    daysLeft: 6,
    votes: { current: 70, total: 120 },
    image: '/project5.png',
  },
  {
    title: 'FarmLink',
    description:
      'A blockchain system connecting farmers directly to consumers.',
    submitterName: 'Nia Roberts',
    submitterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nia',
    category: 'Agriculture',
    score: 88,
    status: 'Approved' as const,
    daysLeft: 4,
    votes: { current: 135, total: 190 },
    image: '/project6.png',
  },
  {
    title: 'SafeNet',
    description:
      'A privacy-focused browser extension that monitors and blocks phishing sites.',
    submitterName: 'Alex Kim',
    submitterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    category: 'Cybersecurity',
    score: 93,
    status: 'Approved' as const,
    daysLeft: 2,
    votes: { current: 155, total: 200 },
    image: '/project7.png',
  },
  {
    title: 'Artify',
    description:
      'A decentralized NFT marketplace empowering artists to monetize digital creations.',
    submitterName: 'Sophia Turner',
    submitterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    category: 'NFTs & Art',
    score: 79,
    status: 'Pending' as const,
    daysLeft: 7,
    votes: { current: 100, total: 170 },
    image: '/project8.png',
  },
  {
    title: 'MedChain',
    description:
      'A secure blockchain network for medical record sharing between hospitals.',
    submitterName: 'David Zhang',
    submitterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    category: 'Healthcare',
    score: 85,
    status: 'Approved' as const,
    daysLeft: 5,
    votes: { current: 130, total: 190 },
    image: '/project9.png',
  },
  {
    title: 'VoteX',
    description:
      'A transparent and tamper-proof voting system built on blockchain.',
    submitterName: 'Olivia Smith',
    submitterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia',
    category: 'Governance',
    score: 91,
    status: 'Approved' as const,
    daysLeft: 1,
    votes: { current: 170, total: 210 },
    image: '/project10.png',
  },
];

const HackathonsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Get initial tab from URL search params
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && hackathonTabs.some(tab => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);

    // Create new URL with updated tab parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);

    // Update URL without page refresh
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className='mx-auto mt-10 max-w-[1440px] px-5 py-5 text-center text-4xl font-bold text-white md:px-[50px] lg:px-[100px]'>
      {/* <div className='mb-10'>
        <JoinHackathonBanner
          onJoinClick={() => {}}
          participants={bannerConfig.participants}
          prizePool={bannerConfig.totalPrizePool}
          isEnded={false}
        />
      </div> */}
      <HackathonBanner
        title={bannerConfig.title}
        subtitle={bannerConfig.subtitle}
        deadline={bannerConfig.deadline}
        categories={bannerConfig.categories}
        status={bannerConfig.status}
        participants={bannerConfig.participants}
        totalPrizePool={bannerConfig.totalPrizePool}
        imageUrl='/banner.png'
      />{' '}
      <HackathonNavTabs
        tabs={hackathonTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <div className='mx-auto max-w-7xl px-6 py-12'>
        <div className='text-white'>
          {activeTab === 'overview' && (
            <div className='space-y-12'>
              {/* Overview Description */}
              <HackathonOverview
                content={hackathonContent}
                timelineEvents={timelineEvents}
                prizes={prizes}
              />
            </div>
          )}
          {activeTab === 'participants' && (
            <HackathonParticipants participants={participants} />
          )}

          {activeTab === 'resources' && <HackathonResources />}

          {activeTab === 'rules' && (
            <div className='text-gray-400'>
              <p>Content for Rules tab goes here</p>
            </div>
          )}
          {activeTab === 'submission' && (
            <SubmissionTab submissions={submissions} />
          )}

          {activeTab === 'updates' && (
            <div className='text-gray-400'>
              <p>Content for Updates tab goes here</p>
            </div>
          )}

          {activeTab === 'discussions' && (
            <HackathonDiscussions hackathonId='68ebe61f83c77a59ccaba35c' />
          )}
        </div>
      </div>
    </div>
  );
};

export default HackathonsPage;
