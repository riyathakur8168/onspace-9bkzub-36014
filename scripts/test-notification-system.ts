(global as any).__DEV__ = true;

import { MatchingEngine } from '../services/matchingEngine';
import { DispatchManager } from '../services/dispatchManager';
import { NotificationService } from '../services/notificationService';
import { Worker, ServiceRequest } from '../services/mockData';

async function runTestSuite() {
  console.log('====================================================');
  console.log('ONEPLACE WORKER JOB NOTIFICATION SYSTEM TEST SUITE');
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

  const matchingEngine = new MatchingEngine(undefined, 10); // 10km max radius
  const dispatchManager = new DispatchManager();
  const notificationService = new NotificationService();

  // Test Workers Definition
  const activeVerifiedElectricianA: Worker = {
    id: 'elec_a',
    name: 'Electrician A (Active Verified)',
    avatar: 'EA',
    primaryCategory: 'electrical',
    skills: ['Electrical', 'Wiring'],
    rating: 4.8,
    completedJobs: 10,
    verificationStatus: 'verified',
    adminApprovalStatus: 'APPROVED',
    verificationState: 'VERIFIED',
    availabilityStatus: true,
    serviceArea: 'Koramangala 5th Block',
    recentEarnings: 5000,
    phone: '+91 9900000001',
    joinedDate: 'Jan 2025',
  };

  const activeVerifiedPlumberB: Worker = {
    id: 'plumb_b',
    name: 'Plumber B (Active Verified)',
    avatar: 'PB',
    primaryCategory: 'plumbing',
    skills: ['Plumbing', 'Pipe Fitting'],
    rating: 4.9,
    completedJobs: 15,
    verificationStatus: 'verified',
    adminApprovalStatus: 'APPROVED',
    verificationState: 'VERIFIED',
    availabilityStatus: true,
    serviceArea: 'Koramangala 5th Block',
    recentEarnings: 2000,
    phone: '+91 9900000002',
    joinedDate: 'Feb 2025',
  };

  const unverifiedElectricianC: Worker = {
    id: 'elec_c_unverified',
    name: 'Electrician C (Unverified)',
    avatar: 'EC',
    primaryCategory: 'electrical',
    skills: ['Electrical'],
    rating: 4.5,
    completedJobs: 0,
    verificationStatus: 'unverified',
    adminApprovalStatus: 'PENDING',
    verificationState: 'UNDER_REVIEW',
    availabilityStatus: true,
    serviceArea: 'Koramangala 5th Block',
    recentEarnings: 0,
    phone: '+91 9900000003',
    joinedDate: 'Mar 2025',
  };

  const inactiveElectricianD: Worker = {
    id: 'elec_d_inactive',
    name: 'Electrician D (Inactive)',
    avatar: 'ED',
    primaryCategory: 'electrical',
    skills: ['Electrical'],
    rating: 4.7,
    completedJobs: 8,
    verificationStatus: 'verified',
    adminApprovalStatus: 'APPROVED',
    verificationState: 'VERIFIED',
    availabilityStatus: false, // OFFLINE / INACTIVE
    serviceArea: 'Koramangala 5th Block',
    recentEarnings: 3000,
    phone: '+91 9900000004',
    joinedDate: 'Apr 2025',
  };

  const farAwayElectricianE: Worker = {
    id: 'elec_e_far',
    name: 'Electrician E (Far Away > 50km)',
    avatar: 'EE',
    primaryCategory: 'electrical',
    skills: ['Electrical'],
    rating: 4.9,
    completedJobs: 20,
    verificationStatus: 'verified',
    adminApprovalStatus: 'APPROVED',
    verificationState: 'VERIFIED',
    availabilityStatus: true,
    serviceArea: 'Faraway Outskirts Location Exceeding Distance Limit',
    recentEarnings: 1000,
    phone: '+91 9900000005',
    joinedDate: 'May 2025',
  };

  const activeVerifiedElectricianF: Worker = {
    id: 'elec_f_high_earner',
    name: 'Electrician F (High Earnings)',
    avatar: 'EF',
    primaryCategory: 'electrical',
    skills: ['Electrical'],
    rating: 4.9,
    completedJobs: 50,
    verificationStatus: 'verified',
    adminApprovalStatus: 'APPROVED',
    verificationState: 'VERIFIED',
    availabilityStatus: true,
    serviceArea: 'Koramangala 5th Block',
    recentEarnings: 25000,
    phone: '+91 9900000006',
    joinedDate: 'Jun 2025',
  };

  const activeVerifiedElectricianG: Worker = {
    id: 'elec_g_low_earner',
    name: 'Electrician G (Zero Earnings)',
    avatar: 'EG',
    primaryCategory: 'electrical',
    skills: ['Electrical'],
    rating: 4.8,
    completedJobs: 2,
    verificationStatus: 'verified',
    adminApprovalStatus: 'APPROVED',
    verificationState: 'VERIFIED',
    availabilityStatus: true,
    serviceArea: 'Koramangala 5th Block',
    recentEarnings: 0,
    phone: '+91 9900000007',
    joinedDate: 'Jul 2025',
  };

  const electricianRequest: ServiceRequest = {
    id: 'req_elec_101',
    customerId: 'cust_1',
    serviceId: 'electrical',
    serviceLabel: 'Electrician',
    issueDescription: 'Short circuit in main board switch',
    address: 'Koramangala 5th Block',
    preferredSlot: 'Today, 4:00 PM',
    status: 'matching',
    serviceValue: 600,
    workerShare: 510,
    createdAt: new Date().toISOString(),
  };

  // TEST 1: Active verified electrician MUST receive notification.
  const eligible1 = matchingEngine.filterEligibleWorkers(electricianRequest, [activeVerifiedElectricianA]);
  assert(eligible1.length === 1 && eligible1[0].id === 'elec_a', 'TEST 1: Customer requests Electrician -> Active verified electrician MUST receive notification');

  // TEST 2: Active verified plumber MUST NOT receive notification.
  const eligible2 = matchingEngine.filterEligibleWorkers(electricianRequest, [activeVerifiedPlumberB]);
  assert(eligible2.length === 0, 'TEST 2: Customer requests Electrician -> Active verified plumber MUST NOT receive notification');

  // TEST 3: Unverified electrician MUST NOT receive notification.
  const eligible3 = matchingEngine.filterEligibleWorkers(electricianRequest, [unverifiedElectricianC]);
  assert(eligible3.length === 0, 'TEST 3: Customer requests Electrician -> Unverified electrician MUST NOT receive notification');

  // TEST 4: Inactive electrician MUST NOT receive notification.
  const eligible4 = matchingEngine.filterEligibleWorkers(electricianRequest, [inactiveElectricianD]);
  assert(eligible4.length === 0, 'TEST 4: Customer requests Electrician -> Inactive electrician MUST NOT receive notification');

  // TEST 5: Electrician outside service radius MUST NOT receive notification.
  const strictRadiusEngine = new MatchingEngine(undefined, 2.0); // 2km radius
  const eligible5 = strictRadiusEngine.filterEligibleWorkers(electricianRequest, [farAwayElectricianE]);
  assert(eligible5.length === 0, 'TEST 5: Customer requests Electrician -> Far away electrician outside service area MUST NOT receive notification');

  // TEST 6: Three active verified electricians -> allocation rules prioritize using opportunity balance (lower earnings prioritized).
  const pool = [activeVerifiedElectricianA, activeVerifiedElectricianF, activeVerifiedElectricianG];
  const eligible6 = matchingEngine.filterEligibleWorkers(electricianRequest, pool);
  const ranked6 = matchingEngine.rankWorkers(electricianRequest, eligible6);
  const topCandidate = ranked6[0]?.worker;
  assert(
    ranked6.length === 3 && topCandidate?.id === 'elec_g_low_earner',
    'TEST 6: 3 active verified electricians eligible -> allocation rules prioritize zero/low earner (Electrician G) for opportunity fairness',
    `Top candidate was ${topCandidate?.name}`
  );

  // TEST 7: Worker becomes verified after being under review -> becomes eligible for future electrician requests.
  const newlyVerifiedElectrician = {
    ...unverifiedElectricianC,
    verificationStatus: 'verified' as const,
    adminApprovalStatus: 'APPROVED' as const,
    verificationState: 'VERIFIED' as const,
  };
  const eligible7 = matchingEngine.filterEligibleWorkers(electricianRequest, [newlyVerifiedElectrician]);
  assert(eligible7.length === 1 && eligible7[0].id === 'elec_c_unverified', 'TEST 7: Worker becomes verified after review -> future eligible requests become available');

  // TEST 8: Same request must not generate duplicate notifications for the same worker.
  const notif1 = await notificationService.sendJobNotification(electricianRequest, activeVerifiedElectricianA);
  const notif2 = await notificationService.sendJobNotification(electricianRequest, activeVerifiedElectricianA);
  assert(notif1?.id === notif2?.id, 'TEST 8: Same request MUST NOT generate duplicate notifications for the same worker');

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
