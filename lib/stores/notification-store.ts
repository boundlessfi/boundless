import { create } from 'zustand';

interface NotificationStore {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: (by?: number) => void;
  clearUnreadCount: () => void;
}

export const useNotificationStore = create<NotificationStore>(set => ({
  unreadCount: 0,
  setUnreadCount: count => set({ unreadCount: count }),
  decrementUnreadCount: (by = 1) =>
    set(state => ({ unreadCount: Math.max(0, state.unreadCount - by) })),
  clearUnreadCount: () => set({ unreadCount: 0 }),
}));
