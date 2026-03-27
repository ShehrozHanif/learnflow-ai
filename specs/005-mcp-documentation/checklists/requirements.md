# Phase 6: Requirements Checklist

## mcp-code-execution
- [x] SKILL.md < 100 tokens
- [x] query_k8s.py outputs < 5 lines
- [x] query_db.py outputs < 5 lines
- [x] query_kafka.py outputs < 5 lines
- [x] system_status.py outputs < 5 lines (JSON)
- [x] verify_mcp.py outputs exactly 2 lines
- [x] Token savings ≥ 99% documented
- [x] Cross-agent compatible (bash + python only)
- [x] Reference guide included

## docusaurus-deploy
- [x] SKILL.md < 100 tokens
- [x] Docusaurus 3.x with LearnFlow branding
- [x] All 6 skills documented
- [x] Architecture overview page
- [x] Deployment guide page
- [x] Getting started guide
- [x] Multi-stage Dockerfile (node → nginx)
- [x] K8s deployment: 64Mi/128Mi budget
- [x] deploy_docs.sh idempotent
- [x] verify_docs.py outputs 2 lines
- [x] Reference guide included

## Cross-cutting
- [x] No hardcoded secrets
- [x] All scripts use bash + python (cross-agent)
- [x] Pipeline pattern: `bash script.sh | python verify.py`
