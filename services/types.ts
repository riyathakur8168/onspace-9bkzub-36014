export type UserRole = 'customer' | 'worker' | 'admin';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  skills: string[];
  serviceArea: string;
  rating: number;
  completedJobs: number;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  isAvailable: boolean;
  recentJobCount: number;
  recentEarnings: number;
  availableHours: number;
  joinedDate: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  address: string;
  totalBookings: number;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  category: string;
  subcategory: string;
  description: string;
  urgency: 'normal' | 'urgent';
  preferredDate: string;
  preferredTime: string;
  estimatedValue: number;
  status: 'matching' | 'offered' | 'accepted' | 'cancelled';
  createdAt: string;
}

export interface BookingStatusEntry {
  status: string;
  timestamp: string;
  note: string;
}

export interface Booking {
  id: string;
  requestId: string;
  workerId: string;
  workerName: string;
  workerAvatar: string;
  workerPhone: string;
  workerRating: number;
  customerId: string;
  category: string;
  subcategory: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  status: 'accepted' | 'en_route' | 'arrived' | 'started' | 'completed' | 'cancelled';
  serviceValue: number;
  workerShare: number;
  cooperativePool: number;
  otp: string;
  statusHistory: BookingStatusEntry[];
  rating?: number;
  review?: string;
}

export interface LedgerEntry {
  id: string;
  bookingId: string;
  date: string;
  category: string;
  subcategory: string;
  serviceValue: number;
  workerShare: number;
  cooperativeContribution: number;
  status: 'paid' | 'pending' | 'processing';
  payoutDate?: string;
}

export interface AdminMetrics {
  totalActiveJobs: number;
  pendingVerifications: number;
  totalWorkers: number;
  activeWorkers: number;
  weeklyGMV: number;
  weeklyJobsCompleted: number;
  disputesPending: number;
  topConcentration: number;
  workerOfferRate: number;
  avgJobsPerWorker: number;
}
