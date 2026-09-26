# Welcome to OnePlace

OnePlace enables effortless management and booking of verified local professionals. The oneplace-app, built with React Native and Expo, delivers seamless cross-platform performance across iOS, Android, and Web environments.

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Start the Development Backend

Before connecting physical phones, start the multi-device development backend:

```bash
npm run backend
```

The backend server listens on `0.0.0.0:5000` so physical phones on the same local Wi-Fi network can connect directly.

### 3. Start Expo in LAN Mode

To allow multiple physical devices to connect simultaneously:

```bash
npm run start:lan
# or
npx expo start --lan
```

Scan the printed QR code using the **Expo Go** app on each physical phone.

---

## Running OnePlace on Multiple Physical Phones Simultaneously

You can test real multi-user interactions across 2–4 physical phones connected to the same development environment at the same time:

- **Phone 1:** Customer Account (`priya@example.com` / `Password123!`)
- **Phone 2:** Worker Account A — Electrician (`suresh@example.com` / `Password123!`)
- **Phone 3:** Worker Account B — Plumber (`rajesh@example.com` / `Password123!`)
- **Phone 4:** Admin Account (`admin@oneplace.in` / `Password123!`)

### Setup Instructions:

1. **Connect to Same Wi-Fi:** Ensure your development laptop and all physical phones are connected to the exact same Wi-Fi / LAN network.
2. **Start Backend Server:** Run `npm run backend` in your terminal. It displays your laptop's LAN IP (e.g. `http://192.168.1.5:5000`).
3. **Configure API URL (Optional):** The app automatically resolves your laptop's LAN IP from Expo `hostUri`. If you want to explicitly specify it, set:
   ```bash
   # Windows PowerShell
   $env:EXPO_PUBLIC_API_URL="http://YOUR_LAPTOP_LAN_IP:5000"
   ```
4. **Start Metro in LAN Mode:** Run `npx expo start --lan`.
5. **Open Expo Go on Each Phone:** Scan the Metro QR code on all physical phones.
6. **Log in with Different Accounts:**
   - On Phone 1: Log in as Customer (e.g., Priya Mehra)
   - On Phone 2: Log in as Worker A (e.g., Suresh Patel — Electrician)
   - On Phone 3: Log in as Worker B (e.g., Rajesh Kumar — Plumber)
7. **Test Multi-Device Workflow:**
   - Customer on Phone 1 creates an Electrician service request.
   - Electrician on Phone 2 receives the job opportunity notification.
   - Plumber on Phone 3 does NOT receive the electrician job opportunity (filtered server-side).
   - Worker A accepts offer $\rightarrow$ Customer's phone updates booking status instantly.

---

## Windows Firewall & Network Troubleshooting

If a physical phone displays `"Unable to connect to OnePlace server"`:

1. **Verify Local Wi-Fi Connection:** Make sure airplane mode / cellular data is turned off on the phone so traffic goes over Wi-Fi.
2. **Allow Node / Backend Port in Windows Firewall:**
   - Open **Windows Defender Firewall with Advanced Security**.
   - Go to **Inbound Rules** $\rightarrow$ **New Rule...**
   - Rule Type: **Port** $\rightarrow$ Specific local ports: `5000, 8081`
   - Action: **Allow the connection**.
   - Profile: **Domain, Private, Public**.
   - Name: `OnePlace Dev Backend`.
3. **Test Connectivity from Mobile Browser:**
   - Open Safari or Chrome on your phone and visit: `http://YOUR_LAPTOP_LAN_IP:5000/api/health`
   - It should return: `{"status":"ok","service":"OnePlace Development Backend"}`.

---

## Main Dependencies

- React Native: 0.86.3
- React: 19.2.3
- Expo: ~57.0.23
- Expo Router: ~57.0.21
- AsyncStorage: 2.2.0

---

## License

Private Project ("private": true).
