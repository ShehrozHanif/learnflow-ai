# Research: Infrastructure Skills

**Feature**: 002-infrastructure-skills
**Date**: 2026-03-19

## R1: Kafka Helm Chart Selection

**Decision**: Bitnami Kafka Helm chart (`bitnami/kafka`)
**Rationale**: Bitnami is the most widely used Helm chart provider, well-maintained, supports KRaft mode (no Zookeeper dependency in recent versions), and has `resourcePreset` options for constrained environments.
**Alternatives considered**:
- Strimzi Kafka Operator: More feature-rich but heavier footprint, overkill for single-node dev setup
- Confluent Helm charts: Enterprise-focused, complex configuration, licensing concerns
- Raw K8s manifests: No Helm dependency but loses idempotency and upgrade support

## R2: Kafka Mode — KRaft vs Zookeeper

**Decision**: KRaft mode (controller-only, no separate Zookeeper)
**Rationale**: Bitnami Kafka v24+ defaults to KRaft mode. Eliminates Zookeeper pods, saving ~300MB RAM. Single `kafka-controller-0` pod handles both controller and broker roles.
**Alternatives considered**:
- Zookeeper mode: Legacy, requires extra pod, wastes RAM on 3GB Minikube
- External Zookeeper: Even more overhead, unnecessary for dev

## R3: PostgreSQL Helm Chart Configuration

**Decision**: Bitnami PostgreSQL Helm chart (`bitnami/postgresql`) with `auth.postgresPassword` set via Helm values
**Rationale**: Standard, lightweight, single-pod deployment. Password set at deploy time via `--set` flag (not hardcoded in SKILL.md). `resourcePreset=small` keeps memory usage minimal.
**Alternatives considered**:
- CloudNativePG operator: Production-grade but heavyweight for dev
- Raw PostgreSQL container: Loses Helm idempotency, PVC management, health probes

## R4: Migration Strategy

**Decision**: Plain SQL files executed via `kubectl exec` with `psql`, using `CREATE TABLE IF NOT EXISTS` for idempotency
**Rationale**: Simplest approach. No migration framework dependency (no Alembic, Flyway, etc.). SQL files are embedded in the skill's scripts/ directory. `IF NOT EXISTS` ensures re-runs are safe.
**Alternatives considered**:
- Alembic (Python): Requires Python + SQLAlchemy in the pod or a separate migration pod
- Flyway: Java-based, heavy dependency
- Kubernetes Job: More complex, but better for production (out of scope)

## R5: Topic Creation Method

**Decision**: `kubectl exec` into Kafka controller pod and run `kafka-topics.sh --create --if-not-exists`
**Rationale**: Direct and simple. `--if-not-exists` ensures idempotency. No external Kafka client library needed.
**Alternatives considered**:
- Python kafka-python library: Requires installing the library, adds dependency
- Kafka REST proxy: Another service to deploy, overkill for dev
- Helm values `provisioning.topics`: Some charts support it but configuration is complex

## R6: Resource Allocation Strategy

**Decision**: Use Bitnami `resourcePreset=small` for both Kafka and PostgreSQL (~512MB + ~256MB)
**Rationale**: Fits within 3GB Minikube. Leaves ~1.4GB headroom for Phase 4+ services. Small preset sets reasonable limits without manual tuning.
**Alternatives considered**:
- Custom resource limits: More precise but requires tuning, fragile
- No limits: Risk of OOMKill on constrained system
- Medium preset: Would consume too much of the 3GB budget
