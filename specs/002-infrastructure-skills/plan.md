# Implementation Plan: Infrastructure Skills (kafka-k8s-setup + postgres-k8s-setup)

**Branch**: `002-infrastructure-skills` | **Date**: 2026-03-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-infrastructure-skills/spec.md`

## Summary

Two AI Skills following MCP Code Execution pattern: `kafka-k8s-setup` deploys Kafka on K8s with topic management, `postgres-k8s-setup` deploys PostgreSQL on K8s with schema migration. Both use Bitnami Helm charts, produce < 5 lines of context output, and run on Minikube with 3GB RAM.

## Technical Context

**Language/Version**: Bash 5.x + Python 3.x (standard library only)
**Primary Dependencies**: kubectl, helm, Bitnami Helm charts (kafka, postgresql)
**Storage**: PostgreSQL (deployed by the skill itself), Kafka (message broker)
**Testing**: Manual pipeline verification (bash script | python script)
**Target Platform**: Kubernetes (Minikube) on Windows/WSL
**Project Type**: Skills (SKILL.md + scripts/ + references/)
**Performance Goals**: Pod readiness within 120s timeout
**Constraints**: 3GB RAM total for Minikube, single-replica deployments only
**Scale/Scope**: Development environment, 1 Kafka broker, 1 PostgreSQL instance

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Skills-First Development | PASS | Both skills follow SKILL.md + scripts/ + references/ pattern |
| II | Token Efficiency (MCP Code Execution) | PASS | Scripts execute outside context, SKILL.md < 100 tokens, output < 5 lines |
| III | Cross-Agent Compatibility | PASS | Standard `.claude/skills/` directory, no agent-specific code |
| IV | Spec-Driven Development | PASS | Full SDD cascade: specify → clarify → plan (this step) |
| V | Automated Infrastructure | PASS | Helm charts automate Kafka + PostgreSQL deployment on K8s |
| VI | No Manual Code | PASS | Skills built via SDD, AI agents execute the scripts |

**Gate Result**: 6/6 PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-infrastructure-skills/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /sp.tasks)
```

### Source Code (Skills)

```text
.claude/skills/
├── kafka-k8s-setup/
│   ├── SKILL.md                    # AI instructions (~80 tokens)
│   ├── scripts/
│   │   ├── deploy_kafka.sh         # Deploy Kafka via Helm (idempotent)
│   │   ├── verify_kafka.py         # Check pods Running, return summary
│   │   ├── create_topics.sh        # Create Kafka topics
│   │   └── verify_topics.py        # Verify topics exist, return summary
│   └── references/
│       └── kafka-k8s-guide.md      # Kafka config, troubleshooting
│
└── postgres-k8s-setup/
    ├── SKILL.md                    # AI instructions (~80 tokens)
    ├── scripts/
    │   ├── deploy_postgres.sh      # Deploy PostgreSQL via Helm (idempotent)
    │   ├── verify_postgres.py      # Check pod Running + connectivity
    │   ├── run_migrations.sh       # Execute SQL migrations
    │   └── verify_schema.py        # Verify tables exist, return summary
    └── references/
        └── postgres-k8s-guide.md   # PostgreSQL config, schema reference
```

**Structure Decision**: Skills pattern — same as Phase 2 (agents-md-gen, k8s-foundation). Each skill has SKILL.md for AI instructions, scripts/ for execution, references/ for on-demand docs.

## Skill Designs

### kafka-k8s-setup

**SKILL.md** (~80 tokens):
```yaml
---
name: kafka-k8s-setup
description: Deploy Apache Kafka on Kubernetes and manage topics.
---
```
Instructions:
1. Deploy Kafka: `bash scripts/deploy_kafka.sh`
2. Verify deployment: `bash scripts/deploy_kafka.sh | python scripts/verify_kafka.py`
3. Create topics: `bash scripts/create_topics.sh <topic1> <topic2> ...`
4. Verify topics: `bash scripts/create_topics.sh <topics> | python scripts/verify_topics.py`

**deploy_kafka.sh**:
- Adds Bitnami Helm repo (idempotent)
- Runs `helm upgrade --install kafka bitnami/kafka --namespace kafka --create-namespace`
- Helm values for dev: `--set controller.replicaCount=1 --set controller.resourcePreset=small`
- Waits for pods with `--wait --timeout 120s`
- Outputs combined JSON (pod status) to stdout for verify_kafka.py

**verify_kafka.py**:
- Reads JSON from stdin (kubectl get pods output)
- Counts Running vs total pods
- Prints 2-line summary: "Kafka: X/Y pods Running in kafka namespace" + "Status: Healthy/Unhealthy"

**create_topics.sh**:
- Accepts topic names as arguments
- Exec into Kafka pod: `kubectl exec kafka-controller-0 -n kafka -- kafka-topics.sh --create --topic <name> --if-not-exists`
- Lists all topics after creation
- Outputs topic list to stdout for verify_topics.py

**verify_topics.py**:
- Reads topic list from stdin
- Checks required topics exist
- Prints 1-line summary: "N topics created: topic1, topic2, ..."

**Token Budget**: SKILL.md ~80 tokens, deploy output 2 lines, topic output 1 line

### postgres-k8s-setup

**SKILL.md** (~80 tokens):
```yaml
---
name: postgres-k8s-setup
description: Deploy PostgreSQL on Kubernetes and manage database schema.
---
```
Instructions:
1. Deploy PostgreSQL: `bash scripts/deploy_postgres.sh`
2. Verify deployment: `bash scripts/deploy_postgres.sh | python scripts/verify_postgres.py`
3. Run migrations: `bash scripts/run_migrations.sh`
4. Verify schema: `python scripts/verify_schema.py`

**deploy_postgres.sh**:
- Adds Bitnami Helm repo (idempotent)
- Runs `helm upgrade --install postgresql bitnami/postgresql --namespace postgres --create-namespace`
- Helm values: `--set auth.postgresPassword=learnflow-dev --set primary.resourcePreset=small`
- Waits with `--wait --timeout 120s`
- Outputs pod status JSON to stdout for verify_postgres.py

**verify_postgres.py**:
- Reads JSON from stdin
- Checks pod Running state
- Tests connectivity via `kubectl exec` with `pg_isready`
- Prints 2-line summary: "PostgreSQL: 1/1 pods Running in postgres namespace" + "Connection: verified/failed"

**run_migrations.sh**:
- Port-forwards PostgreSQL service temporarily
- Runs SQL migration file via `kubectl exec` with `psql`
- Creates tables: users, progress, submissions, exercises (IF NOT EXISTS)
- Outputs migration result to stdout for verify_schema.py

**verify_schema.py**:
- Connects via `kubectl exec` and runs `\dt` or information_schema query
- Counts tables created
- Prints 1-line summary: "Migration complete: N tables created"

**Token Budget**: SKILL.md ~80 tokens, deploy output 2 lines, migration output 1 line

## Resource Planning (3GB RAM Constraint)

| Service | Requested Memory | CPU | Replicas |
|---------|-----------------|-----|----------|
| Kafka Controller | ~512MB | 0.25 | 1 |
| PostgreSQL | ~256MB | 0.25 | 1 |
| K8s system pods | ~800MB | — | varies |
| **Total** | **~1.6GB** | — | — |
| **Available** | **3GB** | — | — |
| **Headroom** | **~1.4GB** | — | for Phase 4+ services |

Both services use Bitnami `resourcePreset=small` to stay within limits.

## Database Schema (LearnFlow Initial)

```sql
-- users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- progress table
CREATE TABLE IF NOT EXISTS progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    topic VARCHAR(255) NOT NULL,
    mastery_score DECIMAL(5,2) DEFAULT 0.00,
    exercises_completed INTEGER DEFAULT 0,
    quiz_score DECIMAL(5,2) DEFAULT 0.00,
    code_quality DECIMAL(5,2) DEFAULT 0.00,
    streak INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    exercise_id INTEGER,
    code TEXT NOT NULL,
    result VARCHAR(50),
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL DEFAULT 'beginner',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    starter_code TEXT,
    solution TEXT,
    test_cases TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Kafka Topics

| Topic | Purpose | Publishers | Subscribers |
|-------|---------|-----------|-------------|
| learning | Student learning events (questions, concept requests) | Frontend, Triage Agent | Concepts Agent, Progress Agent |
| code | Code submission events (execute, review) | Frontend, Code Review Agent | Debug Agent, Exercise Agent |
| exercise | Exercise events (generate, submit, grade) | Exercise Agent, Frontend | Progress Agent |
| struggle | Struggle detection alerts | All agents | Progress Agent, Teacher Dashboard |

## Post-Design Constitution Check

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Skills-First | PASS | Both skills: SKILL.md + scripts/ + references/ |
| II | Token Efficiency | PASS | SKILL.md ~80 tokens each, output 1-2 lines per command |
| III | Cross-Agent | PASS | Standard `.claude/skills/` directory |
| IV | SDD | PASS | Full cascade followed |
| V | Automated Infra | PASS | Helm deploys Kafka + PostgreSQL, scripts verify |
| VI | No Manual Code | PASS | Schema is SQL executed by script, not hand-written app code |

**Post-Design Gate**: 6/6 PASS

## Complexity Tracking

No constitution violations. No complexity justifications needed.
