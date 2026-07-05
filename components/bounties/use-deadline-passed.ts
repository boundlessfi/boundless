'use client';

import { useEffect, useState } from 'react';

/**
 * Whether an ISO deadline has passed, re-checked every 30s (the DueCountdown
 * cadence) so deadline gates unlock while the user stays on the page instead
 * of only on remount. A null deadline reports false.
 */
export function useDeadlinePassed(deadline: string | null): boolean {
  const [passed, setPassed] = useState(() =>
    deadline ? new Date(deadline).getTime() <= Date.now() : false
  );

  useEffect(() => {
    if (!deadline) {
      setPassed(false);
      return;
    }
    const target = new Date(deadline).getTime();
    if (target <= Date.now()) {
      setPassed(true);
      return;
    }
    setPassed(false);
    const interval = setInterval(() => {
      if (Date.now() >= target) setPassed(true);
    }, 30_000);
    return () => clearInterval(interval);
  }, [deadline]);

  return passed;
}
