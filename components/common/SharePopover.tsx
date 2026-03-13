'use client';

import React from 'react';
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverHeader,
  PopoverButton,
} from '@/components/ui/popover-cult';
import {
  IconShare3,
  IconCopy,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconMail,
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface SharePopoverProps {
  title?: string;
  url?: string;
  className?: string;
  trigger?: React.ReactNode;
}

const SharePopover = ({
  title,
  url,
  className,
  trigger,
}: SharePopoverProps) => {
  const shareUrl =
    url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title || 'Check out this hackathon on Boundless!';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareTitle
    )}&url=${encodeURIComponent(shareUrl)}`;
    const newWindow = window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  const handleLinkedinShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl
    )}`;
    const newWindow = window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  const handleEmailShare = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(
      shareTitle
    )}&body=${encodeURIComponent(shareUrl)}`;
  };

  return (
    <PopoverRoot className={className}>
      <PopoverTrigger className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5'>
        {trigger || <IconShare3 className='h-5 w-5' strokeWidth={1.5} />}
      </PopoverTrigger>
      <PopoverContent className='right-0 h-fit w-48 border-white/10 bg-[#1A1F16] text-white backdrop-blur-xl'>
        <PopoverHeader className='border-b border-white/5 py-3'>
          <span className='text-sm font-bold tracking-wider text-white/60 uppercase'>
            Share Hackathon
          </span>
        </PopoverHeader>
        <PopoverBody className='flex flex-col gap-1 p-2'>
          <PopoverButton
            onClick={handleCopyLink}
            className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5'
          >
            <IconCopy size={18} className='text-[#A7F950]' />
            <span>Copy Link</span>
          </PopoverButton>
          <PopoverButton
            onClick={handleTwitterShare}
            className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5'
          >
            <IconBrandTwitter size={18} className='text-[#1DA1F2]' />
            <span>X (Twitter)</span>
          </PopoverButton>
          <PopoverButton
            onClick={handleLinkedinShare}
            className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5'
          >
            <IconBrandLinkedin size={18} className='text-[#0A66C2]' />
            <span>LinkedIn</span>
          </PopoverButton>
          <PopoverButton
            onClick={handleEmailShare}
            className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5'
          >
            <IconMail size={18} className='text-white/60' />
            <span>Email</span>
          </PopoverButton>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};

export default SharePopover;
