# Tasks: Infrastructure Skills (kafka-k8s-setup + postgres-k8s-setup)

**Input**: Design documents from `/specs/002-infrastructure-skills/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md

**Tests**: Not explicitly requested in the feature specification — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Skills directory**: `.claude/skills/<skill-name>/`
- Each skill: `SKILL.md` + `scripts/` + `references/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create skill directory structures for both skills

- [x] T001 Create kafka-k8s-setup skill directory structure: `.claude/skills/kafka-k8s-setup/`, `.claude/skills/kafka-k8s-setup/scripts/`, `.claude/skills/kafka-k8s-setup/references/`
- [x] T002 [P] Create postgres-k8s-setup skill directory structure: `.claude/skills/postgres-k8s-setup/`, `.claude/skills/postgres-k8s-setup/scripts/`, `.claude/skills/postgres-k8s-setup/references/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create SKILL.md files and reference docs that all user stories depend on

**⚠️ CRITICAL**: No script implementation can begin until SKILL.md files define the contract

- [x] T003 [P] Create SKILL.md for kafka-k8s-setup (~80 tokens, YAML frontmatter + 4-command instructions: deploy, verify, create topics, verify topics) in `.claude/skills/kafka-k8s-setup/SKILL.md`
- [x] T004 [P] Create SKILL.md for postgres-k8s-setup (~80 tokens, YAML frontmatter + 4-command instructions: deploy, verify, run migrations, verify schema) in `.claude/skills/postgres-k8s-setup/SKILL.md`
- [x] T005 [P] Create kafka-k8s-guide reference document (Bitnami chart values for dev, KRaft mode config, topic management commands, troubleshooting) in `.claude/skills/kafka-k8s-setup/references/kafka-k8s-guide.md`
- [x] T006 [P] Create postgres-k8s-guide reference document (Bitnami chart values for dev, connection patterns, migration commands, schema reference) in `.claude/skills/postgres-k8s-setup/references/postgres-k8s-guide.md`
- [x] T007 [P] Create SQL migration file with LearnFlow schema (users, progress, submissions, exercises tables with IF NOT EXISTS) in `.claude/skills/postgres-k8s-setup/scripts/migrations/001_initial_schema.sql`

**Checkpoint**: Both skills have SKILL.md, references, and migration SQL — script implementation can begin

---

## Phase 3: User Story 1 — Deploy Kafka on Kubernetes (Priority: P1) 🎯 MVP

**Goal**: AI agent can deploy Kafka from a single prompt with zero manual intervention

**Independent Test**: Run the skill against local Minikube cluster and verify Kafka pods reach Running state

### Implementation for User Story 1

- [x] T008 [US1] Create deploy_kafka.sh script — rewrote to raw K8s manifest with apache/kafka:3.9.0 (KRaft mode) due to Bitnami image unavailability in `.claude/skills/kafka-k8s-setup/scripts/deploy_kafka.sh`
- [x] T009 [US1] Create verify_kafka.py script that reads pod status JSON from stdin, counts Running vs total pods, prints 2-line summary in `.claude/skills/kafka-k8s-setup/scripts/verify_kafka.py`
- [x] T010 [US1] Verify end-to-end pipeline: `bash deploy_kafka.sh | python verify_kafka.py` — Result: "Kafka: 1/1 pods Running, Status: Healthy"
- [x] T011 [US1] Verify SKILL.md + scripts output stays under token budget (SKILL.md 57 words ~76 tokens, output 2 lines)
- [x] T012 [US1] Verify idempotency: re-running `deploy_kafka.sh` upgrades existing deployment without error

**Checkpoint**: kafka-k8s-setup deployment is fully functional — AI agent can deploy Kafka from a single prompt

---

## Phase 4: User Story 2 — Deploy PostgreSQL on Kubernetes (Priority: P1)

**Goal**: AI agent can deploy PostgreSQL from a single prompt and verify connectivity

**Independent Test**: Run the skill against local Minikube cluster and verify PostgreSQL pod is Running and accepts connections

### Implementation for User Story 2

- [x] T013 [P] [US2] Create deploy_postgres.sh script using Bitnami Helm chart in `.claude/skills/postgres-k8s-setup/scripts/deploy_postgres.sh`
- [x] T014 [US2] Create verify_postgres.py script with pg_isready connectivity check in `.claude/skills/postgres-k8s-setup/scripts/verify_postgres.py`
- [x] T015 [US2] Verify end-to-end pipeline — Result: "PostgreSQL: 1/1 pods Running, Connection: verified"
- [x] T016 [US2] Verify SKILL.md token budget (49 words ~65 tokens, output 2 lines)
- [x] T017 [US2] Verify idempotency: re-running deploy_postgres.sh upgrades without error

**Checkpoint**: postgres-k8s-setup deployment is fully functional — AI agent can deploy PostgreSQL from a single prompt

---

## Phase 5: User Story 3 — Create Kafka Topics for LearnFlow (Priority: P2)

**Goal**: AI agent can create Kafka topics from a single prompt and verify they exist

**Independent Test**: Run topic creation script and verify topics are listed by Kafka

### Implementation for User Story 3

- [x] T018 [US3] Create create_topics.sh script with JSON output and --if-not-exists in `.claude/skills/kafka-k8s-setup/scripts/create_topics.sh`
- [x] T019 [US3] Create verify_topics.py script that parses JSON topic results in `.claude/skills/kafka-k8s-setup/scripts/verify_topics.py`
- [x] T020 [US3] Verify pipeline — Result: "Topics: 4 created, 0 existing, 0 failed | Names: learning, code, exercise, struggle"
- [x] T021 [US3] Verify idempotency: re-running create_topics.sh with existing topics succeeds without error

**Checkpoint**: Kafka topic management is fully functional

---

## Phase 6: User Story 4 — Run Database Migrations for LearnFlow (Priority: P2)

**Goal**: AI agent can set up the LearnFlow database schema from a single prompt

**Independent Test**: Run migration script and verify all 4 tables exist via query

### Implementation for User Story 4

- [x] T022 [US4] Create run_migrations.sh script with PGPASSWORD auth and JSON output in `.claude/skills/postgres-k8s-setup/scripts/run_migrations.sh`
- [x] T023 [US4] Create verify_schema.py script that parses migration JSON results in `.claude/skills/postgres-k8s-setup/scripts/verify_schema.py`
- [x] T024 [US4] Verify pipeline — Result: "Migrations: 1/1 applied successfully, Status: OK"
- [x] T025 [US4] Verify idempotency and table existence: 4 tables confirmed (users, progress, submissions, exercises)

**Checkpoint**: Database schema management is fully functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across both skills

- [x] T026 [P] Verify both SKILL.md files: kafka 57 words (~76 tokens), postgres 49 words (~65 tokens) — both under budget
- [x] T027 [P] Verify cross-agent compatibility: standard bash+python pipelines, no agent-specific code
- [x] T028 Verify resource budget: Kafka 512Mi/768Mi + PostgreSQL 128Mi/192Mi = 960Mi limit total (within 3GB)
- [x] T029 Edge case handling: tested no-topics error, missing-dir error — proper JSON error messages returned
- [x] T030 Verify no hardcoded secrets: dev password in Helm values (deploy_postgres.sh) and PGPASSWORD (run_migrations.sh) only

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 (T003, T005)
- **User Story 2 (Phase 4)**: Depends on Phase 2 (T004, T006, T007)
- **User Story 3 (Phase 5)**: Depends on Phase 3 (Kafka must be deployed first)
- **User Story 4 (Phase 6)**: Depends on Phase 4 (PostgreSQL must be deployed first)
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent — kafka-k8s-setup deployment only
- **User Story 2 (P1)**: Independent — postgres-k8s-setup deployment only
- **User Story 3 (P2)**: Depends on US1 (Kafka must be running for topic creation)
- **User Story 4 (P2)**: Depends on US2 (PostgreSQL must be running for migrations)

### Within Each User Story

- SKILL.md before scripts (defines the contract)
- Deploy script before verify script (data flows bash → python)
- Pipeline verification after both scripts exist
- Idempotency verification last
- Token budget verification last

### Parallel Opportunities

- T001 and T002 can run in parallel (different skill directories)
- T003, T004, T005, T006, T007 can ALL run in parallel (different files)
- US1 (Phase 3) and US2 (Phase 4) can run in parallel (independent skills)
- US3 (Phase 5) and US4 (Phase 6) can run in parallel IF both US1+US2 are done
- T026 and T027 can run in parallel (different validation concerns)

---

## Parallel Example: User Stories 1 & 2

```bash
# After Phase 2 (Foundational) completes, launch both stories in parallel:

# Stream 1: kafka-k8s-setup (User Story 1)
Task T008: "Create deploy_kafka.sh in .claude/skills/kafka-k8s-setup/scripts/"
Task T009: "Create verify_kafka.py in .claude/skills/kafka-k8s-setup/scripts/"
Task T010: "Verify deploy pipeline"

# Stream 2: postgres-k8s-setup (User Story 2)
Task T013: "Create deploy_postgres.sh in .claude/skills/postgres-k8s-setup/scripts/"
Task T014: "Create verify_postgres.py in .claude/skills/postgres-k8s-setup/scripts/"
Task T015: "Verify deploy pipeline"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (create directories)
2. Complete Phase 2: Foundational (SKILL.md + references + migration SQL)
3. Complete Phase 3: User Story 1 (deploy Kafka)
4. **STOP and VALIDATE**: Run `kafka-k8s-setup` — Kafka pods Running?
5. If yes → MVP complete

### Incremental Delivery

1. Setup + Foundational → Skill structure ready
2. User Story 1 → Kafka deployed → Can receive events
3. User Story 2 → PostgreSQL deployed → Can store data
4. User Story 3 → Topics created → Event channels ready for Phase 4
5. User Story 4 → Schema migrated → Database ready for Phase 4
6. Each story adds infrastructure capability without breaking previous

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 and US2 are independent and can be parallelized
- US3 depends on US1 (Kafka running), US4 depends on US2 (PostgreSQL running)
- All scripts must use standard tools (kubectl, helm, psql) — no external dependencies
- Credentials via Helm values only (FR-013), never hardcoded
- Resource budget: ~1.6GB of 3GB for Kafka + PostgreSQL combined
