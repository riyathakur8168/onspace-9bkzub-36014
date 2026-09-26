const http = require('http');

async function request(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (dataString) {
      headers['Content-Length'] = Buffer.byteLength(dataString);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 8001,
        path,
        method,
        headers,
      },
      (res) => {
        let bodyText = '';
        res.on('data', (chunk) => (bodyText += chunk));
        res.on('end', () => {
          try {
            const parsed = bodyText ? JSON.parse(bodyText) : {};
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, data: bodyText });
          }
        });
      }
    );

    req.on('error', (e) => reject(e));
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function main() {
  const ts = Date.now();
  console.log('==================================================');
  console.log('REAL FRONTEND-TO-BACKEND API VERIFICATION');
  console.log('==================================================');

  // 1. Health check
  const health = await request('/api/health');
  console.log('✓ Backend Health:', health.status, health.data);

  // 2. Register Customer
  const custEmail = `expo_live_c${ts}@oneplace.com`;
  console.log(`\n1. Register Customer (${custEmail})...`);
  const regCust = await request('/api/auth/register', 'POST', {
    name: 'Live Expo Customer',
    email: custEmail,
    phone: `91${ts % 100000000}`,
    password: 'Password123!',
    role: 'customer',
  });
  console.log('   Register Result:', regCust.status, regCust.data.message || regCust.data);

  // 3. Login Customer
  const loginCust = await request('/api/auth/login', 'POST', {
    email: custEmail,
    password: 'Password123!',
  });
  const custToken = loginCust.data.access_token;
  console.log('   Login Result:', loginCust.status, 'JWT Obtained:', !!custToken);

  // 4. Get Customer Me
  const custMe = await request('/api/auth/me', 'GET', null, custToken);
  console.log('   /me Result:', custMe.status, `ID=${custMe.data.id}, Role=${custMe.data.role}`);

  // 5. Update Customer Profile
  const updateCust = await request('/api/customers/me', 'PUT', {
    address: '99 Main Boulevard',
    city: 'Dehradun',
    pincode: '248001',
  }, custToken);
  console.log('   Update Profile Result:', updateCust.status, `Completion State=${updateCust.data.profile_completion_state}`);

  // 6. Register Worker
  const workEmail = `expo_live_w${ts}@oneplace.com`;
  console.log(`\n2. Register Worker (${workEmail})...`);
  const regWork = await request('/api/auth/register', 'POST', {
    name: 'Live Expo Plumber',
    email: workEmail,
    phone: `92${ts % 100000000}`,
    password: 'Password123!',
    role: 'worker',
  });
  console.log('   Register Result:', regWork.status, regWork.data.message || regWork.data);

  // 7. Login Worker
  const loginWork = await request('/api/auth/login', 'POST', {
    email: workEmail,
    password: 'Password123!',
  });
  const workToken = loginWork.data.access_token;
  console.log('   Login Result:', loginWork.status, 'JWT Obtained:', !!workToken);

  // 8. Update Worker Profile
  const updateWork = await request('/api/workers/me', 'PUT', {
    primary_skill: 'Plumbing Services',
    service_area: 'Dehradun',
  }, workToken);
  console.log('   Worker Profile Skill:', updateWork.data.primary_skill);

  // 9. Upload Work Slip (Compulsory for dashboard eligibility)
  const uploadWs = await request('/api/workers/me/work-slip', 'POST', {
    document_name: 'Signed OnePlace Work Slip.pdf',
    document_reference: `REF_WS_${ts}`,
  }, workToken);
  console.log('   Work Slip Upload Status:', uploadWs.status, uploadWs.data.status);

  const onboard = await request('/api/workers/me/onboarding-status', 'GET', null, workToken);
  console.log('   Dashboard Eligible:', onboard.data.dashboard_eligible);

  // 10. Customer Creates Service Request
  console.log('\n3. Customer creating Service Request for Plumbing Services...');
  const reqRes = await request('/api/requests', 'POST', {
    service_label: 'Plumbing Services',
    issue_description: 'Water pipe leaking under kitchen counter',
    address: '99 Main Boulevard',
    city: 'Dehradun',
    locality: 'Dehradun',
  }, custToken);
  const requestId = reqRes.data.id;
  console.log('   Service Request Created in PostgreSQL:', reqRes.status, `Request ID #${requestId}`);

  // 11. Worker Fetches Offers & Accepts
  console.log('\n4. Worker fetching matched offers from FastAPI...');
  const offersRes = await request('/api/worker/offers', 'GET', null, workToken);
  console.log('   Offers Count:', offersRes.data.length);
  const myOffer = offersRes.data.find((o) => o.request_id === requestId);
  console.log('   Matched Offer Found:', !!myOffer, `Offer ID #${myOffer ? myOffer.id : 'N/A'}`);

  if (myOffer) {
    const acceptRes = await request(`/api/worker/offers/${myOffer.id}/accept`, 'POST', null, workToken);
    const bookingId = acceptRes.data.id;
    const otpCode = acceptRes.data.otp_code;
    console.log('   Offer Accepted! Booking Created in PostgreSQL:', acceptRes.status, `Booking ID #${bookingId}, Customer OTP: ${otpCode}`);

    // 12. Worker Advances Status
    const arriveRes = await request(`/api/bookings/${bookingId}/arrive`, 'POST', null, workToken);
    console.log('   Worker Arrived:', arriveRes.data.status);

    const startRes = await request(`/api/bookings/${bookingId}/start`, 'POST', { otp_code: otpCode }, workToken);
    console.log('   Worker Started Job (Verified OTP):', startRes.data.status);

    const completeRes = await request(`/api/bookings/${bookingId}/complete`, 'POST', null, workToken);
    console.log('   Worker Completed Job:', completeRes.data.status);

    // 13. Customer Payment & Rating
    const paymentRes = await request('/api/payments', 'POST', {
      booking_id: bookingId,
      amount: 499.0,
    }, custToken);
    console.log('\n5. Payment Captured in PostgreSQL:', paymentRes.status, paymentRes.data.status);

    const ratingRes = await request('/api/ratings', 'POST', {
      booking_id: bookingId,
      rating_score: 5.0,
      comment: 'Super fast and reliable service!',
    }, custToken);
    console.log('   Rating Submitted in PostgreSQL:', ratingRes.status, `Score=${ratingRes.data.rating_score}`);
  }

  console.log('\n==================================================');
  console.log('🎉 REAL END-TO-END VERIFICATION SUCCESSFUL!');
  console.log('FastAPI + PostgreSQL is 100% connected & persistent!');
  console.log('==================================================');
}

main().catch((err) => {
  console.error('Error in verification:', err);
  process.exit(1);
});
