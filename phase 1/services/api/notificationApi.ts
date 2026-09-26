import { apiRequest } from './client';

export interface BackendNotification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string;
  data_json?: string;
  is_read: boolean;
  created_at: string;
}

export const notificationApi = {
  async getMyNotifications() {
    return await apiRequest<BackendNotification[]>('/api/notifications', {
      method: 'GET',
    });
  },

  async markAsRead(notificationId: number) {
    return await apiRequest<BackendNotification>(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },

  async markAllAsRead() {
    return await apiRequest('/api/notifications/read-all', {
      method: 'POST',
    });
  },
};
