import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { DEFAULT_MATCHING_WEIGHTS } from '@/services/matchingEngine';

const FALLBACK_CONTEXT = {
  user: null,
  role: null,
  isLoggedIn: false,
  isVerified: false,
  isOnboarded: false,
  isHydrated: false,
  pendingOTP: '123456',
  jobOffers: [],
  bookings: [],
  workersList: [],
  skillsRegistry: [],
  workerAvailable: true,
  activeDispatchSession: null,
  matchingWeights: DEFAULT_MATCHING_WEIGHTS,
  pushToken: null,
  workerNotifications: [],
  updateMatchingWeights: () => {},
  timeoutOffer: () => {},
  registerWithPassword: async () => ({ success: false, error: undefined as string | undefined }),
  loginWithPassword: async () => ({ success: false, error: undefined as string | undefined }),
  sendOTP: async () => ({ success: false, code: '', error: undefined as string | undefined }),
  verifyOTP: async () => ({ success: false, error: undefined as string | undefined }),
  selectRole: () => {},
  saveCustomerProfile: async () => {},
  saveWorkerProfile: async () => {},
  approveWorkerVerification: () => {},
  rejectWorkerVerification: () => {},
  toggleWorkerVerificationStatus: () => {},
  approveWorkerAdmin: () => {},
  rejectWorkerAdmin: () => {},
  uploadVerificationDocument: async () => {},
  uploadWorkSlip: async () => {},
  uploadSkillCertificate: async () => {},
  acceptSkillCertificateCommitment: async () => {},
  reviewWorkerVerification: async () => {},
  downloadVerificationForm: async () => '',
  addSkill: () => {},
  updateSkill: () => {},
  toggleSkillActive: () => {},
  login: () => {},
  logout: () => {},
  acceptOffer: () => ({ success: false, error: undefined as string | undefined }),
  declineOffer: () => {},
  toggleWorkerAvailability: () => {},
  createRequest: () => {},
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    console.warn('[useApp] Context accessed outside AppProvider tree — returning fallback context');
    return FALLBACK_CONTEXT;
  }
  return context;
}
