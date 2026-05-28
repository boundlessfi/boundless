'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BoundlessButton } from '@/components/buttons/BoundlessButton';
import {
  Mail,
  MessageCircle,
  Github,
  Globe,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';
import {
  readTeamContact,
  TeamRecruitmentPost,
} from '@/lib/api/hackathons/teams';
import { useState } from 'react';
import { toast } from 'sonner';

interface ContactTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: TeamRecruitmentPost | null;
  onTrackContact?: (postId: string) => void;
}

export function ContactTeamModal({
  open,
  onOpenChange,
  team,
  onTrackContact,
}: ContactTeamModalProps) {
  const [copied, setCopied] = useState(false);

  if (!team) return null;

  const { teamName, contactInfo, id } = team;
  const contact = readTeamContact(contactInfo);

  // If the team has no contact info at all, render nothing: the parent
  // should have already gated this modal, but defend against bad data.
  if (!contact) return null;
  const { method: contactMethod, value: contactValue } = contact;

  const handleCopy = () => {
    navigator.clipboard.writeText(contactValue);
    setCopied(true);
    toast.success('Contact info copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
    onTrackContact?.(id);
  };

  const getIcon = () => {
    switch (contactMethod) {
      case 'email':
        return <Mail className='h-5 w-5' />;
      case 'telegram':
      case 'discord':
        return <MessageCircle className='h-5 w-5' />;
      default:
        return <Globe className='h-5 w-5' />;
    }
  };

  const getLabel = () => {
    switch (contactMethod) {
      case 'email':
        return 'Email Address';
      case 'telegram':
        return 'Telegram Username/Link';
      case 'discord':
        return 'Discord Username';
      default:
        return 'Contact Info';
    }
  };

  const isLink =
    contactValue.startsWith('http') || contactValue.startsWith('https');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='border-white/10 bg-[#0D0E10] text-white sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            Contact {teamName}
          </DialogTitle>
          <DialogDescription className='text-gray-500'>
            Reach out to the team leader to express your interest in joining.
          </DialogDescription>
        </DialogHeader>

        <div className='mt-6 space-y-6'>
          <div className='rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl'>
            <div className='flex items-center gap-4'>
              <div className='bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl'>
                {getIcon()}
              </div>
              <div className='flex-1 overflow-hidden'>
                <p className='text-[10px] font-bold tracking-widest text-gray-500 uppercase'>
                  {getLabel()}
                </p>
                <p className='truncate text-lg font-bold text-white'>
                  {contactValue}
                </p>
              </div>
            </div>
          </div>

          <div className='flex gap-3'>
            <BoundlessButton
              variant='default'
              className='h-12 flex-1 rounded-xl font-bold'
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className='mr-2 h-4 w-4' /> Copied
                </>
              ) : (
                <>
                  <Copy className='mr-2 h-4 w-4' /> Copy Info
                </>
              )}
            </BoundlessButton>

            {isLink && (
              <BoundlessButton
                variant='outline'
                className='h-12 flex-1 rounded-xl border-white/10 bg-white/5 font-bold hover:bg-white/10'
                onClick={() => {
                  window.open(contactValue, '_blank', 'noopener,noreferrer');
                  onTrackContact?.(id);
                }}
              >
                <ExternalLink className='mr-2 h-4 w-4' /> Open Link
              </BoundlessButton>
            )}
          </div>
        </div>

        <div className='mt-4 text-center'>
          <p className='text-[10px] text-gray-600'>
            By contacting this team, your interest will be tracked by the
            organizers.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
