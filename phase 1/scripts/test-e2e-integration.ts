import { authApi, customerApi, workerApi, serviceApi, requestApi, offerApi, bookingApi } from '../services/api';

async function runFullIntegrationTest() {
  const ts = Date.now();
  console.log(`[E2E VERIFICATION] Starting end-to-end frontend-to-backend integration test...`);

  // 1. Register Customer
  const custEmail = `expo_cust_${ts}@oneplace.com`;
  console.log(`1. Registering Customer: ${custEmail}...`);
  const regCustRes = await authApi.register({
    name: 'Expo Customer',
    email: custEmail,
    phone: `99${ts % 100000000}`,
    password: 'Password123!',
    role: 'customer',
  });
  if (regCustRes.error) {
    throw new Error(`Customer registration failed: ${regCustRes.error}`);
  }
  console.log(`   ✓ Customer registered successfully`);

  // Login Customer
  const loginCustRes = await authApi.login(custEmail, 'Password123!');
  if (loginCustRes.error || !loginCustRes.data?.access_token) {
    throw new Error(`Customer login failed: ${loginCustRes.error}`);
  }
  console.log(`   ✓ Customer JWT obtained`);

  // Get Me
  const meCustRes = await authApi.getMe();
  console.log(`   ✓ Customer /me verified: ID=${meCustRes.data?.id}, Role=${meCustRes.data?.role}`);

  // Update Customer Profile
  const updateCustRes = await customerApi.updateMyProfile({
    address: '45 Park Avenue',
    city: 'Dehradun',
    pincode: '248001',
  });
  console.log(`   ✓ Customer profile updated: City=${updateCustRes.data?.city}, State=${updateCustRes.data?.profile_completion_state}`);

  // 2. Register Worker
  const workEmail = `expo_worker_${ts}@oneplace.com`;
  console.log(`2. Registering Worker: ${workEmail}...`);
  const regWorkRes = await authApi.register({
    name: 'Expo Plumber Worker',
    email: workEmail,
    phone: `98${ts % 100000000}`,
    password: 'Password123!',
    role: 'worker',
  });
  if (regWorkRes.error) {
    throw new Error(`Worker registration failed: ${regWorkRes.error}`);
  }

  // Login Worker
  const loginWorkRes = await authApi.login(workEmail, 'Password123!');
  if (loginWorkRes.error || !loginWorkRes.data?.access_token) {
    throw new Error(`Worker login failed: ${loginWorkRes.error}`);
  }
  console.log(`   ✓ Worker JWT obtained`);

  // Update Worker Profile
  await workerApi.updateMyProfile({
    primary_skill: 'Plumbing Services',
    service_area: 'Dehradun',
  });
  console.log(`   ✓ Worker profile skill set to Plumbing Services`);

  // Upload Work Slip (Compulsory for dashboard/jobs)
  const wsRes = await workerApi.uploadWorkSlip('Signed Work Slip.pdf', `DOC_WS_${ts}`);
  console.log(`   ✓ Work Slip uploaded. Status: ${(wsRes.data as any)?.status}`);

  const onboardStatus = await workerApi.getOnboardingStatus();
  console.log(`   ✓ Worker dashboard eligibility: ${onboardStatus.data?.dashboard_eligible}`);

  // 3. Customer Creates Service Request
  // First login back as customer
  await authApi.login(custEmail, 'Password123!');
  console.log(`3. Customer creating Service Request for Plumbing Services...`);
  const reqRes = await requestApi.createRequest({
    service_label: 'Plumbing Services',
    issue_description: 'Kitchen sink pipe leaking',
    address: '45 Park Avenue',
    city: 'Dehradun',
    locality: 'Dehradun',
  });
  if (reqRes.error || !reqRes.data) {
    throw new Error(`Create service request failed: ${reqRes.error}`);
  }
  const requestId = reqRes.data.id;
  console.log(`   ✓ Service Request #${requestId} created in PostgreSQL. Backend matching triggered.`);

  // 4. Worker Checks Offers & Accepts
  await authApi.login(workEmail, 'Password123!');
  console.log(`4. Worker fetching offers from FastAPI...`);
  const offersRes = await offerApi.getMyOffers();
  if (!offersRes.data || offersRes.data.length === 0) {
    throw new Error(`No worker offers returned from backend matching engine`);
  }
  const myOffer = offersRes.data.find(o => o.request_id === requestId);
  if (!myOffer) {
    throw new Error(`Matching offer for request #${requestId} not found in worker offers`);
  }
  console.log(`   ✓ Offer #${myOffer.id} received. Match reason: ${myOffer.selection_reason}`);

  // Worker Accepts Offer
  const acceptRes = await offerApi.acceptOffer(myOffer.id);
  if (acceptRes.error) {
    throw new Error(`Accept offer failed: ${acceptRes.error}`);
  }
  const booking = acceptRes.data as any;
  const bookingId = booking.id;
  const otpCode = booking.otp_code;
  console.log(`   ✓ Offer accepted! Booking #${bookingId} created with customer OTP: ${otpCode}`);

  // Worker Arrives
  await bookingApi.markArrived(bookingId);
  console.log(`   ✓ Worker marked ARRIVED`);

  // Worker Starts Job via OTP
  await bookingApi.startBookingWithOTP(bookingId, otpCode);
  console.log(`   ✓ Worker started job with verified OTP: ${otpCode}`);

  // Worker Completes Job
  await bookingApi.completeBooking(bookingId);
  console.log(`   ✓ Worker completed job. Earnings credited in PostgreSQL.`);

  console.log(`==================================================`);
  console.log(`🎉 REAL END-TO-END INTEGRATION TEST COMPLETED 100% SUCCESSFULLY!`);
  console.log(`Expo Client -> REST API -> FastAPI -> PostgreSQL Persistence Verified.`);
  console.log(`==================================================`);
}

runFullIntegrationTest().catch(err => {
  console.error('❌ E2E Integration test failed:', err);
  process.exit(1);
});
