'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Copy,
  ExternalLink,
  MessageCircle,
  Twitter,
  MessageSquare,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

interface ShareCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignLink: string;
  campaignTitle: string;
}

const ShareCampaignModal: React.FC<ShareCampaignModalProps> = ({
  open,
  onOpenChange,
  campaignLink,
  campaignTitle,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(campaignLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const shareToTwitter = () => {
    const text = `Check out this amazing campaign: ${campaignTitle}`;
    const url = encodeURIComponent(campaignLink);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
    window.open(twitterUrl, '_blank');
  };

  const shareToDiscord = () => {
    const text = `Check out this amazing campaign: ${campaignTitle}\n${campaignLink}`;
    const discordUrl = `https://discord.com/channels/@me?content=${encodeURIComponent(text)}`;
    window.open(discordUrl, '_blank');
  };

  const shareToWhatsApp = () => {
    const text = `Check out this amazing campaign: ${campaignTitle}\n${campaignLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToTelegram = () => {
    const text = `Check out this amazing campaign: ${campaignTitle}\n${campaignLink}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(campaignLink)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
  };

  const shareOptions = [
    {
      name: 'Discord',
      icon: MessageCircle,
      color: 'bg-[#5865F2] hover:bg-[#4752C4]',
      onClick: shareToDiscord,
    },
    {
      name: 'X/Twitter',
      icon: Twitter,
      color: 'bg-[#1DA1F2] hover:bg-[#1A91DA]',
      onClick: shareToTwitter,
    },
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      color: 'bg-[#25D366] hover:bg-[#22C55E]',
      onClick: shareToWhatsApp,
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-[#0088CC] hover:bg-[#0077B3]',
      onClick: shareToTelegram,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md border-[#2B2B2B] bg-[#1A1A1A] text-white'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-[#F5F5F5]'>
            Share Campaign
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='space-y-3'>
            <label className='text-sm font-medium text-[#B5B5B5]'>
              Campaign Link
            </label>
            <div className='flex items-center space-x-2'>
              <Input
                value={campaignLink}
                readOnly
                className='flex-1 border-[#2B2B2B] bg-[#2A2A2A] text-[#F5F5F5] placeholder:text-[#B5B5B5]'
                placeholder='Campaign link will appear here...'
              />
              <Button
                variant='outline'
                size='sm'
                onClick={copyToClipboard}
                className='min-w-[40px] border-[#2B2B2B] bg-[#2A2A2A] text-[#F5F5F5] hover:bg-[#1A1A1A]'
              >
                <Copy className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => window.open(campaignLink, '_blank')}
                className='min-w-[40px] border-[#2B2B2B] bg-[#2A2A2A] text-[#F5F5F5] hover:bg-[#1A1A1A]'
              >
                <ExternalLink className='h-4 w-4' />
              </Button>
            </div>
            {copied && (
              <p className='text-xs text-green-500'>
                Link copied to clipboard!
              </p>
            )}
          </div>

          <div className='space-y-3'>
            <label className='text-sm font-medium text-[#B5B5B5]'>
              Share on Social Media
            </label>
            <div className='grid grid-cols-2 gap-3'>
              {shareOptions.map(option => (
                <Button
                  key={option.name}
                  onClick={option.onClick}
                  className={`${option.color} border-0 text-white transition-transform hover:scale-105`}
                >
                  <option.icon className='mr-2 h-4 w-4' />
                  {option.name}
                </Button>
              ))}
            </div>
          </div>

          <div className='rounded-lg border border-[#2B2B2B] bg-[#2A2A2A] p-4'>
            <h4 className='mb-2 font-medium text-[#F5F5F5]'>Preview</h4>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-[#F5F5F5]'>
                {campaignTitle}
              </p>
              <p className='text-xs text-[#B5B5B5]'>
                Check out this amazing campaign on Boundless!
              </p>
              <p className='truncate text-xs text-[#B5B5B5]'>{campaignLink}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareCampaignModal;
