# Phase 7: LearnFlow Build — Specification

**Status:** Implemented
**Phase:** 7
**Date:** 2026-03-20

## Overview

Orchestrate all 8 skills to deploy the complete LearnFlow application on Minikube. Demonstrate cross-agent compatibility (Claude Code + Goose) and single-prompt-to-deployment autonomy.

## Requirements

### Master Orchestration
- FR-001: Master deploy script that runs all skills in dependency order
- FR-002: Master verify script that checks full system health
- FR-003: Single-prompt deployment: one command deploys entire stack
- FR-004: Idempotent — re-running upgrades cleanly

### Deployment Order (dependency chain)
- FR-005: Step 1 — Kafka (kafka namespace)
- FR-006: Step 2 — PostgreSQL (postgres namespace)
- FR-007: Step 3 — Backend agents + Dapr (learnflow namespace)
- FR-008: Step 4 — Frontend (learnflow namespace)
- FR-009: Step 5 — Docs (learnflow namespace)

### Cross-Agent Compatibility
- FR-010: Skills work identically on Claude Code and Goose
- FR-011: No agent-specific dependencies (bash + python only)
- FR-012: Goose compatibility file (recipe.yaml or instructions)

### Demo & Verification
- FR-013: System-wide health check (all namespaces, all pods)
- FR-014: Port-forward script for local access to all services
- FR-015: Demo script simulating Student Maya + Teacher Rodriguez scenario

## Acceptance Criteria

- [ ] `bash deploy_all.sh` deploys full stack from scratch
- [ ] `python verify_all.py` reports all components healthy
- [ ] Re-run is idempotent (no errors on second deploy)
- [ ] Cross-agent docs demonstrate Goose compatibility
- [ ] Port-forward script provides local access to frontend + docs
- [ ] Demo scenario documented or scripted
