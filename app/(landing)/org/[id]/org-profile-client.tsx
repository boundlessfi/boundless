'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Users,
  Trophy,
  HandCoins,
  FolderKanban,
  Globe,
  Github,
  Twitter,
  ExternalLink,
  Building2,
  Calendar,
} from 'lucide-react';
import {
  getOrganization,
  getOrganizationStats,
  Organization,
} from '@/lib/api/organization';
import { Skeleton } from '@/components/ui/skeleton';

interface OrgStats {
  totalMembers: number;
  totalHackathons: number;
  totalGrants: number;
}

// TODO: Remove mock data once connected to real org IDs
const MOCK_ORG: Organization = {
  id: 'mock',
  name: 'Boundless Foundation',
  logo: '',
  tagline: 'Empowering builders through open-source hackathons and grants',
  about:
    'Boundless Foundation is dedicated to fostering innovation in the Web3 ecosystem. We organize hackathons, distribute grants, and support open-source projects that push the boundaries of decentralized technology.\n\nOur mission is to create opportunities for developers worldwide to build, learn, and grow together.',
  links: {
    website: 'https://boundlessfi.xyz',
    x: 'https://x.com/boundlessfi',
    github: 'https://github.com/boundlessfi',
    others: '',
  },
  members: ['user1', 'user2', 'user3', 'user4', 'user5'],
  owner: 'user1',
  hackathons: ['h1', 'h2', 'h3'],
  grants: ['g1', 'g2'],
  isProfileComplete: true,
  pendingInvites: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-06-01',
};

const MOCK_STATS: OrgStats = {
  totalMembers: 24,
  totalHackathons: 8,
  totalGrants: 5,
};

interface OrgProfileClientProps {
  id: string;
}

export default function OrgProfileClient({ id }: OrgProfileClientProps) {
  const [org, setOrg] = useState<Organization | null>(null);
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrgProfile() {
      try {
        const [orgRes, statsRes] = await Promise.all([
          getOrganization(id),
          getOrganizationStats(id),
        ]);
        setOrg((orgRes.data || orgRes) as Organization);
        setStats(statsRes.data);
      } catch {
        // Fallback to mock data for design preview
        setOrg(MOCK_ORG);
        setStats(MOCK_STATS);
      } finally {
        setLoading(false);
      }
    }

    loadOrgProfile();
  }, [id]);

  if (loading) {
    return <OrgProfileSkeleton />;
  }

  if (!org) {
    return (
      <section className='flex min-h-[50vh] items-center justify-center'>
        <p className='text-zinc-500'>Organization not found</p>
      </section>
    );
  }

  const socialLinks = [
    { url: org.links?.website, icon: Globe, label: 'Website' },
    { url: org.links?.github, icon: Github, label: 'GitHub' },
    { url: org.links?.x, icon: Twitter, label: 'X / Twitter' },
    { url: org.links?.others, icon: ExternalLink, label: 'Other' },
  ].filter(link => link.url);

  const statCards = [
    {
      label: 'Members',
      value: stats?.totalMembers ?? org.members?.length ?? 0,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Hackathons',
      value: stats?.totalHackathons ?? org.hackathons?.length ?? 0,
      icon: Trophy,
      color: 'text-[#a7f950]',
      bgColor: 'bg-[#a7f950]/10',
    },
    {
      label: 'Grants',
      value: stats?.totalGrants ?? org.grants?.length ?? 0,
      icon: HandCoins,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Projects',
      value: org.hackathons?.length ?? 0,
      icon: FolderKanban,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const joinedDate = org.createdAt
    ? new Date(org.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <section className='mx-auto max-w-[1440px] px-5 py-10 md:px-[50px] lg:px-[100px]'>
      {/* Banner / Header */}
      <div className='relative mb-8 overflow-hidden rounded-2xl border border-[#a7f950]/20 bg-gradient-to-br from-[#a7f950]/10 via-zinc-900/80 to-zinc-900/40'>
        {/* Background glow */}
        <div className='absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#a7f950]/5 blur-3xl' />
        <div className='absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#a7f950]/5 blur-3xl' />

        <div className='relative z-10 p-6 sm:p-8 lg:p-10'>
          <div className='flex flex-col gap-6 sm:flex-row sm:items-start'>
            {/* Logo */}
            <div className='flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-800/80 backdrop-blur-sm sm:h-28 sm:w-28'>
              {org.logo ? (
                <Image
                  src={org.logo}
                  alt={org.name}
                  width={112}
                  height={112}
                  className='h-full w-full object-cover'
                />
              ) : (
                <Building2 className='h-12 w-12 text-zinc-500' />
              )}
            </div>

            {/* Info */}
            <div className='flex flex-1 flex-col gap-3'>
              <div>
                <h1 className='text-3xl font-black text-white lg:text-4xl'>
                  {org.name}
                </h1>
                {org.tagline && (
                  <p className='mt-1 max-w-2xl text-base leading-relaxed text-gray-300'>
                    {org.tagline}
                  </p>
                )}
              </div>

              {/* Meta row */}
              <div className='flex flex-wrap items-center gap-4'>
                {joinedDate && (
                  <div className='flex items-center gap-1.5 text-sm text-zinc-500'>
                    <Calendar className='h-3.5 w-3.5' />
                    <span>Joined {joinedDate}</span>
                  </div>
                )}
                {org.members && (
                  <div className='flex items-center gap-1.5 text-sm text-zinc-500'>
                    <Users className='h-3.5 w-3.5' />
                    <span>
                      {stats?.totalMembers ?? org.members.length} member
                      {(stats?.totalMembers ?? org.members.length) !== 1
                        ? 's'
                        : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Social links */}
              {socialLinks.length > 0 && (
                <div className='flex items-center gap-2'>
                  {socialLinks.map((link, i) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={i}
                        href={link.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        title={link.label}
                        className='flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/50 text-zinc-400 transition-all hover:border-[#a7f950]/30 hover:bg-[#a7f950]/10 hover:text-[#a7f950]'
                      >
                        <Icon className='h-4 w-4' />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/50'
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}
              >
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className='mb-1 text-3xl font-bold text-white'>
                {stat.value}
              </div>
              <span className='text-sm text-zinc-500'>{stat.label}</span>
            </div>
          );
        })}
      </div>

      {/* About Section */}
      {org.about && (
        <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 lg:p-8'>
          <h2 className='mb-4 text-lg font-semibold text-white'>About</h2>
          <p className='whitespace-pre-wrap text-sm leading-7 text-zinc-400'>
            {org.about}
          </p>
        </div>
      )}
    </section>
  );
}

function OrgProfileSkeleton() {
  return (
    <section className='mx-auto max-w-[1440px] px-5 py-10 md:px-[50px] lg:px-[100px]'>
      {/* Banner skeleton */}
      <div className='mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8 lg:p-10'>
        <div className='flex flex-col gap-6 sm:flex-row sm:items-start'>
          <Skeleton className='h-24 w-24 shrink-0 rounded-2xl sm:h-28 sm:w-28' />
          <div className='flex flex-1 flex-col gap-3'>
            <Skeleton className='h-9 w-72' />
            <Skeleton className='h-5 w-96 max-w-full' />
            <div className='flex gap-3'>
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-4 w-24' />
            </div>
            <div className='flex gap-2'>
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className='h-9 w-9 rounded-lg' />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className='mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className='h-32 rounded-xl' />
        ))}
      </div>

      {/* About skeleton */}
      <div className='space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 lg:p-8'>
        <Skeleton className='h-6 w-24' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
      </div>
    </section>
  );
}
