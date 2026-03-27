# Phase 6: MCP Integration + Documentation — Plan

## Architecture

### mcp-code-execution
Replaces 3 direct MCP server connections (~35,000 tokens/session) with on-demand Python scripts (~110 tokens total):

| Script | Replaces | Token Cost |
|--------|----------|------------|
| `query_k8s.py` | K8s MCP server (~15,000) | ~50 |
| `query_db.py` | PostgreSQL MCP server (~10,000) | ~30 |
| `query_kafka.py` | Kafka MCP server (~10,000) | ~30 |
| `system_status.py` | All 3 servers | ~0 (aggregates) |

Scripts use `kubectl exec` and `subprocess` to query live cluster state.

### docusaurus-deploy
- **Build**: Node 20 Alpine → Docusaurus `npm run build` → static HTML/CSS/JS
- **Serve**: Nginx Alpine serves `build/` directory (~30MB image)
- **K8s**: Single pod, 64Mi/128Mi, ClusterIP service on port 80

## Key Decisions

1. **Python subprocess over MCP SDK**: No additional dependencies, works on any system with kubectl
2. **Nginx over Node serving**: 10x smaller runtime, static content doesn't need Node
3. **Docusaurus 3.7**: Latest stable with MDX support and auto-sidebar

## Resource Budget

| Component | Requests | Limits |
|-----------|----------|--------|
| Docs (nginx) | 64Mi | 128Mi |
| mcp-code-execution | 0 (scripts, not deployed) | 0 |
