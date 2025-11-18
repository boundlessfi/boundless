'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationDropdown } from './NotificationDropdown';
import { useNotifications } from '@/hooks/use-notifications';
import { useNotificationPolling } from '@/hooks/use-notification-polling';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
  limit?: number;
}

export const NotificationBell = ({
  className,
  limit = 10,
}: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const notificationsHook = useNotifications({
    page: 1,
    limit,
    autoFetch: true,
  });

  const { notifications, unreadCount, loading, markAllAsRead } =
    notificationsHook;

  // Enable polling when dropdown is open or when there are unread notifications
  useNotificationPolling(notificationsHook, {
    interval: 30000, // 30 seconds
    enabled: isOpen || unreadCount > 0,
  });

  const handleNotificationClick = () => {
    // Notification click is handled in NotificationDropdown
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'relative flex items-center justify-center rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-2 text-zinc-400 transition-all hover:border-zinc-700 hover:bg-zinc-900/50 hover:text-white',
            className
          )}
          aria-label='Notifications'
        >
          <Bell className='h-4 w-4' />
          {unreadCount > 0 && (
            <span className='bg-primary absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-black'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <NotificationDropdown
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        onNotificationClick={handleNotificationClick}
        onMarkAllAsRead={markAllAsRead}
        onClose={() => setIsOpen(false)}
      />
    </DropdownMenu>
  );
};
