'use client';

import { useEffect, useState } from 'react';
import { Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface ShortcutDef {
  keys: string[];
  description: string;
}

interface KeyboardShortcutsProps {
  shortcuts: ShortcutDef[];
  /** When provided, pressing this key toggles the dialog. Defaults to '?'. */
  triggerKey?: string;
}

export function KeyboardShortcuts({
  shortcuts,
  triggerKey = '?',
}: KeyboardShortcutsProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === triggerKey || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setOpen(p => !p);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [triggerKey]);

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className='inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-400 hover:border-white/20 hover:text-white'
        title='Keyboard shortcuts (press ?)'
      >
        <Keyboard className='h-3.5 w-3.5' />
        <span className='hidden sm:inline'>Shortcuts</span>
        <kbd className='rounded border border-white/10 bg-black/40 px-1 font-mono text-[10px] text-gray-500'>
          ?
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='border-white/10 bg-[#101010] text-white sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription className='text-gray-500'>
              Speed through the queue without leaving the keyboard.
            </DialogDescription>
          </DialogHeader>
          <ul className='mt-2 space-y-1.5'>
            {shortcuts.map((s, i) => (
              <li
                key={i}
                className='flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-white/5'
              >
                <span className='text-gray-300'>{s.description}</span>
                <span className='flex shrink-0 items-center gap-1'>
                  {s.keys.map((k, j) => (
                    <kbd
                      key={j}
                      className='rounded border border-white/10 bg-black/40 px-1.5 py-0.5 font-mono text-[11px] text-gray-300'
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
