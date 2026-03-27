#!/usr/bin/env bash
set -euo pipefail

# LearnFlow — Port Forward Script
# Exposes all services locally for development and demo.
# Usage: bash port_forward.sh
# Stop: Ctrl+C (kills all background port-forwards)

echo "=== LearnFlow Port Forward ==="
echo ""
echo "Starting port-forwards..."
echo ""

# Cleanup on exit
cleanup() {
  echo ""
  echo "Stopping all port-forwards..."
  kill $(jobs -p) 2>/dev/null || true
  echo "Done."
}
trap cleanup EXIT INT TERM

# Frontend: localhost:3000
kubectl port-forward -n learnflow svc/learnflow-frontend 3000:80 &
echo "  Frontend:  http://localhost:3000"

# Triage API: localhost:8000
kubectl port-forward -n learnflow svc/triage-agent 8000:80 &
echo "  Triage API: http://localhost:8000"

# Docs: localhost:8080
kubectl port-forward -n learnflow svc/learnflow-docs 8080:80 &
echo "  Docs:      http://localhost:8080"

echo ""
echo "All services forwarded. Press Ctrl+C to stop."
echo ""

# Wait for all background jobs
wait
