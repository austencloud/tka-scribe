#!/usr/bin/env python3
"""
Quick test for VS Code task integration
"""

import json
from pathlib import Path


def test_task_loading():
    """Test loading tasks from VS Code tasks.json"""

    # Find workspace root
    current_path = Path(__file__).resolve()
    for parent_path in [current_path] + list(current_path.parents):
        vscode_path = parent_path / ".vscode"
        if vscode_path.exists():
            workspace_path = parent_path
            break
    else:
        print("❌ Could not find .vscode directory")
        return False

    print(f"✅ Found workspace: {workspace_path}")

    # Load tasks.json
    tasks_file = workspace_path / ".vscode" / "tasks.json"

    if not tasks_file.exists():
        print(f"❌ Tasks file not found: {tasks_file}")
        return False

    print(f"✅ Found tasks file: {tasks_file}")

    try:
        with open(tasks_file, "r") as f:
            content = f.read()

        # Remove JSON comments (simple approach)
        lines = []
        for line in content.split("\n"):
            if "//" in line:
                line = line[: line.index("//")]
            lines.append(line)
        clean_content = "\n".join(lines)

        tasks_config = json.loads(clean_content)

        print(f"✅ Parsed tasks.json successfully")
        print(f"📋 Found {len(tasks_config.get('tasks', []))} tasks:")

        for task in tasks_config.get("tasks", []):
            label = task.get("label", "")
            group = task.get("group", "")
            if isinstance(group, dict):
                group = group.get("kind", "other")

            print(f"  - {label} ({group})")

        return True

    except Exception as e:
        print(f"❌ Error loading tasks: {e}")
        return False


if __name__ == "__main__":
    test_task_loading()
