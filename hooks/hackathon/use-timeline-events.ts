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

    // Add judging deadline if set
    if (currentHackathon.judgingDeadline) {
      const judgingDate = new Date(currentHackathon.judgingDeadline);
      events.push({
        event: 'Judging Deadline',
        date: judgingDate.toLocaleDateString('en-US', dateFormat),
        rawDate: judgingDate,
        type: 'judging',
      });
    }

    // Add hackathon ends (tied to submission deadline)
    if (includeEndDate && currentHackathon.submissionDeadline) {
      const endDate = new Date(currentHackathon.submissionDeadline);
      const hasDeadlineEvent = events.some(e => e.type === 'deadline');
      if (!hasDeadlineEvent) {
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
