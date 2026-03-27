# LearnFlow — Goose Compatibility Guide

## Overview

All LearnFlow skills work on both **Claude Code** and **Goose** without modification. Skills use only bash + python (no agent-specific dependencies).

## Using Skills with Goose

Goose reads `.claude/skills/` directly. Each SKILL.md file contains instructions that Goose can follow.

### Deploy Full Stack

```bash
# Single command — works identically on Claude Code and Goose
bash deploy_all.sh
```

### Deploy Individual Components

```bash
# Infrastructure
bash .claude/skills/kafka-k8s-setup/scripts/deploy_kafka.sh | python .claude/skills/kafka-k8s-setup/scripts/verify_kafka.py
bash .claude/skills/postgres-k8s-setup/scripts/deploy_postgres.sh | python .claude/skills/postgres-k8s-setup/scripts/verify_postgres.py

# Backend
bash .claude/skills/fastapi-dapr-agent/scripts/deploy_services.sh | python .claude/skills/fastapi-dapr-agent/scripts/verify_services.py

# Frontend
bash .claude/skills/nextjs-k8s-deploy/scripts/deploy_frontend.sh | python .claude/skills/nextjs-k8s-deploy/scripts/verify_frontend.py

# Docs
bash .claude/skills/docusaurus-deploy/scripts/deploy_docs.sh | python .claude/skills/docusaurus-deploy/scripts/verify_docs.py
```

### Query System State (MCP Code Execution)

```bash
# K8s context
python .claude/skills/mcp-code-execution/scripts/query_k8s.py learnflow

# Database
python .claude/skills/mcp-code-execution/scripts/query_db.py users 5

# Kafka
python .claude/skills/mcp-code-execution/scripts/query_kafka.py

# Full system health
python .claude/skills/mcp-code-execution/scripts/system_status.py | python .claude/skills/mcp-code-execution/scripts/verify_mcp.py
```

## Skills Inventory

| Skill | Prompt to Trigger | Pipeline |
|-------|-------------------|----------|
| kafka-k8s-setup | "Deploy Kafka on K8s" | `bash deploy_kafka.sh \| python verify_kafka.py` |
| postgres-k8s-setup | "Deploy PostgreSQL on K8s" | `bash deploy_postgres.sh \| python verify_postgres.py` |
| fastapi-dapr-agent | "Deploy backend agents" | `bash deploy_services.sh \| python verify_services.py` |
| nextjs-k8s-deploy | "Deploy frontend" | `bash deploy_frontend.sh \| python verify_frontend.py` |
| docusaurus-deploy | "Deploy docs" | `bash deploy_docs.sh \| python verify_docs.py` |
| mcp-code-execution | "Check system status" | `python system_status.py \| python verify_mcp.py` |

## Cross-Agent Compatibility

All skills follow these constraints:
- **Bash + Python only** — no Node.js, Go, or Ruby in scripts
- **Standard library only** — no pip install needed for verify scripts
- **kubectl + helm + docker** — standard K8s toolchain
- **Pipeline pattern** — `bash script.sh | python verify.py`
- **< 5 lines output** — minimal context consumption
- **SKILL.md < 100 tokens** — fits in any agent's context window

## Commit Convention

When Goose builds using these skills, use commit messages prefixed with:
```
Goose: deployed Kafka using kafka-k8s-setup skill
Goose: deployed PostgreSQL using postgres-k8s-setup skill
```
