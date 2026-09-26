import time
import unittest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestOnePlaceBackend(unittest.TestCase):

    def test_health_check(self):
        response = client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")

    def test_services_catalogue(self):
        response = client.get("/api/services")
        self.assertEqual(response.status_code, 200)
        services = response.json()
        self.assertTrue(len(services) > 0)
        print(f"[SUCCESS] Services catalogue loaded: {len(services)} services")

    def test_end_to_end_flow(self):
        ts = int(time.time())
        # 1. Register Customer
        cust_email = f"cust_{ts}@oneplace.com"
        res = client.post("/api/auth/register", json={
            "name": "E2E Customer",
            "email": cust_email,
            "password": "Password123!",
            "role": "customer"
        })
        self.assertEqual(res.status_code, 200, f"Register failed: {res.text}")

        # 2. Login Customer
        res = client.post("/api/auth/login", json={
            "email": cust_email,
            "password": "Password123!"
        })
        self.assertEqual(res.status_code, 200, f"Login failed: {res.text}")
        cust_token = res.json()["access_token"]
        cust_headers = {"Authorization": f"Bearer {cust_token}"}

        # Get Customer Profile
        res = client.get("/api/customers/me", headers=cust_headers)
        self.assertEqual(res.status_code, 200)

        # Update Customer Profile
        res = client.put("/api/customers/me", json={
            "phone": f"987{ts % 10000000:07d}",
            "address": "123 Main Street",
            "city": "Dehradun",
            "pincode": "248001"
        }, headers=cust_headers)
        self.assertEqual(res.status_code, 200)

        # 3. Register Worker
        work_email = f"worker_{ts}@oneplace.com"
        res = client.post("/api/auth/register", json={
            "name": "E2E Worker Plumber",
            "email": work_email,
            "password": "Password123!",
            "role": "worker"
        })
        self.assertEqual(res.status_code, 200)

        # Login Worker
        res = client.post("/api/auth/login", json={
            "email": work_email,
            "password": "Password123!"
        })
        self.assertEqual(res.status_code, 200)
        work_token = res.json()["access_token"]
        work_headers = {"Authorization": f"Bearer {work_token}"}

        # Worker Profile Update with skill "Plumbing Services"
        res = client.put("/api/workers/me", json={
            "primary_skill": "Plumbing Services",
            "service_area": "Dehradun"
        }, headers=work_headers)
        self.assertEqual(res.status_code, 200)

        # Worker Upload Work Slip (Compulsory for dashboard/jobs)
        res = client.post("/api/workers/me/work-slip", json={
            "document_name": "OnePlace Signed Work Slip.pdf",
            "document_reference": f"DOC_WS_{ts}"
        }, headers=work_headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "uploaded")

        # Worker Onboarding Status
        res = client.get("/api/workers/me/onboarding-status", headers=work_headers)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["dashboard_eligible"])

        # 4. Customer Creates Service Request
        res = client.post("/api/requests", json={
            "service_label": "Plumbing Services",
            "issue_description": "Leaking bathroom pipe",
            "address": "123 Main Street",
            "city": "Dehradun",
            "pincode": "248001",
            "locality": "Dehradun"
        }, headers=cust_headers)
        self.assertEqual(res.status_code, 200)
        req_data = res.json()
        request_id = req_data["id"]
        print(f"[SUCCESS] Service request #{request_id} created, matching triggered.")

        # 5. Worker Checks Offers
        res = client.get("/api/worker/offers", headers=work_headers)
        self.assertEqual(res.status_code, 200)
        offers = res.json()
        self.assertTrue(len(offers) > 0, f"No offers received for worker {work_email}")
        my_offer = [o for o in offers if o["request_id"] == request_id][0]
        offer_id = my_offer["id"]

        # Worker Accepts Offer -> Creates Booking & OTP
        res = client.post(f"/api/worker/offers/{offer_id}/accept", headers=work_headers)
        self.assertEqual(res.status_code, 200)
        booking_data = res.json()
        booking_id = booking_data["id"]
        otp_code = booking_data["otp_code"]
        print(f"[SUCCESS] Offer accepted. Booking #{booking_id} created with OTP: {otp_code}")

        # Worker Arrives
        res = client.post(f"/api/bookings/{booking_id}/arrive", headers=work_headers)
        self.assertEqual(res.status_code, 200, f"Arrive failed: {res.text}")
        self.assertEqual(res.json()["status"], "ARRIVED")

        # Worker Starts Job via OTP
        res = client.post(f"/api/bookings/{booking_id}/start", json={"otp_code": otp_code}, headers=work_headers)
        self.assertEqual(res.status_code, 200, f"Start failed: {res.text}")
        self.assertEqual(res.json()["status"], "IN_PROGRESS")

        # Worker Completes Job
        res = client.post(f"/api/bookings/{booking_id}/complete", headers=work_headers)
        self.assertEqual(res.status_code, 200, f"Complete failed: {res.text}")
        self.assertEqual(res.json()["status"], "COMPLETED")

        # 6. Customer Process Payment
        res = client.post("/api/payments", json={
            "booking_id": booking_id,
            "amount": 499.0
        }, headers=cust_headers)
        self.assertEqual(res.status_code, 200, f"Payment failed: {res.text}")
        self.assertEqual(res.json()["status"], "captured")

        # 7. Customer Rates Worker
        res = client.post("/api/ratings", json={
            "booking_id": booking_id,
            "rating_score": 5.0,
            "comment": "Excellent plumbing work!"
        }, headers=cust_headers)
        self.assertEqual(res.status_code, 200, f"Rating failed: {res.text}")
        print("[SUCCESS] Payment and rating completed successfully!")

if __name__ == "__main__":
    unittest.main()
