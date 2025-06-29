#!/usr/bin/env python3
"""
Test JSON parsing with comments.
"""

import json
from pathlib import Path


def test_json_parsing():
    """Test parsing the launch.json file."""
    
    vscode_dir = Path(__file__).parent.parent / ".vscode"
    launch_json_path = vscode_dir / "launch.json"
    
    print(f"📄 Reading: {launch_json_path}")
    print(f"📄 Exists: {launch_json_path.exists()}")
    
    if not launch_json_path.exists():
        print("❌ File doesn't exist")
        return
    
    try:
        with open(launch_json_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"📄 File size: {len(content)} characters")
        print(f"📄 First 200 characters:")
        print(content[:200])
        
        # Remove comments from JSON (simple approach)
        lines = content.split('\n')
        cleaned_lines = []
        comment_count = 0
        
        for line in lines:
            # Remove lines that start with // (comments)
            stripped = line.strip()
            if stripped.startswith('//'):
                comment_count += 1
                print(f"🔍 Skipping comment: {stripped}")
            else:
                cleaned_lines.append(line)
        
        print(f"📄 Removed {comment_count} comment lines")
        cleaned_content = '\n'.join(cleaned_lines)
        
        print(f"📄 Cleaned content size: {len(cleaned_content)} characters")
        print(f"📄 First 200 characters of cleaned content:")
        print(cleaned_content[:200])
        
        # Try to parse
        launch_config = json.loads(cleaned_content)
        print(f"✅ JSON parsed successfully!")
        print(f"📄 Version: {launch_config.get('version')}")
        print(f"📄 Configurations count: {len(launch_config.get('configurations', []))}")
        
        # List configuration names
        for i, config in enumerate(launch_config.get('configurations', [])):
            name = config.get('name', 'Unnamed')
            print(f"   {i+1}: {name}")
        
        return launch_config
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        return None


if __name__ == "__main__":
    test_json_parsing()
