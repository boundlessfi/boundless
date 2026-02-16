import { HackathonTimeline } from '@/lib/api/hackathons';

export type TimelinePhaseStatus = 'completed' | 'active' | 'upcoming';

export interface TimelinePhase {
  name: string;
  startDate: string;
  endDate: string;
  status: TimelinePhaseStatus;
  description?: string;
}

export interface TimelinePhaseStatusResult {
  phases: TimelinePhase[];
  currentPhase: TimelinePhase | null;
}

/**
 * Format a date string for display
 * @param date - ISO date string
 * @returns Formatted date string (e.g., "20 Aug, 2025")
 */
export const formatTimelineDate = (date: string): string => {
  const dateObj = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Check if a phase is completed based on end date
 * @param endDate - ISO date string for phase end date
 * @param currentDate - Optional current date (defaults to now)
 * @returns true if phase is completed
 */
export const isPhaseCompleted = (
  endDate: string,
  currentDate: Date = new Date()
): boolean => {
  const phaseEndDate = new Date(endDate);
  return currentDate > phaseEndDate;
};

/**
 * Check if a phase is currently active
 * @param startDate - ISO date string for phase start date
 * @param endDate - ISO date string for phase end date
 * @param currentDate - Optional current date (defaults to now)
 * @returns true if phase is currently active
 */
export const isPhaseActive = (
  startDate: string,
  endDate: string,
  currentDate: Date = new Date()
): boolean => {
  const phaseStartDate = new Date(startDate);
  const phaseEndDate = new Date(endDate);
  return currentDate >= phaseStartDate && currentDate <= phaseEndDate;
};

/**
 * Calculate timeline phase statuses based on hackathon timeline data
 * @param timeline - Hackathon timeline data
 * @param currentDate - Optional current date (defaults to now)
 * @returns Timeline phases with their statuses
 */
export const calculateTimelineStatus = (
  timeline: HackathonTimeline,
  currentDate: Date = new Date()
): TimelinePhaseStatusResult => {
  const phases: TimelinePhase[] = [];

  // Register phase (from startDate to submissionDeadline)
  phases.push({
    name: 'Register',
    startDate: timeline.startDate,
    endDate: timeline.submissionDeadline,
    status: isPhaseCompleted(timeline.submissionDeadline, currentDate)
      ? 'completed'
      : isPhaseActive(
            timeline.startDate,
            timeline.submissionDeadline,
            currentDate
          )
        ? 'active'
        : 'upcoming',
    description:
      'Individuals and teams are signing up to participate in the hackathon.',
  });

  // Submission phase (from startDate to submissionDeadline)
  phases.push({
    name: 'Submission',
    startDate: timeline.startDate,
    endDate: timeline.submissionDeadline,
    status: isPhaseCompleted(timeline.submissionDeadline, currentDate)
      ? 'completed'
      : isPhaseActive(
            timeline.startDate,
            timeline.submissionDeadline,
            currentDate
          )
        ? 'active'
        : 'upcoming',
    description:
      'Participants are submitting their projects for review before the deadline.',
  });

  const judgingStart = timeline.judgingStart || timeline.judgingDate;
  const judgingEnd = timeline.judgingEnd || judgingStart;
  const winnersAnnouncedAt =
    timeline.winnersAnnouncedAt ||
    timeline.winnerAnnouncementDate ||
    judgingEnd;

  // Judging phase (from judgingStart to judgingEnd)
  // Only create if explicitly set and has non-zero duration
  if (judgingStart && judgingEnd && judgingStart !== judgingEnd) {
    phases.push({
      name: 'Judging',
      startDate: judgingStart,
      endDate: judgingEnd,
      status: isPhaseCompleted(judgingEnd, currentDate)
        ? 'completed'
        : isPhaseActive(judgingStart, judgingEnd, currentDate)
          ? 'active'
          : 'upcoming',
      description:
        'Judges are currently reviewing and scoring all submitted projects.',
    });
  }

  // Winner Announcement phase (from judgingEnd to winnersAnnouncedAt)
  // Only create if explicitly set and has non-zero duration
  if (judgingEnd && winnersAnnouncedAt && judgingEnd !== winnersAnnouncedAt) {
    phases.push({
      name: 'Winner Announcement',
      startDate: judgingEnd,
      endDate: winnersAnnouncedAt,
      status: isPhaseCompleted(winnersAnnouncedAt, currentDate)
        ? 'completed'
        : isPhaseActive(judgingEnd, winnersAnnouncedAt, currentDate)
          ? 'active'
          : 'upcoming',
      description: 'Final results published and prizes distributed to winners.',
    });
  }

  // Find current active phase
  const currentPhase = phases.find(phase => phase.status === 'active') || null;

  return {
    phases,
    currentPhase,
  };
};
