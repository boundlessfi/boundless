'use client';

import React, { useState, useEffect } from 'react';
import { Code2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

const BRAND_COLOR = '#a7f950';
const DEV_MODAL_KEY = 'dev-status-modal-dismissed';

const DevelopmentStatusModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the modal
    try {
      const dismissed = localStorage.getItem(DEV_MODAL_KEY);
      if (!dismissed) {
        // Show modal after a short delay
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // If localStorage fails, show the modal anyway
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    try {
      localStorage.setItem(DEV_MODAL_KEY, 'true');
    } catch {
      // Silently fail if localStorage is not available
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='max-w-md overflow-hidden border border-zinc-800 bg-zinc-900 p-0 text-white [&>button]:hidden'>
        {/* Header with gradient background */}
        <div
          className='relative px-6 pt-6 pb-4'
          style={{
            background: `linear-gradient(135deg, ${BRAND_COLOR}15 0%, transparent 100%)`,
          }}
        >
          <div className='absolute top-4 right-4'>
            <button
              onClick={handleClose}
              className='rounded-full p-1 transition-colors hover:bg-zinc-800'
              aria-label='Close modal'
            >
              <X className='h-4 w-4 text-zinc-400' />
            </button>
          </div>

          <div className='flex items-start gap-4'>
            <div
              className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl'
              style={{ backgroundColor: `${BRAND_COLOR}20` }}
            >
              <Code2 className='h-6 w-6' style={{ color: BRAND_COLOR }} />
            </div>
            <div className='flex-1 pt-1'>
              <DialogTitle className='mb-2 text-lg font-bold text-white'>
                Boundless is Under Active Development
              </DialogTitle>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='px-6 pb-6'>
          <DialogDescription className='mb-4 text-sm leading-relaxed text-zinc-400'>
            Welcome to Boundless! We're actively building and improving the
            platform. You may encounter:
          </DialogDescription>

          <div className='mb-6 space-y-3'>
            <div className='flex items-start gap-3'>
              <div
                className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full'
                style={{ backgroundColor: `${BRAND_COLOR}20` }}
              >
                <div
                  className='h-2 w-2 rounded-full'
                  style={{ backgroundColor: BRAND_COLOR }}
                />
              </div>
              <p className='text-sm text-zinc-300'>
                New features being rolled out regularly
              </p>
            </div>

            <div className='flex items-start gap-3'>
              <div
                className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full'
                style={{ backgroundColor: `${BRAND_COLOR}20` }}
              >
                <div
                  className='h-2 w-2 rounded-full'
                  style={{ backgroundColor: BRAND_COLOR }}
                />
              </div>
              <p className='text-sm text-zinc-300'>
                Occasional bugs and UI improvements in progress
              </p>
            </div>

            <div className='flex items-start gap-3'>
              <div
                className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full'
                style={{ backgroundColor: `${BRAND_COLOR}20` }}
              >
                <div
                  className='h-2 w-2 rounded-full'
                  style={{ backgroundColor: BRAND_COLOR }}
                />
              </div>
              <p className='text-sm text-zinc-300'>
                Changes to features and functionality
              </p>
            </div>
          </div>

          <div className='mb-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4'>
            <p className='text-xs leading-relaxed text-zinc-400'>
              <strong className='text-zinc-300'>Your feedback matters!</strong>{' '}
              Help us build the best platform by reporting issues or suggesting
              improvements through our support channels.
            </p>
          </div>

          <button
            onClick={handleClose}
            className='w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors'
            style={{
              backgroundColor: BRAND_COLOR,
              color: '#000',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#8ae63a';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = BRAND_COLOR;
            }}
          >
            Got it, let's explore!
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DevelopmentStatusModal;
