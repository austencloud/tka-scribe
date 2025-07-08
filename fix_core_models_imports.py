#!/usr/bin/env python3
"""
Script to fix all remaining core_models imports in the TKA codebase.
Replaces 'from domain.models.core_models import ...' with explicit submodule imports.
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Set

# Mapping of imports to their correct submodules
IMPORT_MAPPING = {
    'BeatData': 'from domain.models.beat_models import BeatData',
    'SequenceData': 'from domain.models.sequence_models import SequenceData',
    'MotionData': 'from domain.models.motion_models import MotionData',
    'MotionType': 'from domain.models.motion_models import MotionType',
    'Location': 'from domain.models.motion_models import Location',
    'RotationDirection': 'from domain.models.motion_models import RotationDirection',
    'LetterType': 'from domain.models.glyph_models import LetterType',
    'GlyphData': 'from domain.models.glyph_models import GlyphData',
    'StartPositionData': 'from domain.models.start_position_models import StartPositionData',
    'GridMode': 'from domain.models.sequence_models import GridMode',
    'PropType': 'from domain.models.sequence_models import PropType',
}

def find_python_files(root_path: Path) -> List[Path]:
    """Find all Python files in the project."""
    python_files = []
    for root, dirs, files in os.walk(root_path):
        # Skip certain directories
        skip_dirs = {'.git', '__pycache__', '.pytest_cache', 'node_modules', '.vscode'}
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        
        for file in files:
            if file.endswith('.py'):
                python_files.append(Path(root) / file)
    
    return python_files

def parse_core_models_import(line: str) -> List[str]:
    """Parse a core_models import line to extract the imported items."""
    # Match patterns like: from domain.models.core_models import BeatData, SequenceData
    match = re.match(r'^\s*from\s+domain\.models\.core_models\s+import\s+(.+)$', line.strip())
    if not match:
        return []
    
    imports_str = match.group(1)
    # Split by comma and clean up whitespace
    imports = [item.strip() for item in imports_str.split(',')]
    return imports

def generate_replacement_imports(imported_items: List[str]) -> List[str]:
    """Generate the replacement import lines for the given items."""
    replacement_lines = []
    used_modules = set()
    
    for item in imported_items:
        if item in IMPORT_MAPPING:
            import_line = IMPORT_MAPPING[item]
            if import_line not in used_modules:
                replacement_lines.append(import_line)
                used_modules.add(import_line)
        else:
            print(f"⚠️  WARNING: Unknown import '{item}' - keeping original")
            replacement_lines.append(f"# FIXME: Unknown import {item}")
    
    return replacement_lines

def fix_file(file_path: Path) -> bool:
    """Fix core_models imports in a single file. Returns True if changes were made."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        modified = False
        new_lines = []
        
        for line in lines:
            if 'from domain.models.core_models import' in line:
                # Parse the import
                imported_items = parse_core_models_import(line)
                if imported_items:
                    # Generate replacements
                    replacements = generate_replacement_imports(imported_items)
                    
                    # Add replacement lines
                    for replacement in replacements:
                        new_lines.append(replacement + '\n')
                    
                    modified = True
                    print(f"  🔄 Replaced: {line.strip()}")
                    for replacement in replacements:
                        print(f"     ➜ {replacement}")
                else:
                    # Keep original line if we couldn't parse it
                    new_lines.append(line)
            else:
                new_lines.append(line)
        
        if modified:
            # Write the modified file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Main function to fix all core_models imports."""
    project_root = Path(__file__).parent
    print(f"🔍 Scanning for Python files in: {project_root}")
    
    # Find all Python files
    python_files = find_python_files(project_root)
    print(f"📂 Found {len(python_files)} Python files")
    
    # Process each file
    files_modified = 0
    total_replacements = 0
    
    for file_path in python_files:
        # Check if file contains core_models imports
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if 'from domain.models.core_models import' in content:
                print(f"\n📝 Processing: {file_path.relative_to(project_root)}")
                if fix_file(file_path):
                    files_modified += 1
                    
                    # Count replacements in this file
                    replacements_in_file = content.count('from domain.models.core_models import')
                    total_replacements += replacements_in_file
                
        except Exception as e:
            print(f"❌ Error reading {file_path}: {e}")
            continue
    
    print(f"\n✅ SUMMARY:")
    print(f"   📁 Files processed: {len(python_files)}")
    print(f"   🔄 Files modified: {files_modified}")
    print(f"   🔀 Total replacements: {total_replacements}")
    
    if files_modified > 0:
        print(f"\n🎉 Successfully fixed all core_models imports!")
        print(f"💡 Run your tests to verify everything still works correctly.")
    else:
        print(f"\n✨ No core_models imports found - looks like they're already fixed!")

if __name__ == "__main__":
    main()
