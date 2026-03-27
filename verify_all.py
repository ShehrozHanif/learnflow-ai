#!/usr/bin/env python3
"""verify_all.py — System-wide health check for LearnFlow.

Checks all 5 components and reports aggregate status.
Usage: python verify_all.py
"""

import subprocess
import json
import sys


def check_pods(namespace: str, label: str = None) -> dict:
    """Get pod status for a namespace/label."""
    cmd = ["kubectl", "get", "pods", "-n", namespace, "-o", "json"]
    if label:
        cmd.extend(["-l", label])
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        if result.returncode != 0:
            return {"total": 0, "running": 0, "error": result.stderr.strip()}
        data = json.loads(result.stdout)
        pods = data.get("items", [])
        running = sum(1 for p in pods if p["status"].get("phase") == "Running")
        return {"total": len(pods), "running": running}
    except Exception as e:
        return {"total": 0, "running": 0, "error": str(e)}


def main():
    components = [
        {"name": "Kafka", "namespace": "kafka", "label": None, "expect_min": 1},
        {"name": "PostgreSQL", "namespace": "postgres", "label": None, "expect_min": 1},
        {"name": "Backend (6 agents)", "namespace": "learnflow", "label": "component=agent", "expect_min": 6},
        {"name": "Frontend", "namespace": "learnflow", "label": "app=learnflow-frontend", "expect_min": 1},
        {"name": "Docs", "namespace": "learnflow", "label": "app=learnflow-docs", "expect_min": 1},
    ]

    total_pods = 0
    running_pods = 0
    healthy_components = 0
    results = []

    for comp in components:
        status = check_pods(comp["namespace"], comp["label"])
        total_pods += status["total"]
        running_pods += status["running"]
        is_healthy = status["running"] >= comp["expect_min"]
        if is_healthy:
            healthy_components += 1
        mark = "OK" if is_healthy else "FAIL"
        results.append(f"{comp['name']}: {status['running']}/{status['total']} Running [{mark}]")

    # Output: 2 lines for pipeline compatibility, then details
    print(f"System: {healthy_components}/{len(components)} components healthy, {running_pods}/{total_pods} pods Running")
    for r in results:
        print(f"  {r}")

    if healthy_components < len(components):
        print(f"\nStatus: Unhealthy ({len(components) - healthy_components} component(s) down)")
        sys.exit(1)
    else:
        print(f"\nStatus: Healthy")


if __name__ == "__main__":
    main()
