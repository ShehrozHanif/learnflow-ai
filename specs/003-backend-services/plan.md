# Implementation Plan: Backend Services (fastapi-dapr-agent)

**Feature**: 003-backend-services
**Created**: 2026-03-20
**Status**: Complete

## Approach

Single Docker image, 6 K8s Deployments. All agents share one FastAPI template configured via environment variables (`AGENT_NAME`, `SUBSCRIBE_TOPIC`, `OPENAI_API_KEY`). Dapr sidecars handle pub/sub (Kafka) and state (PostgreSQL).

## Architecture

```
Student → POST /chat → Triage Agent
                         ↓ route_message()
                         ↓ Dapr pub/sub → Kafka
              ┌──────────┼──────────┬──────────┐
              ↓          ↓          ↓          ↓
         Concepts   CodeReview   Debug    Exercise
              ↓          ↓          ↓          ↓
              └──────────┴──────────┴──────────┘
                         ↓
              Dapr pub/sub → responses topic
                         ↓
                   Progress Agent
```

## Key Decisions

1. **Single image, multi-deploy**: One Dockerfile, 6 deployments with env vars. Saves ~500Mi image layers.
2. **Dapr via Helm**: `dapr/dapr` chart without dashboard. Lighter than CLI install.
3. **Programmatic subscriptions**: `GET /dapr/subscribe` endpoint instead of declarative YAML. More portable.
4. **Mock mode**: `OPENAI_API_KEY=mock` returns sample responses. No real API needed for demo.
5. **Keyword routing**: Simple keyword matching in triage. No ML model needed for MVP.
6. **PostgreSQL state store**: Reuses existing Phase 3 PostgreSQL via Dapr state component.

## Topic Mapping

| Topic | Producer | Consumer(s) |
|-------|----------|-------------|
| learning | triage | concepts |
| code | triage | codereview, debug |
| exercise | triage | exercise |
| struggle | triage | progress |
| responses | all specialists | progress |

## Resource Budget (Minikube 3GB)

| Component | Requests | Limits |
|-----------|----------|--------|
| Dapr system (3 pods) | 256Mi | 512Mi |
| 6 agents × 64Mi | 384Mi | 768Mi |
| 6 sidecars × 32Mi | 192Mi | 384Mi |
| **Phase 4 total** | **832Mi** | **1.66GB** |
| Phase 3 (Kafka+PG) | 640Mi | 960Mi |
| **Grand total** | **1.47GB** | **2.62GB** |

## Skill Structure

```
.claude/skills/fastapi-dapr-agent/
├── SKILL.md                          # 67 tokens
├── scripts/
│   ├── deploy_services.sh            # Dapr + image + 6 deployments
│   ├── verify_services.py            # Pod + sidecar health check
│   ├── test_routing.sh               # Triage routing tests
│   ├── verify_routing.py             # Parse routing results
│   └── templates/
│       ├── app/                      # FastAPI source
│       ├── dapr/                     # Dapr components
│       └── k8s/                      # K8s deployment template
└── references/
    └── fastapi-dapr-guide.md
```

## Risks

1. **Dapr sidecar startup**: Sidecars may take 30-60s to initialize. Mitigated with readiness probes.
2. **Minikube memory**: 2.62GB total is tight in 3GB. Monitor with `kubectl top`.
3. **Kafka topic creation**: `responses` topic must exist before agents publish. Created in deploy script.
