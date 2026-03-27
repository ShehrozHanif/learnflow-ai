# Phase G: Quizzes & Exercises

## Completed: 2026-03-27

## What Was Done

### 1. AI-Generated Quizzes Per Module
- `/api/quizzes/generate` — Teacher or student selects topic + difficulty, AI generates 5 MCQ questions
- Each question has: question text, 4 options, correct answer index, explanation
- Stored in `quizzes` table with JSONB questions column
- `/api/quizzes` — List available quizzes with attempt count and best score
- `/api/quizzes/load` — Load single quiz (strips correct answers for students)

### 2. Auto-Grading
- **Quiz grading** (`/api/quizzes/submit`): Compares student answers to correct indices, calculates percentage, updates `progress.quiz_score` (uses best-of current vs new)
- **Exercise grading** (`/api/exercises/submit`):
  1. Runs student code with Python sandbox (5s timeout)
  2. Compares output to expected output (exact match = 90%)
  3. AI code review via OpenAI for detailed feedback + nuanced grade (0-100)
  4. Updates `assigned_exercises.grade`, `feedback`, `status`
  5. Updates `progress.exercises_completed` and `code_quality`
- Both grading paths recalculate mastery using the weighted formula

### 3. Exercise Assignment Flow
**Teacher generates → assigns → student completes → auto-graded:**

1. **Teacher generates exercise** — AI creates title, description, starter code, expected output
2. **Teacher assigns to student** — Select student from dropdown, exercise saved to `assigned_exercises`
3. **Student sees in Exercises tab** — Shows all assigned exercises with status (pending/completed)
4. **Student starts exercise** — Opens inline code editor with starter code
5. **Student submits** — Code runs, output compared, AI grades, feedback shown
6. **Grade >= 70 = completed** — Status changes to "completed", mastery updated

### 4. Student Exercises Tab (New)
- **Take a Quiz** section: Select topic, generate AI quiz, answer MCQs, see results with explanations
- **Previous Quizzes**: List with attempt count, best score, retake button
- **Assigned Exercises**: List from teacher with status badges, Start/Done buttons
- **Active Quiz UI**: Question-by-question with highlighted selected answers, submit when all answered
- **Active Exercise UI**: Inline code editor, Submit & Grade button, grade display with feedback
- **Quiz Results**: Score percentage, pass/fail, per-question breakdown with explanations

### 5. Teacher Quiz Generation
- New section in teacher dashboard: "Generate Quiz for Students"
- Select topic + difficulty, AI generates quiz, available to all students
- Confirmation message when quiz created

## Files Created
- `scripts/migrate-phase-g.mjs` — DB migration
- `src/app/api/quizzes/route.ts` — List quizzes
- `src/app/api/quizzes/generate/route.ts` — AI quiz generation
- `src/app/api/quizzes/submit/route.ts` — Quiz auto-grading
- `src/app/api/quizzes/load/route.ts` — Load single quiz
- `src/app/api/exercises/submit/route.ts` — Exercise submission + AI grading
- `phases/phase-g-quizzes-exercises.md` — This file

## Files Modified
- `src/app/page.jsx` — Added Exercises tab to StudentDashboard (quiz UI, exercise UI, assignments list), added quiz generation to TeacherDashboard

## Database Changes
- `quizzes` table: topic, difficulty, title, questions (JSONB), created_by
- `quiz_attempts` table: user_id, quiz_id, answers (JSONB), score, total, percentage
- `assigned_exercises` extended: student_code, grade, feedback, graded_at, expected_output

## Success Criteria
- [x] AI-generated quizzes per module (5 MCQ questions via OpenAI)
- [x] Auto-grading for quizzes (answer comparison + percentage)
- [x] Auto-grading for exercises (output matching + AI code review)
- [x] Exercise assignment flow (teacher generates → assigns → student completes → graded)
- [x] Quiz score feeds into mastery calculation (30% weight)
- [x] Exercise completion feeds into mastery calculation (40% weight)
- [x] Student Exercises tab with full quiz + exercise UI
- [x] Teacher can generate quizzes for all students

## What's Next
Phase H: Polish & Edge Cases — error handling, loading states, mobile, sessions
