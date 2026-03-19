---
id: 001
title: Specify Infrastructure Skills
stage: spec
date: 2026-03-19
surface: agent
model: claude-opus-4-6
feature: infrastructure-skills
branch: 002-infrastructure-skills
user: shehroz
command: /sp.specify
labels: ["spec", "infrastructure-skills", "kafka", "postgresql"]
links:
  spec: specs/002-infrastructure-skills/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-infrastructure-skills/spec.md
  - specs/002-infrastructure-skills/checklists/requirements.md
tests:
  - none
---

## Prompt

/sp.specify Infrastructure Skills - Kafka and PostgreSQL deployment on Kubernetes via reusable AI Skills following MCP Code Execution pattern

## Response snapshot

Created spec.md with 4 user stories (Deploy Kafka P1, Deploy PostgreSQL P1, Create Kafka Topics P2, Run DB Migrations P2), 13 functional requirements (FR-001 through FR-013), 9 success criteria (SC-001 through SC-009), 5 edge cases, and clear scope boundaries. Checklist: 16/16 items pass. No [NEEDS CLARIFICATION] markers. Resource constraint (3GB RAM) explicitly addressed. Credentials handling covered in FR-013.

## Outcome

- Impact: Complete specification for Phase 3 infrastructure skills
- Tests: none
- Files: spec.md + checklists/requirements.md created
- Next prompts: /sp.clarify to find gaps, then /sp.plan
- Reflection: Spec covers both deployment and verification (topics + migrations), addressing the full Phase 3 success criteria from AGENTS.md

## Evaluation notes (flywheel)

- Failure modes observed: create-new-feature.ps1 script error (same as Phase 2, branch still created)
- Graders run and results (PASS/FAIL): Checklist 16/16 PASS
- Prompt variant (if applicable): standard /sp.specify
- Next experiment: none needed
