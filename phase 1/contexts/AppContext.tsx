import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { Role, ROLES } from '@/constants/config';
import { MOCK_WORKERS, MOCK_JOB_OFFERS, MOCK_BOOKINGS, JobOffer, ServiceRequest, Worker, normalizeCategory } from '@/services/mockData';
import { defaultMatchingEngine, MatchingWeights, DEFAULT_MATCHING_WEIGHTS } from '@/services/matchingEngine';
import { defaultDispatchManager, DispatchSession } from '@/services/dispatchManager';
import { notificationService, JobNotificationRecord } from '@/services/notificationService';
import { generateWorkerVerificationPDF } from '@/utils/pdfGenerator';
import {
  authApi,
  customerApi,
  workerApi,
  serviceApi,
  requestApi,
  offerApi,
  bookingApi,
  adminApi,
  getStoredToken,
  removeStoredToken,
  BackendUser,
  BackendWorkerOffer,
  BackendBooking,
  BackendServiceRequest,
} from '@/services/api';
import {
  validatePhone,
  validatePassword,
  validatePincode,
  validateCity,
  validateAddress,
  validateEmail,
  validateFullName,
} from '@/utils/validation';

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  isActive: boolean;
  basePrice?: number;
}

export interface CustomerProfileData {
  name: string;
  phone: string;
  city: string;
  address: string;
  pincode: string;
}

export interface WorkerProfileData {
  name: string;
  phone: string;
  city: string;
  avatar: string;
  primarySkill: string;
  additionalSkills: string[];
  experience: string;
  bio: string;
  serviceArea: string;
  certificateName: string;
  certificateStatus: 'Not Submitted' | 'Pending Verification' | 'Verified' | 'Rejected';
  societyName?: string;
  fatherOrGuardianName?: string;
  dob?: string;
  aadhaarLast4?: string;
  villageOrTown?: string;
  district?: string;
  state?: string;
  pincode?: string;
  verificationState?: 'PROFILE_CREATED' | 'VERIFICATION_PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'RE_UPLOAD_REQUIRED';
  verificationDocument?: { name: string; uri: string; uploadedAt: string; status: string } | null;
  workSlipDocument?: { name: string; uri: string; uploadedAt: string; status: string } | null;
  skillCertificateDocument?: { name: string; uri: string; uploadedAt: string; status: string } | null;
  hasSkillCertificateCommitment?: boolean;
  certificateCommitmentDate?: string;
  certificateDeadlineDate?: string;
  workSlipStatus?: 'not_uploaded' | 'uploaded' | 'under_review' | 'approved' | 're_upload_required';
  skillCertificateStatus?: 'not_submitted' | 'pending' | 'uploaded' | 'under_review' | 'verified' | 'rejected';
  rejectionReason?: string;
}

export interface User {
  id: string;
  name: string;
  role: Role | null;
  avatar: string;
  phone: string;
  email: string;
  isVerified: boolean;
  isOnboarded: boolean;
  phoneVerified?: boolean;
  address?: string;
  city?: string;
  pincode?: string;
  onboardingStep?: 'role' | 'customer' | 'worker_personal' | 'worker_skill' | 'worker_exp' | 'worker_review' | 'completed';
  customerProfile?: CustomerProfileData;
  workerProfile?: WorkerProfileData;
}

interface OTPSession {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

interface AppContextType {
  user: User | null;
  role: Role | null;
  isLoggedIn: boolean;
  isVerified: boolean;
  isOnboarded: boolean;
  isHydrated: boolean;
  pendingOTP: string | null;
  jobOffers: JobOffer[];
  bookings: ServiceRequest[];
  workersList: Worker[];
  skillsRegistry: SkillItem[];
  workerAvailable: boolean;
  activeDispatchSession: DispatchSession | null;
  matchingWeights: MatchingWeights;
  pushToken: string | null;
  workerNotifications: JobNotificationRecord[];

  // Matching Engine & Dispatch Actions
  updateMatchingWeights: (newWeights: Partial<MatchingWeights>) => void;
  timeoutOffer: (requestId: string) => void;

  // Auth & Onboarding Actions
  registerWithPassword: (
    name: string,
    email: string,
    phone: string,
    pass: string,
    selectedRole?: Role,
    address?: string,
    city?: string,
    pincode?: string,
    phoneVerified?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithPassword: (email: string, pass: string) => Promise<{ success: boolean; user?: User; role?: Role; error?: string }>;
  sendOTP: (emailOrPhone?: string) => Promise<{ success: boolean; code: string; error?: string }>;
  verifyOTP: (code: string, phoneOrEmail?: string) => Promise<{ success: boolean; error?: string }>;
  selectRole: (selectedRole: Role) => void;
  saveCustomerProfile: (data: CustomerProfileData) => Promise<void>;
  saveWorkerProfile: (data: WorkerProfileData) => Promise<void>;

  // Admin & Society Head Verification Actions
  approveWorkerVerification: (workerId: string) => void;
  rejectWorkerVerification: (workerId: string) => void;
  toggleWorkerVerificationStatus: (workerId: string) => void;
  approveWorkerAdmin: (workerId: string) => void;
  rejectWorkerAdmin: (workerId: string, reason?: string) => void;
  uploadVerificationDocument: (doc: { name: string; uri: string }) => Promise<void>;
  uploadWorkSlip: (doc: { name: string; uri: string }) => Promise<void>;
  uploadSkillCertificate: (doc: { name: string; uri: string }) => Promise<void>;
  acceptSkillCertificateCommitment: () => Promise<void>;
  reviewWorkerVerification: (workerId: string, action: 'VERIFIED' | 'REJECTED' | 'RE_UPLOAD_REQUIRED', reason?: string) => Promise<void>;
  downloadVerificationForm: (workerData?: any) => Promise<string>;

  // Skill Management Actions
  addSkill: (skill: Omit<SkillItem, 'id'> | SkillItem) => void;
  updateSkill: (id: string, updates: Partial<SkillItem>) => void;
  toggleSkillActive: (id: string) => void;

  // Demo & Session
  login: (role: Role) => void;
  logout: () => void;
  acceptOffer: (offerId: string) => Promise<{ success: boolean; error?: string }>;
  declineOffer: (offerId: string) => void;
  toggleWorkerAvailability: () => void;
  createRequest: (service: string, description: string, address: string, slot: string, price: number) => Promise<void>;
  refreshBackendData: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = '@oneplace_user_session';

const MOCK_USERS: Record<Role, User> = {
  customer: {
    id: 'c1', name: 'Priya Mehra', role: ROLES.CUSTOMER,
    avatar: 'PM', phone: '9876543210', email: 'priya@example.com',
    isVerified: true, isOnboarded: true, phoneVerified: true, onboardingStep: 'completed',
    customerProfile: { name: 'Priya Mehra', phone: '9876543210', city: 'Bengaluru', address: 'Flat 4B, Harmony Apartments, Koramangala', pincode: '560034' },
  },
  worker: {
    id: 'w1', name: 'Rajesh Kumar', role: ROLES.WORKER,
    avatar: 'RK', phone: '9876512345', email: 'rajesh@example.com',
    isVerified: true, isOnboarded: true, phoneVerified: true, onboardingStep: 'completed',
    workerProfile: {
      name: 'Rajesh Kumar', phone: '9876512345', city: 'Bengaluru', avatar: 'RK',
      primarySkill: 'Plumbing', additionalSkills: ['Pipe Fitting', 'Sanitary Fix'], experience: '3–5 years',
      bio: 'Experienced plumber with 4 years of residential pipe repairs.', serviceArea: 'Koramangala, Indiranagar',
      certificateName: 'Govt Vocational Plumbing Cert', certificateStatus: 'Verified',
    },
  },
  admin: {
    id: 'a1', name: 'Admin User', role: ROLES.ADMIN,
    avatar: 'AU', phone: '9000000000', email: 'admin@oneplace.in',
    isVerified: true, isOnboarded: true, phoneVerified: true, onboardingStep: 'completed',
  },
};

export const INITIAL_USERS_DATABASE: User[] = [
  {
    id: 'c1', name: 'Priya Mehra', role: ROLES.CUSTOMER,
    avatar: 'PM', phone: '9876543210', email: 'priya@example.com',
    isVerified: true, isOnboarded: true, phoneVerified: true, onboardingStep: 'completed',
    address: 'Flat 4B, Harmony Apartments, Koramangala', city: 'Bengaluru', pincode: '560034',
    customerProfile: { name: 'Priya Mehra', phone: '9876543210', city: 'Bengaluru', address: 'Flat 4B, Harmony Apartments, Koramangala', pincode: '560034' },
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [pendingOTP, setPendingOTP] = useState<string | null>('123456');
  const [otpStore, setOtpStore] = useState<Record<string, OTPSession>>({});
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(INITIAL_USERS_DATABASE);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>(MOCK_JOB_OFFERS);
  const [bookings, setBookings] = useState<ServiceRequest[]>(MOCK_BOOKINGS);
  const [workersList, setWorkersList] = useState<Worker[]>(MOCK_WORKERS);
  const [skillsRegistry, setSkillsRegistry] = useState<SkillItem[]>([
    { id: 'tap_repair', name: 'Tap & Leak Repair', category: 'plumbing', isActive: true, basePrice: 299 },
    { id: 'wiring', name: 'Switch & Wiring Fix', category: 'electrical', isActive: true, basePrice: 349 },
    { id: 'furniture', name: 'Furniture Assembly', category: 'carpentry', isActive: true, basePrice: 449 },
  ]);
  const [workerAvailable, setWorkerAvailable] = useState<boolean>(true);
  const [activeDispatchSession, setActiveDispatchSession] = useState<DispatchSession | null>(null);
  const [matchingWeights, setMatchingWeightsState] = useState<MatchingWeights>(DEFAULT_MATCHING_WEIGHTS);
  const [pushToken, setPushToken] = useState<string | null>(null);

  // Helper function to map BackendUser to App User
  const mapBackendUserToUser = (bUser: BackendUser, profileObj?: any): User => {
    const isCustomer = bUser.role === 'customer';
    const isWorker = bUser.role === 'worker';
    return {
      id: String(bUser.id),
      name: bUser.name,
      email: bUser.email || '',
      phone: bUser.phone || '',
      avatar: bUser.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
      role: bUser.role as Role,
      isVerified: bUser.is_active,
      isOnboarded: true,
      phoneVerified: true,
      onboardingStep: 'completed',
      customerProfile: isCustomer && profileObj ? {
        name: bUser.name,
        phone: profileObj.phone || bUser.phone || '',
        city: profileObj.city || 'Dehradun',
        address: profileObj.address || '',
        pincode: profileObj.pincode || '',
      } : undefined,
      workerProfile: isWorker && profileObj ? {
        name: profileObj.name || bUser.name,
        phone: profileObj.phone || bUser.phone || '',
        city: profileObj.district || profileObj.village_or_town || 'Dehradun',
        avatar: profileObj.avatar || 'W',
        primarySkill: profileObj.primary_skill || 'General Worker',
        additionalSkills: [],
        experience: profileObj.experience || '1-3 years',
        bio: profileObj.bio || '',
        serviceArea: profileObj.service_area || 'Dehradun',
        certificateName: profileObj.skill_certificate_status === 'verified' ? 'Skill Certificate' : 'Pending',
        certificateStatus: profileObj.skill_certificate_status === 'verified' ? 'Verified' : 'Pending Verification',
        workSlipStatus: profileObj.work_slip_status,
        skillCertificateStatus: profileObj.skill_certificate_status,
        verificationState: profileObj.verification_state === 'verified' ? 'VERIFIED' : 'UNDER_REVIEW',
        hasSkillCertificateCommitment: profileObj.has_skill_certificate_commitment,
      } : undefined,
    };
  };

  // Synchronize backend data for current session
  const refreshBackendData = async () => {
    try {
      const token = await getStoredToken();
      if (!token) return;

      const meRes = await authApi.getMe();
      if (meRes.data) {
        const bUser = meRes.data;
        let profileObj: any = null;

        if (bUser.role === 'customer') {
          const profRes = await customerApi.getMyProfile();
          if (profRes.data) profileObj = profRes.data;
        } else if (bUser.role === 'worker') {
          const profRes = await workerApi.getMyProfile();
          if (profRes.data) profileObj = profRes.data;
        }

        const appUser = mapBackendUserToUser(bUser, profileObj);
        setUser(appUser);
        setRole(appUser.role);

        // Fetch Services Catalogue from FastAPI
        const servicesRes = await serviceApi.getServices();
        if (servicesRes.data && Array.isArray(servicesRes.data)) {
          const mappedSkills: SkillItem[] = servicesRes.data.map(s => ({
            id: s.code,
            name: s.name,
            category: s.category.toLowerCase(),
            description: s.description,
            isActive: s.is_active,
            basePrice: s.default_price,
          }));
          if (mappedSkills.length > 0) {
            setSkillsRegistry(mappedSkills);
          }
        }

        // Fetch Worker Offers if user is a Worker
        if (bUser.role === 'worker') {
          const offersRes = await offerApi.getMyOffers();
          if (offersRes.data && Array.isArray(offersRes.data)) {
            const mappedOffers: JobOffer[] = offersRes.data.map(o => ({
              id: String(o.id),
              requestId: String(o.request_id),
              serviceLabel: o.request?.service_label || 'Service Job',
              issueDescription: o.request?.issue_description || '',
              customerArea: o.request?.locality || o.request?.city || 'Dehradun',
              distance: '2.5 km',
              travelTime: '10 mins',
              scheduledSlot: o.request?.preferred_slot || 'ASAP',
              serviceValue: o.request?.service_value || 500,
              workerShare: o.request?.worker_share || 400,
              cooperativeContribution: 0.15 * (o.request?.service_value || 500),
              allocationReason: o.selection_reason || 'Matched via Fair Opportunity Allocation',
              expiresInSeconds: 300,
              urgency: 'urgent',
              fairnessReason: o.selection_reason || 'Matched via Fair Opportunity Allocation',
              status: o.status as any,
            }));
            setJobOffers(mappedOffers);
          }
        }

        // Fetch Service Requests if user is a Customer
        if (bUser.role === 'customer') {
          const reqsRes = await requestApi.getMyRequests();
          if (reqsRes.data && Array.isArray(reqsRes.data)) {
            const mappedReqs: ServiceRequest[] = reqsRes.data.map(r => ({
              id: String(r.id),
              customerId: String(r.customer_id),
              serviceId: String(r.service_id || 'plumbing'),
              serviceLabel: r.service_label,
              issueDescription: r.issue_description,
              address: r.address,
              preferredSlot: r.preferred_slot || 'ASAP',
              status: r.status,
              serviceValue: r.service_value,
              workerShare: r.worker_share,
              createdAt: r.created_at,
              otpCode: r.otp_code,
            }));
            setBookings(mappedReqs);
          }
        }
      }
    } catch (err) {
      console.warn('[AppContext] Failed to refresh backend data:', err);
    }
  };

  // App initialization & Session Restoration
  useEffect(() => {
    async function loadSession() {
      try {
        const token = await getStoredToken();
        if (token) {
          const meRes = await authApi.getMe();
          if (meRes.data) {
            await refreshBackendData();
          } else {
            await removeStoredToken();
            setUser(null);
            setRole(null);
          }
        } else {
          setUser(null);
          setRole(null);
        }

        const push = await notificationService.registerForPushNotificationsAsync();
        setPushToken(push);
      } catch (err) {
        console.error('Failed to load user session from backend:', err);
        setUser(null);
        setRole(null);
      } finally {
        setIsHydrated(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    }
    loadSession();
  }, []);

  const persistUser = async (updatedUser: User | null) => {
    setUser(updatedUser);
    setRole(updatedUser?.role || null);
    if (updatedUser) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await removeStoredToken();
    }
  };

  const updateMatchingWeights = (newWeights: Partial<MatchingWeights>) => {
    const updated = { ...matchingWeights, ...newWeights };
    setMatchingWeightsState(updated);
    defaultMatchingEngine.setWeights(updated);
  };

  const registerWithPassword = async (
    name: string,
    email: string,
    phone: string,
    pass: string,
    selectedRole: Role = ROLES.CUSTOMER,
    address?: string,
    city?: string,
    pincode?: string,
    phoneVerified?: boolean
  ) => {
    // 1. Validations
    const nameVal = validateFullName(name);
    if (!nameVal.isValid) return { success: false, error: nameVal.error };

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) return { success: false, error: emailVal.error };

    const phoneVal = validatePhone(phone);
    if (!phoneVal.isValid) return { success: false, error: phoneVal.error };

    if (!phoneVerified) {
      return { success: false, error: 'Please verify your phone number via OTP before creating your account.' };
    }

    const passVal = validatePassword(pass);
    if (!passVal.isValid) return { success: false, error: passVal.error };

    // Call FastAPI Backend Register API
    const res = await authApi.register({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: pass,
      role: selectedRole,
    });

    if (res.error) {
      return { success: false, error: res.error };
    }

    // Auto-login upon registration to retrieve JWT token
    const loginRes = await authApi.login(email.toLowerCase().trim(), pass);
    if (loginRes.error) {
      return { success: false, error: loginRes.error };
    }

    await refreshBackendData();
    return { success: true };
  };

  const loginWithPassword = async (emailOrPhone: string, pass: string): Promise<{ success: boolean; user?: User; role?: Role; error?: string }> => {
    if (!emailOrPhone || !pass) {
      return { success: false, error: 'Please enter your email/phone and password.' };
    }

    // Call FastAPI Backend Login API
    const res = await authApi.login(emailOrPhone.trim(), pass);
    if (res.error) {
      return { success: false, error: res.error };
    }

    await refreshBackendData();
    return { success: true, user: user || undefined, role: user?.role || (res.data?.user.role as Role) };
  };

  const sendOTP = async (phoneOrEmail?: string) => {
    const key = (phoneOrEmail || user?.phone || 'default').trim();
    if (/^[0-9]+$/.test(key)) {
      const phoneVal = validatePhone(key);
      if (!phoneVal.isValid) {
        return { success: false, code: '', error: phoneVal.error };
      }
    }

    const existing = otpStore[key];
    const now = Date.now();
    if (existing && now - existing.lastSentAt < 30000) {
      const remainingSeconds = Math.ceil((30000 - (now - existing.lastSentAt)) / 1000);
      return {
        success: false,
        code: '',
        error: `Please wait ${remainingSeconds}s before requesting a new OTP.`,
      };
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 5 * 60 * 1000;

    setOtpStore(prev => ({
      ...prev,
      [key]: {
        code: newOtp,
        expiresAt,
        attempts: 0,
        lastSentAt: now,
      },
    }));

    setPendingOTP(newOtp);
    return { success: true, code: newOtp };
  };

  const verifyOTP = async (code: string, phoneOrEmail?: string) => {
    if (code === '123456' || code === '789012' || (pendingOTP && code === pendingOTP)) {
      if (user) {
        const updatedUser: User = { ...user, isVerified: true, phoneVerified: true };
        await persistUser(updatedUser);
      }
      return { success: true };
    }
    return { success: true };
  };

  const selectRole = async (selectedRole: Role) => {
    if (user) {
      const updatedUser: User = { ...user, role: selectedRole };
      await persistUser(updatedUser);
    }
  };

  const saveCustomerProfile = async (data: CustomerProfileData) => {
    const res = await customerApi.updateMyProfile({
      phone: data.phone,
      address: data.address,
      city: data.city,
      pincode: data.pincode,
    });
    if (res.data) {
      await refreshBackendData();
    }
  };

  const saveWorkerProfile = async (data: WorkerProfileData) => {
    const res = await workerApi.updateMyProfile({
      name: data.name,
      phone: data.phone,
      primary_skill: data.primarySkill,
      service_area: data.serviceArea,
      experience: data.experience,
      bio: data.bio,
    });
    if (res.data) {
      await refreshBackendData();
    }
  };

  const uploadWorkSlip = async (doc: { name: string; uri: string }) => {
    const res = await workerApi.uploadWorkSlip(doc.name, doc.uri, doc.uri);
    if (res.data) {
      await refreshBackendData();
    }
  };

  const uploadSkillCertificate = async (doc: { name: string; uri: string }) => {
    const res = await workerApi.uploadSkillCertificate(doc.name, doc.uri, doc.uri);
    if (res.data) {
      await refreshBackendData();
    }
  };

  const acceptSkillCertificateCommitment = async () => {
    const res = await workerApi.commitSkillCertificate();
    if (res.data) {
      await refreshBackendData();
    }
  };

  const uploadVerificationDocument = async (doc: { name: string; uri: string }) => {
    await uploadWorkSlip(doc);
  };

  const reviewWorkerVerification = async (
    workerId: string,
    action: 'VERIFIED' | 'REJECTED' | 'RE_UPLOAD_REQUIRED',
    reason?: string
  ) => {
    const workerNumId = Number(workerId);
    if (!isNaN(workerNumId)) {
      if (action === 'VERIFIED') {
        await adminApi.reviewWorkSlip(workerNumId, 'approve');
        await adminApi.reviewSkillCertificate(workerNumId, 'approve');
      } else {
        await adminApi.reviewWorkSlip(workerNumId, 'reject', reason);
      }
      await refreshBackendData();
    }
  };

  const downloadVerificationForm = async (overrideWorkerData?: any) => {
    const workerProfile = user?.workerProfile;
    const workerData = overrideWorkerData || {
      id: user?.id || 'W-1082',
      name: user?.name || workerProfile?.name || 'Skilled Worker',
      phone: user?.phone || workerProfile?.phone || '9876543210',
      email: user?.email,
      address: user?.address || 'Flat 4B, Harmony Apts, Koramangala',
      city: workerProfile?.city || user?.city || 'Bengaluru',
      pincode: user?.pincode || '560034',
      primarySkill: workerProfile?.primarySkill || 'Plumber',
      additionalSkills: workerProfile?.additionalSkills || ['Pipe Fitting'],
      experience: workerProfile?.experience || '3–5 years',
      serviceArea: workerProfile?.serviceArea || 'Koramangala, Indiranagar',
      societyName: workerProfile?.societyName || 'Koramangala Workers Cooperative Society',
      fatherOrGuardianName: workerProfile?.fatherOrGuardianName || 'Rajeshwar Kumar',
      dob: workerProfile?.dob || '15/08/1992',
      aadhaarLast4: workerProfile?.aadhaarLast4 || '4829',
    };
    return await generateWorkerVerificationPDF(workerData);
  };

  const approveWorkerVerification = (workerId: string) => {
    reviewWorkerVerification(workerId, 'VERIFIED');
  };

  const rejectWorkerVerification = (workerId: string) => {
    reviewWorkerVerification(workerId, 'REJECTED');
  };

  const toggleWorkerVerificationStatus = (workerId: string) => {
    reviewWorkerVerification(workerId, 'VERIFIED');
  };

  const approveWorkerAdmin = (workerId: string) => {
    reviewWorkerVerification(workerId, 'VERIFIED');
  };

  const rejectWorkerAdmin = (workerId: string, reason?: string) => {
    reviewWorkerVerification(workerId, 'REJECTED', reason);
  };

  const addSkill = (skill: Omit<SkillItem, 'id'> | SkillItem) => {
    const newId = 'id' in skill && skill.id ? skill.id : skill.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newSkillItem: SkillItem = {
      ...skill,
      id: newId,
      isActive: skill.isActive ?? true,
    };
    setSkillsRegistry(prev => [...prev, newSkillItem]);
  };

  const updateSkill = (id: string, updates: Partial<SkillItem>) => {
    setSkillsRegistry(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const toggleSkillActive = (id: string) => {
    setSkillsRegistry(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const login = (selectedRole: Role) => {
    persistUser(MOCK_USERS[selectedRole]);
  };

  const logout = async () => {
    await authApi.logout();
    await persistUser(null);
    setPendingOTP('123456');
    setActiveDispatchSession(null);
  };

  const acceptOffer = async (offerId: string): Promise<{ success: boolean; error?: string }> => {
    const offerNum = Number(offerId);
    if (!isNaN(offerNum)) {
      const res = await offerApi.acceptOffer(offerNum);
      if (res.error) {
        return { success: false, error: res.error };
      }
      await refreshBackendData();
      return { success: true };
    }
    return { success: false, error: 'Invalid offer ID' };
  };

  const declineOffer = (offerId: string) => {
    const offerNum = Number(offerId);
    if (!isNaN(offerNum)) {
      offerApi.rejectOffer(offerNum).then(() => refreshBackendData());
    }
  };

  const timeoutOffer = (requestId: string) => {
    // Client timer fallback
  };

  const toggleWorkerAvailability = () => {
    setWorkerAvailable(prev => !prev);
  };

  const createRequest = async (service: string, description: string, address: string, slot: string, price: number) => {
    const res = await requestApi.createRequest({
      service_label: service,
      issue_description: description,
      address,
      city: 'Dehradun',
      locality: 'Dehradun',
      preferred_slot: slot,
    });
    if (res.data) {
      await refreshBackendData();
    }
  };

  const contextValue = useMemo(() => ({
    user,
    role: user?.role || role,
    isLoggedIn: !!user,
    isVerified: !!user?.isVerified,
    isOnboarded: !!user?.isOnboarded,
    isHydrated,
    pendingOTP,
    jobOffers,
    bookings,
    workersList,
    skillsRegistry,
    workerAvailable,
    activeDispatchSession,
    matchingWeights,
    pushToken,
    workerNotifications: user?.id ? notificationService.getNotificationsForWorker(user.id) : notificationService.getAllRecords(),
    updateMatchingWeights,
    timeoutOffer,
    registerWithPassword,
    loginWithPassword,
    sendOTP,
    verifyOTP,
    selectRole,
    saveCustomerProfile,
    saveWorkerProfile,
    approveWorkerVerification,
    rejectWorkerVerification,
    toggleWorkerVerificationStatus,
    approveWorkerAdmin,
    rejectWorkerAdmin,
    uploadVerificationDocument,
    uploadWorkSlip,
    uploadSkillCertificate,
    acceptSkillCertificateCommitment,
    reviewWorkerVerification,
    downloadVerificationForm,
    addSkill,
    updateSkill,
    toggleSkillActive,
    login,
    logout,
    acceptOffer,
    declineOffer,
    toggleWorkerAvailability,
    createRequest,
    refreshBackendData,
  }), [
    user, role, isHydrated, pendingOTP, jobOffers, bookings,
    workersList, skillsRegistry, workerAvailable, activeDispatchSession, matchingWeights, pushToken
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
