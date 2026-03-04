'use client';

import { Notification } from '@/types/notifications';
import BoundlessSheet from '@/components/sheet/boundless-sheet';
import { getNotificationIcon } from '@/components/notifications/NotificationIcon';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NotificationDetailSheetProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const metadataLabels: Record<string, string> = {
  organizationName: 'Organization',
  hackathonName: 'Hackathon',
  projectName: 'Project',
  memberEmail: 'Member',
  role: 'Role',
  oldRole: 'Previous Role',
  newRole: 'New Role',
  oldStatus: 'Previous Status',
  newStatus: 'New Status',
  submissionStatus: 'Submission Status',
  deadlineType: 'Deadline',
  amount: 'Amount',
  transactionHash: 'Transaction',
};

export const NotificationDetailSheet = ({
  notification,
  open,
  onOpenChange,
}: NotificationDetailSheetProps) => {
  if (!notification) return null;

  const Icon = getNotificationIcon(notification.type);
  const createdAt = new Date(notification.createdAt);

  const metadata = Object.entries(notification.data).filter(
    ([key, value]) =>
      value !== undefined &&
      value !== null &&
      key in metadataLabels &&
      key !== 'organizationId' &&
      key !== 'hackathonId' &&
      key !== 'projectId' &&
      key !== 'commentId' &&
      key !== 'milestoneId' &&
      key !== 'teamInvitationId' &&
      key !== 'hackathonSlug'
  );

  return (
    <BoundlessSheet
      open={open}
      setOpen={onOpenChange}
      title='Notification Details'
      size='default'
    >
      <div className='px-6 pb-8 md:px-12'>
        {/* Notification header */}
        <div className='flex items-start gap-4 pt-2'>
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border',
              !notification.read
                ? 'border-primary/20 bg-primary/10 text-primary'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400'
            )}
          >
            <Icon className='h-6 w-6' />
          </div>
          <div className='min-w-0 flex-1'>
            <h3 className='text-lg font-semibold text-white'>
              {notification.title}
            </h3>
            <div className='mt-1 flex items-center gap-2 text-xs text-zinc-500'>
              <time dateTime={notification.createdAt}>
                {format(createdAt, 'MMM d, yyyy · h:mm a')}
              </time>
              <span className='text-zinc-700'>·</span>
              <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
            </div>
          </div>
          <Badge
            variant={notification.read ? 'outline' : 'default'}
            className={cn(
              'shrink-0 text-[10px]',
              notification.read
                ? 'border-zinc-800 text-zinc-500'
                : 'bg-primary/20 text-primary border-primary/30'
            )}
          >
            {notification.read ? 'Read' : 'Unread'}
          </Badge>
        </div>

        {/* Divider */}
        <div className='my-6 border-t border-zinc-800/50' />

        {/* Message body */}
        <div className='rounded-lg border border-zinc-800/30 bg-zinc-900/30 p-5'>
          <p className='text-sm leading-relaxed text-zinc-300'>
            {notification.message}
          </p>
        </div>

        {/* Metadata */}
        {metadata.length > 0 && (
          <div className='mt-6'>
            <h4 className='mb-3 text-xs font-semibold tracking-widest text-zinc-500 uppercase'>
              Details
            </h4>
            <div className='space-y-2'>
              {metadata.map(([key, value]) => (
                <div
                  key={key}
                  className='flex items-center justify-between rounded-lg border border-zinc-800/20 bg-zinc-900/20 px-4 py-2.5'
                >
                  <span className='text-xs text-zinc-500'>
                    {metadataLabels[key] || key}
                  </span>
                  <span className='text-sm font-medium text-zinc-300'>
                    {key === 'amount'
                      ? `$${(value as number).toLocaleString()}`
                      : key === 'transactionHash'
                        ? `${String(value).slice(0, 8)}...${String(value).slice(-6)}`
                        : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Type tag */}
        <div className='mt-6'>
          <span className='inline-flex rounded-full border border-zinc-800/50 bg-zinc-900/50 px-3 py-1 text-[10px] font-medium tracking-wider text-zinc-500'>
            {notification.type.replace(/_/g, ' ')}
          </span>
        </div>
      </div>
    </BoundlessSheet>
  );
};
