'use client';

import { Notification } from '@/types/notifications';
import { NotificationFeedItem } from './NotificationFeedItem';
import { motion, AnimatePresence } from 'motion/react';
import { Archive, Bell, Inbox } from 'lucide-react';

interface NotificationSectionProps {
  title: string;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  isMarkingAll: boolean;
  emptyMessage: string;
  emptySubMessage: string;
}

const sectionIcons: Record<string, typeof Bell> = {
  New: Bell,
  Earlier: Inbox,
  Archived: Archive,
};

export const NotificationSection = ({
  title,
  notifications,
  onNotificationClick,
  isMarkingAll,
  emptyMessage,
  emptySubMessage,
}: NotificationSectionProps) => {
  const Icon = sectionIcons[title] ?? Bell;

  return (
    <section aria-label={`${title} notifications`}>
      <div className='mb-3 flex items-center gap-2'>
        <Icon className='h-4 w-4 text-zinc-500' />
        <h2 className='text-xs font-semibold tracking-widest text-zinc-500 uppercase'>
          {title}
        </h2>
        {notifications.length > 0 && (
          <span className='rounded-full bg-zinc-800/60 px-2 py-0.5 text-[10px] font-medium text-zinc-400'>
            {notifications.length}
          </span>
        )}
      </div>

      <div className='rounded-xl border border-zinc-800/30'>
        {notifications.length === 0 ? (
          <div className='py-8 text-center'>
            <p className='text-sm text-zinc-400'>{emptyMessage}</p>
            <p className='mt-1 text-xs text-zinc-600'>{emptySubMessage}</p>
          </div>
        ) : (
          <AnimatePresence mode='sync'>
            <div className='divide-y divide-zinc-800/30'>
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 1 }}
                  animate={{
                    opacity: isMarkingAll && !notification.read ? 0.5 : 1,
                  }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  layout
                >
                  <NotificationFeedItem
                    notification={notification}
                    onClick={() => onNotificationClick(notification)}
                    isMarkingAll={isMarkingAll}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
};
