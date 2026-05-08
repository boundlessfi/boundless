'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a placeholder of the same size before mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        type='button'
        aria-label='Toggle theme'
        className={cn(
          'border-border-subtle flex h-9 w-9 items-center justify-center rounded-full border',
          className
        )}
      >
        <Sun className='text-muted-text h-4 w-4' aria-hidden='true' />
      </button>
    );
  }

  const current = theme === 'system' ? resolvedTheme : theme;
  const isDark = current === 'dark';

  return (
    <button
      type='button'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={cn(
        'group border-border-subtle bg-surface hover:border-border-strong relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors',
        className
      )}
    >
      <Sun
        className={cn(
          'text-foreground absolute h-4 w-4 transition-all',
          isDark
            ? 'scale-0 rotate-90 opacity-0'
            : 'scale-100 rotate-0 opacity-100'
        )}
        aria-hidden='true'
      />
      <Moon
        className={cn(
          'text-foreground absolute h-4 w-4 transition-all',
          isDark
            ? 'scale-100 rotate-0 opacity-100'
            : 'scale-0 -rotate-90 opacity-0'
        )}
        aria-hidden='true'
      />
    </button>
  );
}

export default ThemeToggle;
