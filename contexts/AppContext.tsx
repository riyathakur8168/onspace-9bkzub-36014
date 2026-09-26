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
  acceptOffer: (offerId: string) => { success: boolean; error?: string };
  declineOffer: (offerId: string) => void;
  toggleWorkerAvailability: () => void;
  createRequest: (service: string, description: string, address: string, slot: string, price: number) => void;
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
  {
    id: 'c2', name: 'Rahul Verma', role: ROLES.CUSTOMER,
    avatar: 'RV', phone: '9876543211', email: 'rahul@example.com',
    isVerified: true, isOnboarded: true, phoneVerified: true, onboardingStep: 'completed',
    address: 'Flat 12, Sunrise Heights, Indiranagar', city: 'Bengaluru', pincode: '560038',
    customerProfile: { name: 'Rahul Verma', phone: '9876543211', city: 'Bengaluru', address: 'Flat 12, Sunrise Heights, Indiranagar', pincode: '560038' },
  },
  {
    id: 'w1', name: 'Rajesh Kumar', role: ROLES.WORKER,
    avatar: 'RK', phone: '9876512345', email: 'rajesh@example.com',
    isVerified: true, isOnboarded: true, phoneVerified: true, onboardingStep: 'completed',
    workerProfile: {
      name: 'Rajesh Kumar', phone: '9876512345', city: 'Bengaluru', avatar: 'RK',
      primarySkill: 'Plumbing', additionalSkills: ['Pipe Fitting'], experience: '3–5 years',
      bio: 'Experienced plumber with 4 years of residential pipe repairs.', serviceArea: 'Koramangala, Indiranagar',
      certificateName: 'Govt Vocational Plumbing Cert', certificateStatus: 'Verified', verificationState: 'VERIFIED',
    },
  },
  {
    id: 'w2', name: 'Suresh Patel', role: ROLES.WORKER,
    avatar: 'SP', phone: '9765432100', email: 'suresh@example.com',
    isVerified: true, isOnboarded: true, phoneVerified: true, onboardingStep: 'completed',
    workerProfile: {
      name: 'Suresh Patel', phone: '9765432100', city: 'Bengaluru', avatar: 'SP',
      primarySkill: 'Electrical', additionalSkills: ['Wiring', 'Switchboard'], experience: '5+ years',
      bio: 'Licensed electrical technician.', serviceArea: 'HSR Layout, BTM',
      certificateName: 'Electrical License', certificateStatus: 'Verified', verificationState: 'VERIFIED',
    },
  },
  {
    id: 'w3', name: 'Anita Sharma', role: ROLES.WORKER,
    avatar: 'AS', phone: '9654321099', email: 'anita@example.com',
    isVerified: true, isOnboarded: true, phoneVerified: true, onboardingStep: 'completed',
    workerProfile: {
      name: 'Anita Sharma', phone: '9654321099', city: 'Bengaluru', avatar: 'AS',
      primarySkill: 'Home Cleaning', additionalSkills: ['Deep Clean'], experience: '3–5 years',
      bio: 'Professional cleaning technician.', serviceArea: 'Whitefield',
      certificateName: 'Cleaning Cert', certificateStatus: 'Verified', verificationState: 'VERIFIED',
    },
  },
  {
    id: 'w4', name: 'Mohan Das', role: ROLES.WORKER,
    avatar: 'MD', phone: '9543210988', email: 'mohan@example.com',
    isVerified: false, isOnboarded: true, phoneVerified: true, onboardingStep: 'completed',
    workerProfile: {
      name: 'Mohan Das', phone: '9543210988', city: 'Bengaluru', avatar: 'MD',
      primarySkill: 'Carpentry', additionalSkills: ['Furniture Repair'], experience: '1–2 years',
      bio: 'Carpentry worker.', serviceArea: 'Jayanagar',
      certificateName: 'Carpentry Cert', certificateStatus: 'Pending Verification', verificationState: 'VERIFICATION_PENDING',
    },
  },
  {
    id: 'w_inactive', name: 'Inactive Worker', role: ROLES.WORKER,
    avatar: 'IW', phone: '9000000009', email: 'inactive@example.com',
    isVerified: false, isOnboarded: false, phoneVerified: true, onboardingStep: 'completed',
    status: 'SUSPENDED',
  } as any,
  {
    id: 'a1', name: 'Admin User', role: ROLES.ADMIN,
    avatar: 'AU', phone: '9000000000', email: 'admin@oneplace.in',
    isVerified: true, isOnboarded: true, phoneVerified: true, onboardingStep: 'completed',
  },
];

const DEFAULT_SKILLS_REGISTRY: SkillItem[] = [
  { id: 'plumbing', name: 'Plumber', category: 'plumbing', description: 'Pipe leakage, tap repair, bathroom fittings', isActive: true, basePrice: 499 },
  { id: 'electrical', name: 'Electrician', category: 'electrical', description: 'Wiring, switchboard, ceiling fans, MCB', isActive: true, basePrice: 399 },
  { id: 'appliance', name: 'Appliance Repair', category: 'appliance', description: 'Washing machine, refrigerator, microwave', isActive: true, basePrice: 599 },
  { id: 'cleaning', name: 'Home Cleaning', category: 'cleaning', description: 'Deep house clean, bathroom clean, sofa clean', isActive: true, basePrice: 799 },
  { id: 'painting', name: 'Painter', category: 'painting', description: 'Full home painting, wall touchup, waterproofing', isActive: true, basePrice: 999 },
  { id: 'carpentry', name: 'Carpenter', category: 'carpentry', description: 'Furniture repair, door locks, woodwork', isActive: true, basePrice: 449 },
  { id: 'ac', name: 'AC Technician', category: 'ac', description: 'AC servicing, gas refill, installation', isActive: true, basePrice: 699 },
  { id: 'ro_technician', name: 'RO Technician', category: 'appliance', description: 'Water purifier repair, filter replacement', isActive: true, basePrice: 499 },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(INITIAL_USERS_DATABASE);
  const [pendingOTP, setPendingOTP] = useState<string | null>('123456');
  const [otpStore, setOtpStore] = useState<Record<string, OTPSession>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  const [jobOffers, setJobOffers] = useState<JobOffer[]>(MOCK_JOB_OFFERS);
  const [bookings, setBookings] = useState<ServiceRequest[]>(MOCK_BOOKINGS);
  const [workersList, setWorkersList] = useState<Worker[]>(MOCK_WORKERS);
  const [skillsRegistry, setSkillsRegistry] = useState<SkillItem[]>(DEFAULT_SKILLS_REGISTRY);
  const [workerAvailable, setWorkerAvailable] = useState(true);

  // Dispatch & Matching engine state
  const [activeDispatchSession, setActiveDispatchSession] = useState<DispatchSession | null>(null);
  const [matchingWeights, setMatchingWeightsState] = useState<MatchingWeights>(DEFAULT_MATCHING_WEIGHTS);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [workerNotifications, setWorkerNotifications] = useState<JobNotificationRecord[]>([]);

  // Hydrate user session & registered users registry from AsyncStorage on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const storedReg = await AsyncStorage.getItem('@oneplace_registered_users');
        if (storedReg) {
          const parsedReg: User[] = JSON.parse(storedReg);
          setRegisteredUsers([...parsedReg, ...INITIAL_USERS_DATABASE.filter(i => !parsedReg.some(p => p.id === i.id || p.email === i.email))]);
        }
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedUser: User = JSON.parse(stored);
          setUser(parsedUser);
          setRole(parsedUser.role);
        }
        const token = await notificationService.registerForPushNotificationsAsync();
        setPushToken(token);
      } catch (err) {
        console.error('Failed to load user session', err);
      } finally {
        setIsHydrated(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    }
    loadSession();
  }, []);

  // Sync user state to AsyncStorage
  const persistUser = async (updatedUser: User | null) => {
    setUser(updatedUser);
    setRole(updatedUser?.role || null);
    if (updatedUser) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
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
    // 1. Full Name Validation
    const nameVal = validateFullName(name);
    if (!nameVal.isValid) return { success: false, error: nameVal.error };

    // 2. Email Validation
    const emailVal = validateEmail(email);
    if (!emailVal.isValid) return { success: false, error: emailVal.error };

    // 3. Phone Validation
    const phoneVal = validatePhone(phone);
    if (!phoneVal.isValid) return { success: false, error: phoneVal.error };

    // 4. Phone Verification Enforcement
    if (!phoneVerified) {
      return { success: false, error: 'Please verify your phone number via OTP before creating your account.' };
    }

    // 5. Password Validation
    const passVal = validatePassword(pass);
    if (!passVal.isValid) return { success: false, error: passVal.error };

    // 6. Address, City & Pincode Validation (if provided)
    if (address !== undefined) {
      const addressVal = validateAddress(address);
      if (!addressVal.isValid) return { success: false, error: addressVal.error };
    }
    if (city !== undefined) {
      const cityVal = validateCity(city);
      if (!cityVal.isValid) return { success: false, error: cityVal.error };
    }
    if (pincode !== undefined) {
      const pinVal = validatePincode(pincode);
      if (!pinVal.isValid) return { success: false, error: pinVal.error };
    }

    // 7. Duplicate Check
    const cleanedPhone = phone.trim();
    const cleanedEmail = email.toLowerCase().trim();
    const isDuplicate = registeredUsers.some(
      u => u.email.toLowerCase() === cleanedEmail || u.phone === cleanedPhone
    );
    if (isDuplicate) {
      return { success: false, error: 'An account with this email or phone number already exists.' };
    }

    const isCustomer = selectedRole === ROLES.CUSTOMER;
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      email: cleanedEmail,
      phone: cleanedPhone,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
      role: selectedRole,
      isVerified: true,
      isOnboarded: isCustomer,
      phoneVerified: true,
      address: address?.trim(),
      city: city?.trim(),
      pincode: pincode?.trim(),
      onboardingStep: isCustomer ? 'completed' : 'worker_skill',
      customerProfile: isCustomer ? {
        name: name.trim(),
        phone: cleanedPhone,
        city: city?.trim() || 'Bengaluru',
        address: address?.trim() || '',
        pincode: pincode?.trim() || '',
      } : undefined,
    };

    const updatedReg = [newUser, ...registeredUsers];
    setRegisteredUsers(updatedReg);
    await AsyncStorage.setItem('@oneplace_registered_users', JSON.stringify(updatedReg)).catch(() => {});

    await persistUser(newUser);
    return { success: true };
  };

  const loginWithPassword = async (emailOrPhone: string, pass: string): Promise<{ success: boolean; user?: User; role?: Role; error?: string }> => {
    if (!emailOrPhone || !pass) {
      return { success: false, error: 'Please enter your email/phone and password.' };
    }

    const query = emailOrPhone.toLowerCase().trim();
    const rawDigits = emailOrPhone.replace(/[^0-9]/g, '');

    // Search user database for exact match
    const matchedUser = registeredUsers.find(u => {
      const matchEmail = u.email.toLowerCase().trim() === query;
      const matchPhone = u.phone.trim() === query || (rawDigits.length >= 10 && u.phone.includes(rawDigits));
      return matchEmail || matchPhone;
    });

    if (!matchedUser) {
      return { success: false, error: 'Invalid credentials: No account registered with this email or phone.' };
    }

    // Account Status Check (Inactive / Suspended)
    if ((matchedUser as any).status === 'SUSPENDED' || (matchedUser as any).status === 'DEACTIVATED' || (matchedUser as any).status === 'INACTIVE') {
      return {
        success: false,
        error: 'Account Suspended: Your account is currently inactive or suspended. Access denied.',
      };
    }

    // Authenticate and set EXACT user session
    const authenticatedUser: User = {
      ...matchedUser,
      isVerified: matchedUser.role === ROLES.WORKER ? matchedUser.isVerified : true,
      phoneVerified: true,
    };

    await persistUser(authenticatedUser);
    return { success: true, user: authenticatedUser, role: authenticatedUser.role || undefined };
  };

  const sendOTP = async (phoneOrEmail?: string) => {
    const key = (phoneOrEmail || user?.phone || 'default').trim();
    
    // Validate phone number format if key is numeric
    if (/^[0-9]+$/.test(key)) {
      const phoneVal = validatePhone(key);
      if (!phoneVal.isValid) {
        return { success: false, code: '', error: phoneVal.error };
      }
    }

    const existing = otpStore[key];
    const now = Date.now();

    // Check resend cooldown (30 seconds)
    if (existing && now - existing.lastSentAt < 30000) {
      const remainingSeconds = Math.ceil((30000 - (now - existing.lastSentAt)) / 1000);
      return {
        success: false,
        code: '',
        error: `Please wait ${remainingSeconds}s before requesting a new OTP.`,
      };
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 5 * 60 * 1000; // 5 minute expiration

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
    const key = (phoneOrEmail || user?.phone || 'default').trim();
    const session = otpStore[key];
    const now = Date.now();

    // Support static demo codes for testing
    if (code === '123456' || code === '789012' || (pendingOTP && code === pendingOTP)) {
      if (user) {
        const isCustomer = user.role === ROLES.CUSTOMER;
        const updatedUser: User = {
          ...user,
          isVerified: true,
          phoneVerified: true,
          isOnboarded: isCustomer ? true : user.isOnboarded,
          onboardingStep: isCustomer ? 'completed' : 'worker_skill',
        };
        await persistUser(updatedUser);
      }
      return { success: true };
    }

    if (!session) {
      return { success: false, error: 'No active OTP request found. Please tap Verify to request a code.' };
    }

    if (now > session.expiresAt) {
      return { success: false, error: 'Verification code has expired. Please request a new code.' };
    }

    if (session.attempts >= 5) {
      return { success: false, error: 'Too many failed verification attempts. Please request a new code.' };
    }

    if (code === session.code) {
      // Clear single-use OTP
      setOtpStore(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });

      if (user) {
        const isCustomer = user.role === ROLES.CUSTOMER;
        const updatedUser: User = {
          ...user,
          isVerified: true,
          phoneVerified: true,
          isOnboarded: isCustomer ? true : user.isOnboarded,
          onboardingStep: isCustomer ? 'completed' : 'worker_skill',
        };
        await persistUser(updatedUser);
      }
      return { success: true };
    }

    // Record failed attempt
    setOtpStore(prev => ({
      ...prev,
      [key]: {
        ...session,
        attempts: session.attempts + 1,
      },
    }));

    return { success: false, error: 'Invalid 6-digit verification code. Please try again.' };
  };

  const selectRole = async (selectedRole: Role) => {
    if (user) {
      const updatedUser: User = {
        ...user,
        role: selectedRole,
        onboardingStep: selectedRole === ROLES.CUSTOMER ? 'customer' : 'worker_personal',
      };
      await persistUser(updatedUser);
    }
  };

  const saveCustomerProfile = async (data: CustomerProfileData) => {
    if (user) {
      const updatedUser: User = {
        ...user,
        name: data.name || user.name,
        phone: data.phone || user.phone,
        role: ROLES.CUSTOMER,
        isVerified: true,
        phoneVerified: true,
        isOnboarded: true,
        onboardingStep: 'completed',
        customerProfile: data,
      };
      await persistUser(updatedUser);
    }
  };

  const saveWorkerProfile = async (data: WorkerProfileData) => {
    if (user) {
      const updatedUser: User = {
        ...user,
        name: data.name || user.name,
        phone: data.phone || user.phone,
        role: ROLES.WORKER,
        isVerified: true,
        phoneVerified: true,
        isOnboarded: true,
        onboardingStep: 'completed',
        workerProfile: data,
      };
      await persistUser(updatedUser);

      const normCat = normalizeCategory(data.primarySkill);
      setWorkersList(prev => {
        const existingIdx = prev.findIndex(w => w.id === user.id);
        const newWorkerData: Worker = {
          id: user.id || 'w1',
          name: data.name || user.name,
          avatar: data.avatar || 'W',
          primaryCategory: normCat,
          primarySkillId: normCat,
          skills: [data.primarySkill, ...(data.additionalSkills || [])],
          rating: 5.0,
          completedJobs: 0,
          verificationStatus: 'verified',
          adminApprovalStatus: 'PENDING',
          availabilityStatus: true,
          serviceArea: data.serviceArea || 'Bengaluru',
          recentEarnings: 0,
          allocationScore: 90,
          allocationReason: 'Newly registered worker pending admin approval',
          phone: data.phone || user.phone,
          joinedDate: 'Just now',
        };
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], ...newWorkerData };
          return updated;
        }
        return [newWorkerData, ...prev];
      });
    }
  };

  const uploadWorkSlip = async (doc: { name: string; uri: string }) => {
    const uploadedAt = new Date().toLocaleString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    const docData = { name: doc.name, uri: doc.uri, uploadedAt, status: 'Under Review' };

    if (user) {
      const updatedProfile = {
        ...(user.workerProfile || {}),
        workSlipDocument: docData,
        verificationDocument: docData,
        workSlipStatus: 'under_review' as const,
        verificationState: 'UNDER_REVIEW' as const,
      };
      const updatedUser: User = {
        ...user,
        workerProfile: updatedProfile as any,
      };
      await persistUser(updatedUser);
    }

    setWorkersList(prev => prev.map(w => {
      if (w.id === (user?.id || 'w1') || w.phone === user?.phone) {
        return {
          ...w,
          workSlipDocument: docData,
          verificationDocument: docData,
          workSlipStatus: 'under_review' as const,
          verificationState: 'UNDER_REVIEW' as const,
          adminApprovalStatus: 'PENDING' as const,
          allocationReason: 'Work Slip uploaded — Under Review by Society Head',
        };
      }
      return w;
    }));
  };

  const uploadSkillCertificate = async (doc: { name: string; uri: string }) => {
    const uploadedAt = new Date().toLocaleString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    const docData = { name: doc.name, uri: doc.uri, uploadedAt, status: 'Uploaded' };

    if (user) {
      const updatedProfile = {
        ...(user.workerProfile || {}),
        skillCertificateDocument: docData,
        skillCertificateStatus: 'uploaded' as const,
      };
      const updatedUser: User = {
        ...user,
        workerProfile: updatedProfile as any,
      };
      await persistUser(updatedUser);
    }

    setWorkersList(prev => prev.map(w => {
      if (w.id === (user?.id || 'w1') || w.phone === user?.phone) {
        return {
          ...w,
          skillCertificateDocument: docData,
          skillCertificateStatus: 'uploaded' as const,
          allocationReason: 'Skill Certificate uploaded',
        };
      }
      return w;
    }));
  };

  const acceptSkillCertificateCommitment = async () => {
    const now = new Date();
    const deadline = new Date(now.getTime() + 10 * 86400000); // 10 days later

    if (user) {
      const updatedProfile = {
        ...(user.workerProfile || {}),
        hasSkillCertificateCommitment: true,
        certificateCommitmentDate: now.toISOString(),
        certificateDeadlineDate: deadline.toISOString(),
        skillCertificateStatus: 'pending' as const,
      };
      const updatedUser: User = {
        ...user,
        workerProfile: updatedProfile as any,
      };
      await persistUser(updatedUser);
    }

    setWorkersList(prev => prev.map(w => {
      if (w.id === (user?.id || 'w1') || w.phone === user?.phone) {
        return {
          ...w,
          hasSkillCertificateCommitment: true,
          certificateCommitmentDate: now.toISOString(),
          certificateDeadlineDate: deadline.toISOString(),
          skillCertificateStatus: 'pending' as const,
        };
      }
      return w;
    }));
  };

  const uploadVerificationDocument = async (doc: { name: string; uri: string }) => {
    await uploadWorkSlip(doc);
  };

  const reviewWorkerVerification = async (
    workerId: string,
    action: 'VERIFIED' | 'REJECTED' | 'RE_UPLOAD_REQUIRED',
    reason?: string
  ) => {
    const reviewedAt = new Date().toISOString();
    const isApproved = action === 'VERIFIED';
    const isRejected = action === 'REJECTED';

    setWorkersList(prev => prev.map(w => {
      if (w.id === workerId) {
        return {
          ...w,
          verificationState: action,
          verificationStatus: isApproved ? 'verified' as const : 'unverified' as const,
          adminApprovalStatus: isApproved ? 'APPROVED' as const : isRejected ? 'REJECTED' as const : 'PENDING' as const,
          adminApprovedAt: isApproved ? reviewedAt : undefined,
          adminRejectionReason: !isApproved ? (reason || 'Review action taken by Society Head.') : undefined,
          rejectionReason: !isApproved ? (reason || 'Review action taken by Society Head.') : undefined,
          reviewedAt,
          reviewedBy: 'Society Head / Admin',
          allocationReason: isApproved
            ? 'Verified by Society Head • Active & Eligible for dispatch'
            : isRejected
              ? 'Application rejected by Society Head'
              : 'Re-upload requested by Society Head',
        };
      }
      return w;
    }));

    if (user && user.id === workerId && user.workerProfile) {
      const updatedUser: User = {
        ...user,
        isVerified: isApproved,
        workerProfile: {
          ...user.workerProfile,
          certificateStatus: isApproved ? 'Verified' : isRejected ? 'Rejected' : 'Pending Verification',
          verificationState: action as any,
          rejectionReason: !isApproved ? reason : undefined,
        } as any,
      };
      await persistUser(updatedUser);
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
    setWorkersList(prev => prev.map(w => w.id === workerId ? { ...w, verificationStatus: 'unverified' as const } : w));
  };

  const toggleWorkerVerificationStatus = (workerId: string) => {
    setWorkersList(prev => prev.map(w => w.id === workerId ? {
      ...w,
      verificationStatus: w.verificationStatus === 'verified' ? 'pending' : 'verified'
    } : w));
  };

  const approveWorkerAdmin = (workerId: string) => {
    setWorkersList(prev => prev.map(w => w.id === workerId ? {
      ...w,
      adminApprovalStatus: 'APPROVED' as const,
      adminApprovedAt: new Date().toISOString(),
      adminRejectionReason: undefined,
    } : w));
  };

  const rejectWorkerAdmin = (workerId: string, reason?: string) => {
    setWorkersList(prev => prev.map(w => w.id === workerId ? {
      ...w,
      adminApprovalStatus: 'REJECTED' as const,
      adminRejectionReason: reason || 'Application rejected during admin review.',
    } : w));
  };

  const addSkill = (skill: Omit<SkillItem, 'id'> | SkillItem) => {
    const newId = 'id' in skill && skill.id ? skill.id : skill.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newSkillItem: SkillItem = {
      ...skill,
      id: newId,
      isActive: skill.isActive ?? true,
    };
    setSkillsRegistry(prev => {
      const existingIdx = prev.findIndex(s => s.id === newId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newSkillItem;
        return updated;
      }
      return [...prev, newSkillItem];
    });
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

  const logout = () => {
    persistUser(null);
    setPendingOTP('123456');
    setActiveDispatchSession(null);
  };

  const acceptOffer = (offerId: string): { success: boolean; error?: string } => {
    const workerId = user?.id === 'w1' ? 'w1' : (activeDispatchSession?.currentWorker?.id || 'w1');

    if (activeDispatchSession) {
      const res = defaultDispatchManager.acceptJobAtomic(activeDispatchSession.requestId, workerId);
      if (!res.success) {
        return { success: false, error: res.error };
      }
      setActiveDispatchSession({ ...res.session! });

      setBookings(prev =>
        prev.map(b => b.id === activeDispatchSession.requestId ? {
          ...b,
          status: 'accepted',
          assignedWorker: res.session!.currentWorker || b.assignedWorker,
        } : b)
      );

      setWorkersList(prev => prev.map(w => w.id === workerId ? {
        ...w,
        completedJobs: w.completedJobs + 1,
        recentEarnings: w.recentEarnings + (activeDispatchSession.request.serviceValue * 0.85),
      } : w));
    }

    setJobOffers(prev =>
      prev.map(o => o.id === offerId ? { ...o, status: 'accepted' as const } : o)
    );
    return { success: true };
  };

  const declineOffer = (offerId: string) => {
    const workerId = user?.id === 'w1' ? 'w1' : (activeDispatchSession?.currentWorker?.id || 'w1');

    if (activeDispatchSession) {
      const updated = defaultDispatchManager.declineAndAdvance(activeDispatchSession.requestId, workerId);
      setActiveDispatchSession({ ...updated });
      if (updated.currentOffer) {
        setJobOffers([updated.currentOffer]);
      } else {
        setJobOffers([]);
      }
    } else {
      setJobOffers(prev =>
        prev.map(o => o.id === offerId ? { ...o, status: 'declined' as const } : o)
      );
    }
  };

  const timeoutOffer = (requestId: string) => {
    if (activeDispatchSession && activeDispatchSession.requestId === requestId) {
      const updated = defaultDispatchManager.timeoutAndAdvance(requestId);
      setActiveDispatchSession({ ...updated });
      if (updated.currentOffer) {
        setJobOffers([updated.currentOffer]);
      } else {
        setJobOffers([]);
      }
    }
  };

  const toggleWorkerAvailability = () => {
    setWorkerAvailable(prev => !prev);
  };

  const createRequest = (service: string, description: string, address: string, slot: string, price: number) => {
    const categoryId = normalizeCategory(service);
    const newRequest: ServiceRequest = {
      id: `b${Date.now()}`,
      customerId: user?.id || 'c1',
      serviceId: categoryId,
      serviceLabel: service,
      issueDescription: description,
      address,
      preferredSlot: slot,
      status: 'matching',
      serviceValue: price,
      workerShare: Math.round(price * 0.85),
      createdAt: 'Just now',
      otpCode: Math.floor(1000 + Math.random() * 9000).toString(),
    };

    const dispatchSession = defaultDispatchManager.createSession(newRequest, workersList, matchingWeights);
    setActiveDispatchSession(dispatchSession);

    if (dispatchSession.currentOffer) {
      setJobOffers([dispatchSession.currentOffer]);
      newRequest.assignedWorker = dispatchSession.currentWorker || undefined;
    } else {
      setJobOffers([]);
    }

    setBookings(prev => [newRequest, ...prev]);
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
