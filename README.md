# MiniLedger — Personal Debt Tracking Application

> **CredSetu Technologies — Full Stack Development Internship Assignment**  
> Built with: **Node.js · TypeScript · Fastify · Prisma ORM · PostgreSQL · Zod · React Native (Expo) · Vitest**

---

## 📹 Video Walkthrough & Demo

🎥 **Watch the Live Demonstration**:  
👉 **[MiniLedger Full Stack Demo & Architecture Walkthrough (Google Drive)](https://drive.google.com/file/d/1SWgzR_Q7Q_cQk7c-pcBunu_RfIqN-UAb/view?usp=drivesdk)**

---

## 🌟 Overview

**MiniLedger** is a lightweight, mobile-first financial ledger designed to track informal loans between friends. It eliminates forgotten debts, ambiguously tracked repayments, and stale overdue status.

### ✨ Key Features
- **Phone Number Login with Mock OTP**: No third-party SMS gateway costs. The 4-digit verification code is printed directly to the server terminal.
- **Real-Time Dynamic Overdue Calculation**: An entry is overdue if and only if `!isRepaid && dueDate < now()`. No background cron jobs or stale database states.
- **Financial Dashboard Summary**: Instant computation of `Total Lent`, `Total Repaid`, and `Total Overdue` with active vs. settled loan counters.
- **Interactive Mobile UI**: Built with React Native & Expo. Features overdue red card highlights, pull-to-refresh, status filter pills, and quick date selectors.
- **Enterprise-Grade Architecture**: Replaces generic Express with **Fastify** and includes runtime payload validation via **Zod**, matching CredSetu's production stack.
- **Comprehensive Test Suite**: 15 automated integration tests written with **Vitest**.

---

## 🏗️ Architecture & Tech Stack

```
MiniLedger/
├── backend/                  # Fastify + TypeScript + Prisma API
│   ├── prisma/               # Database schema & migrations
│   ├── src/
│   │   ├── modules/auth/     # Phone OTP authentication module
│   │   ├── modules/loans/    # Loan CRUD & summary calculation
│   │   ├── middlewares/      # JWT pre-handler authentication hook
│   │   ├── app.ts            # Fastify application factory
│   │   └── server.ts         # Server runner & network listener
│   └── tests/                # 15 Vitest integration tests
│
└── mobile/                   # React Native (Expo) Application
    ├── src/
    │   ├── context/          # Centralized AuthContext (AsyncStorage token session)
    │   ├── services/         # Typed API client wrapper
    │   ├── components/       # SummaryCard, LoanCard, AddLoanModal, StatusBadge
    │   └── screens/          # LoginScreen, DashboardScreen
    └── App.tsx               # App entrypoint with declarative auth routing
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20+ LTS installed
- **npm**: v10+ installed
- *(Optional)* **Docker Desktop**: for running local PostgreSQL 16

---

### 2. Backend Setup & Startup

1. Open your terminal in the `backend/` directory:
   ```bash
   cd backend
   npm install
   ```

2. Start PostgreSQL (either via Docker Compose or your own local Postgres instance):
   ```bash
   # From the project root:
   docker compose up -d
   ```
   *(Ensure `backend/.env` has your valid `DATABASE_URL`)*

3. Run migrations and generate Prisma client:
   ```bash
   npm run db:generate
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The server will start at `http://localhost:3000`.  
   You will see:
   ```
   🚀 MiniLedger Server listening at http://0.0.0.0:3000
   🔍 Health check available at: http://0.0.0.0:3000/health
   ```

5. **Run the Automated Test Suite**:
   ```bash
   npm test
   ```
   All 15 tests will execute in milliseconds.

---

### 3. Mobile App Setup & Startup

1. Open a new terminal in the `mobile/` directory:
   ```bash
   cd mobile
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npm start
   ```

3. **Running the App**:
   - **On Android Emulator**: Press `a` in the terminal.
   - **On Physical Device**: Install the **Expo Go** app from Google Play / App Store and scan the QR code in your terminal.  
     *(Note: When using a physical phone, ensure your phone and computer are on the same Wi-Fi, and tap the server config at the bottom of the Login screen to set `http://<YOUR_COMPUTER_IP>:3000`)*.

---

## 🔐 How the Mock OTP Works

1. On the mobile Login screen, enter any valid 10-digit mobile number (e.g., `9876543210`) and tap **"Send OTP Code"**.
2. Switch to your backend server terminal. You will see a clean mock SMS message:
   ```
   ========================================
   📩 [MOCK SMS GATEWAY]
   Phone: +919876543210
   Your MiniLedger OTP is: 4829
   Valid for: 5 minutes
   ========================================
   ```
3. Type the 4-digit code into the mobile app and tap **"Verify & Open Ledger"**.
4. The server validates the OTP, marks it verified to prevent replay attacks, creates your user profile, and returns a signed JWT Bearer token.

---

## 📊 API Contract Summary

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/health` | Public | Server health and uptime check |
| `POST` | `/api/auth/send-otp` | Public | Generates 4-digit OTP and logs to console |
| `POST` | `/api/auth/verify-otp` | Public | Verifies OTP and returns JWT Bearer token |
| `GET` | `/api/loans` | Bearer JWT | Returns user loans with dynamic `isOverdue` boolean |
| `POST` | `/api/loans` | Bearer JWT | Creates a new loan entry |
| `GET` | `/api/loans/summary` | Bearer JWT | Returns `{ totalLent, totalRepaid, totalOverdue }` |
| `PATCH`| `/api/loans/:id/repay` | Bearer JWT | Sets `isRepaid = true` and `repaidAt = now()` |

---

## 🎯 Key Engineering Decisions (Interview Defense)

1. **Why Fastify instead of Express?**
   Fastify has native async/await lifecycles, zero-overhead schema compilation (`fastify-type-provider-zod`), and directly matches CredSetu's production stack.
2. **Why dynamic `isOverdue` instead of a database column?**
   Storing `OVERDUE` in a database column goes stale as soon as midnight passes unless updated by an expensive recurring background cron worker. Computing `isOverdue: (!isRepaid && dueDate < now())` at query time guarantees 100% real-time mathematical accuracy with zero background infrastructure overhead.
3. **Why Decimal(12,2) for money?**
   Prevents IEEE 754 floating-point rounding errors (e.g. `0.1 + 0.2 = 0.30000000000000004`).
