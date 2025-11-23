'use client';
import { Hackathon } from '@/types/hackathon';
import { useMemo } from 'react';

export interface TimelineEvent {
  event: string;
  date: string;
  rawDate: Date;
  type: 'start' | 'deadline' | 'judging' | 'winner' | 'end';
}

interface UseTimelineEventsOptions {
  includeEndDate?: boolean;
  dateFormat?: Intl.DateTimeFormatOptions;
  deadlineFormat?: Intl.DateTimeFormatOptions;
}

export const useTimelineEvents = (
  currentHackathon: Hackathon | null,
  options: UseTimelineEventsOptions = {}
) => {
  const {
    includeEndDate = true,
    dateFormat = { year: 'numeric', month: 'long', day: 'numeric' },
    deadlineFormat = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  } = options;

  return useMemo(() => {
    if (!currentHackathon) return [];

    const events: TimelineEvent[] = [];

    // Add start date
    if (currentHackathon.startDate) {
      const startDate = new Date(currentHackathon.startDate);
      events.push({
        event: 'Hackathon Starts',
        date: startDate.toLocaleDateString('en-US', dateFormat),
        rawDate: startDate,
        type: 'start',
      });
    }

    // Add submission deadline
    if (currentHackathon.deadline) {
      const deadline = new Date(currentHackathon.deadline);
      events.push({
        event: 'Submission Deadline',
        date: deadline.toLocaleDateString('en-US', deadlineFormat),
        rawDate: deadline,
        type: 'deadline',
      });
    }

    // Add judging date
    if (currentHackathon.judgingDate) {
      const judgingDate = new Date(currentHackathon.judgingDate);
      events.push({
        event: 'Judging Period',
        date: judgingDate.toLocaleDateString('en-US', dateFormat),
        rawDate: judgingDate,
        type: 'judging',
      });
    }

    // Add winner announcement date
    if (currentHackathon.winnerAnnouncementDate) {
      const winnerDate = new Date(currentHackathon.winnerAnnouncementDate);
      events.push({
        event: 'Winners Announced',
        date: winnerDate.toLocaleDateString('en-US', dateFormat),
        rawDate: winnerDate,
        type: 'winner',
      });
    }

    // Add end date if enabled and different from winner announcement
    if (
      includeEndDate &&
      currentHackathon.endDate &&
      currentHackathon.endDate !== currentHackathon.winnerAnnouncementDate
    ) {
      const endDate = new Date(currentHackathon.endDate);
      events.push({
        event: 'Hackathon Ends',
        date: endDate.toLocaleDateString('en-US', dateFormat),
        rawDate: endDate,
        type: 'end',
      });
    }

    return events
      .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
      .map(({ ...event }) => event);
  }, [currentHackathon, includeEndDate, dateFormat, deadlineFormat]);
};
