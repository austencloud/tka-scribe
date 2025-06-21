#!/usr/bin/env python3
"""
Quick validation script for VS Code task enhancements.
Can be run as a VS Code task for instant feedback.
"""

import json
import os
from pathlib import Path


def validate_enhancements():
    """Quick validation of all task enhancements"""
    workspace = Path(__file__).parent.parent
    vscode_dir = workspace / ".vscode"

    print("🔍 Validating VS Code Task Enhancements...")
    print("-" * 40)

    checks = []

    # 1. Check tasks.json structure
    tasks_file = vscode_dir / "tasks.json"
    if tasks_file.exists():
        with open(tasks_file) as f:
            tasks = json.load(f)

        # Check default build task
        full_stack_task = next(
            (t for t in tasks["tasks"] if t.get("label") == "Full Stack Development"),
            None,
        )
        if full_stack_task and full_stack_task.get("group", {}).get("isDefault"):
            checks.append("✅ Default build task configured")
        else:
            checks.append("❌ Default build task missing")

        # Check instance limits
        instance_limit_tasks = [
            t for t in tasks["tasks"] if t.get("runOptions", {}).get("instanceLimit")
        ]
        if len(instance_limit_tasks) >= 2:
            checks.append("✅ Instance limits configured")
        else:
            checks.append("❌ Instance limits missing")

        # Check auto-run
        auto_run_task = next(
            (
                t
                for t in tasks["tasks"]
                if t.get("runOptions", {}).get("runOn") == "folderOpen"
            ),
            None,
        )
        if auto_run_task:
            checks.append("✅ Auto-run on folder open configured")
        else:
            checks.append("❌ Auto-run configuration missing")

        # Check terminal grouping
        grouped_tasks = [
            t
            for t in tasks["tasks"]
            if t.get("presentation", {}).get("group") == "development"
        ]
        if len(grouped_tasks) >= 3:
            checks.append("✅ Terminal grouping configured")
        else:
            checks.append("❌ Terminal grouping incomplete")

    # 2. Check launch.json
    launch_file = vscode_dir / "launch.json"
    if launch_file.exists():
        with open(launch_file) as f:
            launch = json.load(f)

        pre_launch_config = next(
            (c for c in launch["configurations"] if c.get("preLaunchTask")), None
        )
        if pre_launch_config:
            checks.append("✅ Debug pre-launch task configured")
        else:
            checks.append("❌ Debug pre-launch task missing")

    # 3. Check keybindings.json
    kb_file = vscode_dir / "keybindings.json"
    if kb_file.exists():
        with open(kb_file) as f:
            keybindings = json.load(f)

        if len(keybindings) >= 3:
            checks.append("✅ Keyboard shortcuts configured")
        else:
            checks.append("❌ Keyboard shortcuts incomplete")

    # Print results
    for check in checks:
        print(check)

    success_count = sum(1 for check in checks if check.startswith("✅"))
    total_count = len(checks)

    print("-" * 40)
    if success_count == total_count:
        print(f"🎉 All {total_count} enhancements validated successfully!")
        return True
    else:
        print(f"⚠️  {success_count}/{total_count} enhancements working")
        return False


if __name__ == "__main__":
    validate_enhancements()
