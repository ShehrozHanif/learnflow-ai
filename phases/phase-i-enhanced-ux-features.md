# Phase I: Enhanced UX Features (10-16)

**Status:** COMPLETE
**Date:** 2026-03-30
**Branch:** `003-backend-services`

## What Was Done

7 features from `new_feature.md` were implemented to enhance the student and teacher experience, plus a sidebar bug fix:

### Feature 10: Streak Tracking Fix
- `/api/execute` now calculates consecutive-day streak from `submissions` table
- Streak synced to `progress.streak` column after every successful code run
- Properly feeds into mastery formula (10% weight)

### Feature 11: Leaderboard
- `/api/leaderboard` API route with `?period=all|weekly` filter
- Aggregates: avg mastery, max streak, topics started/mastered, code runs, successful runs, quizzes taken
- Joins `users` + `progress` + `submissions` + `quiz_attempts`
- Returns `{ leaderboard, my_rank }` with `is_me` flag per entry
- `LeaderboardPage` component with podium display (gold/silver/bronze), rank badges, stat columns

### Feature 12: Dark/Light Mode
- 18 CSS custom properties (`--lf-bg`, `--lf-card`, `--lf-text`, `--lf-border`, `--lf-sidebar`, etc.)
- Theme toggle switch in `SettingsPage`
- Persisted via `lf_theme` in localStorage
- Applied globally via `useEffect` on `document.documentElement.style`
- All components inherit theme through CSS variables — no per-component styling needed

### Feature 13: Onboarding Flow
- 4-step flow: Welcome → Survey → Feature Tour → First Code Run
- Per-user tracking: `lf_onboarded_${userId}` (not global)
- Skip button with visible white-font styling per user feedback
- Shows only once per user account, survives browser refresh

### Feature 14: Chat History Page
- `ChatHistoryPage` component added to sidebar navigation
- Search by keyword across all messages
- Date-grouped conversation cards
- Click to expand full conversation with styled message bubbles (user vs AI)
- Fetches from `chat_messages` table

### Feature 15: Code Snippets (Save & Reuse)
- `/api/snippets` API route — GET, POST, DELETE, PATCH (star toggle)
- `snippets` table auto-created via `ensureTable()`
- `SnippetsPage` with 8 pre-built starter templates (Hello World, For Loop, List Comprehension, File I/O, Dictionary Ops, Functions, Try/Except, Class Definition)
- Star/favorite toggle, tag filtering, search
- "Load into Editor" button — cross-component communication via lifted `snippetCode` state in AppShell

### Feature 16: Voice Input
- Web Speech API (`SpeechRecognition`/`webkitSpeechRecognition`)
- Mic button in chat input area
- Real-time transcript appended to chat input field
- Visual feedback: pulsing red dot during recording
- Graceful fallback message for unsupported browsers

### Bug Fix: Dynamic Sidebar
- Replaced hardcoded "Mr. Rodriguez" / "Maya Chen" names
- Sidebar now accepts `user` prop and displays `user.name` + computed initials

## Files Created

| File | Description |
|------|-------------|
| `src/app/api/leaderboard/route.ts` | Leaderboard API with period filter |
| `src/app/api/snippets/route.ts` | CRUD API for code snippets |
| `phases/phase-i-enhanced-ux-features.md` | This summary file |

## Files Modified

| File | Changes |
|------|---------|
| `src/app/page.jsx` | Added LeaderboardPage, OnboardingFlow, ChatHistoryPage, SnippetsPage components; dark mode CSS variables; voice input; sidebar dynamic names; NAV_ITEMS updates |
| `src/app/api/execute/route.ts` | Added streak calculation from submissions table |
| `src/app/api/teacher/student-detail/route.ts` | Fixed `[...new Set()]` → `Array.from(new Set())` for TypeScript compatibility |

## Database Changes

| Table | Change |
|-------|--------|
| `snippets` | New table — id, user_id, title, description, code, tags, starred, created_at |

## New API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/leaderboard` | GET | Leaderboard with `?period=all\|weekly` |
| `/api/snippets` | GET | List user snippets + starter templates |
| `/api/snippets` | POST | Save new snippet |
| `/api/snippets` | DELETE | Remove snippet (verified ownership) |
| `/api/snippets` | PATCH | Toggle star/favorite |

## New Navigation Items

| ID | Label | Emoji | Access |
|----|-------|-------|--------|
| snippets | Snippets | 📌 | Student only |
| history | Chat History | 🗂️ | Student only |
| leaderboard | Leaderboard | 🏆 | All users |

## Success Criteria

- [x] Streak properly calculated from consecutive submission days
- [x] Leaderboard shows ranked users with stats and highlights current user
- [x] Dark/Light mode persists across refresh with CSS variables
- [x] Onboarding shows once per new user, skippable
- [x] Chat history searchable and grouped by date
- [x] Snippets saveable, starrable, filterable, loadable into editor
- [x] Voice input works with Web Speech API and degrades gracefully
- [x] Sidebar shows dynamic user name instead of hardcoded values

## Commits

| Hash | Message |
|------|---------|
| `813fa77` | Claude: Add dark/light mode toggle with CSS custom properties |
| `a15d019` | Claude: Add onboarding flow — welcome, survey, feature tour, and first code run |
| `f9e5cf4` | Claude: Add chat history page and fix dynamic sidebar user name |
| `d9bf81d` | Claude: Add code snippets — save, browse, star, search, and load into editor |
| `0d8296a` | Claude: Add voice input — mic button with Web Speech API for chat |

## What's Next

All 16 features from `new_feature.md` are complete. Potential next steps:
- Deploy updated frontend to GKE (Phase 9 re-deploy)
- Feature cards on landing page (Changing 1 from `new_feature.md`)
- Learning modules system (Changing 2 from `new_feature.md`)
- Rate limiting (Changing 7 from `new_feature.md`)
- Classroom system with join codes (Changing 9 from `new_feature.md`)
