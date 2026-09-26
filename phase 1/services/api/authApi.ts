import { apiRequest } from './client';
import { setStoredToken, removeStoredToken } from './tokenStorage';

export interface BackendUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'customer' | 'worker' | 'admin';
  is_active: boolean;
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
  async register(data: { name: string; email: string; phone?: string; password: string; role: string }) {
    const res = await apiRequest<{ message: string; user: BackendUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
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
  }
};
