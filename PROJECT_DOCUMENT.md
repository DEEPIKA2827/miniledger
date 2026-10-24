# MiniLedger â€” Project Specification & Architecture Document

> **Author**: Deepika S (CredSetu Technologies Assignment)  
> **Target Role**: Full Stack Development Intern  
> **Status**: Completed (Phase 1 & Phase 2)  
> **Demo Video**: [Watch Walkthrough on Google Drive](https://drive.google.com/file/d/1SWgzR_Q7Q_cQk7c-pcBunu_RfIqN-UAb/view?usp=drivesdk)

---

## 1. Problem Statement
People frequently lend small amounts of money to friends, colleagues, and acquaintances. Without a lightweight tracking mechanism, these informal loans are easily forgotten, terms are miscommunicated, and overdue amounts linger indefinitely.

**MiniLedger** is a streamlined mobile and backend solution designed to:
- Authenticate users quickly and friction-free via phone number and OTP.
- Record every loan entry with precision (recipient name, principal amount, due date, optional note/receipt).
- Clearly distinguish active loans from settled ones and visibly highlight overdue debts.
- Deliver an instant, real-time executive financial summary: *Total Amount Lent*, *Total Repaid*, and *Total Currently Overdue*.

---

## 2. Tech Stack & Justifications (vs. Assignment Minimums & CredSetu Stack)

| Layer | Selected Tech | Assignment Baseline | CredSetu Production Stack Alignment |
|---|---|---|---|
| **Backend Runtime & Language** | Node.js (v20+ LTS) + TypeScript | Node.js + TypeScript | Direct match |
| **Backend Framework** | **Fastify** | Express (implied by default) | Direct match with CredSetu backend |
| **Database & ORM** | **PostgreSQL** + **Prisma ORM** | PostgreSQL | Direct match with CredSetu data layer |
| **Validation Layer** | **Zod** | Not specified | Direct match with CredSetu validation patterns |
| **Mobile Client** | **React Native (Expo / Bare RN)** | React Native | Direct match (Android target) |
| **Testing Engine** | **Vitest** (Unit/Integration) | Optional | Direct match with CredSetu test runner |
| **Containerization / Local DB**| Docker Compose (PostgreSQL 16) | Local Postgres | Standard industry practice / CredSetu dev workflow |

---

## 3. Database Schema

### 3.1 Entity Relationship Diagram (ERD)
```
User (1) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€< Loan (*)
[id, phone]          [id, userId, friendName, amount, dueDate, isRepaid, repaidAt]

OtpVerification (Independent audit table)
[id, phone, otpCode, expiresAt, verified]
```

### 3.2 Models & Field Definitions

#### `users`
- `id` (`String`, Primary Key, CUID): Unique user ID.
- `phone` (`String`, Unique, Indexed): User's mobile number.
- `createdAt` / `updatedAt` (`DateTime`): Audit timestamps.

#### `otp_verifications`
- `id` (`String`, Primary Key, CUID): Verification record ID.
- `phone` (`String`, Indexed): Mobile number requesting OTP.
- `otpCode` (`String`): 4 or 6-digit verification code.
- `expiresAt` (`DateTime`): Expiry timestamp (e.g., 5-minute validity).
- `verified` (`Boolean`, default `false`): Single-use flag preventing replay attacks.
- `createdAt` (`DateTime`): Generation timestamp.

#### `loans`
- `id` (`String`, Primary Key, CUID): Unique loan entry ID.
- `userId` (`String`, Foreign Key -> `users.id`, Indexed): Owner of the ledger entry.
- `friendName` (`String`): Name of the borrower.
- `amount` (`Decimal(12, 2)`): Precise monetary amount.
- `dueDate` (`DateTime`): Scheduled date for repayment.
- `isRepaid` (`Boolean`, default `false`): Current settlement flag.
- `repaidAt` (`DateTime`, Nullable): Timestamp when loan was marked repaid.
- `notes` (`String`, Nullable): Optional description.
- `receiptUrl` (`String`, Nullable): Optional photo receipt URL (Bonus).
- `createdAt` / `updatedAt` (`DateTime`): Timestamps.

> **Key Design Decision (Interview Highlight)**:
> We do NOT persist `OVERDUE` as an enum status in PostgreSQL. An entry is dynamically overdue when `!isRepaid && dueDate < now()`. This ensures the status is always computed in real-time and never goes stale.

---

## 4. API Contract

### 4.1 Endpoints Overview

| Method | Endpoint | Auth | Purpose |
|---|---|:---:|---|
| `POST` | `/api/auth/send-otp` | Public | Generates mock OTP and logs to console. |
| `POST` | `/api/auth/verify-otp` | Public | Validates OTP and issues JWT Bearer token. |
| `GET` | `/api/loans` | Bearer JWT | Returns loans list with dynamic `isOverdue` boolean. |
| `POST` | `/api/loans` | Bearer JWT | Creates a new loan entry. |
| `PATCH`| `/api/loans/:id/repay` | Bearer JWT | Sets `isRepaid = true` and `repaidAt = now()`. |
| `GET` | `/api/loans/summary` | Bearer JWT | Returns `{ totalLent, totalRepaid, totalOverdue }`. |

### 4.2 Endpoint Specifications

#### `POST /api/auth/send-otp`
- **Request Body**:
  ```json
  { "phone": "9876543210" }
  ```
- **Response (200 OK)**:
  ```json
  { "success": true, "message": "OTP generated and logged to server console", "expiresInSeconds": 300 }
  ```

#### `POST /api/auth/verify-otp`
- **Request Body**:
  ```json
  { "phone": "9876543210", "otp": "4829" }
  ```
- **Response (200 OK)**:
  ```json
  { "success": true, "token": "JWT_BEARER_STRING", "user": { "id": "cuid", "phone": "9876543210" } }
  ```

#### `POST /api/loans`
- **Request Body**:
  ```json
  {
    "friendName": "Rahul Sharma",
    "amount": 1500.00,
    "dueDate": "2026-11-15T00:00:00.000Z",
    "notes": "Optional context"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "loan": {
      "id": "cuid",
      "friendName": "Rahul Sharma",
      "amount": 1500.00,
      "dueDate": "2026-11-15T00:00:00.000Z",
      "isRepaid": false,
      "repaidAt": null,
      "isOverdue": false,
      "notes": "Optional context",
      "createdAt": "2026-10-22T00:50:00.000Z"
    }
  }
  ```

#### `GET /api/loans`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "loans": [
      {
        "id": "cuid",
        "friendName": "Priya Singh",
        "amount": 2000.00,
        "dueDate": "2026-10-20T00:00:00.000Z",
        "isRepaid": false,
        "repaidAt": null,
        "isOverdue": true,
        "notes": null,
        "createdAt": "2026-10-10T12:00:00.000Z"
      }
    ]
  }
  ```

#### `PATCH /api/loans/:id/repay`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "loan": {
      "id": "cuid",
      "isRepaid": true,
      "repaidAt": "2026-10-22T00:52:00.000Z",
      "isOverdue": false
    }
  }
  ```

#### `GET /api/loans/summary`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "summary": {
      "totalLent": 4500.00,
      "totalRepaid": 500.00,
      "totalOverdue": 2000.00,
      "activeLoanCount": 2,
      "settledLoanCount": 1
    }
  }
  ```

---

## 5. App Screens & Component Breakdown

### 5.1 Screen Architecture & Flow
```
App.tsx (AuthContext: userToken, isAuthenticated)
  â”œâ”€â”€ Unauthenticated -> LoginScreen (Phone Input -> Mock OTP Input)
  â””â”€â”€ Authenticated   -> DashboardScreen
                          â”œâ”€â”€ <SummaryCard /> (Total Lent, Repaid, Overdue)
                          â”œâ”€â”€ <LoanList /> (FlatList with pull-to-refresh)
                          â”‚     â””â”€â”€ <LoanCard /> (Item with Overdue badge & Repay button)
                          â””â”€â”€ <AddLoanModal /> (Name, Amount, Due Date form)
```

### 5.2 Screens

#### 1. `LoginScreen` (`mobile/src/screens/LoginScreen.tsx`)
- **Step 1 (Phone Input)**: 10-digit number validation, triggers `POST /api/auth/send-otp`.
- **Step 2 (OTP Input)**: 4-digit code entry with terminal log hint, triggers `POST /api/auth/verify-otp`.
- Stores JWT token in client storage and updates `AuthContext`.

#### 2. `DashboardScreen` (`mobile/src/screens/DashboardScreen.tsx`)
- Header displaying user info and a logout button.
- Fetches and displays `GET /api/loans/summary` and `GET /api/loans` on mount with pull-to-refresh (`RefreshControl`).
- Floating Action Button (FAB) or header button to trigger `<AddLoanModal />`.

### 5.3 Modular Components

#### `<SummaryCard />` (`mobile/src/components/SummaryCard.tsx`)
- Renders 3 clean financial tiles:
  - **Total Lent** (Blue/neutral tint)
  - **Total Repaid** (Emerald green tint)
  - **Overdue Amount** (Crimson red tint with warning icon)

#### `<LoanCard />` (`mobile/src/components/LoanCard.tsx`)
- Individual loan card with clear typography.
- **Dynamic Overdue Visuals**:
  - If `isOverdue === true`: Red border accent, subtle rose background tint, and prominent `"OVERDUE"` badge.
  - If `isRepaid === true`: Subtle muted styling, green `"REPAID"` badge, shows repaid date.
  - If pending: Neutral styling with due date relative label (e.g., "Due in 3 days").
- Contains an inline **"Mark Repaid"** button (disabled/hidden if already repaid).

#### `<AddLoanModal />` (`mobile/src/components/AddLoanModal.tsx`)
- Slide-up bottom sheet / modal.
- Input fields:
  - Friend Name (Text input)
  - Amount in â‚¹ (Numeric keypad)
  - Due Date (Date picker / selector)
  - Optional Notes
- Form validation and submit button with loading state.

#### `<StatusBadge />` (`mobile/src/components/StatusBadge.tsx`)
- Reusable visual status pill (`REPAID` in green, `OVERDUE` in red, `PENDING` in amber).

---

## 6. Setup & Run Instructions
*(To be detailed as code is scaffolded)*

---

## 7. Testing Strategy
- **Unit Testing**: Schema validation rules (Zod) and pure summary calculation functions using Vitest.
- **Integration Testing**: Fastify route testing using `fastify.inject()` against an ephemeral/test database instance.
- **Interview Walkthrough Readiness**: Every test case will read as clear business documentation.

---

## 8. Open Questions & Architectural Decisions
- [x] Backend framework selection: Fastify chosen over Express.
- [x] ORM selection: Prisma chosen over raw SQL or TypeORM.
- [ ] Mobile runtime: Expo (development build) vs. React Native CLI. Expo recommended for seamless setup, fast testing, and cross-platform ease.
- [ ] Authentication session strategy: JWT (access token) vs. session cookies. JWT recommended for standard React Native mobile client auth.

---

## 9. Changelog
- **2026-10-23 (Phase 2, Steps 2.1 - 2.4)**: Completed full React Native (Expo) mobile client with TypeScript in strict mode, @react-native-async-storage/async-storage session persistence, centralized AuthContext, LoginScreen with mock OTP evaluator flow, DashboardScreen with <SummaryCard />, <LoanCard /> (with dynamic overdue red styling and settle actions), <AddLoanModal />, filter tabs, and comprehensive root README.md.
- **2026-10-23 (Phase 1, Step 1.6)**: Implemented Ledger Summary Dashboard endpoint (GET /api/loans/summary) with financial metrics aggregation (	otalLent, 	otalRepaid, 	otalOverdue, and active/settled counts), 2-decimal precision normalization, and comprehensive Vitest test coverage (15 total tests passing).
- **2026-10-23 (Phase 1, Step 1.5)**: Implemented Loan Entry CRUD module (`POST /api/loans`, `GET /api/loans`, `PATCH /api/loans/:id/repay`) with JWT pre-handler auth hook (`authenticate.ts`), Zod schemas (`loans.schema.ts`), tenant isolation, dynamic overdue calculation, and 8 comprehensive Vitest integration tests (`tests/loans.test.ts`).
- **2026-10-23 (Phase 1, Step 1.4)**: Implemented Phone OTP Authentication module (`POST /api/auth/send-otp` & `POST /api/auth/verify-otp`) with Zod schemas (`auth.schema.ts`), console mock SMS logging, Prisma OTP verification & user upsert, JWT token issuance, and 5 comprehensive Vitest tests (`tests/auth.test.ts`).
- **2026-10-23 (Phase 1, Step 1.3)**: Built Fastify application factory (`src/app.ts`) and server runner (`src/server.ts`) with Zod type-provider, CORS, JWT configuration, and `/health` route; verified with Vitest integration test (`tests/health.test.ts`).
- **2026-10-22 (Phase 1, Step 1.2)**: Configured PostgreSQL Docker service (`docker-compose.yml`), `.env` configuration, Prisma schema (`schema.prisma`), singleton Prisma Client (`src/lib/prisma.ts`), and successfully generated Prisma Client artifacts.
- **2026-10-22 (Phase 1, Step 1.1)**: Scaffolded `backend/` directory, initialized `package.json` with Fastify, Zod, Prisma, and Vitest dependencies; created strict `tsconfig.json` and `.gitignore`.
- **2026-10-22 (Phase 1, Step 1.0)**: Initialized project document with Problem Statement, Tech Stack justifications, Database Schema, and API Contract.


