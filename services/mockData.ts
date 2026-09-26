export type UserRole = 'customer' | 'worker' | 'admin';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  verified?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  basePrice: number;
  unit: string;
}

export interface JobOffer {
  id: string;
  serviceCategory: string;
  serviceIcon: string;
  issueTitle: string;
  issueDescription: string;
  customerArea: string;
  distanceKm: number;
  travelMinutes: number;
  scheduledDate: string;
  scheduledSlot: string;
  serviceValue: number;
  workerShare: number;
  cooperativePool: number;
  eligibilityReason: string;
  urgency: 'normal' | 'urgent';
  expiresInMinutes: number;
  status: 'pending' | 'accepted' | 'declined';
}

export interface Booking {
  id: string;
  bookingRef: string;
  serviceCategory: string;
  serviceIcon: string;
  issueTitle: string;
  workerName?: string;
  workerPhone?: string;
  workerRating?: number;
  workerJobsCompleted?: number;
  workerVerified?: boolean;
  customerName?: string;
  address: string;
  scheduledDate: string;
  scheduledSlot: string;
  serviceValue: number;
  workerShare?: number;
  status: 'matching' | 'confirmed' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  otp?: string;
  completionOtp?: string;
  createdAt: string;
}

export interface EarningsEntry {
  id: string;
  bookingRef: string;
  serviceCategory: string;
  serviceIcon: string;
  customerArea: string;
  completedDate: string;
  serviceValue: number;
  workerShare: number;
  cooperativePool: number;
  payoutStatus: 'pending' | 'processing' | 'paid';
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  skills: string[];
  serviceArea: string;
  rating: number;
  jobsCompleted: number;
  recentEarnings: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  availabilityStatus: 'available' | 'busy' | 'offline';
  joinedDate: string;
}

export const MOCK_USERS: MockUser[] = [
  { id: 'c1', name: 'Priya Mehra', email: 'priya@example.com', phone: '+91 98765 43210', role: 'customer', verified: true },
  { id: 'w1', name: 'Suresh Patel', email: 'suresh@example.com', phone: '+91 87654 32109', role: 'worker', verified: true },
  { id: 'a1', name: 'Admin User', email: 'admin@oneplace.in', phone: '+91 99999 00000', role: 'admin', verified: true },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'plumbing', name: 'Plumbing', icon: 'plumbing', color: '#0D7B6B', description: 'Pipe repairs, leaks, installations', basePrice: 299, unit: 'visit' },
  { id: 'electrical', name: 'Electrical', icon: 'electrical-services', color: '#F59E0B', description: 'Wiring, switchboards, fixtures', basePrice: 349, unit: 'visit' },
  { id: 'carpentry', name: 'Carpentry', icon: 'carpenter', color: '#92400E', description: 'Furniture, doors, wood repairs', basePrice: 399, unit: 'visit' },
  { id: 'cleaning', name: 'Cleaning', icon: 'cleaning-services', color: '#7C3AED', description: 'Deep clean, regular, post-renovation', basePrice: 499, unit: 'session' },
  { id: 'appliance', name: 'Appliance Repair', icon: 'build', color: '#1D4ED8', description: 'AC, washing machine, fridge', basePrice: 449, unit: 'visit' },
  { id: 'painting', name: 'Painting', icon: 'format-paint', color: '#DB2777', description: 'Interior, exterior, touch-up', basePrice: 599, unit: 'session' },
];

export const MOCK_JOB_OFFERS: JobOffer[] = [
  {
    id: 'jo1',
    serviceCategory: 'Electrical',
    serviceIcon: 'electrical-services',
    issueTitle: 'Switchboard sparking',
    issueDescription: 'Main switchboard in living room is sparking when switching on the AC. Needs urgent attention.',
    customerArea: 'Koramangala 5th Block',
    distanceKm: 2.4,
    travelMinutes: 12,
    scheduledDate: 'Today',
    scheduledSlot: '2:00 PM – 4:00 PM',
    serviceValue: 650,
    workerShare: 552,
    cooperativePool: 98,
    eligibilityReason: 'Matched to your electrical skill · 2.4 km away · Your recent workload is lower than other eligible workers',
    urgency: 'urgent',
    expiresInMinutes: 8,
    status: 'pending',
  },
  {
    id: 'jo2',
    serviceCategory: 'Plumbing',
    serviceIcon: 'plumbing',
    issueTitle: 'Kitchen tap leaking',
    issueDescription: 'Kitchen tap has been dripping constantly for 3 days. Needs replacement or repair.',
    customerArea: 'HSR Layout Sector 1',
    distanceKm: 4.1,
    travelMinutes: 18,
    scheduledDate: 'Tomorrow',
    scheduledSlot: '10:00 AM – 12:00 PM',
    serviceValue: 420,
    workerShare: 357,
    cooperativePool: 63,
    eligibilityReason: 'Matched to your plumbing skill · 4.1 km away · Available at requested time',
    urgency: 'normal',
    expiresInMinutes: 30,
    status: 'pending',
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    bookingRef: 'OP-2024-0847',
    serviceCategory: 'Electrical',
    serviceIcon: 'electrical-services',
    issueTitle: 'Switchboard sparking',
    workerName: 'Suresh Patel',
    workerPhone: '+91 87654 32109',
    workerRating: 4.8,
    workerJobsCompleted: 127,
    workerVerified: true,
    address: '23, 5th Block, Koramangala, Bengaluru 560095',
    scheduledDate: 'Today',
    scheduledSlot: '2:00 PM – 4:00 PM',
    serviceValue: 650,
    workerShare: 552,
    status: 'confirmed',
    otp: '7294',
    createdAt: '2024-09-26T10:30:00Z',
  },
  {
    id: 'b2',
    bookingRef: 'OP-2024-0821',
    serviceCategory: 'Plumbing',
    serviceIcon: 'plumbing',
    issueTitle: 'Bathroom pipe blockage',
    workerName: 'Rajesh Kumar',
    workerPhone: '+91 76543 21098',
    workerRating: 4.6,
    workerJobsCompleted: 89,
    workerVerified: true,
    address: '45, HSR Layout, Bengaluru 560102',
    scheduledDate: '24 Sep 2024',
    scheduledSlot: '11:00 AM – 1:00 PM',
    serviceValue: 380,
    workerShare: 323,
    status: 'completed',
    createdAt: '2024-09-24T09:00:00Z',
  },
];

export const MOCK_EARNINGS: EarningsEntry[] = [
  {
    id: 'e1',
    bookingRef: 'OP-2024-0821',
    serviceCategory: 'Plumbing',
    serviceIcon: 'plumbing',
    customerArea: 'HSR Layout',
    completedDate: '24 Sep 2024',
    serviceValue: 380,
    workerShare: 323,
    cooperativePool: 57,
    payoutStatus: 'paid',
  },
  {
    id: 'e2',
    bookingRef: 'OP-2024-0798',
    serviceCategory: 'Electrical',
    serviceIcon: 'electrical-services',
    customerArea: 'Indiranagar',
    completedDate: '22 Sep 2024',
    serviceValue: 520,
    workerShare: 442,
    cooperativePool: 78,
    payoutStatus: 'paid',
  },
  {
    id: 'e3',
    bookingRef: 'OP-2024-0775',
    serviceCategory: 'Electrical',
    serviceIcon: 'electrical-services',
    customerArea: 'Koramangala',
    completedDate: '20 Sep 2024',
    serviceValue: 890,
    workerShare: 757,
    cooperativePool: 133,
    payoutStatus: 'processing',
  },
];

export const MOCK_WORKERS: Worker[] = [
  { id: 'w1', name: 'Suresh Patel', phone: '+91 87654 32109', skills: ['Electrical', 'Appliance Repair'], serviceArea: 'Koramangala, HSR Layout', rating: 4.8, jobsCompleted: 127, recentEarnings: 18450, verificationStatus: 'verified', availabilityStatus: 'available', joinedDate: 'Jan 2024' },
  { id: 'w2', name: 'Rajesh Kumar', phone: '+91 76543 21098', skills: ['Plumbing'], serviceArea: 'HSR Layout, BTM', rating: 4.6, jobsCompleted: 89, recentEarnings: 12300, verificationStatus: 'verified', availabilityStatus: 'busy', joinedDate: 'Mar 2024' },
  { id: 'w3', name: 'Anand Sharma', phone: '+91 65432 10987', skills: ['Carpentry', 'Painting'], serviceArea: 'Indiranagar, Whitefield', rating: 4.5, jobsCompleted: 54, recentEarnings: 9870, verificationStatus: 'verified', availabilityStatus: 'available', joinedDate: 'May 2024' },
  { id: 'w4', name: 'Mohammed Rafi', phone: '+91 54321 09876', skills: ['Cleaning'], serviceArea: 'MG Road, Richmond Town', rating: 0, jobsCompleted: 0, recentEarnings: 0, verificationStatus: 'pending', availabilityStatus: 'offline', joinedDate: 'Sep 2024' },
];
