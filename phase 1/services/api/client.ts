import { getApiEndpoint } from '@/constants/config';
import { getStoredToken } from './tokenStorage';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = getApiEndpoint(endpoint);
  const token = await getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const status = response.status;
    let responseData: any;

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      if (typeof responseData === 'object' && responseData !== null) {
        errorMessage = responseData.detail || responseData.message || JSON.stringify(responseData);
      } else if (typeof responseData === 'string' && responseData.length > 0) {
        errorMessage = responseData;
      }
      return { status, error: errorMessage };
    }

    return { status, data: responseData as T };
  } catch (error: any) {
    console.warn(`[API Client] Network error fetching ${url}:`, error);
    return {
      status: 0,
      error: error?.message || 'Network connection failed. Please check backend status.',
    };
  }
}
