'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationDropdown } from './NotificationDropdown';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
  limit?: number;
}

export const NotificationBell = ({ className }: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { session } = useAuthContext();
  const userId = session.data?.user?.id;

  const { notifications, unreadCount, isConnected, loading, markAllAsRead } =
    useNotifications(userId || undefined);

  const handleMarkAllAsRead = async () => {
    markAllAsRead();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'relative flex items-center justify-center rounded-lg border border-[#2B2B2B] bg-transparent p-2 text-gray-400 transition-colors hover:border-gray-700 hover:bg-gray-900 hover:text-white',
            className
          )}
          aria-label='Notifications'
        >
          <Bell className='h-4 w-4' />
          {unreadCount > 0 && (
            <span className='bg-primary absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] leading-none font-bold text-black'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {!isConnected && userId && (
            <span className='absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border border-black bg-red-500' />
          )}
        </button>
      </DropdownMenuTrigger>
      <NotificationDropdown
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClose={() => setIsOpen(false)}
      />
    </DropdownMenu>
  );
};
