import { apiRequest } from './client';

export interface BackendServiceRequest {
  id: number;
  customer_id: number;
  service_id?: number;
  service_label: string;
  issue_description: string;
  address: string;
  city: string;
  pincode?: string;
  locality?: string;
  preferred_slot?: string;
  status: string;
  service_value: number;
  worker_share: number;
  otp_code?: string;
  created_at: string;
  updated_at: string;
}

export const requestApi = {
  async createRequest(data: {
    service_id?: number;
    service_label: string;
    issue_description: string;
    address: string;
    city: string;
    pincode?: string;
    locality?: string;
    preferred_slot?: string;
  }) {
    return await apiRequest<BackendServiceRequest>('/api/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMyRequests() {
    return await apiRequest<BackendServiceRequest[]>('/api/requests', {
      method: 'GET',
    });
  },

  async getRequestById(id: number) {
    return await apiRequest<BackendServiceRequest>(`/api/requests/${id}`, {
      method: 'GET',
    });
  },

  async cancelRequest(id: number) {
    return await apiRequest<BackendServiceRequest>(`/api/requests/${id}/cancel`, {
      method: 'POST',
    });
  },
};
