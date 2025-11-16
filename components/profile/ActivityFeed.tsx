'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { GetMeResponse } from '@/lib/api/types';

interface ActivityItem {
  id: string;
  type: 'comment' | 'back' | 'add' | 'submit' | 'apply' | 'reply';
  description: string;
  projectName?: string;
  amount?: string;
  hackathonName?: string;
  grantName?: string;
  timestamp: string;
  emoji?: string;
  image?: string;
}

const getActivityDescription = (activity: ActivityItem) => {
  let description = activity.description;

  if (activity.projectName) {
    description += ` ${activity.projectName}`;
  }

  if (
    activity.description.includes('to hackathon:') &&
    activity.hackathonName
  ) {
    description += ` ${activity.hackathonName}`;
  }

  if (activity.amount) {
    description += ` — Funded ${activity.amount}`;
  }

  if (activity.emoji) {
    description += ` ${activity.emoji}`;
  }

  return description;
};

interface ActivityFeedProps {
  filter: string;
  user: GetMeResponse;
}

export default function ActivityFeed({ filter, user }: ActivityFeedProps) {
  const [showAll, setShowAll] = useState(false);

  // Use real activities from API, fallback to empty array if none
  const realActivities = (user.activities || []) as ActivityItem[];

  // For now, show empty state when no activities
  if (realActivities.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <div className='mb-4 rounded-full bg-gray-800 p-4'>
          <svg
            className='h-8 w-8 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
            />
          </svg>
        </div>
        <h3 className='mb-2 text-lg font-medium text-white'>No Activity Yet</h3>
        <p className='text-sm text-gray-400'>
          Your activity will appear here once you start engaging with projects.
        </p>
      </div>
    );
  }

  const todayActivities = realActivities.slice(0, 4);
  const yesterdayActivities = realActivities.slice(4, 6);
  const weekActivities = realActivities.slice(6, 10);

  // Filter activities based on selected filter
  const getFilteredActivities = () => {
    switch (filter) {
      case 'Today':
        return [{ title: 'TODAY', activities: todayActivities }];
      case 'Yesterday':
        return [{ title: 'YESTERDAY', activities: yesterdayActivities }];
      case 'This Week':
        return [
          { title: 'TODAY', activities: todayActivities },
          { title: 'YESTERDAY', activities: yesterdayActivities },
          { title: 'THIS WEEK', activities: weekActivities },
        ];
      case 'This Month':
        return [
          { title: 'TODAY', activities: todayActivities },
          { title: 'YESTERDAY', activities: yesterdayActivities },
          { title: 'THIS WEEK', activities: weekActivities },
        ];
      case 'This Year':
        return [
          { title: 'TODAY', activities: todayActivities },
          { title: 'YESTERDAY', activities: yesterdayActivities },
          { title: 'THIS WEEK', activities: weekActivities },
        ];
      case 'All Time':
        return [
          { title: 'TODAY', activities: todayActivities },
          { title: 'YESTERDAY', activities: yesterdayActivities },
          { title: 'THIS WEEK', activities: weekActivities },
        ];
      default: // 'All'
        return [
          { title: 'TODAY', activities: todayActivities },
          { title: 'YESTERDAY', activities: yesterdayActivities },
          { title: 'THIS WEEK', activities: weekActivities },
        ];
    }
  };

  const groupedActivities = getFilteredActivities();

  return (
    <div className='space-y-6'>
      {groupedActivities.map((group, groupIndex) => (
        <div key={groupIndex}>
          <h3 className='mb-4 text-sm text-white'>{group.title}</h3>
          <div className='ml-5 space-y-4'>
            {group.activities.map(activity => (
              <div key={activity.id} className='flex items-start gap-3'>
                <Image
                  src={activity.image || '/avatar.png'}
                  alt={activity.projectName || 'Project Image'}
                  width={20}
                  height={20}
                  className='h-8 w-8 rounded-full'
                />
                <div className='flex-1'>
                  <p className='text-sm text-white'>
                    {getActivityDescription(activity)}
                  </p>
                  <p className='mt-1 text-xs text-gray-400'>
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showAll && filter === 'All' && (
        <div>
          <h3 className='mb-4 text-sm text-white'>EARLIER</h3>
          <div className='ml-5 space-y-4'>
            {realActivities.slice(10).map(activity => (
              <div key={activity.id} className='flex items-start gap-3'>
                <Image
                  src={activity.image || '/admin.png'}
                  alt={activity.projectName || 'Project Image'}
                  width={20}
                  height={20}
                  className='h-8 w-8 rounded-full'
                />
                <div className='flex-1'>
                  <p className='text-sm text-white'>
                    {getActivityDescription(activity)}
                  </p>
                  <p className='mt-1 text-xs text-gray-400'>
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filter === 'All' && (
        <div className='flex justify-center pt-4'>
          <button
            onClick={() => setShowAll(!showAll)}
            className='flex items-center gap-2 text-gray-400 transition-colors hover:text-white'
          >
            {showAll ? 'Show Less' : 'Show More'}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      )}
    </div>
  );
}
