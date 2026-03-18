# Implementation Plan: Foundation Skills

**Branch**: `001-foundation-skills` | **Date**: 2026-03-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-foundation-skills/spec.md`

## Summary

Build two reusable AI Skills (`agents-md-gen` and `k8s-foundation`) that follow the MCP Code Execution pattern. Each skill has a lightweight SKILL.md (~100 tokens) that tells the AI WHAT to do, and scripts/ that do the heavy lifting outside AI context. Both skills must work on Claude Code and Goose without modification.

## Technical Context

**Language/Version**: Python 3.x (verify.py scripts) + Bash (shell scripts)
**Primary Dependencies**: kubectl, helm, find, grep, awk (standard CLI tools)
**Storage**: N/A (skills produce files, not persistent data)
**Testing**: Manual testing — run skill via Claude Code, verify output
**Target Platform**: Windows (WSL) / Linux / macOS — any environment with bash and python3
**Project Type**: Skills library (`.claude/skills/` directories)
**Performance Goals**: Script execution < 10 seconds, context output < 5 lines
**Constraints**: SKILL.md < 100 tokens, scripts print < 5 lines, no MCP server dependencies
**Scale/Scope**: 2 skills, ~5 scripts total, ~2 reference files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Skills-First Development | PASS | Building skills with SKILL.md + scripts/ + references/ |
| II. Token Efficiency | PASS | Scripts execute outside context, < 5 lines output |
| III. Cross-Agent Compatibility | PASS | Using `.claude/skills/` directory, no agent-specific code |
| IV. Spec-Driven Development | PASS | Following SDD cascade: specify → clarify → plan → tasks |
| V. Automated Infrastructure | PASS | k8s-foundation automates cluster health checks |
| VI. No Manual Code | PASS | Skills will be generated using skill-creator-pro |

**Gate Result: ALL PASS — proceed to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/001-foundation-skills/
├── spec.md              # Feature specification (done)
├── plan.md              # This file
├── research.md          # Phase 0 output (below)
├── checklists/
│   └── requirements.md  # Spec quality checklist (done)
└── tasks.md             # Phase 2 output (/sp.tasks)
```

### Source Code (skills directories)

```text
.claude/skills/
├── agents-md-gen/
│   ├── SKILL.md                # ~100 tokens: instructions for AI
│   ├── references/
│   │   └── agents-md-format.md # AGENTS.md section reference (loaded on-demand)
│   └── scripts/
│       ├── analyze_repo.sh     # Scans repo: files, languages, structure
│       └── generate_agents_md.py # Generates AGENTS.md from analysis output
│
└── k8s-foundation/
    ├── SKILL.md                # ~100 tokens: instructions for AI
    ├── references/
    │   └── kubectl-commands.md # Common kubectl patterns (loaded on-demand)
    └── scripts/
        ├── check_cluster.sh    # Checks node status, core pods, reachability
        ├── verify_health.py    # Parses kubectl JSON, returns minimal summary
        └── helm_install.sh     # Installs a Helm chart + waits for pods
```

**Structure Decision**: Each skill is a self-contained directory under `.claude/skills/`. No shared code between skills. Each has 3 subdirectories: root (SKILL.md), references/, scripts/.

---

## Phase 0: Research

### Research Findings

**R1: AGENTS.md Format — What sections should it contain?**
- **Decision**: 5 sections — Project Overview, Directory Structure, Tech Stack, Conventions, Getting Started
- **Rationale**: This covers what AI agents need to understand a codebase. Based on the hackathon requirements (Part 2A glossary defines AGENTS.md) and common patterns in open-source repos.
- **Alternatives**: 3-section minimal (overview, structure, conventions) — rejected because tech stack detection adds significant value for AI understanding.

**R2: Script Language — Bash vs Python vs Both?**
- **Decision**: Both — Bash for file scanning and kubectl/helm commands, Python for JSON parsing and AGENTS.md generation.
- **Rationale**: Bash is natural for CLI tool orchestration (find, kubectl, helm). Python is better for structured output generation and JSON parsing. Both are available in any dev environment.
- **Alternatives**: Pure Python — rejected because subprocess calls to kubectl/helm add unnecessary complexity vs direct bash. Pure Bash — rejected because generating structured markdown is painful in bash.

**R3: How to detect repo languages/frameworks?**
- **Decision**: File extension scanning via `find` + known patterns (package.json → Node.js, requirements.txt → Python, go.mod → Go, Cargo.toml → Rust, etc.)
- **Rationale**: Simple, fast, no external dependencies. Works on any repo.
- **Alternatives**: GitHub API language detection — rejected (requires API access, not available offline). `cloc` tool — rejected (extra dependency).

**R4: kubectl output — JSON vs text parsing?**
- **Decision**: Use `kubectl get ... -o json` piped through Python for structured parsing.
- **Rationale**: JSON output is stable across kubectl versions. Python `json` module handles parsing cleanly. Only the summary line enters context.
- **Alternatives**: Text parsing with grep/awk — rejected (fragile, depends on kubectl output format). `kubectl get ... -o custom-columns` — viable but less flexible for error detection.

**R5: Helm install — How to handle idempotency?**
- **Decision**: Check if release exists first with `helm list`, then `helm upgrade --install` for idempotent operation.
- **Rationale**: `helm upgrade --install` handles both fresh install and upgrade cases in one command.
- **Alternatives**: Always `helm install` with error handling — rejected (more complex, error-prone).

---

## Phase 1: Design

### Skill 1: agents-md-gen

**SKILL.md Design** (~80 tokens):
```
---
name: agents-md-gen
description: Generate AGENTS.md files for repositories. Use when setting up a new repo or when asked to create an AGENTS.md.
---
# Generate AGENTS.md
## Instructions
1. Analyze repo: `bash scripts/analyze_repo.sh`
2. Generate file: `python scripts/generate_agents_md.py`
3. Confirm AGENTS.md exists at repo root.
```

**Script: analyze_repo.sh**
- Scans current directory tree (max depth 3)
- Detects languages by file extensions
- Detects frameworks by config files (package.json, requirements.txt, etc.)
- Outputs structured text (not JSON) to stdout for Python to consume
- Prints only: "Analyzed: X files, Y languages detected"

**Script: generate_agents_md.py**
- Reads analyze_repo.sh output from stdin (piped)
- Generates AGENTS.md with 5 sections
- Writes file to repo root
- Prints only: "AGENTS.md created (5 sections, N lines)"

**Reference: agents-md-format.md**
- Documents the 5 required AGENTS.md sections
- Provides examples for each section
- Loaded by AI only if it needs format guidance

### Skill 2: k8s-foundation

**SKILL.md Design** (~80 tokens):
```
---
name: k8s-foundation
description: Check Kubernetes cluster health and install Helm charts. Use when verifying cluster status or deploying basic services.
---
# K8s Foundation
## Instructions
- Check health: `bash scripts/check_cluster.sh`
- Verify details: `python scripts/verify_health.py`
- Install chart: `bash scripts/helm_install.sh <chart> <namespace>`
```

**Script: check_cluster.sh**
- Runs `kubectl cluster-info` (reachability check)
- Runs `kubectl get nodes -o json` (node status)
- Runs `kubectl get pods -n kube-system -o json` (core services)
- Outputs raw JSON to stdout (for verify_health.py to parse)
- On failure: prints "Cluster not reachable" with exit code 1

**Script: verify_health.py**
- Reads JSON from check_cluster.sh via stdin
- Parses nodes (Ready count), pods (Running count), core services
- Prints 3-line summary: nodes, pods, overall status
- Example: "Nodes: 1/1 Ready | Core Pods: 7/7 Running | Status: Healthy"

**Script: helm_install.sh**
- Takes arguments: `<chart-name> <namespace> [--repo <repo-url>]`
- Adds Helm repo if not present
- Runs `helm upgrade --install` for idempotency
- Waits for pods (timeout 120s)
- Prints: "<chart> deployed: X/Y pods Running"

**Reference: kubectl-commands.md**
- Common kubectl patterns for health checks
- Helm chart installation patterns
- Loaded by AI only when debugging or customizing

### Data Flow

```
agents-md-gen:
  AI reads SKILL.md → runs analyze_repo.sh → pipes to generate_agents_md.py → "Done"
  Context cost: ~80 tokens (SKILL.md) + ~2 lines output = ~90 tokens total

k8s-foundation (health check):
  AI reads SKILL.md → runs check_cluster.sh | verify_health.py → "Healthy"
  Context cost: ~80 tokens (SKILL.md) + ~3 lines output = ~95 tokens total

k8s-foundation (helm install):
  AI reads SKILL.md → runs helm_install.sh <chart> <ns> → "Deployed"
  Context cost: ~80 tokens (SKILL.md) + ~1 line output = ~85 tokens total
```

### Constitution Re-Check (Post-Design)

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Skills-First | PASS | Both skills follow SKILL.md + scripts/ + references/ pattern |
| II. Token Efficiency | PASS | Max ~95 tokens per skill execution |
| III. Cross-Agent | PASS | Standard bash/python scripts, `.claude/skills/` directory |
| IV. SDD | PASS | Plan traces to spec requirements FR-001 through FR-010 |
| V. Automated | PASS | All operations automated via scripts |
| VI. No Manual Code | PASS | Skills generate output, no manual coding |

**Gate Result: ALL PASS — ready for /sp.tasks.**
