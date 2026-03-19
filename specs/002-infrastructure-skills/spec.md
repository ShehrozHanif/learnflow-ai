# Feature Specification: Infrastructure Skills (kafka-k8s-setup + postgres-k8s-setup)

**Feature Branch**: `002-infrastructure-skills`
**Created**: 2026-03-19
**Status**: Draft
**Input**: Infrastructure Skills — Kafka and PostgreSQL deployment on Kubernetes via reusable AI Skills following MCP Code Execution pattern

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deploy Kafka on Kubernetes (Priority: P1)

A developer says: "Deploy Kafka on my cluster." The AI agent uses the `kafka-k8s-setup` skill — runs a script that adds the Bitnami Helm repo, deploys Kafka via Helm chart into a dedicated namespace, waits for pods to become ready, and returns a minimal status. The developer sees only "Kafka deployed: 2/2 pods Running in kafka namespace."

**Why this priority**: Kafka is the message bus for LearnFlow. All 6 AI agents (Triage, Concepts, Code Review, Debug, Exercise, Progress) communicate via Kafka topics. Without Kafka, no inter-service communication is possible. Phases 4-7 depend on this.

**Independent Test**: Run the skill against the local Minikube cluster and verify Kafka pods reach Running state and a test topic can be created.

**Acceptance Scenarios**:

1. **Given** a healthy K8s cluster with Helm installed, **When** the AI agent is told "deploy Kafka", **Then** the skill deploys Kafka via Helm into a `kafka` namespace, all pods reach Running state, and a confirmation message (< 5 lines) enters AI context.
2. **Given** Kafka is already deployed, **When** the skill runs again, **Then** it handles the existing deployment gracefully (upgrade, not duplicate install).
3. **Given** the cluster has limited resources (3GB RAM), **When** Kafka is deployed, **Then** the deployment uses resource-constrained configuration (single replica, minimal memory).

---

### User Story 2 - Deploy PostgreSQL on Kubernetes (Priority: P1)

A developer says: "Deploy PostgreSQL on my cluster." The AI agent uses the `postgres-k8s-setup` skill — runs a script that deploys PostgreSQL via Helm chart, waits for the pod to be ready, verifies database connectivity, and returns a minimal status. The developer sees "PostgreSQL deployed: 1/1 pods Running in postgres namespace. Connection verified."

**Why this priority**: PostgreSQL stores all LearnFlow data — user accounts, progress tracking, code submissions, quiz scores. Without a database, no persistent state is possible. Phases 4-7 depend on this.

**Independent Test**: Run the skill against the local Minikube cluster and verify the PostgreSQL pod is Running and a test connection succeeds.

**Acceptance Scenarios**:

1. **Given** a healthy K8s cluster with Helm installed, **When** the AI agent is told "deploy PostgreSQL", **Then** the skill deploys PostgreSQL via Helm into a `postgres` namespace, the pod reaches Running state, and a confirmation message (< 5 lines) enters AI context.
2. **Given** PostgreSQL is already deployed, **When** the skill runs again, **Then** it handles the existing deployment gracefully (upgrade, not duplicate install).
3. **Given** a running PostgreSQL instance, **When** connectivity is verified, **Then** the script confirms the database accepts connections.

---

### User Story 3 - Create Kafka Topics for LearnFlow (Priority: P2)

A developer says: "Create the Kafka topics for LearnFlow." The AI agent uses the `kafka-k8s-setup` skill — runs a script that creates the required topics (learning.*, code.*, exercise.*, struggle.*) and verifies they exist. The developer sees "4 topics created: learning, code, exercise, struggle."

**Why this priority**: Topics are needed before the backend services (Phase 4) can publish/subscribe to events. This validates that the Kafka deployment is functional end-to-end.

**Independent Test**: Run the topic creation script and verify topics are listed by Kafka.

**Acceptance Scenarios**:

1. **Given** a running Kafka deployment, **When** the AI agent is told "create LearnFlow topics", **Then** the skill creates the 4 required topics and returns a confirmation listing them.
2. **Given** topics already exist, **When** the skill runs again, **Then** it skips existing topics without error.

---

### User Story 4 - Run Database Migrations for LearnFlow (Priority: P2)

A developer says: "Set up the LearnFlow database schema." The AI agent uses the `postgres-k8s-setup` skill — runs a migration script that creates the initial tables (users, progress, submissions, exercises) and verifies the schema. The developer sees "Migration complete: 4 tables created."

**Why this priority**: The database schema must exist before the backend services (Phase 4) can read/write data. This validates that PostgreSQL is functional end-to-end.

**Independent Test**: Run the migration script and verify tables exist via a query.

**Acceptance Scenarios**:

1. **Given** a running PostgreSQL instance, **When** the AI agent is told "run migrations", **Then** the skill creates the required tables and returns a confirmation with table count.
2. **Given** tables already exist, **When** migrations run again, **Then** they are idempotent (CREATE IF NOT EXISTS pattern) and do not duplicate or destroy data.

---

### Edge Cases

- What happens when Minikube has insufficient memory for Kafka + PostgreSQL simultaneously? → Skills use resource-constrained configs (single replicas, low memory limits). Deployment warns if available resources are low.
- What happens when Helm repo is unavailable or network is down? → Scripts return clear error: "Helm repo unreachable" with exit code 1.
- What happens when a Kafka pod gets stuck in CrashLoopBackOff? → Verify script detects unhealthy pods and reports them instead of returning success.
- What happens when PostgreSQL password is not set? → Deployment script sets a default dev password via Helm values. Never hardcode in SKILL.md.
- What happens when a migration partially fails? → Script reports which tables were created and which failed, with the specific error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `kafka-k8s-setup` skill MUST deploy Kafka on K8s using Helm with a single-replica configuration suitable for development (3GB RAM constraint).
- **FR-002**: `kafka-k8s-setup` skill MUST verify all Kafka pods reach Running state before returning success.
- **FR-003**: `kafka-k8s-setup` skill MUST support creating named topics and verifying their existence.
- **FR-004**: `kafka-k8s-setup` skill MUST handle idempotent deployment (re-running does not break existing deployment).
- **FR-005**: `postgres-k8s-setup` skill MUST deploy PostgreSQL on K8s using Helm into a dedicated namespace.
- **FR-006**: `postgres-k8s-setup` skill MUST verify the PostgreSQL pod reaches Running state and accepts connections.
- **FR-007**: `postgres-k8s-setup` skill MUST support running SQL migration scripts to create the initial schema.
- **FR-008**: `postgres-k8s-setup` skill MUST handle idempotent migrations (re-running does not duplicate or destroy data).
- **FR-009**: Both skills MUST have SKILL.md with YAML frontmatter (name, description) under 100 tokens.
- **FR-010**: Both skills MUST follow MCP Code Execution pattern: scripts execute outside AI context, only minimal output (< 5 lines) enters context.
- **FR-011**: Both skills MUST work identically on Claude Code and Goose without modification.
- **FR-012**: Both skills MUST include `scripts/` directory with executable scripts and `references/` directory with on-demand documentation.
- **FR-013**: Deployment scripts MUST NOT hardcode secrets or passwords. Credentials must be passed via Helm values or environment variables.

### Key Entities

- **Kafka Cluster**: A messaging system deployed on K8s. Key attributes: namespace, replica count, pod status, broker endpoints.
- **Kafka Topic**: A named channel for events. Key attributes: topic name, partition count, replication factor.
- **PostgreSQL Instance**: A database server deployed on K8s. Key attributes: namespace, pod status, connection endpoint, credentials.
- **Database Schema**: The table structure for LearnFlow. Key tables: users, progress, submissions, exercises.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: AI agent deploys Kafka from a single prompt with zero manual intervention, all pods reach Running state.
- **SC-002**: AI agent deploys PostgreSQL from a single prompt with zero manual intervention, pod reaches Running state and accepts connections.
- **SC-003**: AI agent creates Kafka topics from a single prompt, topics are verified to exist.
- **SC-004**: AI agent runs database migrations from a single prompt, tables are verified to exist.
- **SC-005**: SKILL.md files are under 100 tokens each.
- **SC-006**: Script output entering AI context is under 5 lines per execution.
- **SC-007**: Both skills work on Claude Code and Goose without any modification.
- **SC-008**: Re-running any skill does not break existing deployments (idempotency).
- **SC-009**: Kafka and PostgreSQL can run simultaneously on Minikube with 3GB RAM.

## Assumptions

- Minikube cluster is running with at least 3GB RAM (established in Phase 1).
- Helm v3 is installed and functional (verified in Phase 1).
- kubectl is configured and can reach the cluster (verified in Phase 1).
- k8s-foundation skill from Phase 2 is available for Helm operations.
- Bitnami Helm charts are used for both Kafka and PostgreSQL (industry standard, well-maintained).
- Single-replica deployments are acceptable for development (not production).
- Default dev credentials are acceptable for local development; production will use secrets management.
- The `.claude/skills/` directory is the standard location for skills.

## Scope Boundaries

**In Scope:**
- kafka-k8s-setup skill (SKILL.md + scripts + references)
- postgres-k8s-setup skill (SKILL.md + scripts + references)
- Kafka deployment + topic creation
- PostgreSQL deployment + schema migration
- Testing both skills with Claude Code

**Out of Scope:**
- Production-grade Kafka (multi-broker, replication) — development only
- Production-grade PostgreSQL (HA, backups) — development only
- Dapr integration with Kafka pub/sub (Phase 4)
- Application code that uses the database (Phase 4)
- Goose testing (deferred to Phase 7, but skill structure is compatible)
- Data seeding beyond schema creation
