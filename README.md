# Personal Finance Tracker

A full-stack personal finance tracker with transaction management, 
data visualization, an AI-powered financial assistant, and a 
built-in advisor-client access control system — built to explore 
production-grade patterns like JWT authentication, role-based data 
access, and automated testing.

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