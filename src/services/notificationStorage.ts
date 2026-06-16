import { Notification } from '../types';

const STORAGE_KEY = 'notifications';

export const notificationStorage = {
  getAll(): Notification[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Notification[];
    } catch {
      return [];
    }
  },

  saveAll(notifications: Notification[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  },

  add(notification: Notification): void {
    const all = this.getAll();
    if (!all.some(n => n.id === notification.id)) {
      all.push({ ...notification, sincronizado: notification.sincronizado ?? false });
      this.saveAll(all);
    }
  },

  update(id: string, updates: Partial<Notification>): void {
    const all = this.getAll();
    const index = all.findIndex(n => n.id === id);
    if (index !== -1) {
      all[index] = { ...all[index], ...updates };
      this.saveAll(all);
    }
  },

  markAsRead(id: string): void {
    this.update(id, { leida: true, sincronizado: false });
  },

  markAllAsRead(): void {
    const all = this.getAll();
    const updated = all.map(n => n.leida ? n : { ...n, leida: true, sincronizado: false });
    this.saveAll(updated);
  },

  getUnread(): Notification[] {
    return this.getAll().filter(n => !n.leida);
  },

  getUnreadCount(): number {
    return this.getUnread().length;
  },

  getUnsynced(): Notification[] {
    return this.getAll().filter(n => !n.sincronizado);
  },

  markAsSynced(id: string): void {
    this.update(id, { sincronizado: true });
  }
};
