# Feature Specification: Foundation Skills (agents-md-gen + k8s-foundation)

**Feature Branch**: `001-foundation-skills`
**Created**: 2026-03-19
**Status**: Draft
**Input**: Two reusable AI Skills that follow MCP Code Execution pattern, work on Claude Code and Goose

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate AGENTS.md for Any Repository (Priority: P1)

A developer opens Claude Code (or Goose) in any repository and says: "Generate an AGENTS.md for this repo." The AI agent uses the `agents-md-gen` skill — runs a script that analyzes the repo structure, detects technologies, and generates a comprehensive AGENTS.md file. The developer sees only a short confirmation like "AGENTS.md created with 5 sections."

**Why this priority**: AGENTS.md is required for every repo in this hackathon. It helps AI agents understand the codebase. This skill is used repeatedly across all phases.

**Independent Test**: Run the skill against this hackathon repo (`hack3/`) and verify a valid AGENTS.md is generated.

**Acceptance Scenarios**:

1. **Given** a repo with files and folders, **When** the AI agent is told "generate AGENTS.md", **Then** a valid AGENTS.md is created at the repo root containing project overview, structure, conventions, and tech stack sections.
2. **Given** a repo with no existing AGENTS.md, **When** the skill runs, **Then** scripts execute outside context, only minimal output (~3 lines) enters AI context.
3. **Given** a repo with an existing AGENTS.md, **When** the skill runs, **Then** it regenerates the file (overwrite) with updated content.

---

### User Story 2 - Check Kubernetes Cluster Health (Priority: P1)

A developer says: "Check if my K8s cluster is healthy." The AI agent uses the `k8s-foundation` skill — runs a script that checks node status, core services (DNS, storage), and reports a summary. The developer sees "Cluster healthy: 1 node Ready, CoreDNS running, storage-provisioner active."

**Why this priority**: Every subsequent phase (3-7) depends on a working K8s cluster. This skill validates the foundation before deploying Kafka, PostgreSQL, services, etc.

**Independent Test**: Run the skill against the local Minikube cluster and verify it reports accurate health status.

**Acceptance Scenarios**:

1. **Given** a running Minikube cluster, **When** the AI agent is told "check cluster health", **Then** a script checks node status, core pods, and returns a 3-5 line summary.
2. **Given** Minikube is not running, **When** the skill runs, **Then** the script returns a clear error: "Cluster not reachable" with exit code 1.
3. **Given** a healthy cluster, **When** the skill runs, **Then** only the summary enters AI context (not full kubectl JSON output).

---

### User Story 3 - Apply Basic Helm Chart via Skill (Priority: P2)

A developer says: "Install nginx via Helm on my cluster." The AI agent uses the `k8s-foundation` skill to apply a basic Helm chart, verify it deployed, and return a minimal status.

**Why this priority**: This validates the pattern of deploying Helm charts via skills before Phase 3 tackles Kafka and PostgreSQL.

**Independent Test**: Deploy a simple Helm chart (e.g., nginx) and verify pods reach Running state.

**Acceptance Scenarios**:

1. **Given** a healthy cluster and Helm installed, **When** the AI agent is told "install nginx via Helm", **Then** the script runs `helm install`, waits for pods, and returns "nginx deployed: 1/1 pods Running."
2. **Given** a Helm release already exists, **When** the skill runs again, **Then** it handles the "already exists" case gracefully (upgrade or skip).

---

### Edge Cases

- What happens when kubectl is not installed or not in PATH? → Script returns clear error message.
- What happens when the repo has no files (empty repo)? → agents-md-gen generates a minimal AGENTS.md noting "empty repository."
- What happens when cluster has pods in CrashLoopBackOff? → k8s-foundation reports unhealthy pods with count.
- What happens when Helm repo has not been added? → Script adds the repo first before installing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `agents-md-gen` skill MUST analyze repo file tree, detect languages/frameworks, and identify project conventions.
- **FR-002**: `agents-md-gen` skill MUST generate an AGENTS.md with sections: Project Overview, Directory Structure, Tech Stack, Conventions, and Getting Started.
- **FR-003**: `agents-md-gen` scripts MUST execute outside AI context and return only a confirmation message (< 5 lines).
- **FR-004**: `k8s-foundation` skill MUST check: node status, core pods (kube-system namespace), and cluster reachability.
- **FR-005**: `k8s-foundation` skill MUST support basic Helm chart installation with pod verification.
- **FR-006**: `k8s-foundation` scripts MUST return minimal health summary (< 5 lines) instead of raw kubectl JSON.
- **FR-007**: Both skills MUST have SKILL.md with YAML frontmatter (name, description) under 100 tokens.
- **FR-008**: Both skills MUST work identically on Claude Code and Goose without modification.
- **FR-009**: Both skills MUST include a `scripts/` directory with executable scripts.
- **FR-010**: Both skills MUST include a `references/` directory with on-demand documentation.

### Key Entities

- **Skill**: A directory under `.claude/skills/<name>/` containing SKILL.md, scripts/, and references/
- **SKILL.md**: Lightweight instruction file (~100 tokens) with YAML frontmatter that tells AI WHAT to do
- **Script**: An executable file (bash/python) that does the heavy lifting outside AI context
- **AGENTS.md**: A markdown file describing repo structure, conventions, and guidelines for AI agents

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: AI agent generates a valid AGENTS.md from a single prompt with zero manual intervention.
- **SC-002**: AI agent reports cluster health status from a single prompt with zero manual intervention.
- **SC-003**: SKILL.md files are under 100 tokens each (frontmatter + instructions).
- **SC-004**: Script output entering AI context is under 5 lines per execution.
- **SC-005**: Both skills work on Claude Code and Goose without any modification.
- **SC-006**: Generated AGENTS.md contains all 5 required sections (Overview, Structure, Tech Stack, Conventions, Getting Started).
- **SC-007**: Cluster health check correctly identifies healthy vs unhealthy cluster states.

## Assumptions

- Python 3 and Bash are available in the development environment.
- kubectl is configured and can reach the Minikube cluster.
- Helm v3 is installed and functional.
- The `.claude/skills/` directory is the standard location for skills (both Claude Code and Goose read from it).
- Scripts use standard tools (find, grep, kubectl, helm) available in any dev environment.

## Scope Boundaries

**In Scope:**
- agents-md-gen skill (SKILL.md + scripts + references)
- k8s-foundation skill (SKILL.md + scripts + references)
- Testing both skills with Claude Code

**Out of Scope:**
- Deploying Kafka or PostgreSQL (Phase 3)
- Any application code for LearnFlow
- MCP server integration
- Goose testing (deferred to Phase 7, but skill structure is compatible)
