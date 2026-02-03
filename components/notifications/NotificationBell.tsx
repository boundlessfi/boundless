'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationDropdown } from './NotificationDropdown';
import { useNotifications } from '@/hooks/useNotifications';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
  limit?: number;
}

export const NotificationBell = ({ className }: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get userId from auth session
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  // Use WebSocket-based notifications hook (only connect if userId is available)
  const { notifications, unreadCount, isConnected, loading, markAllAsRead } =
    useNotifications(userId || undefined);

  // Wrapper for markAllAsRead that uses WebSocket
  const handleMarkAllAsRead = async () => {
    markAllAsRead();
  };

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
          title={
            isConnected
              ? 'Notifications connected'
              : 'Notifications disconnected'
          }
        >
          <Bell className='h-4 w-4' />
          {unreadCount > 0 && (
            <span className='bg-primary absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-black'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {!isConnected && userId && (
            <span className='absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border border-zinc-900 bg-red-500' />
          )}
        </button>
      </DropdownMenuTrigger>
      <NotificationDropdown
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        onNotificationClick={handleNotificationClick}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClose={() => setIsOpen(false)}
      />
    </DropdownMenu>
  );
};
