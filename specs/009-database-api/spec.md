# Phase B: Database Schema & API

## Goal
Replace all hardcoded frontend data with real Neon PostgreSQL queries via Next.js API routes.

## API Routes
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/progress` | GET | JWT | Student's topic progress |
| `/api/progress` | POST | JWT | Update progress for a topic |
| `/api/chat/history` | GET | JWT | Load chat history |
| `/api/chat/history` | POST | JWT | Save a chat message |
| `/api/execute` | POST | JWT | Execute code + save to submissions |
| `/api/teacher/students` | GET | JWT(teacher) | List all students with mastery |
| `/api/teacher/alerts` | GET | JWT(teacher) | Struggle alerts |

## Schema Additions
- `struggle_alerts` table — teacher-visible alerts
- Seed 8 Python topics into `progress` table on user registration
- `chat_messages` table already exists from Phase A migration

## Acceptance Criteria
- [ ] Student dashboard loads real progress from DB
- [ ] Chat messages persist across sessions
- [ ] Code executions saved to submissions table
- [ ] Teacher sees real student list from DB
- [ ] Teacher sees real struggle alerts
- [ ] Demo mode still works with hardcoded data (no DB calls)
