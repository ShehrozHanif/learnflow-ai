# Phase 6: MCP Integration + Documentation — Specification

**Status:** Implemented
**Phase:** 6
**Date:** 2026-03-20

## Overview

Build two skills for Phase 6:
1. **mcp-code-execution** — Python scripts replacing direct MCP server connections for 99.7% token savings
2. **docusaurus-deploy** — Auto-generated documentation site on Kubernetes

## Requirements

### mcp-code-execution
- FR-001: `query_k8s.py <namespace>` — pods, services, logs (~5 lines output)
- FR-002: `query_db.py <table> [limit]` — tables, rows, schema (~5 lines output)
- FR-003: `query_kafka.py` — topics, consumer groups (~5 lines output)
- FR-004: `system_status.py` — aggregated JSON from all 3 subsystems (~2 lines)
- FR-005: `verify_mcp.py` — parses system_status JSON, prints 2-line summary
- FR-006: Token savings ≥99% vs direct MCP server connections

### docusaurus-deploy
- FR-007: Docusaurus 3.x site with LearnFlow branding
- FR-008: Documentation for all 6 skills (kafka, postgres, backend, frontend, mcp, docs)
- FR-009: Architecture overview and deployment guide pages
- FR-010: Deploy pipeline: `bash deploy_docs.sh | python verify_docs.py`
- FR-011: K8s deployment with 64Mi/128Mi resource budget
- FR-012: Nginx-based serving for static output (~30MB image)

### Cross-cutting
- FR-013: SKILL.md < 100 tokens for both skills
- FR-014: All script outputs < 5 lines
- FR-015: Cross-agent compatible (bash + python, no agent-specific deps)

## Acceptance Criteria

- [x] mcp-code-execution skill with 5 scripts + SKILL.md + reference
- [x] docusaurus-deploy skill with templates, deploy pipeline, verify script
- [x] 10 documentation pages covering all skills + architecture
- [x] Token budget met: both SKILL.md < 100 tokens
- [x] Pipeline outputs < 5 lines
- [x] Idempotent deploy scripts
