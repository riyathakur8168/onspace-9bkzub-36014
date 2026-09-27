import { apiRequest } from './client';
import { setStoredToken, removeStoredToken } from './tokenStorage';

export interface BackendUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'customer' | 'worker' | 'admin';
  is_active: boolean;
  email_verified?: boolean;
  aadhaar_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: BackendUser;
}

export const authApi = {
  async register(data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: string;
    session_id?: string;
    aadhaar_number?: string;
  }) {
    const res = await apiRequest<{ message: string; user: BackendUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },

  async requestAadhaarOtp(aadhaarNumber: string, sessionId?: string) {
    return await apiRequest<{
      session_id: string;
      client_id: string;
      message: string;
      aadhaar_verified: boolean;
    }>('/api/auth/aadhaar-otp/request', {
      method: 'POST',
      body: JSON.stringify({ aadhaar_number: aadhaarNumber, session_id: sessionId }),
    });
  },

  async verifyAadhaarOtp(sessionId: string, clientId: string, otp: string) {
    return await apiRequest<{
      session_id: string;
      success: boolean;
      aadhaar_verified: boolean;
      aadhaar_verification_reference: string;
      message: string;
    }>('/api/auth/aadhaar-otp/verify', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, client_id: clientId, otp }),
    });
  },

  async requestPhoneOtp(phone: string, sessionId?: string) {
    return await apiRequest<{
      session_id: string;
      message: string;
      phone_verified: boolean;
      dev_otp?: string;
    }>('/api/auth/phone-otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone, session_id: sessionId }),
    });
  },

  async verifyPhoneOtp(sessionId: string, phone: string, otp: string) {
    return await apiRequest<{
      session_id: string;
      success: boolean;
      phone_verified: boolean;
      message: string;
    }>('/api/auth/phone-otp/verify', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, phone, otp }),
    });
  },

  async requestEmailOtp(email: string, sessionId?: string) {
    return await apiRequest<{
      session_id: string;
      message: string;
      email_verified: boolean;
    }>('/api/auth/email-otp/request', {
      method: 'POST',
      body: JSON.stringify({ email, session_id: sessionId }),
    });
  },

  async verifyEmailOtp(sessionId: string, otp: string) {
    return await apiRequest<{
      session_id: string;
      success: boolean;
      email_verified: boolean;
      message: string;
    }>('/api/auth/email-otp/verify', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, otp }),
    });
  },

  async login(email: string, password: string) {
    const res = await apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.data?.access_token) {
      await setStoredToken(res.data.access_token);
    }
    return res;
  },

  async getMe() {
    const res = await apiRequest<BackendUser>('/api/auth/me', {
      method: 'GET',
    });
    return res;
  },

  async logout() {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    await removeStoredToken();
  },

  async getDevLatestOtp(sessionId: string) {
    return await apiRequest<{
      session_id: string;
      email: string | null;
      email_verified: boolean;
      aadhaar_verified: boolean;
      dev_email_otp: string | null;
      dev_aadhaar_otp: string | null;
      environment: string;
    }>(`/api/auth/dev/latest-otp?session_id=${encodeURIComponent(sessionId)}`, {
      method: 'GET',
    });
  }
};
