'use client';

import { useEffect, useState } from 'react';

export function useHackathonStatus(startDate?: string, deadline?: string) {
  const [status, setStatus] = useState<'upcoming' | 'ongoing' | 'ended'>(
    'upcoming'
  );
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    const now = Date.now();
    const start = startDate ? new Date(startDate).getTime() : null;
    const end = deadline ? new Date(deadline).getTime() : null;

    let newStatus: 'upcoming' | 'ongoing' | 'ended' = 'upcoming';

    if (end && now > end) {
      newStatus = 'ended';
    } else if (start && now >= start) {
      newStatus = 'ongoing';
    } else {
      newStatus = 'upcoming';
    }

    setStatus(newStatus);
  }, [startDate, deadline]);

  useEffect(() => {
    const target =
      status === 'ongoing'
        ? deadline
        : status === 'upcoming'
          ? startDate
          : null;

    if (!target) return;

    const getTime = () => {
      const now = Date.now();
      const targetTime = new Date(target).getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        total: diff,
      };
    };

    setTimeRemaining(getTime());

    const interval = setInterval(() => setTimeRemaining(getTime()), 1000);
    return () => clearInterval(interval);
  }, [deadline, startDate, status]);

  const formatCountdown = (t: typeof timeRemaining) => {
    if (t.total <= 0) return 'Ended';
    if (t.days > 0) return `${t.days}d ${t.hours}h`;
    if (t.hours > 0) return `${t.hours}h ${t.minutes}m`;
    return `${t.minutes}m ${t.seconds}s`;
  };

  return {
    status,
    timeRemaining,
    formatCountdown,
  };
}
