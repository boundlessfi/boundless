'use client';
import { useState } from 'react';
// import type { Metadata } from "next"
// import { generatePageMetadata } from "@/lib/metadata"
import { HackathonBanner } from '@/components/hackathons/hackathonBanner';
import { HackathonNavTabs } from '@/components/hackathons/hackathonNavTabs';
import { HackathonOverview } from '@/components/hackathons/overview/hackathonOverview';
import { JoinHackathonBanner } from '@/components/hackathons/overview/joinHackathon';

// export const metadata: Metadata = generatePageMetadata("hackathons")

const hackathonTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'participants', label: 'Participants', badge: 78 },
  { id: 'resources', label: 'Resources' },
  { id: 'rules', label: 'Rules' },
  { id: 'submission', label: 'Submissions' },
  { id: 'updates', label: 'Updates' },
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

const HackathonsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className='mx-auto mt-10 max-w-[1440px] px-5 py-5 text-center text-4xl font-bold text-white md:px-[50px] lg:px-[100px]'>
      <div className='mb-10'>
        <JoinHackathonBanner
          onJoinClick={() => {}}
          participants={bannerConfig.participants}
          prizePool={bannerConfig.totalPrizePool}
          isEnded={false}
        />
      </div>
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
        onTabChange={setActiveTab}
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
            <div className='text-gray-400'>
              <p>Content for Participants tab goes here</p>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className='text-gray-400'>
              <p>Content for Resources tab goes here</p>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className='text-gray-400'>
              <p>Content for Rules tab goes here</p>
            </div>
          )}

          {activeTab === 'submission' && (
            <div className='text-gray-400'>
              <p>Content for Project gallery tab goes here</p>
            </div>
          )}

          {activeTab === 'updates' && (
            <div className='text-gray-400'>
              <p>Content for Updates tab goes here</p>
            </div>
          )}

          {activeTab === 'discussions' && (
            <div className='text-gray-400'>
              <p>Content for Discussions tab goes here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HackathonsPage;
