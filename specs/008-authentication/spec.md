# Phase A: Authentication & Users

## Feature
Real user authentication with registration, login, session management, and role-based access (student/teacher).

## Requirements
1. Users can register with name, email, password, and role (student/teacher)
2. Users can log in with email + password
3. JWT tokens for session persistence (localStorage)
4. Protected routes — only authenticated users see the app shell
5. User identity passed to all API calls (chat, execute, progress)
6. Neon PostgreSQL as the user store (cloud DB, not K8s PostgreSQL)

## Acceptance Criteria
- [ ] POST `/api/auth/register` creates user in Neon DB with hashed password
- [ ] POST `/api/auth/login` returns JWT token on valid credentials
- [ ] GET `/api/auth/me` returns user profile from valid JWT
- [ ] Frontend login form calls real API (no hardcoded credentials)
- [ ] Frontend stores JWT in localStorage, sends in Authorization header
- [ ] Invalid/expired tokens redirect to login screen
- [ ] Student role → StudentDashboard, Teacher role → TeacherDashboard
- [ ] Password hashed with bcrypt (min 10 rounds)

## Non-Goals (Phase A)
- OAuth/social login
- Email verification
- Password reset
- Rate limiting (Phase H)

## Tech Decisions
- **Auth in Next.js API routes** (not FastAPI) — simplest deployment, same container
- **JWT** (not sessions) — stateless, no session store needed
- **Neon PostgreSQL** — cloud DB with connection pooling, survives pod restarts
- **bcrypt** — industry standard password hashing
