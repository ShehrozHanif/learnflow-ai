# Tasks: Frontend (nextjs-k8s-deploy)

**Feature**: 004-frontend
**Created**: 2026-03-20
**Status**: Complete

## Task 1: Create Skill Directory Structure
- [x] Create `.claude/skills/nextjs-k8s-deploy/` directory tree
- [x] Create subdirectories: `scripts/templates/app/src/app`, `scripts/templates/k8s`, `references`

## Task 2: Create SKILL.md
- [x] Write SKILL.md with YAML frontmatter
- [x] Under 100 tokens
- [x] Documents deploy pipeline

## Task 3: Next.js Project Config
- [x] `package.json` with Next.js 14 + Monaco + Tailwind
- [x] `next.config.js` with standalone output
- [x] `tailwind.config.js` + `postcss.config.js`
- [x] `tsconfig.json`

## Task 4: Landing Page
- [x] `layout.tsx` — root layout with metadata
- [x] `page.tsx` — role selector (Student / Teacher)
- [x] `globals.css` — Tailwind imports

## Task 5: Components
- [x] `ChatPanel.tsx` — sends messages to Triage Agent, displays responses
- [x] `CodeEditor.tsx` — Monaco editor with Run button and output panel
- [x] `MasteryBadge.tsx` — color-coded mastery indicator (Red/Yellow/Green/Blue)
- [x] `ProgressDashboard.tsx` — topic mastery overview with sample data

## Task 6: Student Dashboard
- [x] `student/page.tsx` — 3-column layout (Chat + Editor + Progress)
- [x] Connects to chat API and code execution API

## Task 7: Teacher Dashboard
- [x] `teacher/page.tsx` — class overview, struggle alerts, exercise generator
- [x] Displays sample student data with mastery badges
- [x] Exercise generation via Triage Agent

## Task 8: Code Execution API
- [x] `api/execute/route.ts` — spawns Python subprocess with 5s timeout
- [x] Input validation (code required, max 50KB)
- [x] Hard kill after timeout + 1s grace

## Task 9: Chat Proxy API
- [x] `api/chat/route.ts` — proxies to Triage Agent via K8s internal DNS
- [x] Error handling for backend unreachable

## Task 10: Container Image
- [x] Multi-stage Dockerfile (deps → build → runner)
- [x] Standalone output for minimal image size

## Task 11: K8s Deployment
- [x] `deployment.yaml` with resource limits (128Mi/256Mi)
- [x] Readiness + liveness probes
- [x] ClusterIP service
- [x] Environment variables for backend URL

## Task 12: Deploy Script
- [x] Prerequisites check (kubectl, docker, backend services)
- [x] Build image in Minikube Docker daemon
- [x] Deploy to K8s with rollout wait
- [x] JSON output for verify script

## Task 13: Verify Script
- [x] Parse pod JSON, check Running state
- [x] 2-line output summary

## Task 14: Reference Documentation
- [x] `nextjs-k8s-guide.md` with standalone output, Monaco setup, sandbox pattern

## Task 15: Token Budget Validation
- [x] SKILL.md under 100 tokens
- [x] Script outputs under 5 lines
- [x] No hardcoded secrets
