# OnePlace Cooperative Service Platform

OnePlace is a cooperative service platform designed to empower skilled gig workers and cooperatives through transparent service discovery, fair opportunity allocation, and digital workflow verification.

---

## 🏗️ Repository Architecture

```text
onspace-9bkzub-36014/
├── phase 1/          # Expo / React Native Mobile Application
│   ├── app/          # Expo Router File-based Navigation
│   ├── components/   # UI Components & Custom Layouts
│   ├── contexts/     # Application State (AppContext)
│   ├── services/     # REST API Client & Storage Services
│   └── package.json  # Frontend Dependencies
│
├── backend/          # FastAPI REST API Backend
│   ├── app/          # API Routers, Domain Models, Schemas, & Logic
│   ├── alembic/      # Database Migration Scripts
│   ├── requirements.txt
│   └── .env.example  # Environment Variable Template
│
└── README.md
```

---

## ⚡ Quick Start

### 1. PostgreSQL Database Setup
Ensure PostgreSQL is running locally and database `oneplace` exists:
```sql
CREATE DATABASE oneplace;
```

### 2. Backend Setup (FastAPI)
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Copy configuration template and edit secrets
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Frontend Setup (Expo Go)
```powershell
cd "phase 1"
pnpm install # or npm install
npx expo start --port 8081
```

---

## 🌐 Network Architecture
- **Expo / Metro Bundler:** Port `8081` (`exp://<LAN_IP>:8081`)
- **FastAPI REST API:** Port `8001` (`http://<LAN_IP>:8001`)
- **PostgreSQL Database:** Port `5432` (`localhost:5432`)
