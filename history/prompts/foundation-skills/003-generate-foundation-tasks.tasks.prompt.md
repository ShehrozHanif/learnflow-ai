---
id: 003
title: Generate Foundation Skills Tasks
stage: tasks
date: 2026-03-19
surface: agent
model: claude-opus-4-6
feature: foundation-skills
branch: 001-foundation-skills
user: shehroz
command: /sp.tasks
labels: ["tasks", "foundation-skills", "task-generation"]
links:
  spec: specs/001-foundation-skills/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-foundation-skills/tasks.md
tests:
  - none
---

## Prompt

/sp.tasks — Generate actionable task list for foundation-skills feature based on spec.md, plan.md, and research.md.

## Response snapshot

Generated tasks.md with 21 tasks organized across 6 phases: Setup (2 tasks), Foundational (4 tasks), User Story 1 - agents-md-gen (4 tasks), User Story 2 - k8s health check (4 tasks), User Story 3 - Helm install (3 tasks), Polish (4 tasks). All tasks follow strict checklist format with IDs T001-T021, [P] markers for parallelizable work, [US1/US2/US3] story labels, and exact file paths. Identified parallel opportunities: US1 and US2 can execute simultaneously. MVP scope: Phase 1-3 (agents-md-gen only).

## Outcome

- Impact: Complete task breakdown enabling incremental implementation of both skills
- Tests: none (not requested in spec)
- Files: specs/001-foundation-skills/tasks.md created
- Next prompts: /sp.analyze to verify spec-plan-tasks alignment, then /sp.implement to execute
- Reflection: Clean mapping from 3 user stories to 3 implementation phases, each independently testable

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): Format validation PASS (all 21 tasks have checkbox + ID + labels + file paths)
- Prompt variant (if applicable): standard /sp.tasks
- Next experiment: none needed
