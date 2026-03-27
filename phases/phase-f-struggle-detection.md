# Phase F: Struggle Detection (Live)

## Completed: 2026-03-27

## What Was Done

### 1. Kafka Event Publishing
- Created `src/lib/kafka.ts` — KafkaJS producer with graceful fallback
- Publishes to `struggle` topic on every struggle detection event
- Connection-resilient: if Kafka unavailable, events are still saved to DB

### 2. Four Struggle Trigger Types
All triggers create `struggle_alerts` in DB AND publish Kafka events:

| Trigger | Source | Condition |
|---------|--------|-----------|
| `repeated_error` | `/api/execute` | 5+ consecutive code execution failures |
| `frustrated_message` | `/api/chat` | NLP routes message to "struggle" agent |
| `low_quiz_score` | `/api/chat` + `/api/progress/check-struggle` | Quiz score < 50% on any topic |
| `stuck_time` | `/api/progress/check-struggle` | 3+ errors in 10 min, 0 successes |

### 3. Real-Time Teacher Dashboard
- Auto-refreshes every 10 seconds (polling `/api/teacher/alerts` + `/api/teacher/students`)
- Alert type badges with color coding (Repeated Errors, Frustrated, Low Quiz, Stuck 10min+)
- Resolve button calls `/api/teacher/alerts/resolve` — marks alert resolved in DB
- "Auto-refresh 10s" indicator in header

### 4. Teacher Assigns Exercises to Specific Students
- New `assigned_exercises` table in DB
- `/api/teacher/assign` — POST to assign exercise to a student
- `/api/teacher/assign` — GET to view assigned exercises (student or teacher)
- Assign modal with student dropdown, shows name + module + mastery %
- Can assign from struggle alerts (Assign button) or from generated exercises

### 5. AI Exercise Generation (Real)
- `/api/teacher/exercises/generate` — POST with prompt, calls OpenAI gpt-4o-mini
- Returns structured JSON: title, difficulty, description, starter_code, expected_output
- Teacher types description, AI generates exercise, then assigns to student
- Mock fallback when no API key

### 6. Student Struggle Check
- StudentDashboard runs `/api/progress/check-struggle` every 60 seconds
- Detects stuck_time (3+ errors in 10min) and low_quiz_score automatically
- Creates alerts visible to teachers in real-time

## Files Created
- `src/lib/kafka.ts` — Kafka producer library
- `src/app/api/teacher/alerts/resolve/route.ts` — Resolve alerts API
- `src/app/api/teacher/assign/route.ts` — Assign exercises API
- `src/app/api/teacher/exercises/generate/route.ts` — AI exercise generation
- `src/app/api/progress/check-struggle/route.ts` — Struggle detection checks
- `scripts/migrate-phase-f.mjs` — DB migration (assigned_exercises + struggle_alerts columns)
- `phases/phase-f-struggle-detection.md` — This file

## Files Modified
- `src/app/api/chat/route.ts` — Added Kafka import, frustrated_message alerts, low_quiz_score alerts
- `src/app/api/execute/route.ts` — Added Kafka import, publishes repeated_error events
- `src/app/api/teacher/alerts/route.ts` — Returns alert_type, message, user_id
- `src/app/page.jsx` — TeacherDashboard: auto-refresh, resolve, assign modal, AI generate; StudentDashboard: struggle check interval
- `package.json` — Added kafkajs dependency
- `k8s/deployment.yaml` — Added KAFKA_BROKERS env var

## Database Changes
- `assigned_exercises` table: teacher_id, student_id, title, description, starter_code, difficulty, topic, status, due_date
- `struggle_alerts.message` column added (stores context)
- `struggle_alerts.resolved_by` column added (tracks who resolved)
- `struggle_alerts.resolved_at` column added (tracks when resolved)

## Success Criteria
- [x] Kafka events for repeated errors
- [x] Kafka events for frustrated/"I don't understand" messages
- [x] Kafka events for low quiz scores
- [x] Kafka events for stuck time (10+ minutes)
- [x] Real-time alerts on teacher dashboard (10s polling)
- [x] Teacher can resolve alerts
- [x] Teacher can assign exercises to specific students
- [x] AI-generated exercises with OpenAI
- [x] Alert type badges (color-coded by trigger type)

## What's Next
Phase G: Quizzes & Exercises — AI-generated quizzes, auto-grading, assignment flow
