# Implementation Plan: Frontend (nextjs-k8s-deploy)

**Feature**: 004-frontend
**Created**: 2026-03-20
**Status**: In Progress

## Approach

Next.js 14 App Router with TypeScript. Single container deployed to K8s. Monaco editor via `@monaco-editor/react`. Chat connects to Triage Agent via internal K8s service. Code sandbox executes Python via API route with subprocess timeout.

## Architecture

```
Browser → Next.js (K8s Pod)
             ├── /student → Chat + Monaco + Progress
             ├── /teacher → Class Overview + Alerts + Exercises
             └── /api/execute → Python Sandbox (subprocess, 5s timeout)
                     ↓
              triage-agent.learnflow.svc (POST /chat)
```

## Key Decisions

1. **App Router**: Next.js 14 with `src/app/` directory. Modern React Server Components where needed.
2. **Monaco via npm**: `@monaco-editor/react` — loads Monaco from CDN, zero bundling overhead.
3. **Code sandbox**: API route spawns `python3 -c <code>` with `timeout 5` and `ulimit` memory cap. No Docker-in-Docker for MVP.
4. **Simulated auth**: Role selector dropdown (student/teacher) instead of real auth. Keeps MVP simple.
5. **Tailwind CSS**: Utility-first styling, no component library needed.
6. **Standalone output**: `next.config.js` with `output: "standalone"` for minimal Docker image.

## Skill Structure

```
.claude/skills/nextjs-k8s-deploy/
├── SKILL.md                          # ~80 tokens
├── scripts/
│   ├── deploy_frontend.sh            # Build image + deploy to K8s
│   ├── verify_frontend.py            # Check pod + health endpoint
│   └── templates/
│       ├── app/                      # Next.js source
│       │   ├── package.json
│       │   ├── next.config.js
│       │   ├── tailwind.config.js
│       │   ├── tsconfig.json
│       │   ├── postcss.config.js
│       │   ├── Dockerfile
│       │   └── src/
│       │       └── app/
│       │           ├── layout.tsx
│       │           ├── page.tsx
│       │           ├── globals.css
│       │           ├── student/
│       │           │   └── page.tsx
│       │           ├── teacher/
│       │           │   └── page.tsx
│       │           ├── api/
│       │           │   └── execute/
│       │           │       └── route.ts
│       │           └── components/
│       │               ├── ChatPanel.tsx
│       │               ├── CodeEditor.tsx
│       │               ├── MasteryBadge.tsx
│       │               └── ProgressDashboard.tsx
│       └── k8s/
│           └── deployment.yaml
└── references/
    └── nextjs-k8s-guide.md
```

## Resource Budget

| Component | Requests | Limits |
|-----------|----------|--------|
| Next.js pod | 128Mi | 256Mi |
| **Phase 5 total** | **128Mi** | **256Mi** |
| Phase 3+4 total | 1.47GB | 2.62GB |
| **Grand total** | **~1.6GB** | **~2.88GB** |

Fits within 3GB Minikube with ~120Mi headroom.

## Risks

1. **Monaco bundle size**: ~2MB gzipped from CDN. Mitigate: loaded lazily on editor pages only.
2. **Code sandbox escape**: MVP uses subprocess with timeout. Not production-safe but acceptable for demo.
3. **Memory tight**: 120Mi headroom is thin. Monitor with `kubectl top`.
