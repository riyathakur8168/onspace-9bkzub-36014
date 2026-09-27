import { apiRequest } from './client';

export interface BackendWorkerProfile {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  avatar?: string;
  primary_skill: string;
  experience?: string;
  bio?: string;
  service_area?: string;
  father_or_guardian_name?: string;
  dob?: string;
  aadhaar_last4?: string;
  village_or_town?: string;
  district?: string;
  state?: string;
  pincode?: string;
  society_name?: string;
  availability_status: boolean;
  verification_state: string;
  work_slip_status: string;
  skill_certificate_status: string;
  has_skill_certificate_commitment: boolean;
  certificate_commitment_date?: string;
  certificate_deadline_date?: string;
  recent_earnings: number;
  completed_jobs_count: number;
  rating: number;
  admin_approval_status: string;
  rejection_reason?: string;
}

export interface BackendOnboardingStatus {
  dashboard_eligible: boolean;
  verification_state: string;
  work_slip_status: string;
  skill_certificate_status: string;
  has_certificate_commitment: boolean;
  certificate_deadline?: string;
  message: string;
}

export const workerApi = {
  async getMyProfile() {
    return await apiRequest<BackendWorkerProfile>('/api/workers/me', {
      method: 'GET',
    });
  },

  async updateMyProfile(data: Partial<BackendWorkerProfile>) {
    return await apiRequest<BackendWorkerProfile>('/api/workers/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getOnboardingStatus() {
    return await apiRequest<BackendOnboardingStatus>('/api/workers/me/onboarding-status', {
      method: 'GET',
    });
  },

  async uploadWorkSlip(docName: string, docRef: string, fileUri?: string) {
    if (fileUri && (fileUri.startsWith('file://') || fileUri.startsWith('content://') || fileUri.startsWith('ph://'))) {
      const formData = new FormData();
      formData.append('document_name', docName);
      const filename = docName || 'signed_work_slip.pdf';
      const ext = filename.split('.').pop() || 'pdf';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'application/pdf';

      formData.append('file', {
        uri: fileUri,
        name: filename,
        type: mimeType,
      } as any);

      return await apiRequest('/api/workers/me/work-slip', {
        method: 'POST',
        body: formData,
      });
    }

    return await apiRequest('/api/workers/me/work-slip', {
      method: 'POST',
      body: JSON.stringify({ document_name: docName, document_reference: docRef, file_path: fileUri }),
    });
  },

  async uploadSkillCertificate(certName: string, docRef: string, fileUri?: string) {
    if (fileUri && (fileUri.startsWith('file://') || fileUri.startsWith('content://') || fileUri.startsWith('ph://'))) {
      const formData = new FormData();
      formData.append('certificate_name', certName);
      const filename = certName || 'skill_certificate.pdf';
      const ext = filename.split('.').pop() || 'pdf';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'application/pdf';

      formData.append('file', {
        uri: fileUri,
        name: filename,
        type: mimeType,
      } as any);

      return await apiRequest('/api/workers/me/skill-certificate', {
        method: 'POST',
        body: formData,
      });
    }

    return await apiRequest('/api/workers/me/skill-certificate', {
      method: 'POST',
      body: JSON.stringify({ certificate_name: certName, document_reference: docRef, file_path: fileUri }),
    });
  },

  async commitSkillCertificate() {
    return await apiRequest<BackendWorkerProfile>('/api/workers/me/skill-certificate/commit', {
      method: 'POST',
      body: JSON.stringify({ commit: true }),
    });
  },
};
