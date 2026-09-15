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