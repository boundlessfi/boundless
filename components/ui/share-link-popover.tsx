'use client';

import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const XIcon = () => (
  <svg className='h-4 w-4' viewBox='0 0 24 24' fill='currentColor' aria-hidden>
    <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
  </svg>
);

export interface ShareLinkPopoverProps {
  url: string;
  title?: string;
  trigger?: React.ReactNode;
  triggerClassName?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const defaultShareText = 'Check this out';

export const ShareLinkPopover = ({
  url,
  title = defaultShareText,
  trigger,
  triggerClassName,
  align = 'end',
  side = 'bottom',
}: ShareLinkPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
      setOpen(false);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const shareToX = () => {
    const text = `${title} ${url}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
    setOpen(false);
  };

  const shareToTelegram = () => {
    const text = `${title} ${url}`;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
    setOpen(false);
  };

  const shareToWhatsApp = () => {
    const text = `${title} ${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
    setOpen(false);
  };

  const options = [
    {
      label: 'Copy link',
      icon: Copy,
      onClick: handleCopy,
      className: 'hover:bg-zinc-100 hover:text-zinc-900',
      active: copied,
    },
    {
      label: 'X (Twitter)',
      icon: XIcon,
      onClick: shareToX,
      className: 'hover:bg-zinc-100 hover:text-zinc-900',
    },
    {
      label: 'Telegram',
      icon: Send,
      onClick: shareToTelegram,
      className: 'hover:bg-[#0088cc]/10 hover:text-[#0088cc]',
    },
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      onClick: shareToWhatsApp,
      className: 'hover:bg-[#25d366]/10 hover:text-[#25d366]',
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button
            variant='outline'
            size='sm'
            className={cn(
              'gap-2 border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white',
              triggerClassName
            )}
          >
            <Share2 className='h-4 w-4' />
            Share
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        className='bg-background-card w-56 rounded-xl p-2'
      >
        <div className='space-y-0.5'>
          {options.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.label}
                type='button'
                onClick={opt.onClick}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white transition-colors',
                  opt.className,
                  opt.active && 'bg-green-500/10 text-green-500'
                )}
              >
                <Icon />
                <span>
                  {opt.label}
                  {opt.active ? ' ✓' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
