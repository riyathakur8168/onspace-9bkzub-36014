import { apiRequest } from './client';
import { BackendServiceRequest } from './requestApi';

export interface BackendBookingStatusHistory {
  id: number;
  booking_id: number;
  previous_status?: string;
  new_status: string;
  note?: string;
  timestamp: string;
}

export interface BackendBooking {
  id: number;
  request_id: number;
  customer_id: number;
  worker_id: number;
  status: string;
  otp_code?: string;
  otp_verified_at?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  request?: BackendServiceRequest;
  history?: BackendBookingStatusHistory[];
}

export const bookingApi = {
  async getMyBookings() {
    return await apiRequest<BackendBooking[]>('/api/bookings', {
      method: 'GET',
    });
  },

  async getBookingById(id: number) {
    return await apiRequest<BackendBooking>(`/api/bookings/${id}`, {
      method: 'GET',
    });
  },

  async markArrived(bookingId: number) {
    return await apiRequest<BackendBooking>(`/api/bookings/${bookingId}/arrive`, {
      method: 'POST',
    });
  },

  async startBookingWithOTP(bookingId: number, otp_code: string) {
    return await apiRequest<BackendBooking>(`/api/bookings/${bookingId}/start`, {
      method: 'POST',
      body: JSON.stringify({ otp_code }),
    });
  },

  async completeBooking(bookingId: number) {
    return await apiRequest<BackendBooking>(`/api/bookings/${bookingId}/complete`, {
      method: 'POST',
    });
  },

  async cancelBooking(bookingId: number) {
    return await apiRequest<BackendBooking>(`/api/bookings/${bookingId}/cancel`, {
      method: 'POST',
    });
  },
};
