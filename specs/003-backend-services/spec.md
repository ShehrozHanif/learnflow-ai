# Feature Specification: Backend Services (fastapi-dapr-agent)

**Feature Branch**: `003-backend-services`
**Created**: 2026-03-20
**Status**: Implemented
**Input**: User description: "Phase 4: Backend Services - fastapi-dapr-agent skill. Build a FastAPI + Dapr microservices skill that deploys 6 AI tutoring agents on Kubernetes with Kafka pub/sub for async communication."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deploy Backend Microservices (Priority: P1)

An AI agent (Claude Code or Goose) receives a single prompt to deploy the LearnFlow backend services. The skill generates FastAPI microservice templates with Dapr sidecar configuration, builds container images, and deploys them to Kubernetes. Each of the 6 AI tutoring agents (Triage, Concepts, Code Review, Debug, Exercise, Progress) runs as an independent stateless microservice with its own Dapr sidecar.

**Why this priority**: Without running backend services, no other functionality works. This is the foundation for the entire LearnFlow application backend.

**Independent Test**: Can be fully tested by running the deploy pipeline and verifying all 6 service pods reach Running state with Dapr sidecars injected.

**Acceptance Scenarios**:

1. **Given** a Kubernetes cluster with Kafka and PostgreSQL already deployed, **When** the AI agent runs the deploy skill, **Then** all 6 microservice pods reach Running state within 5 minutes.
2. **Given** the deploy skill has already been run, **When** it is run again, **Then** the deployment upgrades cleanly without downtime or errors (idempotent).
3. **Given** a fresh cluster, **When** the AI agent runs the deploy skill without Kafka/PostgreSQL, **Then** the skill reports missing dependencies clearly.

---

### User Story 2 - AI Agent Routing via Triage (Priority: P1)

A student sends a message through the API. The Triage Agent receives it, analyzes intent, and routes to the appropriate specialist agent (Concepts, Code Review, Debug, Exercise, or Progress) via Kafka pub/sub. The specialist processes the request and publishes a response event.

**Why this priority**: The Triage Agent is the entry point for all student interactions. Without routing, no agent can serve requests.

**Independent Test**: Can be tested by sending a message to the triage endpoint and verifying it gets published to the correct Kafka topic and the specialist agent receives it.

**Acceptance Scenarios**:

1. **Given** a running Triage Agent, **When** a student asks "How do for loops work?", **Then** the message is routed to the Concepts Agent via the `learning` Kafka topic.
2. **Given** a running Triage Agent, **When** a student submits code with "please review my code", **Then** the message is routed to the Code Review Agent via the `code` Kafka topic.
3. **Given** a running Triage Agent, **When** a student says "I keep getting an IndexError", **Then** the message is routed to the Debug Agent via the `code` Kafka topic.
4. **Given** a running Triage Agent, **When** intent is ambiguous, **Then** the Triage Agent requests clarification from the student.

---

### User Story 3 - Specialist Agent Processing (Priority: P2)

Each specialist agent (Concepts, Code Review, Debug, Exercise, Progress) subscribes to Kafka topics via Dapr pub/sub, processes student requests using OpenAI SDK, and publishes responses. Agents use Dapr state management to cache session context and Dapr service invocation for cross-agent communication when needed.

**Why this priority**: Specialist agents deliver the core tutoring value but depend on the Triage routing being in place first.

**Independent Test**: Can be tested by publishing a message directly to a specialist's Kafka topic and verifying the agent produces a valid AI-generated response.

**Acceptance Scenarios**:

1. **Given** a Concepts Agent subscribed to the `learning` topic, **When** it receives a question about Python loops, **Then** it generates an explanation with code examples using the OpenAI SDK.
2. **Given** a Code Review Agent, **When** it receives student code, **Then** it returns feedback on correctness, style (PEP 8), efficiency, and readability.
3. **Given** a Debug Agent, **When** it receives an error traceback, **Then** it identifies the root cause and provides hints before the full solution.
4. **Given** an Exercise Agent, **When** a teacher requests exercises on list comprehensions, **Then** it generates coding challenges with test cases.
5. **Given** a Progress Agent, **When** queried for a student's mastery, **Then** it calculates and returns the mastery score using the weighted formula (exercises 40%, quizzes 30%, code quality 20%, streak 10%).

---

### User Story 4 - Service Health and Observability (Priority: P3)

Each microservice exposes health check endpoints. The skill includes verification scripts that check all services are healthy, Dapr sidecars are injected, Kafka subscriptions are active, and the pub/sub pipeline is flowing end-to-end.

**Why this priority**: Observability is needed for debugging and demo, but the core services must exist first.

**Independent Test**: Can be tested by running the verify pipeline and checking all health endpoints return healthy status.

**Acceptance Scenarios**:

1. **Given** all services deployed, **When** the verify script runs, **Then** it reports health status for all 6 services and their Dapr sidecars.
2. **Given** a service is unhealthy, **When** the verify script runs, **Then** it identifies the failing service and provides diagnostic information.

---

### Edge Cases

- What happens when a specialist agent's OpenAI API call times out or fails? The agent should return a graceful error message to the student and not crash.
- What happens when Kafka is unreachable? Dapr pub/sub should handle retries automatically; the service should log errors and degrade gracefully.
- What happens when a student sends an empty message? The Triage Agent should respond with a prompt asking the student to provide more detail.
- What happens when the AI generates harmful or irrelevant content? System prompts for each agent should constrain responses to Python tutoring only.
- What happens when two messages arrive simultaneously for the same student? Agents are stateless; Dapr state management handles session locking.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The skill MUST generate FastAPI microservice source code for 6 AI tutoring agents (Triage, Concepts, Code Review, Debug, Exercise, Progress).
- **FR-002**: Each microservice MUST include Dapr sidecar annotations for automatic injection on Kubernetes.
- **FR-003**: The Triage Agent MUST analyze student message intent and route to the correct specialist agent via Kafka pub/sub (Dapr component).
- **FR-004**: Each specialist agent MUST subscribe to its designated Kafka topic(s) via Dapr pub/sub.
- **FR-005**: Each specialist agent MUST use the OpenAI SDK (or compatible API) to generate AI-powered tutoring responses.
- **FR-006**: The Progress Agent MUST calculate mastery scores using the weighted formula: exercises (40%) + quizzes (30%) + code quality (20%) + streak (10%).
- **FR-007**: All microservices MUST be stateless; session state MUST be managed through Dapr state store.
- **FR-008**: The skill MUST include Kubernetes deployment manifests (or templates) for all 6 services with resource limits.
- **FR-009**: The skill MUST include Dapr component definitions for Kafka pub/sub and state store.
- **FR-010**: Each service MUST expose a `/health` endpoint returning service status.
- **FR-011**: The deploy script MUST be idempotent — re-running deploys or upgrades without errors.
- **FR-012**: The skill MUST follow the MCP Code Execution pattern: SKILL.md (~100 tokens) + scripts/ + references/.
- **FR-013**: All API keys and secrets MUST be passed via environment variables or Kubernetes secrets, never hardcoded.
- **FR-014**: The skill MUST produce output under 5 lines when pipelines are run.
- **FR-015**: Each agent MUST include a system prompt constraining responses to Python tutoring content only.

### Key Entities

- **Agent**: A specialized AI tutoring microservice (one of 6 types) that processes student requests. Has: name, type, Kafka topic subscriptions, system prompt, health status.
- **Message**: A student interaction routed through the system. Has: student ID, content, intent (detected by Triage), source agent, target agent, timestamp.
- **Session**: A stateful conversation context managed via Dapr state store. Has: student ID, conversation history, current topic, mastery context.
- **Mastery Score**: A calculated metric per student per topic. Has: exercise completion (40%), quiz scores (30%), code quality (20%), streak (10%), overall level (Beginner/Learning/Proficient/Mastered).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 6 microservice pods reach Running state with Dapr sidecars within 5 minutes of running the deploy skill.
- **SC-002**: A student message sent to the Triage endpoint is routed to the correct specialist within 2 seconds.
- **SC-003**: Each specialist agent generates an AI-powered response within 10 seconds of receiving a message.
- **SC-004**: The deploy pipeline is idempotent — re-running produces no errors and all services remain healthy.
- **SC-005**: SKILL.md stays under 100 tokens; all script outputs stay under 5 lines.
- **SC-006**: All 6 health endpoints return healthy status when services are running correctly.
- **SC-007**: The mastery calculation produces correct scores matching the weighted formula for sample test data.
- **SC-008**: The skill works identically when invoked by Claude Code or Goose (cross-agent compatible).
- **SC-009**: Total resource consumption for all 6 services fits within available Minikube budget (remaining ~2GB after Kafka + PostgreSQL).
- **SC-010**: No API keys or secrets are hardcoded in any skill files, scripts, or Kubernetes manifests.

## Assumptions

- Kafka and PostgreSQL are already deployed via Phase 3 skills (kafka-k8s-setup, postgres-k8s-setup).
- The 4 LearnFlow Kafka topics (learning, code, exercise, struggle) already exist.
- Dapr will be installed on the cluster as part of this skill's deploy pipeline (or as a prerequisite check).
- OpenAI SDK is used for AI responses; API key provided via environment variable `OPENAI_API_KEY`.
- Minikube has approximately 2GB of available memory after Kafka (~768Mi) and PostgreSQL (~192Mi).
- Each microservice container is lightweight (Python + FastAPI + OpenAI SDK), targeting ~128Mi-256Mi per service.
- For MVP, all 6 agents can share a single FastAPI template with different system prompts and topic subscriptions.
- Dapr state store uses the already-deployed PostgreSQL as its backend.

## Dependencies

- Phase 3 skills (kafka-k8s-setup, postgres-k8s-setup) must be completed and infrastructure running.
- Dapr runtime must be installable on Minikube (Dapr Helm chart or dapr CLI).
- Container registry access for building/pushing service images (Minikube's built-in registry or local image loading).
- OpenAI API key for AI-powered responses (can use mock responses for testing/demo).

## Out of Scope

- Frontend UI (Phase 5)
- Code execution sandbox (Phase 5)
- MCP server integration (Phase 6)
- Authentication and authorization (Better Auth — later phase)
- Kong API Gateway configuration (later phase)
- Production-grade scaling (horizontal pod autoscaling)
- Multi-cluster deployment
