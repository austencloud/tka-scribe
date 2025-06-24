#!/usr/bin/env python3
"""
Create a dynamic VS Code debug configuration for subprocess attachment.
"""

import json
from pathlib import Path


def create_subprocess_debug_config(debug_port: int):
    """Create a VS Code debug configuration for subprocess attachment."""

    # Path to VS Code launch.json
    vscode_dir = Path(__file__).parent.parent / ".vscode"
    launch_json_path = vscode_dir / "launch.json"

    # Configuration for subprocess debugging
    subprocess_config = {
        "name": f"🔗 Attach to TKA Subprocess (Port {debug_port})",
        "type": "debugpy",
        "request": "attach",
        "connect": {"host": "localhost", "port": debug_port},
        "justMyCode": False,
        "presentation": {"group": "TKA Debug", "order": 10},
    }

    try:
        # Read existing launch.json
        if launch_json_path.exists():
            with open(launch_json_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Remove comments from JSON (simple approach)
            lines = content.split("\n")
            cleaned_lines = []
            for line in lines:
                # Remove lines that start with // (comments)
                stripped = line.strip()
                if not stripped.startswith("//"):
                    cleaned_lines.append(line)

            cleaned_content = "\n".join(cleaned_lines)
            launch_config = json.loads(cleaned_content)
        else:
            launch_config = {"version": "0.2.0", "configurations": []}

        # Remove any existing subprocess debug configs
        launch_config["configurations"] = [
            config
            for config in launch_config["configurations"]
            if not config.get("name", "").startswith("🔗 Attach to TKA Subprocess")
        ]

        # Add the new subprocess config
        launch_config["configurations"].append(subprocess_config)

        # Write back to launch.json
        vscode_dir.mkdir(exist_ok=True)
        with open(launch_json_path, "w", encoding="utf-8") as f:
            json.dump(launch_config, f, indent=2)

        print(f"✅ Created debug configuration for port {debug_port}")
        print(
            f"🎯 You can now use 'Attach to TKA Subprocess (Port {debug_port})' in VS Code"
        )
        return True

    except Exception as e:
        print(f"❌ Failed to create debug configuration: {e}")
        return False


def cleanup_subprocess_debug_configs():
    """Remove all subprocess debug configurations."""

    vscode_dir = Path(__file__).parent.parent / ".vscode"
    launch_json_path = vscode_dir / "launch.json"

    try:
        if not launch_json_path.exists():
            return True

        with open(launch_json_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Remove comments from JSON (simple approach)
        lines = content.split("\n")
        cleaned_lines = []
        for line in lines:
            # Remove lines that start with // (comments)
            stripped = line.strip()
            if not stripped.startswith("//"):
                cleaned_lines.append(line)

        cleaned_content = "\n".join(cleaned_lines)
        launch_config = json.loads(cleaned_content)

        # Remove subprocess debug configs
        original_count = len(launch_config["configurations"])
        launch_config["configurations"] = [
            config
            for config in launch_config["configurations"]
            if not config.get("name", "").startswith("🔗 Attach to TKA Subprocess")
        ]

        removed_count = original_count - len(launch_config["configurations"])

        if removed_count > 0:
            with open(launch_json_path, "w", encoding="utf-8") as f:
                json.dump(launch_config, f, indent=2)
            print(f"✅ Removed {removed_count} subprocess debug configuration(s)")

        return True

    except Exception as e:
        print(f"❌ Failed to cleanup debug configurations: {e}")
        return False


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        if sys.argv[1] == "cleanup":
            cleanup_subprocess_debug_configs()
        else:
            try:
                port = int(sys.argv[1])
                create_subprocess_debug_config(port)
            except ValueError:
                print(
                    "Usage: python create_debug_config.py <port> or python create_debug_config.py cleanup"
                )
    else:
        print(
            "Usage: python create_debug_config.py <port> or python create_debug_config.py cleanup"
        )
