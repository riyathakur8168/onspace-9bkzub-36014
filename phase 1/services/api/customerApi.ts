import { apiRequest } from './client';

export interface BackendCustomerProfile {
  id: number;
  user_id: number;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  profile_completion_state: string;
  created_at: string;
  updated_at: string;
}

export const customerApi = {
  async getMyProfile() {
    return await apiRequest<BackendCustomerProfile>('/api/customers/me', {
      method: 'GET',
    });
  },

  async updateMyProfile(data: Partial<BackendCustomerProfile>) {
    return await apiRequest<BackendCustomerProfile>('/api/customers/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
