# Tasks: Backend Services (fastapi-dapr-agent)

**Feature**: 003-backend-services
**Created**: 2026-03-20
**Status**: Complete

## Task 1: Create Skill Directory Structure
- [x] Create `.claude/skills/fastapi-dapr-agent/` directory tree
- [x] Create subdirectories: `scripts/templates/app`, `scripts/templates/dapr`, `scripts/templates/k8s`, `references`

## Task 2: Create SKILL.md
- [x] Write SKILL.md with YAML frontmatter
- [x] Under 100 tokens
- [x] Documents deploy and test pipelines

## Task 3: FastAPI Application Template (main.py)
- [x] `GET /health` endpoint
- [x] `GET /dapr/subscribe` programmatic subscription
- [x] `POST /handle` Dapr pub/sub message handler
- [x] `POST /chat` direct HTTP endpoint (triage only)
- [x] `call_ai()` with mock mode support
- [x] `publish_event()` via Dapr sidecar
- [x] `save_state()` via Dapr state store

## Task 4: Agent Logic (agents.py)
- [x] System prompts for all 6 agents
- [x] `route_message()` keyword-based routing
- [x] `AGENT_TOPICS` mapping
- [x] Struggle detection has higher priority

## Task 5: Container Image (Dockerfile + requirements.txt)
- [x] Python 3.12-slim base image
- [x] FastAPI + uvicorn + httpx dependencies
- [x] Minimal layer count

## Task 6: Dapr Components
- [x] `kafka-pubsub.yaml` — Kafka broker connection
- [x] `statestore.yaml` — PostgreSQL state store

## Task 7: K8s Deployment Template
- [x] `deployment.yaml.tmpl` with envsubst variables
- [x] Dapr sidecar annotations
- [x] Resource requests/limits (64Mi/128Mi per agent)
- [x] Readiness + liveness probes
- [x] ClusterIP service per agent

## Task 8: Deploy Script (deploy_services.sh)
- [x] Prerequisites check (kubectl, helm, kafka, postgres)
- [x] Dapr Helm install (idempotent)
- [x] Namespace creation
- [x] Dapr component application
- [x] Responses topic creation
- [x] Docker image build in Minikube
- [x] 6 agent deployments via envsubst
- [x] Rollout wait with timeout
- [x] JSON output for verify script

## Task 9: Verify Script (verify_services.py)
- [x] Parse kubectl JSON from stdin
- [x] Count Running pods (expect 6)
- [x] Check Dapr sidecar injection (2 containers per pod)
- [x] 2-line output summary

## Task 10: Test Routing Script (test_routing.sh)
- [x] Port-forward triage agent
- [x] 4 test cases (learning, code, exercise, struggle)
- [x] JSON output for verify script

## Task 11: Verify Routing Script (verify_routing.py)
- [x] Parse test results from stdin
- [x] Count passed/failed
- [x] 2-line output summary

## Task 12: Reference Documentation
- [x] `fastapi-dapr-guide.md` with Dapr patterns
- [x] Topic architecture table
- [x] Resource budget reference

## Task 13: Token Budget Validation
- [x] SKILL.md under 100 tokens
- [x] All script outputs under 5 lines
- [x] No hardcoded secrets (uses env vars + mock mode)
