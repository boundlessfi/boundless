'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Trophy,
  HandCoins,
  FolderKanban,
  Target,
  Building2,
} from 'lucide-react';
import {
  getOrganizationProfile,
  OrganizationProfile,
} from '@/lib/api/organization';
import { Skeleton } from '@/components/ui/skeleton';

interface OrgProfileClientProps {
  slug: string;
}

export default function OrgProfileClient({ slug }: OrgProfileClientProps) {
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getOrganizationProfile(slug);
        setProfile(data);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [slug]);

  if (loading) {
    return <OrgProfileSkeleton />;
  }

  if (!profile) {
    return (
      <section className='flex min-h-[50vh] items-center justify-center'>
        <p className='text-zinc-500'>Organization not found</p>
      </section>
    );
  }

  const { stats } = profile;
  const statCards = [
    {
      label: 'Projects',
      value: stats.projectsCount,
      icon: FolderKanban,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Hackathons',
      value: stats.totalHackathons,
      icon: Trophy,
      color: 'text-[#a7f950]',
      bgColor: 'bg-[#a7f950]/10',
    },
    {
      label: 'Bounties',
      value: stats.totalBounties,
      icon: Target,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Grants',
      value: stats.totalGrants,
      icon: HandCoins,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
  ];

  return (
    <section className='mx-auto max-w-[1440px] px-5 py-10 md:px-[50px] lg:px-[100px]'>
      {/* Banner / Header */}
      <div className='relative mb-8 overflow-hidden rounded-2xl border border-[#a7f950]/20 bg-linear-to-br from-[#a7f950]/10 via-zinc-900/80 to-zinc-900/40'>
        <div className='absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#a7f950]/5 blur-3xl' />
        <div className='absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#a7f950]/5 blur-3xl' />

        <div className='relative z-10 p-6 sm:p-8 lg:p-10'>
          <div className='flex flex-col gap-6 sm:flex-row sm:items-start'>
            {/* Logo */}
            <div className='flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-800/80 backdrop-blur-sm sm:h-28 sm:w-28'>
              {profile.logoUrl ? (
                <Image
                  src={profile.logoUrl}
                  alt={profile.name}
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
              <h1 className='text-3xl font-black text-white lg:text-4xl'>
                {profile.name}
              </h1>
              {profile.description && (
                <p className='max-w-2xl text-base leading-relaxed text-gray-300'>
                  {profile.description}
                </p>
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
    </section>
  );
}

function OrgProfileSkeleton() {
  return (
    <section className='mx-auto max-w-[1440px] px-5 py-10 md:px-[50px] lg:px-[100px]'>
      <div className='mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8 lg:p-10'>
        <div className='flex flex-col gap-6 sm:flex-row sm:items-start'>
          <Skeleton className='h-24 w-24 shrink-0 rounded-2xl sm:h-28 sm:w-28' />
          <div className='flex flex-1 flex-col gap-3'>
            <Skeleton className='h-9 w-72' />
            <Skeleton className='h-5 w-96 max-w-full' />
          </div>
        </div>
      </div>

      <div className='mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className='h-32 rounded-xl' />
        ))}
      </div>
    </section>
  );
}
