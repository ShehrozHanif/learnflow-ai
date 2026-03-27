#!/usr/bin/env bash
set -euo pipefail

# LearnFlow — Teardown Script
# Removes all LearnFlow resources from the cluster.
# Usage: bash teardown.sh

echo "=== LearnFlow Teardown ==="
echo ""
echo "This will remove ALL LearnFlow resources from the cluster."
read -p "Continue? (y/N): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

echo ""

# Step 1: Delete learnflow namespace (frontend, docs, agents, dapr components)
echo "Deleting learnflow namespace..."
kubectl delete namespace learnflow --ignore-not-found --timeout=60s
echo "  ✓ learnflow namespace deleted"

# Step 2: Uninstall Dapr
echo "Uninstalling Dapr..."
helm uninstall dapr -n dapr-system 2>/dev/null || true
kubectl delete namespace dapr-system --ignore-not-found --timeout=60s
echo "  ✓ Dapr removed"

# Step 3: Delete Kafka
echo "Deleting Kafka..."
kubectl delete namespace kafka --ignore-not-found --timeout=60s
echo "  ✓ Kafka removed"

# Step 4: Delete PostgreSQL
echo "Deleting PostgreSQL..."
helm uninstall postgresql -n postgres 2>/dev/null || true
kubectl delete namespace postgres --ignore-not-found --timeout=60s
echo "  ✓ PostgreSQL removed"

echo ""
echo "=== Teardown Complete ==="
echo "All LearnFlow resources have been removed."
echo "To redeploy: bash deploy_all.sh"
