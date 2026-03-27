#!/usr/bin/env bash
set -euo pipefail

# LearnFlow — Demo Scenario Script
# Simulates the Student Maya + Teacher Rodriguez interaction.
# Prerequisites: Full stack deployed (bash deploy_all.sh)
# Usage: bash demo_scenario.sh

TRIAGE_URL="http://localhost:8000"

echo "=== LearnFlow Demo: Student Maya + Teacher Rodriguez ==="
echo ""

# Check if port-forward is running
if ! curl -sf "$TRIAGE_URL/health" > /dev/null 2>&1; then
  echo "Error: Triage agent not reachable at $TRIAGE_URL"
  echo "Run 'bash port_forward.sh' first, then retry."
  exit 1
fi

echo "Step 1: Student Maya asks about for loops"
echo "---"
RESPONSE=$(curl -sf -X POST "$TRIAGE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "maya-001", "message": "How do for loops work in Python?"}' 2>&1 || echo '{"error": "triage not reachable"}')
echo "  Triage response: $(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('response','')[:200])" 2>/dev/null || echo "$RESPONSE")"
echo ""

echo "Step 2: Maya asks to review her code"
echo "---"
RESPONSE=$(curl -sf -X POST "$TRIAGE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "maya-001", "message": "Review my code: for i in range(10): print(i)"}' 2>&1 || echo '{"error": "triage not reachable"}')
echo "  Triage response: $(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('response','')[:200])" 2>/dev/null || echo "$RESPONSE")"
echo ""

echo "Step 3: Student James struggles with list comprehensions"
echo "---"
RESPONSE=$(curl -sf -X POST "$TRIAGE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "james-001", "message": "I dont understand list comprehensions, I keep getting errors"}' 2>&1 || echo '{"error": "triage not reachable"}')
echo "  Triage response: $(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('response','')[:200])" 2>/dev/null || echo "$RESPONSE")"
echo ""

echo "Step 4: Teacher Rodriguez requests exercises"
echo "---"
RESPONSE=$(curl -sf -X POST "$TRIAGE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "rodriguez-001", "message": "Create easy exercises on list comprehensions for struggling students"}' 2>&1 || echo '{"error": "triage not reachable"}')
echo "  Triage response: $(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('response','')[:200])" 2>/dev/null || echo "$RESPONSE")"
echo ""

echo "Step 5: System health check"
echo "---"
python3 verify_all.py
echo ""

echo "=== Demo Complete ==="
echo ""
echo "Access the UI:"
echo "  Student view:  http://localhost:3000/student"
echo "  Teacher view:  http://localhost:3000/teacher"
echo "  API docs:      http://localhost:8000/docs"
echo "  Documentation: http://localhost:8080"
