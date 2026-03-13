'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  Palette,
  Play,
  Server,
  Box,
  ShieldCheck,
  Layers,
  Lock,
  Calendar,
} from 'lucide-react';
import { ResourceHeader } from './header';
import { ResourceCard } from './ResourceCard';
import { BoundlessButton } from '@/components/buttons/BoundlessButton';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { useHackathon } from '@/hooks/hackathon/use-hackathon-queries';
import { Skeleton } from '@/components/ui/skeleton';
import { type HackathonResourceItem } from '@/lib/api/hackathons';
import { ResourceCardProps } from './ResourceCard';

interface MappedResource extends ResourceCardProps {
  category: string;
}

// Helper to map API resources to UI format
const mapApiResource = (resource: HackathonResourceItem): MappedResource => {
  const content = (
    (resource.description || '') +
    ' ' +
    (resource.file?.name || '') +
    ' ' +
    (resource.link || '')
  ).toLowerCase();

  const isDoc =
    content.includes('doc') ||
    content.includes('guide') ||
    content.includes('trustlesswork.com');
  const isSdk =
    content.includes('sdk') ||
    content.includes('api') ||
    content.includes('git') ||
    content.includes('repo');
  const isDesign =
    content.includes('design') ||
    content.includes('figma') ||
    content.includes('brand') ||
    content.includes('asset');
  const isMedia =
    content.includes('video') ||
    content.includes('tutorial') ||
    content.includes('youtube') ||
    content.includes('play');

  let icon = Box;
  let category = 'All';
  let type: 'read' | 'repo' | 'download' | 'watch' | 'config' = 'read';
  let actionText = 'View Resource';

  if (isDoc) {
    icon = BookOpen;
    category = 'Technical';
    actionText = 'Read Docs';
    type = 'read';
  } else if (isSdk) {
    icon = Code2;
    category = 'Technical';
    actionText = 'View Repository';
    type = 'repo';
  } else if (isDesign) {
    icon = Palette;
    category = 'Design';
    actionText = 'Download Kit';
    type = 'download';
  } else if (isMedia) {
    icon = Play;
    category = 'Media';
    actionText = 'Watch Now';
    type = 'watch';
  }

  // Deriving title
  let title = resource.file?.name;
  if (!title && resource.link) {
    try {
      const url = new URL(resource.link);
      title = url.hostname.replace('www.', '');
      if (title.includes('docs.')) {
        title = 'Documentation';
      } else if (title.includes('github.com')) {
        title = 'GitHub Repository';
      } else if (title.includes('figma.com')) {
        title = 'Design Assets';
      } else if (title.includes('youtube.com') || title.includes('youtu.be')) {
        title = 'Video Tutorial';
      }
    } catch {
      title = 'External Resource';
    }
  }

  if (!title && resource.description) {
    title = resource.description.split('\n')[0].substring(0, 40);
  }

  return {
    title: title || 'Untitled Resource',
    description:
      resource.description ||
      `Access the ${title || 'resource'} via the link below.`,
    icon,
    actionText,
    actionHref: resource.link || resource.file?.url,
    type,
    category,
  };
};

export const ResourcesList = () => {
  const { slug } = useParams() as { slug: string };
  const { data: hackathon, isLoading } = useHackathon(slug);
  const [activeTab, setActiveTab] = useState('All');

  if (isLoading) {
    return (
      <div className='grid gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3'>
        {[1, 2, 3].map(i => (
          <Skeleton
            key={i}
            className='h-[280px] w-full rounded-3xl bg-white/5'
          />
        ))}
      </div>
    );
  }

  const apiResources: MappedResource[] =
    hackathon?.resources?.map(mapApiResource) || [];

  // Add "More Coming Soon" if there are fewer than 3 resources
  if (apiResources.length < 3) {
    apiResources.push({
      title: 'More Coming Soon',
      description: 'New resources and tools are being added to help you build.',
      icon: Box,
      actionText: '',
      actionHref: '#',
      type: 'read',
      category: 'All',
      isComingSoon: true,
    });
  }

  const filteredResources = apiResources.filter(
    (r: MappedResource) =>
      activeTab === 'All' || r.category === activeTab || r.isComingSoon
  );

  return (
    <div className='space-y-16 py-8 md:py-12'>
      <ResourceHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {filteredResources.map((resource: MappedResource, idx: number) => (
          <ResourceCard key={resource.title || idx} {...resource} />
        ))}
      </div>
    </div>
  );
};
