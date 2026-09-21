import { create } from 'zustand';

type NotificationStore = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  setUnreadCount: (unreadCount) => set({ unreadCount }),
}));

export const selectUnreadCount = (state: NotificationStore): number => state.unreadCount;
