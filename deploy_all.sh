#!/usr/bin/env bash
set -euo pipefail

# LearnFlow — Master Deploy Script
# Deploys the complete stack using Skills in dependency order.
# Usage: bash deploy_all.sh
#
# Deployment order:
#   1. Kafka (kafka namespace)
#   2. PostgreSQL (postgres namespace)
#   3. Backend agents + Dapr (learnflow namespace)
#   4. Frontend (learnflow namespace)
#   5. Docs (learnflow namespace)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR/.claude/skills"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

step=0
total=5

log() {
  step=$((step + 1))
  echo -e "\n${YELLOW}=== Step $step/$total: $1 ===${NC}\n"
}

success() {
  echo -e "${GREEN}✓ $1${NC}"
}

fail() {
  echo -e "${RED}✗ $1${NC}"
  echo -e "${RED}Deploy failed at step $step. Fix the issue and re-run (idempotent).${NC}"
  exit 1
}

# Prerequisites
echo -e "${YELLOW}=== LearnFlow Full Stack Deploy ===${NC}"
for cmd in kubectl helm docker; do
  command -v "$cmd" >/dev/null 2>&1 || { fail "$cmd not found. Install it first."; }
done

# Check Minikube
if command -v minikube >/dev/null 2>&1; then
  minikube status >/dev/null 2>&1 || { fail "Minikube not running. Start with: minikube start --memory=3072"; }
fi

# Step 1: Kafka
log "Deploying Kafka"
bash "$SKILLS_DIR/kafka-k8s-setup/scripts/deploy_kafka.sh" > /tmp/kafka_deploy.json 2>&1 || { fail "Kafka deploy failed"; }
success "Kafka deployed"

echo "Creating topics..."
bash "$SKILLS_DIR/kafka-k8s-setup/scripts/create_topics.sh" learning,code,exercise,struggle,responses > /tmp/topics.json 2>&1 || { fail "Topic creation failed"; }
success "Kafka topics created"

# Step 2: PostgreSQL
log "Deploying PostgreSQL"
bash "$SKILLS_DIR/postgres-k8s-setup/scripts/deploy_postgres.sh" > /tmp/pg_deploy.json 2>&1 || { fail "PostgreSQL deploy failed"; }
success "PostgreSQL deployed"

echo "Running migrations..."
bash "$SKILLS_DIR/postgres-k8s-setup/scripts/run_migrations.sh" > /tmp/migrations.json 2>&1 || { fail "Migrations failed"; }
success "Database migrations applied"

# Step 3: Backend Agents + Dapr
log "Deploying Backend Services (6 agents + Dapr)"
bash "$SKILLS_DIR/fastapi-dapr-agent/scripts/deploy_services.sh" > /tmp/services_deploy.json 2>&1 || { fail "Backend services deploy failed"; }
success "Backend services deployed (6 agents)"

# Step 4: Frontend
log "Deploying Frontend (Next.js)"
bash "$SKILLS_DIR/nextjs-k8s-deploy/scripts/deploy_frontend.sh" > /tmp/frontend_deploy.json 2>&1 || { fail "Frontend deploy failed"; }
success "Frontend deployed"

# Step 5: Docs
log "Deploying Documentation (Docusaurus)"
bash "$SKILLS_DIR/docusaurus-deploy/scripts/deploy_docs.sh" > /tmp/docs_deploy.json 2>&1 || { fail "Docs deploy failed"; }
success "Documentation deployed"

# Summary
echo ""
echo -e "${GREEN}=== LearnFlow Deploy Complete ===${NC}"
echo ""
echo "Run verification:  python verify_all.py"
echo "Access services:   bash port_forward.sh"
echo "Tear down:         bash teardown.sh"
