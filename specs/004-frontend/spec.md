# Feature Specification: Frontend (nextjs-k8s-deploy)

**Feature Branch**: `003-backend-services`
**Created**: 2026-03-20
**Status**: Implemented
**Input**: User description: "Phase 5: Frontend - nextjs-k8s-deploy skill. Deploy Next.js app with Monaco editor, Student and Teacher dashboards, code execution sandbox."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deploy Next.js Frontend (Priority: P1)

An AI agent (Claude Code or Goose) receives a single prompt to deploy the LearnFlow frontend. The skill generates a Next.js application with Monaco code editor, builds a container image, and deploys it to Kubernetes. The frontend connects to the backend Triage Agent for student interactions.

**Why this priority**: Without a frontend, students and teachers cannot interact with the LearnFlow platform.

**Independent Test**: Run the deploy pipeline and verify the frontend pod reaches Running state and the app is accessible via port-forward.

**Acceptance Scenarios**:

1. **Given** a K8s cluster with backend services running, **When** the AI agent runs the deploy skill, **Then** the frontend pod reaches Running state within 3 minutes.
2. **Given** the deploy skill has already been run, **When** it is run again, **Then** the deployment upgrades cleanly (idempotent).
3. **Given** the frontend is deployed, **When** a user accesses it via browser, **Then** the landing page loads with navigation to Student and Teacher dashboards.

---

### User Story 2 - Student Dashboard (Priority: P1)

A student logs in and sees their dashboard with: a chat panel for talking to the AI tutor, a Monaco code editor for writing and running Python code, and a progress view showing mastery levels across topics.

**Why this priority**: The student experience is the core product.

**Acceptance Scenarios**:

1. **Given** a student on the dashboard, **When** they type a question in the chat panel, **Then** the message is sent to the Triage Agent and a response is displayed.
2. **Given** the student uses the code editor, **When** they click "Run", **Then** the code executes in a sandboxed environment and output is displayed.
3. **Given** a student with progress data, **When** they view the progress panel, **Then** mastery levels are shown with color-coded badges (Red/Yellow/Green/Blue).

---

### User Story 3 - Teacher Dashboard (Priority: P2)

A teacher logs in and sees a class overview with: student progress across topics, struggle alerts for students who need help, and an exercise generator powered by the Exercise Agent.

**Why this priority**: Teacher features depend on student data and backend agents being functional.

**Acceptance Scenarios**:

1. **Given** a teacher on the dashboard, **When** they view the class overview, **Then** all students' mastery levels are displayed.
2. **Given** a student is struggling, **When** the teacher views alerts, **Then** the struggling student is highlighted with diagnostic info.
3. **Given** a teacher wants exercises, **When** they request generation for a topic, **Then** the Exercise Agent produces exercises.

---

### User Story 4 - Code Execution Sandbox (Priority: P1)

Students can write Python code in the Monaco editor and execute it safely. The sandbox enforces: 5-second timeout, 50MB memory limit, no filesystem access, no network access, standard library only.

**Why this priority**: Code execution is a core tutoring feature and must be safe.

**Acceptance Scenarios**:

1. **Given** valid Python code, **When** the student runs it, **Then** output is displayed correctly.
2. **Given** an infinite loop, **When** execution exceeds 5s, **Then** it is terminated with a timeout message.
3. **Given** code trying `import requests`, **When** run, **Then** it fails with an import error (only stdlib allowed).

---

### Edge Cases

- Empty code submission → Show "No code to run" message.
- Backend unreachable → Show connection error with retry button.
- Very long AI responses → Truncate with "Show more" option.
- Student with no progress data → Show empty state with "Start learning" prompt.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The skill MUST generate a Next.js application with TypeScript and App Router.
- **FR-002**: The frontend MUST include a Monaco code editor component for Python editing.
- **FR-003**: The frontend MUST include a chat panel that sends messages to the Triage Agent API.
- **FR-004**: The frontend MUST include a Student dashboard with chat, code editor, and progress view.
- **FR-005**: The frontend MUST include a Teacher dashboard with class progress and struggle alerts.
- **FR-006**: The frontend MUST include a code execution sandbox with 5s timeout and 50MB memory.
- **FR-007**: The frontend MUST display mastery levels with color-coded badges (Red/Yellow/Green/Blue).
- **FR-008**: The skill MUST include a Dockerfile for building the container image.
- **FR-009**: The skill MUST include K8s deployment manifests with resource limits.
- **FR-010**: The deploy script MUST be idempotent.
- **FR-011**: The skill MUST follow MCP Code Execution pattern: SKILL.md (~100 tokens) + scripts/ + references/.
- **FR-012**: SKILL.md MUST stay under 100 tokens; outputs under 5 lines.
- **FR-013**: No hardcoded secrets or API endpoints; use environment variables.

### Key Entities

- **Student Dashboard**: Chat + Code Editor + Progress view.
- **Teacher Dashboard**: Class overview + Struggle alerts + Exercise generator.
- **Code Sandbox**: Isolated Python execution with timeout and memory limits.
- **Mastery Badge**: Visual indicator (Beginner=Red, Learning=Yellow, Proficient=Green, Mastered=Blue).

## Success Criteria *(mandatory)*

- **SC-001**: Frontend pod reaches Running state within 3 minutes.
- **SC-002**: Landing page loads with Student/Teacher navigation.
- **SC-003**: Monaco editor renders and accepts Python input.
- **SC-004**: Chat messages reach the Triage Agent and responses display.
- **SC-005**: Code execution returns output within 5s or times out.
- **SC-006**: Mastery badges show correct colors for score ranges.
- **SC-007**: SKILL.md under 100 tokens; outputs under 5 lines.
- **SC-008**: Cross-agent compatible (bash + python scripts).
- **SC-009**: Fits within remaining Minikube budget (~400Mi after Phase 3+4).
- **SC-010**: Idempotent deployment.

## Assumptions

- Backend services (Phase 4) are deployed and Triage Agent is accessible.
- Monaco editor loaded via `@monaco-editor/react` npm package.
- Code execution uses a simple API route that spawns a Python subprocess with resource limits.
- For MVP, authentication is simulated (role selector, not real auth).
- Frontend communicates with backend via K8s internal service DNS.

## Dependencies

- Phase 4 backend services (fastapi-dapr-agent) deployed.
- Minikube Docker daemon for image building.
- ~400Mi available memory after Phases 3+4.

## Out of Scope

- Real authentication (Better Auth — later phase).
- Kong API Gateway routing.
- MCP server integration (Phase 6).
- Production-grade code sandbox (Docker-in-Docker).
- Server-side rendering with real data (MVP uses client-side fetch).
