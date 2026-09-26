import { COOPERATIVE_SPLIT } from '@/constants/config';

export type VerificationState =
  | 'PROFILE_CREATED'
  | 'VERIFICATION_PENDING'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'RE_UPLOAD_REQUIRED';

export interface VerificationDocument {
  name: string;
  uri: string;
  uploadedAt: string;
  status: string;
}

export interface Worker {
  id: string;
  name: string;
  avatar: string;
  primaryCategory: string;
  primarySkillId?: string;
  skills: string[];
  rating: number;
  completedJobs: number;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  adminApprovalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
  adminRejectionReason?: string;
  adminApprovedAt?: string;
  verificationState?: VerificationState;
  verificationDocument?: VerificationDocument | null;
  workSlipDocument?: VerificationDocument | null;
  skillCertificateDocument?: VerificationDocument | null;
  hasSkillCertificateCommitment?: boolean;
  certificateCommitmentDate?: string;
  certificateDeadlineDate?: string;
  workSlipStatus?: 'not_uploaded' | 'uploaded' | 'under_review' | 'approved' | 're_upload_required';
  skillCertificateStatus?: 'not_submitted' | 'pending' | 'uploaded' | 'under_review' | 'verified' | 'rejected';
  fatherOrGuardianName?: string;
  dob?: string;
  aadhaarLast4?: string;
  villageOrTown?: string;
  district?: string;
  state?: string;
  pincode?: string;
  societyName?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  availabilityStatus: boolean;
  serviceArea: string;
  recentEarnings: number;
  allocationScore?: number;
  allocationReason?: string;
  phone: string;
  joinedDate: string;
}

export function normalizeCategory(catOrLabel?: string): string {
  if (!catOrLabel) return '';
  const lower = catOrLabel.toLowerCase().trim();
  if (lower.includes('plumb') || lower.includes('pipe')) return 'plumbing';
  if (lower.includes('electr') || lower.includes('wiring') || lower.includes('switch')) return 'electrical';
  if (lower.includes('carpent') || lower.includes('furnit')) return 'carpentry';
  if (lower.includes('clean')) return 'cleaning';
  if (lower.includes('pest')) return 'pest';
  if (lower.includes('ac') || lower.includes('air cond')) return 'ac';
  if (lower.includes('paint')) return 'painting';
  if (lower.includes('appliance')) return 'appliance';
  return lower;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  serviceId: string;
  serviceLabel: string;
  issueDescription: string;
  address: string;
  preferredSlot: string;
  status: string;
  serviceValue: number;
  workerShare: number;
  createdAt: string;
  assignedWorker?: Worker;
  otpCode?: string;
}

export interface JobOffer {
  id: string;
  requestId: string;
  serviceLabel: string;
  issueDescription: string;
  customerArea: string;
  distance: string;
  travelTime: string;
  scheduledSlot: string;
  serviceValue: number;
  workerShare: number;
  cooperativeContribution: number;
  allocationReason: string;
  expiresInSeconds: number;
  status: 'pending' | 'accepted' | 'declined';
  urgency: 'normal' | 'urgent';
}

export interface EarningsEntry {
  id: string;
  jobId: string;
  serviceLabel: string;
  date: string;
  grossServiceValue: number;
  workerShare: number;
  cooperativeContribution: number;
  netPayout: number;
  status: 'settled' | 'pending' | 'processing';
  customerName: string;
}

export const MOCK_WORKERS: Worker[] = [
  {
    id: 'w1',
    name: 'Rajesh Kumar',
    avatar: 'RK',
    primaryCategory: 'plumbing',
    primarySkillId: 'plumbing',
    skills: ['Plumbing', 'Pipe Fitting', 'Tap Repair'],
    rating: 4.8,
    completedJobs: 127,
    verificationStatus: 'verified',
    adminApprovalStatus: 'APPROVED',
    adminApprovedAt: '2025-01-15T10:00:00Z',
    verificationState: 'VERIFIED',
    workSlipStatus: 'approved',
    skillCertificateStatus: 'verified',
    workSlipDocument: { name: 'work_slip_rajesh.pdf', uri: 'file:///mock/work_slip.pdf', uploadedAt: '2025-01-15', status: 'Approved' },
    skillCertificateDocument: { name: 'iti_plumbing_cert.pdf', uri: 'file:///mock/iti_cert.pdf', uploadedAt: '2025-01-15', status: 'Verified' },
    availabilityStatus: true,
    serviceArea: 'Koramangala, Indiranagar',
    recentEarnings: 12400,
    allocationScore: 87,
    allocationReason: 'High skill match, lower recent workload, nearby',
    phone: '+91 98xxx xxxxx',
    joinedDate: 'Jan 2025',
  },
  {
    id: 'w5',
    name: 'Vikram Singh',
    avatar: 'VS',
    primaryCategory: 'plumbing',
    primarySkillId: 'plumbing',
    skills: ['Plumbing', 'Water Tank Installation'],
    rating: 4.9,
    completedJobs: 12,
    verificationStatus: 'verified',
    adminApprovalStatus: 'APPROVED',
    adminApprovedAt: '2026-02-01T10:00:00Z',
    verificationState: 'VERIFIED',
    workSlipStatus: 'approved',
    skillCertificateStatus: 'pending',
    hasSkillCertificateCommitment: true,
    certificateCommitmentDate: new Date().toISOString(),
    certificateDeadlineDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    workSlipDocument: { name: 'work_slip_vikram.pdf', uri: 'file:///mock/work_slip.pdf', uploadedAt: '2026-02-01', status: 'Approved' },
    availabilityStatus: true,
    serviceArea: 'Koramangala, BTM',
    recentEarnings: 0,
    allocationScore: 95,
    allocationReason: 'Primary Plumber match, 0 recent earnings fairness priority',
    phone: '+91 94xxx xxxxx',
    joinedDate: 'Feb 2026',
  },
  {
    id: 'w2',
    name: 'Suresh Patel',
    avatar: 'SP',
    primaryCategory: 'electrical',
    primarySkillId: 'electrical',
    skills: ['Electrical Repair', 'Wiring', 'Switchboard', 'Fan Installation'],
    rating: 4.6,
    completedJobs: 94,
    verificationStatus: 'verified',
    adminApprovalStatus: 'APPROVED',
    adminApprovedAt: '2025-03-10T10:00:00Z',
    verificationState: 'VERIFIED',
    workSlipStatus: 'approved',
    skillCertificateStatus: 'verified',
    workSlipDocument: { name: 'work_slip_suresh.pdf', uri: 'file:///mock/work_slip.pdf', uploadedAt: '2025-03-10', status: 'Approved' },
    skillCertificateDocument: { name: 'electrical_license.pdf', uri: 'file:///mock/license.pdf', uploadedAt: '2025-03-10', status: 'Verified' },
    availabilityStatus: true,
    serviceArea: 'HSR Layout, BTM',
    recentEarnings: 8200,
    allocationScore: 82,
    allocationReason: 'Verified electrical specialist, available, moderate recent load',
    phone: '+91 97xxx xxxxx',
    joinedDate: 'Mar 2025',
  },
  {
    id: 'w6',
    name: 'Amit Verma',
    avatar: 'AV',
    primaryCategory: 'electrical',
    primarySkillId: 'electrical',
    skills: ['Electrical', 'Wiring'],
    rating: 4.7,
    completedJobs: 8,
    verificationStatus: 'verified',
    adminApprovalStatus: 'APPROVED',
    adminApprovedAt: '2026-04-05T10:00:00Z',
    availabilityStatus: true,
    serviceArea: 'Indiranagar, HSR',
    recentEarnings: 0,
    allocationScore: 92,
    allocationReason: 'Primary Electrician match, low recent load priority',
    phone: '+91 93xxx xxxxx',
    joinedDate: 'Apr 2026',
  },
  {
    id: 'w3',
    name: 'Anita Sharma',
    avatar: 'AS',
    primaryCategory: 'cleaning',
    primarySkillId: 'cleaning',
    skills: ['Cleaning', 'Deep Clean', 'Pest Control'],
    rating: 4.9,
    completedJobs: 203,
    verificationStatus: 'verified',
    adminApprovalStatus: 'APPROVED',
    adminApprovedAt: '2024-11-20T10:00:00Z',
    availabilityStatus: false,
    serviceArea: 'Whitefield, Mahadevapura',
    recentEarnings: 18600,
    phone: '+91 96xxx xxxxx',
    joinedDate: 'Nov 2024',
  },
  {
    id: 'w4',
    name: 'Mohan Das',
    avatar: 'MD',
    primaryCategory: 'carpentry',
    primarySkillId: 'carpentry',
    skills: ['Carpentry', 'Furniture Repair'],
    rating: 4.5,
    completedJobs: 56,
    verificationStatus: 'pending',
    adminApprovalStatus: 'PENDING',
    availabilityStatus: true,
    serviceArea: 'Jayanagar, JP Nagar',
    recentEarnings: 5100,
    phone: '+91 95xxx xxxxx',
    joinedDate: 'Aug 2026',
  },
];

export const MOCK_JOB_OFFERS: JobOffer[] = [
  {
    id: 'jo1',
    requestId: 'req1',
    serviceLabel: 'Plumbing — Pipe Leakage',
    issueDescription: 'Kitchen sink pipe leaking under the counter. Water pooling.',
    customerArea: 'Koramangala 5th Block',
    distance: '2.3 km',
    travelTime: '~10 min',
    scheduledSlot: 'Today, 3:00 PM – 5:00 PM',
    serviceValue: 800,
    workerShare: Math.round(800 * COOPERATIVE_SPLIT.workerShare),
    cooperativeContribution: Math.round(800 * COOPERATIVE_SPLIT.platformShare),
    allocationReason: 'You are verified for plumbing, available at this time, within service area, and your recent workload is lower than other eligible workers.',
    expiresInSeconds: 120,
    status: 'pending',
    urgency: 'normal',
  },
  {
    id: 'jo2',
    requestId: 'req2',
    serviceLabel: 'Electrical — Fan Not Working',
    issueDescription: 'Ceiling fan in bedroom stopped working. May need capacitor replacement.',
    customerArea: 'Indiranagar 12th Main',
    distance: '3.8 km',
    travelTime: '~18 min',
    scheduledSlot: 'Tomorrow, 10:00 AM – 12:00 PM',
    serviceValue: 600,
    workerShare: Math.round(600 * COOPERATIVE_SPLIT.workerShare),
    cooperativeContribution: Math.round(600 * COOPERATIVE_SPLIT.platformShare),
    allocationReason: 'Matched to your electrical skill, nearby location, and your recent job count is below the weekly median.',
    expiresInSeconds: 180,
    status: 'pending',
    urgency: 'normal',
  },
];

export const MOCK_EARNINGS: EarningsEntry[] = [
  {
    id: 'e1', jobId: 'j1',
    serviceLabel: 'Plumbing — Bathroom Tap Fix',
    date: 'Today, 2:30 PM',
    grossServiceValue: 650,
    workerShare: Math.round(650 * COOPERATIVE_SPLIT.workerShare),
    cooperativeContribution: Math.round(650 * COOPERATIVE_SPLIT.platformShare),
    netPayout: Math.round(650 * COOPERATIVE_SPLIT.workerShare),
    status: 'settled',
    customerName: 'Priya M.',
  },
  {
    id: 'e2', jobId: 'j2',
    serviceLabel: 'Pipe Fitting — New Connection',
    date: 'Yesterday, 11:00 AM',
    grossServiceValue: 1200,
    workerShare: Math.round(1200 * COOPERATIVE_SPLIT.workerShare),
    cooperativeContribution: Math.round(1200 * COOPERATIVE_SPLIT.platformShare),
    netPayout: Math.round(1200 * COOPERATIVE_SPLIT.workerShare),
    status: 'settled',
    customerName: 'Arun K.',
  },
  {
    id: 'e3', jobId: 'j3',
    serviceLabel: 'Plumbing — Water Heater Install',
    date: 'Sep 14, 4:00 PM',
    grossServiceValue: 1800,
    workerShare: Math.round(1800 * COOPERATIVE_SPLIT.workerShare),
    cooperativeContribution: Math.round(1800 * COOPERATIVE_SPLIT.platformShare),
    netPayout: Math.round(1800 * COOPERATIVE_SPLIT.workerShare),
    status: 'settled',
    customerName: 'Kavita R.',
  },
  {
    id: 'e4', jobId: 'j4',
    serviceLabel: 'Plumbing — Drain Cleaning',
    date: 'Sep 13, 9:30 AM',
    grossServiceValue: 500,
    workerShare: Math.round(500 * COOPERATIVE_SPLIT.workerShare),
    cooperativeContribution: Math.round(500 * COOPERATIVE_SPLIT.platformShare),
    netPayout: Math.round(500 * COOPERATIVE_SPLIT.workerShare),
    status: 'pending',
    customerName: 'Sameer T.',
  },
];

export const MOCK_BOOKINGS: ServiceRequest[] = [
  {
    id: 'b1',
    customerId: 'c1',
    serviceId: 'plumbing',
    serviceLabel: 'Plumbing',
    issueDescription: 'Kitchen sink pipe leaking, water damage forming',
    address: 'Flat 4B, Harmony Apartments, Koramangala',
    preferredSlot: 'Today, 3:00 PM – 5:00 PM',
    status: 'started',
    serviceValue: 800,
    workerShare: Math.round(800 * COOPERATIVE_SPLIT.workerShare),
    createdAt: 'Today, 1:15 PM',
    assignedWorker: MOCK_WORKERS[0],
    otpCode: '7842',
  },
  {
    id: 'b2',
    customerId: 'c1',
    serviceId: 'electrical',
    serviceLabel: 'Electrical',
    issueDescription: 'Switchboard sparking intermittently',
    address: 'Flat 4B, Harmony Apartments, Koramangala',
    preferredSlot: 'Sep 14, 10:00 AM',
    status: 'completed',
    serviceValue: 950,
    workerShare: Math.round(950 * COOPERATIVE_SPLIT.workerShare),
    createdAt: 'Sep 13, 5:00 PM',
    assignedWorker: MOCK_WORKERS[1],
  },
];

export const MOCK_ADMIN_STATS = {
  liveJobs: 14,
  pendingVerifications: 7,
  todayBookings: 38,
  todayGMV: 29400,
  activeWorkers: 62,
  disputesOpen: 3,
  weeklyFairnessScore: 84,
  topWorkerShareOfJobs: 8.2,
};

export const MOCK_ADMIN_ALLOCATION = [
  { worker: 'Rajesh K.', jobs: 12, earnings: 9800, fairnessIndex: 0.92 },
  { worker: 'Suresh P.', jobs: 8, earnings: 6100, fairnessIndex: 0.88 },
  { worker: 'Vikram S.', jobs: 11, earnings: 8900, fairnessIndex: 0.85 },
  { worker: 'Anita S.', jobs: 15, earnings: 12400, fairnessIndex: 0.78 },
  { worker: 'Mohan D.', jobs: 4, earnings: 2800, fairnessIndex: 0.95 },
];
