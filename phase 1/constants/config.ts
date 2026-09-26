export const APP_NAME = 'OnePlace';
export const APP_VERSION = '1.0.0';

export const ROLES = {
  CUSTOMER: 'customer',
  WORKER: 'worker',
  ADMIN: 'admin',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const SERVICE_CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing', icon: 'plumbing', color: '#3B82F6' },
  { id: 'electrical', label: 'Electrical', icon: 'electrical-services', color: '#F59E0B' },
  { id: 'carpentry', label: 'Carpentry', icon: 'carpenter', color: '#8B5CF6' },
  { id: 'cleaning', label: 'Cleaning', icon: 'cleaning-services', color: '#10B981' },
  { id: 'appliance', label: 'Appliance', icon: 'home-repair-service', color: '#EF4444' },
  { id: 'painting', label: 'Painting', icon: 'format-paint', color: '#EC4899' },
  { id: 'pest', label: 'Pest Control', icon: 'pest-control', color: '#6B7280' },
  { id: 'ac', label: 'AC Service', icon: 'ac-unit', color: '#06B6D4' },
];

export const JOB_STATES = {
  REQUESTED: 'requested',
  MATCHING: 'matching',
  OFFERED: 'offered',
  ACCEPTED: 'accepted',
  EN_ROUTE: 'en_route',
  ARRIVED: 'arrived',
  STARTED: 'started',
  COMPLETED: 'completed',
  PAYMENT_SETTLED: 'payment_settled',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
} as const;

export const COOPERATIVE_SPLIT = {
  workerShare: 0.85,
  platformShare: 0.15,
};

export const POOL_ALLOCATION = {
  training: 0.30,
  safety: 0.20,
  technology: 0.25,
  welfare: 0.15,
  quality: 0.10,
};

// ==================================================
// DEVELOPMENT API CONFIGURATION
// ==================================================

export const DEFAULT_BACKEND_PORT = 8001;

export function getDevMachineLanIp(): string {
  try {
    const Constants = require('expo-constants');
    const config = Constants.expoConfig || Constants.default?.expoConfig;
    const hostUri = config?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.developer?.tool;
    if (hostUri && typeof hostUri === 'string') {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return ip;
      }
    }
  } catch (err) {
    // Safe fallback for Node script environments
  }
  return '10.72.101.162';
}

export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    if (trimmed.includes('localhost') || trimmed.includes('127.0.0.1')) {
      return trimmed.replace(/localhost|127\.0\.0\.1/g, getDevMachineLanIp());
    }
    return trimmed;
  }
  return `http://${getDevMachineLanIp()}:${DEFAULT_BACKEND_PORT}`;
}

export function getApiEndpoint(path: string): string {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

