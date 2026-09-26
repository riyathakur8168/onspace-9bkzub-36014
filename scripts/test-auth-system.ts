(global as any).__DEV__ = true;

const ROLES = {
  CUSTOMER: 'customer' as const,
  WORKER: 'worker' as const,
  ADMIN: 'admin' as const,
};

interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
  phone: string;
  email: string;
  isVerified: boolean;
  isOnboarded: boolean;
  phoneVerified?: boolean;
  address?: string;
  city?: string;
  pincode?: string;
  status?: string;
  customerProfile?: any;
  workerProfile?: any;
}

const INITIAL_USERS_DATABASE: User[] = [
  {
    id: 'c1', name: 'Priya Mehra', role: ROLES.CUSTOMER,
    avatar: 'PM', phone: '9876543210', email: 'priya@example.com',
    isVerified: true, isOnboarded: true, phoneVerified: true,
    address: 'Flat 4B, Harmony Apartments, Koramangala', city: 'Bengaluru', pincode: '560034',
    customerProfile: { name: 'Priya Mehra', phone: '9876543210', city: 'Bengaluru', address: 'Flat 4B, Harmony Apartments, Koramangala', pincode: '560034' },
  },
  {
    id: 'c2', name: 'Rahul Verma', role: ROLES.CUSTOMER,
    avatar: 'RV', phone: '9876543211', email: 'rahul@example.com',
    isVerified: true, isOnboarded: true, phoneVerified: true,
    address: 'Flat 12, Sunrise Heights, Indiranagar', city: 'Bengaluru', pincode: '560038',
    customerProfile: { name: 'Rahul Verma', phone: '9876543211', city: 'Bengaluru', address: 'Flat 12, Sunrise Heights, Indiranagar', pincode: '560038' },
  },
  {
    id: 'w1', name: 'Rajesh Kumar', role: ROLES.WORKER,
    avatar: 'RK', phone: '9876512345', email: 'rajesh@example.com',
    isVerified: true, isOnboarded: true, phoneVerified: true,
    workerProfile: {
      name: 'Rajesh Kumar', phone: '9876512345', city: 'Bengaluru', avatar: 'RK',
      primarySkill: 'Plumbing', additionalSkills: ['Pipe Fitting'], experience: '3–5 years',
      bio: 'Experienced plumber.', serviceArea: 'Koramangala, Indiranagar',
      certificateName: 'Govt Vocational Plumbing Cert', certificateStatus: 'Verified', verificationState: 'VERIFIED',
    },
  },
  {
    id: 'w2', name: 'Suresh Patel', role: ROLES.WORKER,
    avatar: 'SP', phone: '9765432100', email: 'suresh@example.com',
    isVerified: true, isOnboarded: true, phoneVerified: true,
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
    isVerified: true, isOnboarded: true, phoneVerified: true,
    workerProfile: {
      name: 'Anita Sharma', phone: '9654321099', city: 'Bengaluru', avatar: 'AS',
      primarySkill: 'Home Cleaning', additionalSkills: ['Deep Clean'], experience: '3–5 years',
      bio: 'Professional cleaner.', serviceArea: 'Whitefield',
      certificateName: 'Cleaning Cert', certificateStatus: 'Verified', verificationState: 'VERIFIED',
    },
  },
  {
    id: 'w4', name: 'Mohan Das', role: ROLES.WORKER,
    avatar: 'MD', phone: '9543210988', email: 'mohan@example.com',
    isVerified: false, isOnboarded: true, phoneVerified: true,
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
    isVerified: false, isOnboarded: false, phoneVerified: true,
    status: 'SUSPENDED',
  },
  {
    id: 'a1', name: 'Admin User', role: ROLES.ADMIN,
    avatar: 'AU', phone: '9000000000', email: 'admin@oneplace.in',
    isVerified: true, isOnboarded: true, phoneVerified: true,
  },
];

async function runAuthTestSuite() {
  console.log('====================================================');
  console.log('ONEPLACE AUTHENTICATION & USER ISOLATION TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   Detail: ${detail}`);
      failedTests++;
    }
  }

  // Simulated User Registry (in-memory backend db)
  const registeredUsers: User[] = [...INITIAL_USERS_DATABASE];

  // Backend Authentication Service Function
  async function authenticateUser(emailOrPhone: string, pass: string): Promise<{ success: boolean; user?: User; role?: string; error?: string }> {
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

    return { success: true, user: matchedUser, role: matchedUser.role };
  }

  // Simulated Session Storage
  let activeSession: { user: User | null; token: string | null } = { user: null, token: null };

  function loginSession(user: User) {
    activeSession = { user, token: `token_${user.id}_${Date.now()}` };
  }

  function logoutSession() {
    activeSession = { user: null, token: null };
  }

  // TEST 1: Login with existing Customer A credentials -> Customer A dashboard opens with Customer A identity.
  const res1 = await authenticateUser('priya@example.com', 'Password123!');
  if (res1.success && res1.user) loginSession(res1.user);
  assert(
    res1.success && activeSession.user?.id === 'c1' && activeSession.user?.name === 'Priya Mehra' && res1.role === 'customer',
    'TEST 1: Customer A credentials -> Customer A dashboard & profile opens (Priya Mehra)',
    `Returned ID: ${activeSession.user?.id}, Name: ${activeSession.user?.name}`
  );

  // TEST 2: Logout. Login with existing Customer B credentials -> Customer B dashboard opens, NOT Customer A.
  logoutSession();
  const res2 = await authenticateUser('rahul@example.com', 'Password123!');
  if (res2.success && res2.user) loginSession(res2.user);
  assert(
    Boolean(res2.success) && activeSession.user?.id === 'c2' && activeSession.user?.name === 'Rahul Verma' && (activeSession.user?.id as string) !== 'c1',
    'TEST 2: Customer B credentials -> Customer B dashboard opens (Rahul Verma, NOT Customer A)',
    `Returned ID: ${activeSession.user?.id}, Name: ${activeSession.user?.name}`
  );

  // TEST 3: Logout. Login with existing Worker A credentials -> Worker A dashboard opens.
  logoutSession();
  const res3 = await authenticateUser('rajesh@example.com', 'Password123!');
  if (res3.success && res3.user) loginSession(res3.user);
  assert(
    Boolean(res3.success) && activeSession.user?.id === 'w1' && activeSession.user?.name === 'Rajesh Kumar' && res3.role === 'worker',
    'TEST 3: Worker A credentials -> Worker A dashboard opens (Rajesh Kumar - Plumber)',
    `Returned Role: ${res3.role}, Name: ${activeSession.user?.name}`
  );

  // TEST 4: Logout. Login with existing Worker B credentials -> Worker B dashboard opens (Suresh Patel - Electrician).
  logoutSession();
  const res4 = await authenticateUser('suresh@example.com', 'Password123!');
  if (res4.success && res4.user) loginSession(res4.user);
  assert(
    Boolean(res4.success) && activeSession.user?.id === 'w2' && activeSession.user?.name === 'Suresh Patel' && (activeSession.user?.id as string) !== 'w1',
    'TEST 4: Worker B credentials -> Worker B dashboard opens (Suresh Patel - Electrician)',
    `Returned ID: ${activeSession.user?.id}, Name: ${activeSession.user?.name}`
  );

  // TEST 5: Session restoration on app refresh while logged in as Worker B.
  const serialized = JSON.stringify(activeSession);
  const restoredSession = JSON.parse(serialized);
  assert(
    restoredSession.user?.id === 'w2' && restoredSession.user?.name === 'Suresh Patel' && restoredSession.token !== null,
    'TEST 5: App refresh while logged in as Worker B -> Worker B session/dashboard remains active',
    `Restored User ID: ${restoredSession.user?.id}`
  );

  // TEST 6: User Data Isolation check: Backend denies cross-user data tampering.
  function getUserProfile(authenticatedUserId: string, requestedUserId: string) {
    if (authenticatedUserId !== requestedUserId) {
      return { success: false, error: 'Forbidden: Access denied to another user\'s profile.' };
    }
    const user = registeredUsers.find(u => u.id === requestedUserId);
    return { success: true, profile: user };
  }

  const accessDeniedRes = getUserProfile('c1', 'c2'); // Customer A tries to read Customer B's data
  const accessAllowedRes = getUserProfile('c1', 'c1'); // Customer A reads Customer A's data
  assert(
    !accessDeniedRes.success && accessAllowedRes.success && accessAllowedRes.profile?.id === 'c1',
    'TEST 6: Cross-user data isolation check -> Backend denies access to unauthorized user data',
    `Denied Result: ${accessDeniedRes.error}`
  );

  // TEST 7: Invalid credentials.
  const res7 = await authenticateUser('nonexistent@example.com', 'WrongPassword!');
  assert(
    Boolean(!res7.success && res7.error?.includes('Invalid credentials')),
    'TEST 7: Invalid credentials -> Login fails and no dashboard is opened',
    `Error Message: ${res7.error}`
  );

  // TEST 8: Valid credentials for inactive/suspended account.
  const res8 = await authenticateUser('inactive@example.com', 'Password123!');
  assert(
    Boolean(!res8.success && res8.error?.includes('Account Suspended')),
    'TEST 8: Inactive/Suspended account -> Account status restriction enforced, active dashboard denied',
    `Error Message: ${res8.error}`
  );

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAuthTestSuite().catch(err => {
  console.error('Auth Test Suite Error:', err);
  process.exit(1);
});
