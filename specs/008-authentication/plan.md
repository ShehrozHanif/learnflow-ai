# Phase A: Authentication Plan

## Architecture
```
Browser → Next.js API Routes (/api/auth/*) → Neon PostgreSQL
                ↓
         JWT token stored in localStorage
                ↓
         Sent as Authorization: Bearer <token> on all API calls
```

## Implementation Steps

### 1. Database (Neon)
- Add `password_hash` column to existing `users` table
- Add `sessions` table for optional token tracking
- Run migration against Neon PostgreSQL

### 2. Dependencies
- `pg` — PostgreSQL client for Node.js
- `bcryptjs` — Pure JS bcrypt (no native compilation needed for Alpine)
- `jsonwebtoken` — JWT sign/verify

### 3. API Routes (Next.js)
- `src/app/api/auth/register/route.ts` — POST: validate → hash password → insert user → return JWT
- `src/app/api/auth/login/route.ts` — POST: find user → compare password → return JWT
- `src/app/api/auth/me/route.ts` — GET: verify JWT → return user profile
- `src/lib/db.ts` — Shared Neon PostgreSQL connection pool
- `src/lib/auth.ts` — JWT sign/verify helpers

### 4. Frontend Updates (page.jsx)
- LoginPage: call `/api/auth/login`, store token
- RegisterPage: call `/api/auth/register`, store token
- AppShell: check token on mount, redirect to login if invalid
- Pass user info (id, name, role) to child components
- Add Authorization header to chat/execute API calls

### 5. Docker/Build
- Add dependencies to package.json
- No Dockerfile changes needed (bcryptjs is pure JS, pg is JS)

## Security
- Passwords hashed with bcryptjs (10 rounds)
- JWT secret from AUTH_SECRET env var
- JWT expiry: 7 days
- No sensitive data in JWT payload (only user_id, email, role)
