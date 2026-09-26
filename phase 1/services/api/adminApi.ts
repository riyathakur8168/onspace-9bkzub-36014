import { apiRequest } from './client';
import { BackendWorkerProfile } from './workerApi';

export interface BackendAdminDashboardSummary {
  total_users: number;
  total_customers: number;
  total_workers: number;
  pending_verifications: number;
  total_requests: number;
  active_bookings: number;
  completed_bookings: number;
  total_revenue: number;
}

export interface BackendAuditLog {
  id: number;
  actor_id?: number;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata_json?: string;
  ip_address?: string;
  created_at: string;
}

export const adminApi = {
  async getDashboardSummary() {
    return await apiRequest<BackendAdminDashboardSummary>('/api/admin/dashboard', {
      method: 'GET',
    });
  },

  async getAllWorkers() {
    return await apiRequest<BackendWorkerProfile[]>('/api/admin/workers', {
      method: 'GET',
    });
  },

  async getWorkerDetail(workerId: number) {
    return await apiRequest<BackendWorkerProfile>(`/api/admin/workers/${workerId}`, {
      method: 'GET',
    });
  },

  async reviewWorkSlip(workerId: number, action: 'approve' | 'reject', rejection_reason?: string) {
    return await apiRequest(`/api/admin/workers/${workerId}/work-slip/review`, {
      method: 'POST',
      body: JSON.stringify({ action, rejection_reason }),
    });
  },

  async reviewSkillCertificate(workerId: number, action: 'approve' | 'reject', rejection_reason?: string) {
    return await apiRequest(`/api/admin/workers/${workerId}/certificate/review`, {
      method: 'POST',
      body: JSON.stringify({ action, rejection_reason }),
    });
  },

  async getAuditLogs() {
    return await apiRequest<BackendAuditLog[]>('/api/admin/audit-logs', {
      method: 'GET',
    });
  },
};
