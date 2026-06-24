'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Megaphone, Sparkles, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { previewAnnouncementAudience } from '@/lib/api/hackathons/draft';
import { reportError } from '@/lib/error-reporting';

interface PrePublishAnnounceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftId: string;
  organizationId: string;
  hackathonName: string;
  onConfirm: (options: {
    skipAnnouncement: boolean;
    announcementSubject?: string;
  }) => void;
  isPublishing: boolean;
}

export default function PrePublishAnnounceDialog({
  open,
  onOpenChange,
  draftId,
  organizationId,
  hackathonName,
  onConfirm,
  isPublishing,
}: PrePublishAnnounceDialogProps) {
  const [audienceSize, setAudienceSize] = useState<number | null>(null);
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [announce, setAnnounce] = useState(true);
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (!open || !draftId) return;
    let cancelled = false;
    setAudienceLoading(true);
    setAudienceSize(null);
    (async () => {
      try {
        const res = await previewAnnouncementAudience(draftId, organizationId);
        if (!cancelled) setAudienceSize(res.audienceSize);
      } catch (err) {
        if (!cancelled) setAudienceSize(0);
        reportError(err, { context: 'announcement-preview' });
      } finally {
        if (!cancelled) setAudienceLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, draftId, organizationId]);

  const defaultSubject = `${hackathonName} just launched on Boundless`;

  const handleConfirm = () => {
    onConfirm({
      skipAnnouncement: !announce,
      announcementSubject:
        announce && subject.trim() && subject.trim() !== defaultSubject
          ? subject.trim()
          : undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={isPublishing ? () => undefined : onOpenChange}
    >
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Sparkles className='text-primary h-4 w-4' />
            Ready to publish?
          </DialogTitle>
          <DialogDescription>
            We&apos;ll publish your hackathon and optionally send a launch
            announcement to interested users.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex items-start justify-between gap-4 rounded-lg border border-gray-900 bg-gray-950/40 p-4'>
            <div className='flex min-w-0 items-start gap-3'>
              <div className='bg-primary/15 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg'>
                <Megaphone className='text-primary h-4 w-4' />
              </div>
              <div className='min-w-0'>
                <Label
                  htmlFor='announce-switch'
                  className='text-sm font-medium text-white'
                >
                  Send launch announcement
                </Label>
                <p className='mt-1 text-xs text-gray-400'>
                  Email to followers, hackathon-tag subscribers, and active
                  Boundless users (de-duplicated, frequency-capped).
                </p>
                <div className='mt-2 flex items-center gap-1.5 text-xs text-gray-500'>
                  <Users className='h-3.5 w-3.5' />
                  {audienceLoading ? (
                    <span className='inline-flex items-center gap-1'>
                      <Loader2 className='h-3 w-3 animate-spin' />
                      Estimating reach…
                    </span>
                  ) : audienceSize === null ? (
                    <span>Audience preview unavailable</span>
                  ) : (
                    <span>
                      {audienceSize.toLocaleString()} eligible recipients
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Switch
              id='announce-switch'
              checked={announce}
              onCheckedChange={setAnnounce}
              disabled={isPublishing}
            />
          </div>

          {announce && (
            <div className='space-y-2'>
              <Label htmlFor='subject' className='text-xs text-gray-400'>
                Email subject (optional)
              </Label>
              <Input
                id='subject'
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder={defaultSubject}
                maxLength={120}
                disabled={isPublishing}
              />
              <p className='text-[11px] text-gray-500'>
                {subject.length === 0
                  ? `Default: "${defaultSubject}"`
                  : `${subject.length}/120 characters`}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isPublishing}
          >
            Cancel
          </Button>
          <Button type='button' onClick={handleConfirm} disabled={isPublishing}>
            {isPublishing ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Publishing…
              </>
            ) : announce ? (
              'Publish & announce'
            ) : (
              'Publish quietly'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
