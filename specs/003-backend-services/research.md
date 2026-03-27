# Research: Backend Services (fastapi-dapr-agent)

**Date**: 2026-03-20
**Feature**: 003-backend-services

## R1: Dapr Installation on Minikube

**Decision**: Use Dapr Helm chart (not dapr CLI)
**Rationale**: Helm chart is lighter (no dashboard), integrates with existing Helm workflow from Phase 2 (k8s-foundation skill), and allows precise resource control via Helm values.
**Alternatives**: dapr CLI (`dapr init -k`) — installs dashboard + zipkin which consume extra ~200Mi RAM we can't spare.

## R2: Container Image Strategy

**Decision**: Use `eval $(minikube docker-env)` to build directly in Minikube's Docker daemon
**Rationale**: No registry needed, instant image availability, zero network overhead. Images built locally inside Minikube's Docker are immediately available to K8s pods.
**Alternatives**: `minikube image load` (slower, copies tarball), local registry (extra pod + memory overhead).

## R3: Service Architecture — Single Template vs Separate Services

**Decision**: Single FastAPI template with per-agent configuration via environment variables
**Rationale**: All 6 agents share identical structure (FastAPI + Dapr pub/sub + OpenAI SDK). Only the system prompt, topic subscriptions, and agent name differ. One Docker image, 6 K8s Deployments with different env vars. Saves ~500Mi by sharing base image layers.
**Alternatives**: 6 separate codebases (unnecessary duplication, harder to maintain), monolith (violates stateless microservice principles required by evaluation).

## R4: Resource Budget

**Decision**: 64Mi request / 128Mi limit per service, Dapr system at 256Mi total
**Rationale**:
- Available: ~2GB (3GB Minikube - 960Mi Kafka+PostgreSQL)
- Dapr system (3 pods): ~256Mi requests
- 6 services × 64Mi = 384Mi requests
- 6 Dapr sidecars × 32Mi = 192Mi (auto-injected, lightweight)
- Total requests: ~832Mi — fits within 2GB with headroom
**Alternatives**: Larger limits per service (risk OOM kills on Minikube).

## R5: Dapr Pub/Sub with Kafka

**Decision**: Programmatic subscription model via `/dapr/subscribe` endpoint
**Rationale**: Each FastAPI service exposes `GET /dapr/subscribe` returning topic subscriptions. Dapr sidecar calls this on startup, routes messages to the declared endpoint. Simpler than declarative YAML subscriptions (no extra files per service). Kafka component YAML points to existing Kafka broker at `kafka-0.kafka.kafka.svc.cluster.local:9092`.
**Alternatives**: Declarative subscription YAML (extra files, harder to template), CloudEvents SDK (unnecessary complexity for MVP).

## R6: Dapr State Store with PostgreSQL

**Decision**: Use existing PostgreSQL as Dapr state store backend
**Rationale**: PostgreSQL already deployed in Phase 3. Dapr's PostgreSQL state store component connects to it for session state management. No additional infrastructure needed.
**Alternatives**: Redis (extra pod + memory), in-memory (lost on restart).

## R7: Response Delivery Path

**Decision**: Specialists publish responses to a `responses` Kafka topic; frontend/API gateway subscribes
**Rationale**: Keeps agents fully decoupled and stateless. Triage publishes to specialist topics, specialists publish results to `responses` topic. This maintains the async event-driven pattern required by evaluation criteria.
**Alternatives**: Direct HTTP callback (couples services), Dapr service invocation (sync, defeats pub/sub purpose).

## R8: OpenAI API Fallback for Demo

**Decision**: Support mock mode via `OPENAI_API_KEY=mock` environment variable
**Rationale**: Judges may not have an OpenAI API key. When key is "mock", agents return pre-written sample responses demonstrating the routing and processing pipeline without actual AI calls. Real OpenAI integration works when a valid key is provided.
**Alternatives**: Always require real API key (blocks demos), hardcode responses (doesn't demonstrate AI integration).
