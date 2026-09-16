# Personal Finance Tracker

A full-stack personal finance tracker with transaction management, 
data visualization, an AI-powered financial assistant, and a 
built-in advisor-client access control system — built to explore 
production-grade patterns like JWT authentication, role-based data 
access, and automated testing.

[![CI](https://github.com/Daviti1010/finance-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/Daviti1010/finance-tracker/actions)
<br>
*Backend and frontend test suites run automatically on every pull request via GitHub Actions.*

## Tech Stack

**Frontend**
- React + TypeScript
- CSS
- Vite
- Recharts (data visualization)

**Backend**
- Node.js + Express
- PostgreSQL (raw SQL, no ORM)
- JWT authentication with bcrypt
- Google Gemini API (AI chatbot)
- Resend (transactional email)

**Testing & CI**
- Vitest + Supertest (backend)
- Vitest + React Testing Library (frontend)
- GitHub Actions (automated testing on every PR)

**Other**
- pdfkit (PDF export)

## Key Features

**Authentication & Security**
- JWT-based authentication with bcrypt password hashing
- Session invalidation via token versioning (logs out all sessions on password reset)
- "Forgot password" flow with time-limited, single-use verification codes sent via email

**Transaction Management**
- Full CRUD for income/expense transactions
- Filtering by type, category, and combinations thereof
- CSV and PDF export, with support for filtered exports

**Dashboard & Insights**
- Income vs. expense visualization by month, with year navigation
- Starting balance tracking and running balance calculations

**AI Financial Assistant**
- Chatbot powered by Google's Gemini API, scoped to personal finance topics
- Per-user rate limiting to prevent abuse
- Responses informed by the user's actual recent transaction history

**Advisor-Client Access Control**
- Relational linking system allowing advisors to request access to a client's data
- Clients must explicitly accept requests before any access is granted
- Either party can revoke access at any time, with re-requesting supported afterward
- Full role-based access enforcement at the API level, not just the UI

**Appearance**
- Dark mode with theme preference saved via localStorage

  ## Architecture Overview

The project is structured as a monorepo with two main folders:

- **`client/`** — React + TypeScript frontend, built with Vite
- **`server/`** — Node.js + Express backend, using raw SQL queries against PostgreSQL (no ORM)

### Authentication Flow
1. On login, the server issues a JWT signed with the user's ID and a `tokenVersion` value.
2. Every protected route is guarded by middleware that verifies the token's signature, confirms the user still exists, and checks that `tokenVersion` matches the current value stored in the database.
3. Resetting a password increments `tokenVersion` server-side, which instantly invalidates every previously issued token — even ones that haven't expired yet.

### Advisor-Client Access Control
The app supports two informal roles — **advisor** and **client** — without a fixed role column. Instead, relationships are modeled as rows in an `advisor_client_links` table:

1. An advisor sends a link request to a client by email.
2. The client can **accept** or **revoke** the request. Only an accepted link grants access.
3. A dedicated `requireClientAccess` middleware checks for an accepted link before allowing an advisor to view a client's transactions or financial summary — enforced entirely at the API level, independent of the frontend.
4. Links can be revoked and later re-requested, with the system tracking each request as its own record rather than overwriting history.

## Testing

The backend and frontend both have automated test coverage, run automatically on every pull request via GitHub Actions.

**Backend** — Vitest + Supertest, testing against a dedicated PostgreSQL test database:
- Authentication (registration, login, and all four token-rejection paths: missing, malformed, deleted-user, and stale-session tokens)
- Transaction CRUD, ownership enforcement, and filtering
- The full advisor-client RBAC lifecycle — link requests, accept/revoke, and access-control enforcement on protected routes
- Session invalidation after password reset
- Per-user chatbot rate limiting

**Frontend** — Vitest + React Testing Library, covering key components with real logic (forms, filters, multi-step flows).

## Setup & Installation

### Prerequisites
- Node.js (v22 or later)
- PostgreSQL

### 1. Clone the repository
```bash
git clone https://github.com/Daviti1010/finance-tracker.git
cd finance-tracker
```

### 2. Set up the database
Create a PostgreSQL database, then run the schema:
```bash
psql -U <your_user> -d <your_database> -f server/db/schema.sql
```

### 3. Backend setup
```bash
cd server
npm install
```
Create a `.env` file in `server/` with the following variables (see `.env.example` for reference):
- USER=your_postgres_user
- HOST=localhost
- DATABASE=your_database_name
- PASSWORD=your_postgres_password
- PORT=5432
- JWT_SECRET=your_jwt_secret
- GEMINI_API_KEY=your_gemini_api_key
- RESEND_API_KEY=your_resend_api_key
- EMAIL=your_sender_email_address

Run the server:
```bash
npm run dev
```

### 4. Frontend setup
```bash
cd client
npm install
npm run dev
```

The app should now be running locally, with the frontend available at whatever port Vite reports (typically `http://localhost:5173`).

### Running tests
**Backend** — create a separate test database and a corresponding `.env.test` (or equivalent) pointing to it, then:
```bash
cd server
npm test
```
**Frontend**
```bash
cd client
npm test
```