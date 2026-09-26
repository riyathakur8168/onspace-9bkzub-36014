import { apiRequest } from './client';
import { BackendServiceRequest } from './requestApi';

export interface BackendWorkerOffer {
  id: number;
  request_id: number;
  worker_id: number;
  status: string;
  offered_at: string;
  responded_at?: string;
  matching_score: number;
  selection_reason?: string;
  request?: BackendServiceRequest;
}

export const offerApi = {
  async getMyOffers() {
    return await apiRequest<BackendWorkerOffer[]>('/api/worker/offers', {
      method: 'GET',
    });
  },

  async acceptOffer(offerId: number) {
    return await apiRequest(`/api/worker/offers/${offerId}/accept`, {
      method: 'POST',
    });
  },

  async rejectOffer(offerId: number) {
    return await apiRequest(`/api/worker/offers/${offerId}/reject`, {
      method: 'POST',
    });
  },
};
