#!/usr/bin/env python3
"""
Import Fixer for TKA Desktop Application

This script systematically finds and fixes relative import issues across the entire codebase.
It converts relative imports to absolute imports using the full module path.
"""

import re
from pathlib import Path


class ImportFixer:
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.fixed_files = 0
        self.total_changes = 0

        # Common import patterns to fix - update to use src layout
        self.import_patterns = [
            # Fix old flat layout imports to src layout
            (
                r"from\s+desktop\.modern\.domain\.([a-zA-Z0-9_\.]+)\s+import",
                r"from desktop.modern.src.domain.\1 import",
            ),
            (
                r"from\s+desktop\.modern\.application\.([a-zA-Z0-9_\.]+)\s+import",
                r"from desktop.modern.src.application.\1 import",
            ),
            (
                r"from\s+desktop\.modern\.presentation\.([a-zA-Z0-9_\.]+)\s+import",
                r"from desktop.modern.src.presentation.\1 import",
            ),
            (
                r"from\s+desktop\.modern\.core\.([a-zA-Z0-9_\.]+)\s+import",
                r"from desktop.modern.src.core.\1 import",
            ),
            (
                r"from\s+desktop\.modern\.infrastructure\.([a-zA-Z0-9_\.]+)\s+import",
                r"from desktop.modern.src.infrastructure.\1 import",
            ),
            # Fix relative imports to absolute src layout
            (
                r"from\s+domain\.models\.([a-zA-Z0-9_\.]+)\s+import",
                r"from desktop.modern.src.domain.models.\1 import",
            ),
            (
                r"from\s+application\.services\.([a-zA-Z0-9_\.]+)\s+import",
                r"from desktop.modern.src.application.services.\1 import",
            ),
            (
                r"from\s+presentation\.components\.([a-zA-Z0-9_\.]+)\s+import",
                r"from desktop.modern.src.presentation.components.\1 import",
            ),
            (
                r"from\s+core\.([a-zA-Z0-9_\.]+)\s+import",
                r"from desktop.modern.src.core.\1 import",
            ),
            (
                r"from\s+infrastructure\.([a-zA-Z0-9_\.]+)\s+import",
                r"from desktop.modern.src.infrastructure.\1 import",
            ),
        ]

        # Files to exclude from processing
        self.exclude_patterns = [
            "__pycache__",
            ".pyc",
            ".git",
            "tests",
            "legacy",  # Skip legacy code
            "web_app",  # Skip web app code
        ]

    def should_process_file(self, file_path: Path) -> bool:
        """Check if file should be processed."""
        if not file_path.suffix == ".py":
            return False

        path_str = str(file_path)
        for pattern in self.exclude_patterns:
            if pattern in path_str:
                return False

        return True

    def fix_imports_in_file(self, file_path: Path) -> int:
        """Fix imports in a single file. Returns number of changes made."""
        try:
            with open(file_path, encoding="utf-8") as f:
                content = f.read()

            original_content = content
            changes_made = 0

            # Apply each import pattern
            for pattern, replacement in self.import_patterns:
                new_content, count = re.subn(pattern, replacement, content)
                if count > 0:
                    print(f"  Fixed {count} imports with pattern: {pattern}")
                    content = new_content
                    changes_made += count

            # Only write if changes were made
            if changes_made > 0:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"✅ Fixed {changes_made} imports in {file_path}")

            return changes_made

        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
            return 0

    def fix_all_imports(self) -> None:
        """Fix imports in all Python files in the modern directory."""
        print("🔧 Starting systematic import fixing...")

        # Process modern src directory
        modern_dir = self.base_path / "modern" / "src"
        if modern_dir.exists():
            print(f"📁 Processing modern src directory: {modern_dir}")
            self._process_directory(modern_dir)

        # Shared directory is no longer used - services moved to modern

        print("\n✅ Import fixing complete!")
        print(f"   Files processed: {self.fixed_files}")
        print(f"   Total changes: {self.total_changes}")

    def _process_directory(self, directory: Path) -> None:
        """Process all Python files in a directory recursively."""
        for file_path in directory.rglob("*.py"):
            if self.should_process_file(file_path):
                changes = self.fix_imports_in_file(file_path)
                if changes > 0:
                    self.fixed_files += 1
                    self.total_changes += changes


def main():
    """Main entry point."""
    # Get the desktop directory (current directory)
    current_dir = Path(__file__).parent
    desktop_root = current_dir

    # Check if we have the modern/src structure
    if not (desktop_root / "modern" / "src").exists():
        print("❌ Could not find modern/src directory")
        return

    print(f"🎯 Desktop root: {desktop_root}")

    # Create and run the fixer
    fixer = ImportFixer(str(desktop_root))
    fixer.fix_all_imports()

    print("\n🚀 Import fixing complete! You can now run the application.")


if __name__ == "__main__":
    main()
