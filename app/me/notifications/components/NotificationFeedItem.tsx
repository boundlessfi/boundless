'use client';

import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types/notifications';
import { getNotificationIcon } from '@/components/notifications/NotificationIcon';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationFeedItemProps {
  notification: Notification;
  onClick: () => void;
  isMarkingAll: boolean;
}

export const NotificationFeedItem = ({
  notification,
  onClick,
  isMarkingAll,
}: NotificationFeedItemProps) => {
  const Icon = getNotificationIcon(notification.type);
  const isUnread = !notification.read;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-start gap-4 p-4 text-left transition-all duration-200',
        isUnread ? 'bg-primary/3 hover:bg-primary/6' : 'hover:bg-zinc-900/40'
      )}
      aria-label={`${isUnread ? 'Unread: ' : ''}${notification.title}`}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors',
          isUnread
            ? 'border-primary/20 bg-primary/10 text-primary'
            : 'border-zinc-800 bg-zinc-900 text-zinc-500 group-hover:text-zinc-400'
        )}
      >
        <Icon className='h-5 w-5' />
      </div>

      {/* Content */}
      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-2'>
          <h4
            className={cn(
              'text-sm leading-snug',
              isUnread
                ? 'font-semibold text-zinc-100'
                : 'font-normal text-zinc-400 group-hover:text-zinc-300'
            )}
          >
            {notification.title}
          </h4>
          <span className='shrink-0 text-[10px] whitespace-nowrap text-zinc-600'>
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        <p
          className={cn(
            'mt-0.5 line-clamp-2 text-xs leading-relaxed',
            isUnread ? 'text-zinc-400' : 'text-zinc-600'
          )}
        >
          {notification.message}
        </p>

        {notification.data?.amount != null && (
          <div className='mt-1.5 inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400'>
            <span>$</span>
            <span>{notification.data?.amount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Unread indicator */}
      <AnimatePresence>
        {isUnread && !isMarkingAll && (
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='bg-primary absolute top-1/2 right-3 h-2 w-2 -translate-y-1/2 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.4)]'
            aria-hidden='true'
          />
        )}
      </AnimatePresence>
    </button>
  );
};
