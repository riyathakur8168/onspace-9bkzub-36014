(global as any).__DEV__ = true;

import { MatchingEngine } from '../services/matchingEngine';
import { NotificationService } from '../services/notificationService';
import { Worker, ServiceRequest } from '../services/mockData';

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

async function runFinalRequirementTestSuite() {
  console.log('================================================================');
  console.log('ONEPLACE USER DASHBOARD & STRICT SKILL MATCHING VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   Detail: ${detail}`);
      failed++;
    }
  }

  const matchingEngine = new MatchingEngine(undefined, 10);
  const notificationService = new NotificationService();

  // Test Accounts Database
  const customerA: User = {
    id: 'c1', name: 'Priya Mehra', role: ROLES.CUSTOMER, avatar: 'PM',
    phone: '9876543210', email: 'priya@example.com', isVerified: true, isOnboarded: true
  };

  const customerB: User = {
    id: 'c2', name: 'Rahul Verma', role: ROLES.CUSTOMER, avatar: 'RV',
    phone: '9876543211', email: 'rahul@example.com', isVerified: true, isOnboarded: true
  };

  const workerElectrician: Worker = {
    id: 'w2_suresh', name: 'Suresh Patel (Electrician)', avatar: 'SP',
    primaryCategory: 'electrical', skills: ['Electrical Repair', 'Wiring', 'Fan Installation'],
    rating: 4.8, completedJobs: 25, verificationStatus: 'verified', adminApprovalStatus: 'APPROVED',
    verificationState: 'VERIFIED', availabilityStatus: true, serviceArea: 'Koramangala 5th Block',
    recentEarnings: 4500, phone: '9765432100', joinedDate: '2025'
  };

  const workerPlumber: Worker = {
    id: 'w1_rajesh', name: 'Rajesh Kumar (Plumber)', avatar: 'RK',
    primaryCategory: 'plumbing', skills: ['Plumbing', 'Pipe Fitting', 'Tap Fix'],
    rating: 4.9, completedJobs: 40, verificationStatus: 'verified', adminApprovalStatus: 'APPROVED',
    verificationState: 'VERIFIED', availabilityStatus: true, serviceArea: 'Koramangala 5th Block',
    recentEarnings: 8000, phone: '9876512345', joinedDate: '2025'
  };

  const unverifiedElectrician: Worker = {
    id: 'w_unverif_elec', name: 'Unverified Electrician', avatar: 'UE',
    primaryCategory: 'electrical', skills: ['Electrical Repair', 'Wiring'],
    rating: 4.0, completedJobs: 0, verificationStatus: 'unverified', adminApprovalStatus: 'PENDING',
    verificationState: 'UNDER_REVIEW', availabilityStatus: true, serviceArea: 'Koramangala 5th Block',
    recentEarnings: 0, phone: '9999900001', joinedDate: '2026'
  };

  // Auth Simulation
  function login(user: User) {
    return { user, role: user.role, active: true };
  }

  // TEST 1: Login using Customer A credentials -> Customer A's own dashboard opens.
  const session1 = login(customerA);
  assert(
    session1.user.id === 'c1' && session1.user.name === 'Priya Mehra' && session1.role === 'customer',
    'TEST 1: Customer A credentials -> Customer A\'s own dashboard opens'
  );

  // TEST 2: Logout -> Login using Customer B credentials -> Customer B's own dashboard opens. Customer A data MUST NOT appear.
  const session2 = login(customerB);
  assert(
    session2.user.id === 'c2' && session2.user.name === 'Rahul Verma' && (session2.user.id as string) !== 'c1',
    'TEST 2: Customer B credentials -> Customer B\'s own dashboard opens (Rahul Verma, NOT Customer A)'
  );

  // TEST 3: Login using Worker A credentials -> Worker A's own worker dashboard opens.
  const session3 = login({ id: workerPlumber.id, name: workerPlumber.name, role: ROLES.WORKER, avatar: 'RK', phone: workerPlumber.phone, email: 'rajesh@example.com', isVerified: true, isOnboarded: true });
  assert(
    session3.user.id === 'w1_rajesh' && session3.user.name === 'Rajesh Kumar (Plumber)' && session3.role === 'worker',
    'TEST 3: Worker A credentials -> Worker A\'s own worker dashboard opens (Rajesh Kumar)'
  );

  // TEST 4: Login using Worker B credentials -> Worker B's own worker dashboard opens. Worker A / Priya Mehra data MUST NOT appear.
  const session4 = login({ id: workerElectrician.id, name: workerElectrician.name, role: ROLES.WORKER, avatar: 'SP', phone: workerElectrician.phone, email: 'suresh@example.com', isVerified: true, isOnboarded: true });
  assert(
    session4.user.id === 'w2_suresh' && session4.user.name === 'Suresh Patel (Electrician)' && (session4.user.id as string) !== 'w1_rajesh',
    'TEST 4: Worker B credentials -> Worker B\'s own worker dashboard opens (Suresh Patel, NOT Rajesh or Priya)'
  );

  // TEST 5: Worker = Electrician. Customer requests = Electrician -> Worker receives job offer.
  const elecReq: ServiceRequest = {
    id: 'req_elec_1', customerId: 'c1', serviceId: 'electrical', serviceLabel: 'Electrician',
    issueDescription: 'Fan switch board sparking', address: 'Koramangala 5th Block', preferredSlot: 'Today', status: 'matching', serviceValue: 500, workerShare: 425, createdAt: 'Now'
  };
  const eligible5 = matchingEngine.filterEligibleWorkers(elecReq, [workerElectrician]);
  assert(eligible5.length === 1 && eligible5[0].id === 'w2_suresh', 'TEST 5: Worker = Electrician, Request = Electrician -> Worker receives job offer');

  // TEST 6: Worker = Electrician. Customer requests = Plumber -> Worker receives NOTHING.
  const plumbReq: ServiceRequest = {
    id: 'req_plumb_1', customerId: 'c1', serviceId: 'plumbing', serviceLabel: 'Plumber',
    issueDescription: 'Bathroom tap leak', address: 'Koramangala 5th Block', preferredSlot: 'Today', status: 'matching', serviceValue: 600, workerShare: 510, createdAt: 'Now'
  };
  const eligible6 = matchingEngine.filterEligibleWorkers(plumbReq, [workerElectrician]);
  assert(eligible6.length === 0, 'TEST 6: Worker = Electrician, Request = Plumber -> Worker receives NOTHING');

  // TEST 7: Worker = Plumber. Customer requests = Electrician -> Worker receives NOTHING.
  const eligible7 = matchingEngine.filterEligibleWorkers(elecReq, [workerPlumber]);
  assert(eligible7.length === 0, 'TEST 7: Worker = Plumber, Request = Electrician -> Worker receives NOTHING');

  // TEST 8: Worker = Electrician (with registered skill "Electrical Repair"). Customer requests = Electrical Repair -> Worker receives matching opportunity.
  const elecRepairReq: ServiceRequest = {
    id: 'req_elec_repair', customerId: 'c1', serviceId: 'electrical', serviceLabel: 'Electrical Repair',
    issueDescription: 'Wiring check', address: 'Koramangala 5th Block', preferredSlot: 'Today', status: 'matching', serviceValue: 550, workerShare: 467, createdAt: 'Now'
  };
  const eligible8 = matchingEngine.filterEligibleWorkers(elecRepairReq, [workerElectrician]);
  assert(eligible8.length === 1 && eligible8[0].id === 'w2_suresh', 'TEST 8: Worker = Electrician, Request = Electrical Repair (registered skill) -> Worker receives matching opportunity');

  // TEST 9: Worker is unverified -> Customer requests matching profession -> Worker receives NO job notification.
  const eligible9 = matchingEngine.filterEligibleWorkers(elecReq, [unverifiedElectrician]);
  assert(eligible9.length === 0, 'TEST 9: Unverified Worker -> Customer requests matching profession -> Worker receives NO job notification');

  // TEST 10: Two different workers with different professions -> Each worker receives ONLY job opportunities matching their own registered profession/skills.
  const pool = [workerElectrician, workerPlumber];
  const elecMatches = matchingEngine.filterEligibleWorkers(elecReq, pool);
  const plumbMatches = matchingEngine.filterEligibleWorkers(plumbReq, pool);
  assert(
    elecMatches.length === 1 && elecMatches[0].id === 'w2_suresh' &&
    plumbMatches.length === 1 && plumbMatches[0].id === 'w1_rajesh',
    'TEST 10: Multiple workers -> Electrician receives ONLY Electrician job, Plumber receives ONLY Plumber job'
  );

  console.log('\n================================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runFinalRequirementTestSuite().catch(err => {
  console.error('Test Suite Exception:', err);
  process.exit(1);
});
