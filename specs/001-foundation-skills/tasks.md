# Tasks: Foundation Skills (agents-md-gen + k8s-foundation)

**Input**: Design documents from `/specs/001-foundation-skills/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md

**Tests**: Not explicitly requested in the feature specification — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Skills directory**: `.claude/skills/<skill-name>/`
- Each skill: `SKILL.md` + `scripts/` + `references/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create skill directory structure for both skills

- [x] T001 Create agents-md-gen skill directory structure: `.claude/skills/agents-md-gen/`, `.claude/skills/agents-md-gen/scripts/`, `.claude/skills/agents-md-gen/references/`
- [x] T002 [P] Create k8s-foundation skill directory structure: `.claude/skills/k8s-foundation/`, `.claude/skills/k8s-foundation/scripts/`, `.claude/skills/k8s-foundation/references/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create SKILL.md files and reference docs that both user stories depend on

**⚠️ CRITICAL**: No script implementation can begin until SKILL.md files define the contract

- [x] T003 [P] Create SKILL.md for agents-md-gen (~80 tokens, YAML frontmatter + 3-step instructions) in `.claude/skills/agents-md-gen/SKILL.md`
- [x] T004 [P] Create SKILL.md for k8s-foundation (~80 tokens, YAML frontmatter + 3-command instructions) in `.claude/skills/k8s-foundation/SKILL.md`
- [x] T005 [P] Create agents-md-format reference document (5 AGENTS.md sections with examples) in `.claude/skills/agents-md-gen/references/agents-md-format.md`
- [x] T006 [P] Create kubectl-commands reference document (health check and Helm patterns) in `.claude/skills/k8s-foundation/references/kubectl-commands.md`

**Checkpoint**: Both skills have SKILL.md and references — script implementation can begin

---

## Phase 3: User Story 1 — Generate AGENTS.md for Any Repository (Priority: P1) 🎯 MVP

**Goal**: AI agent can generate a valid AGENTS.md from a single prompt with zero manual intervention

**Independent Test**: Run the skill against `hack3/` repo and verify AGENTS.md is generated with 5 sections

### Implementation for User Story 1

- [x] T007 [US1] Create analyze_repo.sh script that scans repo tree (max depth 3), detects languages by file extensions, detects frameworks by config files, and outputs structured text to stdout in `.claude/skills/agents-md-gen/scripts/analyze_repo.sh`
- [x] T008 [US1] Create generate_agents_md.py script that reads analyze_repo.sh output from stdin, generates AGENTS.md with 5 sections (Project Overview, Directory Structure, Tech Stack, Conventions, Getting Started), writes to repo root in `.claude/skills/agents-md-gen/scripts/generate_agents_md.py`
- [x] T009 [US1] Make scripts executable and verify end-to-end pipeline: `bash analyze_repo.sh | python generate_agents_md.py` produces valid AGENTS.md at repo root
- [x] T010 [US1] Verify SKILL.md + scripts output stays under token budget (SKILL.md < 100 tokens, script output < 5 lines to context)

**Checkpoint**: agents-md-gen skill is fully functional — AI agent can generate AGENTS.md from a single prompt

---

## Phase 4: User Story 2 — Check Kubernetes Cluster Health (Priority: P1)

**Goal**: AI agent can verify cluster health from a single prompt and get a 3-line summary

**Independent Test**: Run the skill against local Minikube cluster and verify accurate health report

### Implementation for User Story 2

- [x] T011 [P] [US2] Create check_cluster.sh script that runs kubectl cluster-info, kubectl get nodes -o json, kubectl get pods -n kube-system -o json, outputs combined JSON to stdout, exits 1 with "Cluster not reachable" on failure in `.claude/skills/k8s-foundation/scripts/check_cluster.sh`
- [x] T012 [US2] Create verify_health.py script that reads JSON from stdin, parses node Ready count, pod Running count, core service status, prints 3-line summary in `.claude/skills/k8s-foundation/scripts/verify_health.py`
- [x] T013 [US2] Make scripts executable and verify pipeline: `bash check_cluster.sh | python verify_health.py` returns accurate health summary
- [x] T014 [US2] Verify SKILL.md + scripts output stays under token budget (SKILL.md < 100 tokens, script output < 5 lines)

**Checkpoint**: k8s-foundation health check is fully functional — AI agent can check cluster from a single prompt

---

## Phase 5: User Story 3 — Apply Basic Helm Chart via Skill (Priority: P2)

**Goal**: AI agent can install a Helm chart and verify deployment from a single prompt

**Independent Test**: Deploy nginx Helm chart and verify pods reach Running state

### Implementation for User Story 3

- [x] T015 [US3] Create helm_install.sh script that takes `<chart-name> <namespace> [--repo <repo-url>]` arguments, adds Helm repo if needed, runs `helm upgrade --install` for idempotency, waits for pods (timeout 120s), prints deployment status in `.claude/skills/k8s-foundation/scripts/helm_install.sh`
- [x] T016 [US3] Verify helm_install.sh handles: fresh install, upgrade of existing release, repo not yet added, and timeout scenarios
- [x] T017 [US3] Verify script output stays under 5 lines to context (e.g., "nginx deployed: 1/1 pods Running")

**Checkpoint**: All three user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across both skills

- [x] T018 [P] Verify both SKILL.md files have valid YAML frontmatter (name, description fields) and are under 100 tokens each
- [x] T019 [P] Verify cross-agent compatibility: skill structure works for both Claude Code and Goose (standard `.claude/skills/` directory, no agent-specific code)
- [x] T020 Edge case handling: test empty repo (agents-md-gen), kubectl not installed (k8s-foundation), CrashLoopBackOff pods (k8s-foundation)
- [x] T021 Verify all scripts have proper error handling and return clear error messages on failure

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 (T003, T005 specifically)
- **User Story 2 (Phase 4)**: Depends on Phase 2 (T004, T006 specifically)
- **User Story 3 (Phase 5)**: Depends on Phase 4 (needs working k8s-foundation SKILL.md)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent — agents-md-gen skill, no K8s dependency
- **User Story 2 (P1)**: Independent — k8s-foundation health check, no agents-md dependency
- **User Story 3 (P2)**: Depends on k8s-foundation SKILL.md from US2 setup, but adds helm_install.sh independently

### Within Each User Story

- SKILL.md before scripts (defines the contract)
- Shell scripts before Python scripts (data flows bash → python)
- Pipeline verification after both scripts exist
- Token budget verification last

### Parallel Opportunities

- T001 and T002 can run in parallel (different skill directories)
- T003, T004, T005, T006 can ALL run in parallel (different files)
- US1 (Phase 3) and US2 (Phase 4) can run in parallel (completely independent skills)
- T018 and T019 can run in parallel (different validation concerns)

---

## Parallel Example: User Stories 1 & 2

```bash
# After Phase 2 (Foundational) completes, launch both stories in parallel:

# Stream 1: agents-md-gen (User Story 1)
Task T007: "Create analyze_repo.sh in .claude/skills/agents-md-gen/scripts/analyze_repo.sh"
Task T008: "Create generate_agents_md.py in .claude/skills/agents-md-gen/scripts/generate_agents_md.py"
Task T009: "Verify end-to-end pipeline"

# Stream 2: k8s-foundation (User Story 2)
Task T011: "Create check_cluster.sh in .claude/skills/k8s-foundation/scripts/check_cluster.sh"
Task T012: "Create verify_health.py in .claude/skills/k8s-foundation/scripts/verify_health.py"
Task T013: "Verify health check pipeline"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (create directories)
2. Complete Phase 2: Foundational (SKILL.md files + references)
3. Complete Phase 3: User Story 1 (agents-md-gen scripts)
4. **STOP and VALIDATE**: Run `agents-md-gen` against hack3/ repo
5. If valid AGENTS.md generated → MVP complete

### Incremental Delivery

1. Setup + Foundational → Skill structure ready
2. User Story 1 → agents-md-gen works → Can generate AGENTS.md for any repo
3. User Story 2 → k8s-foundation health check works → Can verify cluster
4. User Story 3 → Helm install works → Can deploy charts via skill
5. Each story adds capability without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each phase completion (with user approval per Rule 3)
- Skills will be built using skill-creator-pro pattern
- All scripts must use standard tools (find, grep, kubectl, helm) — no external dependencies
