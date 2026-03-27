---
id: 001
title: Specify Backend Services
stage: spec
date: 2026-03-20
surface: agent
model: claude-opus-4-6
feature: backend-services
branch: 003-backend-services
user: Shehroz Hanif
command: /sp.specify
labels: ["fastapi", "dapr", "microservices", "agents", "kafka", "backend"]
links:
  spec: specs/003-backend-services/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-backend-services/spec.md
  - specs/003-backend-services/checklists/requirements.md
tests:
  - Checklist: 16/16 PASS
  - No NEEDS CLARIFICATION markers
---

## Prompt

/sp.specify Phase 4: Backend Services - fastapi-dapr-agent skill. Build a FastAPI + Dapr microservices skill that deploys 6 AI tutoring agents (Triage, Concepts, Code Review, Debug, Exercise, Progress) on Kubernetes with Kafka pub/sub for async communication. Backend uses FastAPI + OpenAI SDK. Dapr provides state management, pub/sub, and service invocation. Must follow MCP Code Execution pattern (SKILL.md ~100 tokens + scripts/ + references/). Architecture weight is 20% of evaluation - must demonstrate correct Dapr patterns, Kafka pub/sub, stateless microservice principles.

## Response snapshot

Created feature specification for Backend Services (fastapi-dapr-agent) with 4 user stories (Deploy Services P1, Triage Routing P1, Specialist Processing P2, Health/Observability P3), 15 functional requirements, 10 success criteria. Key aspects: 6 AI agents as stateless FastAPI microservices, Dapr sidecars for pub/sub + state + invocation, Kafka topics for async routing, OpenAI SDK for AI responses, MCP Code Execution pattern compliance. All checklist items pass (16/16). No clarification needed.

## Outcome

- Impact: Feature specification complete with clear user stories, requirements, and success criteria
- Tests: Quality checklist 16/16 PASS
- Files: spec.md, checklists/requirements.md
- Next prompts: /sp.clarify to scan for ambiguities, then /sp.plan
- Reflection: Technology names necessarily appear in spec since the skill's purpose IS deploying these technologies; documented this in checklist notes

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): All 16 checklist items PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
