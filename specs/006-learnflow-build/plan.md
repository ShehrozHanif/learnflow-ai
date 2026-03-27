# Phase 7: LearnFlow Build — Plan

## Architecture

### Master Orchestration
A single `deploy_all.sh` script calls each skill's deploy script in order, piping output to verify scripts. If any step fails, it stops with a clear error.

```
deploy_all.sh
  ├── Step 1: bash kafka-k8s-setup/scripts/deploy_kafka.sh
  │           bash kafka-k8s-setup/scripts/create_topics.sh learning,code,exercise,struggle,responses
  ├── Step 2: bash postgres-k8s-setup/scripts/deploy_postgres.sh
  │           bash postgres-k8s-setup/scripts/run_migrations.sh
  ├── Step 3: bash fastapi-dapr-agent/scripts/deploy_services.sh
  ├── Step 4: bash nextjs-k8s-deploy/scripts/deploy_frontend.sh
  └── Step 5: bash docusaurus-deploy/scripts/deploy_docs.sh
```

### System Verification
`verify_all.py` aggregates health from all verify scripts:
```
verify_all.py
  ├── verify_kafka.py → Kafka: 1/1 Running
  ├── verify_postgres.py → PostgreSQL: 1/1 Running
  ├── verify_services.py → Services: 6/6 Running
  ├── verify_frontend.py → Frontend: 1/1 Running
  └── verify_docs.py → Docs: 1/1 Running
  → System: 5/5 components healthy, 10/10 pods Running
```

### Cross-Agent Strategy
All skills already use bash + python (no agent-specific deps). For Goose:
- Skills in `.claude/skills/` are read by both Claude Code and Goose
- Add a `goose-instructions.md` explaining how to use the skills with Goose
- Goose reads SKILL.md files directly (same format)

### Port-Forward Script
Exposes all services locally for demo:
- Frontend: localhost:3000
- Docs: localhost:8080
- Triage API: localhost:8000

## Key Decisions

1. **Single orchestration script** over separate manual commands — demonstrates autonomy
2. **Sequential deployment** (not parallel) — respects dependency chain
3. **Fail-fast** — stop on first failure with clear error message
4. **Goose compatibility via shared skills directory** — no separate recipe needed

## Resource Budget (Full Stack)

| Component | Requests | Limits |
|-----------|----------|--------|
| Kafka | 512Mi | 768Mi |
| PostgreSQL | 128Mi | 192Mi |
| Dapr system (3 pods) | 256Mi | 512Mi |
| 6 agents + sidecars | 576Mi | 1.15GB |
| Frontend | 128Mi | 256Mi |
| Docs | 64Mi | 128Mi |
| **Total** | **~1.66GB** | **~3.0GB** |
