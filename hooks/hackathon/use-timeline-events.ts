'use client';
import { Hackathon } from '@/lib/api/hackathons';
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
    if (currentHackathon.submissionDeadline) {
      const deadline = new Date(currentHackathon.submissionDeadline);
      events.push({
        event: 'Submission Deadline',
        date: deadline.toLocaleDateString('en-US', deadlineFormat),
        rawDate: deadline,
        type: 'deadline',
      });
    }

    // Note: Judging date is not available in the current Hackathon type structure

    // Add winner announcement date (using end date as fallback)
    if (currentHackathon.endDate) {
      const winnerDate = new Date(currentHackathon.endDate);
      events.push({
        event: 'Winners Announced',
        date: winnerDate.toLocaleDateString('en-US', dateFormat),
        rawDate: winnerDate,
        type: 'winner',
      });
    }

    // Add end date if enabled and different from winner announcement
    if (includeEndDate && currentHackathon.endDate) {
      const endDate = new Date(currentHackathon.endDate);
      // Only add end date if it's different from the winner announcement date (which uses endDate)
      const hasWinnerEvent = events.some(event => event.type === 'winner');
      const shouldAddEndDate =
        !hasWinnerEvent ||
        endDate.getTime() !==
          events.find(e => e.type === 'winner')?.rawDate.getTime();

      if (shouldAddEndDate) {
        events.push({
          event: 'Hackathon Ends',
          date: endDate.toLocaleDateString('en-US', dateFormat),
          rawDate: endDate,
          type: 'end',
        });
      }
    }

    return events
      .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
      .map(({ ...event }) => event);
  }, [currentHackathon, includeEndDate, dateFormat, deadlineFormat]);
};
