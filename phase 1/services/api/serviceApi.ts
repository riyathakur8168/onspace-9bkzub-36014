import { apiRequest } from './client';

export interface BackendService {
  id: number;
  code: string;
  name: string;
  category: string;
  description?: string;
  default_price: number;
  worker_share_percentage: number;
  is_active: boolean;
}

export interface BackendSkill {
  id: number;
  code: string;
  name: string;
  category: string;
  description?: string;
  base_price: number;
  is_active: boolean;
}

export const serviceApi = {
  async getServices(category?: string) {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return await apiRequest<BackendService[]>(`/api/services${query}`, {
      method: 'GET',
    });
  },

  async getServiceById(id: number) {
    return await apiRequest<BackendService>(`/api/services/${id}`, {
      method: 'GET',
    });
  },

  async getSkills() {
    return await apiRequest<BackendSkill[]>('/api/services/skills/list', {
      method: 'GET',
    });
  },
};
