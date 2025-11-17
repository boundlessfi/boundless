// ActivityFeed.tsx - Simplified
'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Activity } from 'lucide-react';
import Image from 'next/image';
import { GetMeResponse } from '@/lib/api/types';

interface ActivityFeedProps {
  filter: string;
  user: GetMeResponse;
}

interface Activity {
  id: string;
  description: string;
  timestamp: string;
  image?: string;
}

export default function ActivityFeed({ filter, user }: ActivityFeedProps) {
  const [showAll, setShowAll] = useState(false);

  // Reset showAll when filter changes
  useEffect(() => {
    setShowAll(false);
  }, [filter]);

  const activities = useMemo(
    () => (user.activities || []) as Activity[],
    [user.activities]
  );

  const filteredActivities = useMemo(() => {
    if (filter === 'All' || filter === 'All Time') {
      return activities;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    return activities.filter(activity => {
      if (!activity.timestamp) return false;

      const activityDate = new Date(activity.timestamp);

      switch (filter) {
        case 'Today':
          return activityDate >= today;
        case 'Yesterday':
          return activityDate >= yesterday && activityDate < today;
        case 'This Week':
          return activityDate >= thisWeek;
        case 'This Month':
          return activityDate >= thisMonth;
        case 'This Year':
          return activityDate >= thisYear;
        default:
          return true;
      }
    });
  }, [activities, filter]);

  const groupedActivities = useMemo(() => {
    if (filter === 'All' || filter === 'All Time') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const thisWeek = new Date(today);
      thisWeek.setDate(thisWeek.getDate() - 7);

      const todayActivities: Activity[] = [];
      const yesterdayActivities: Activity[] = [];
      const weekActivities: Activity[] = [];

      filteredActivities.forEach(activity => {
        if (!activity.timestamp) return;

        const activityDate = new Date(activity.timestamp);
        activityDate.setHours(0, 0, 0, 0);

        if (activityDate.getTime() === today.getTime()) {
          todayActivities.push(activity);
        } else if (activityDate.getTime() === yesterday.getTime()) {
          yesterdayActivities.push(activity);
        } else if (activityDate >= thisWeek) {
          weekActivities.push(activity);
        }
      });

      return [
        { title: 'TODAY', activities: todayActivities },
        { title: 'YESTERDAY', activities: yesterdayActivities },
        { title: 'THIS WEEK', activities: weekActivities },
      ].filter(group => group.activities.length > 0);
    } else {
      // For specific filters, show all filtered activities in one group
      return [{ title: filter.toUpperCase(), activities: filteredActivities }];
    }
  }, [filteredActivities, filter]);

  const displayedGroups = useMemo(() => {
    if (showAll) {
      return groupedActivities;
    }

    // Show first group with limited activities, or all groups if there's only one
    if (groupedActivities.length === 0) return [];
    if (groupedActivities.length === 1) {
      return [
        {
          ...groupedActivities[0],
          activities: groupedActivities[0].activities.slice(0, 10),
        },
      ];
    }

    // For multiple groups, show first group fully and limit others
    return [
      groupedActivities[0],
      ...groupedActivities.slice(1).map(group => ({
        ...group,
        activities: group.activities.slice(0, 5),
      })),
    ];
  }, [groupedActivities, showAll]);

  const hasMoreActivities = useMemo(() => {
    if (showAll) return false;

    const totalDisplayed = displayedGroups.reduce(
      (sum, group) => sum + group.activities.length,
      0
    );
    return filteredActivities.length > totalDisplayed;
  }, [displayedGroups, filteredActivities.length, showAll]);

  if (filteredActivities.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-12'>
        <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800'>
          <Activity className='h-8 w-8 text-zinc-500' />
        </div>
        <h3 className='mb-2 text-lg font-medium text-white'>No Activity Yet</h3>
        <p className='text-sm text-zinc-500'>
          {filter === 'All' || filter === 'All Time'
            ? 'Your activity will appear here once you start engaging'
            : `No activity found for ${filter.toLowerCase()}`}
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {displayedGroups.map(
        (group, idx) =>
          group.activities.length > 0 && (
            <div key={idx}>
              <h3 className='mb-4 text-xs font-semibold tracking-wider text-zinc-500 uppercase'>
                {group.title}
              </h3>
              <div className='space-y-4'>
                {group.activities.map(activity => (
                  <div key={activity.id} className='flex items-start gap-3'>
                    <Image
                      src={activity.image || '/avatar.png'}
                      alt='Activity'
                      width={40}
                      height={40}
                      className='h-10 w-10 rounded-full border border-zinc-800'
                    />
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm text-white'>
                        {activity.description}
                      </p>
                      <p className='mt-1 text-xs text-zinc-500'>
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
      )}

      {hasMoreActivities && (
        <button
          onClick={() => setShowAll(!showAll)}
          className='flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 py-3 text-sm text-zinc-400 transition-colors hover:bg-zinc-900/50 hover:text-white'
        >
          {showAll ? 'Show Less' : 'Show More'}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </div>
  );
}
